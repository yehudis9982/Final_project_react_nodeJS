import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Paper, Typography, Box, Button, TextField, Select, MenuItem } from "@mui/material";
import "../css/WeeklyReportForm.css";

const WeeklyReportForm = () => {
  const { reportId: reportIdFromUrl } = useParams();

  const [currentId, setCurrentId] = useState(reportIdFromUrl || null);
  const [weekStartDate, setWeekStartDate] = useState("");
  const [dailyWork, setDailyWork] = useState([]);
  const [generalNotes, setGeneralNotes] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("Draft");
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [kindergartensList, setKindergartensList] = useState([]);

  useEffect(() => {
    const fetchKindergartens = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("http://localhost:2025/api/Kindergarten", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setKindergartensList(Array.isArray(res.data) ? res.data : []);
      } catch {
        setKindergartensList([]);
      }
    };
    fetchKindergartens();
  }, []);

  const token = useMemo(() => {
    try {
      const c = localStorage.getItem("consultant");
      const parsed = c ? JSON.parse(c) : null;
      return parsed?.accessToken || localStorage.getItem("token") || "";
    } catch {
      return localStorage.getItem("token") || "";
    }
  }, []);

  const client = useMemo(() => {
    return axios.create({
      baseURL: "http://localhost:2025/api",
      timeout: 15000,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }, [token]);

  const extractErrMsg = (err) =>
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    (typeof err?.response?.data === "string" ? err.response.data : null) ||
    err?.message ||
    "שגיאה לא צפויה";

  const pickId = (data) =>
    data?._id || data?.id || data?.reportId || data?.report?._id || null;

  const safeDW = (arr) =>
    (Array.isArray(arr) ? arr : []).map((d) => ({
      date: d?.date || new Date().toISOString(),
      dayOfWeek: d?.dayOfWeek ?? new Date(d?.date || Date.now()).getDay(),
      totalHours: Number.isFinite(Number(d?.totalHours)) && Number(d?.totalHours) > 0 ? Number(d?.totalHours) : "",
      notes: d?.notes || "",
      kindergartens: Array.isArray(d?.kindergartens) ? d.kindergartens : [],
      tasks: Array.isArray(d?.tasks) ? d.tasks : [],
    }));

  const makeEmptyDay = () => ({
    date: new Date().toISOString(),
    dayOfWeek: new Date().getDay(),
    totalHours: "",
    notes: "",
    kindergartens: [],
    tasks: [],
  });

  useEffect(() => {
    if (!currentId) return;
    const fetchReport = async () => {
      try {
        const { data } = await client.get(`/WeeklyReport/${currentId}`);
        setWeekStartDate(data.weekStartDate || "");
        const days = safeDW(data.dailyWork);
        setDailyWork(days);
        setGeneralNotes(data.generalNotes || "");
        setStatus(data.status || "Draft");
        setMessage("");
      } catch {
        setMessage("שגיאה בטעינת דוח לעריכה");
      }
    };
    fetchReport();
  }, [currentId, client]);

  const createTemplate = async () => {
    if (!token) {
      setMessage("חסר טוקן. התחברות נדרשת.");
      return;
    }
    if (!weekStartDate) {
      setMessage("יש לבחור תאריך תחילת שבוע");
      return;
    }

    setCreating(true);
    const ac = new AbortController();
    const kill = setTimeout(() => ac.abort("template-timeout"), 20000);
    try {
      const { data } = await client.post(
        "/WeeklyReport/template",
        { weekStartDate },
        { signal: ac.signal }
      );

      const id = pickId(data);
      if (!id) {
        setMessage("נוצרה תבנית ללא מזהה. ודא/י שהשרת מחזיר _id.");
        return;
      }

      setCurrentId(id);

      try {
        const { data: full } = await client.get(`/WeeklyReport/${id}`);
        const days = safeDW(full.dailyWork);
        setDailyWork(days.length ? days : [makeEmptyDay()]);
        setGeneralNotes(full.generalNotes || "");
        setStatus(full.status || "Draft");
      } catch {
        const days = safeDW(data?.dailyWork);
        setDailyWork(days.length ? days : [makeEmptyDay()]);
        setGeneralNotes(data?.generalNotes || "");
        setStatus(data?.status || "Draft");
      }

      setMessage("תבנית נוצרה בהצלחה, ניתן לערוך ולשלוח.");
    } catch (err) {
      const msg = extractErrMsg(err);
      if (msg === "Weekly report for this week already exists!") {
        setMessage("כבר קיים דוח שבועי לתאריך זה. ניתן לערוך אותו ברשימת הדוחות.");
      } else {
        setMessage(msg || "שגיאה ביצירת תבנית");
      }
    } finally {
      clearTimeout(kill);
      setCreating(false);
    }
  };

  const updateField = (i, field, value) => {
    setDailyWork((prev) =>
      prev.map((d, idx) => {
        if (idx !== i) return d;
        if (field === "date") {
          return { ...d, date: value, dayOfWeek: new Date(value).getDay() };
        }
        return { ...d, [field]: value };
      })
    );
  };

  const addKindergarten = (i) => {
    setDailyWork((prev) =>
      prev.map((d, idx) =>
        idx === i
          ? {
              ...d,
              kindergartens: [
                ...(Array.isArray(d.kindergartens) ? d.kindergartens : []),
                { kindergarten: "", startTime: "", endTime: "", notes: "" },
              ],
            }
          : d
      )
    );
  };

  const addTask = (i) => {
    setDailyWork((prev) =>
      prev.map((d, idx) =>
        idx === i
          ? {
              ...d,
              tasks: [
                ...(Array.isArray(d.tasks) ? d.tasks : []),
                {
                  task: { title: "", description: "", type: "" },
                  startTime: "",
                  endTime: "",
                  notes: "",
                },
              ],
            }
          : d
      )
    );
  };

  const updateKG = (i, k, field, value) => {
    setDailyWork((prev) =>
      prev.map((d, idx) =>
        idx === i
          ? {
              ...d,
              kindergartens: (d.kindergartens || []).map((kg, kk) =>
                kk === k ? { ...kg, [field]: value } : kg
              ),
            }
          : d
      )
    );
  };

  const updateTask = (i, t, path, value) => {
    setDailyWork((prev) =>
      prev.map((d, idx) => {
        if (idx !== i) return d;
        const nextTasks = (d.tasks || []).map((task, tt) => {
          if (tt !== t) return task;
          if (path.startsWith("task.")) {
            const key = path.split(".")[1];
            return { ...task, task: { ...task.task, [key]: value } };
          }
          return { ...task, [path]: value };
        });
        return { ...d, tasks: nextTasks };
      })
    );
  };

  const saveReport = async (finalize = false) => {
    if (!token) {
      setMessage("חסר טוקן. התחברות נדרשת.");
      return;
    }
    if (!currentId) {
      setMessage("אין reportId לשמירה – צר/י תבנית קודם");
      return;
    }

    setSaving(true);
    const ac = new AbortController();
    const kill = setTimeout(() => ac.abort("save-timeout"), 20000);
    try {
      const payload = {
        dailyWork,
        generalNotes,
        status: finalize ? "Submitted" : "Draft",
      };

      const res = await client.put(
        `/WeeklyReport/${encodeURIComponent(currentId)}`,
        payload,
        { signal: ac.signal }
      );

      const newStatus = res?.data?.status ?? payload.status;
      setStatus(newStatus);
      setMessage(finalize ? "הדוח נשלח בהצלחה." : "הדוח נשמר בהצלחה.");
    } catch (err) {
      const msg = extractErrMsg(err);
      if (err?.response?.status === 404) {
        setMessage("דוח לא נמצא (id לא קיים/לא שייך למשתמש).");
      } else if (err?.code === "ERR_CANCELED") {
        setMessage("הבקשה בוטלה/פג תוקף.");
      } else {
        setMessage(msg || "שגיאה בשמירה/שליחה");
      }
    } finally {
      clearTimeout(kill);
      setSaving(false);
    }
  };

  return (
    <Box className="weekly-report-form-container">
      <Paper elevation={3} className="weekly-report-form-paper">
        <Box className="weekly-report-form-header">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              const token = localStorage.getItem("token");
              if (token) {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                if (decoded?.roles === "Supervisor") {
                  window.location.href = "/supervisor-dashboard";
                } else {
                  window.location.href = "/consultant-dashboard";
                }
              } else {
                window.location.href = "/";
              }
            }}
            className="home-btn"
          >
            ← דף הבית
          </Button>
          <Typography variant="h6" align="center" sx={{ flex: 1 }}>
            דוח שבועי
          </Typography>
        </Box>

        {!currentId && (
          <Box className="weekly-report-form-date-row">
            <TextField
              type="date"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
              label="תאריך תחילת שבוע"
              InputLabelProps={{ shrink: true }}
              size="small"
              className="weekly-report-date-input"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={createTemplate}
              disabled={!token || creating}
              className="weekly-report-create-btn"
            >
              {creating ? "יוצר..." : "צור תבנית"}
            </Button>
          </Box>
        )}

        {currentId && dailyWork.length === 0 && (
          <Box className="weekly-report-form-empty-days">
            <Typography color="warning.main" gutterBottom>
              לא קיימים ימים בתבנית.
            </Typography>
            <Button
              variant="contained"
              color="warning"
              onClick={() => setDailyWork([makeEmptyDay()])}
            >
              הוסף יום
            </Button>
          </Box>
        )}

        {dailyWork.length > 0 && (
          <Box className="weekly-report-form-status-row">
            <Typography variant="body2">
              סטטוס:{" "}
              <span className={status === "Submitted" ? "weekly-report-status-submitted" : "weekly-report-status-draft"}>
                {status === "Submitted" ? "נשלח" : "טיוטה"}
              </span>
            </Typography>
            <TextField
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              multiline
              rows={2}
              fullWidth
              label="הערות כלליות לדוח"
              margin="normal"
            />
          </Box>
        )}

        <Box className="weekly-report-form-days-list">
          {dailyWork.map((day, i) => (
            <Paper key={i} elevation={1} className="weekly-report-form-day">
              <Typography fontWeight="bold" gutterBottom>
                יום #{i + 1} - {new Date(day.date).toLocaleDateString('he-IL')}
              </Typography>
              <Box display="flex" gap={2} mb={2}>
                <TextField
                  type="number"
                  value={day.totalHours}
                  onChange={(e) => updateField(i, "totalHours", e.target.value === "" ? "" : Number(e.target.value))}
                  label="סה״כ שעות"
                  inputProps={{ min: 0, step: 0.5 }}
                  size="small"
                  className="weekly-report-hours-input"
                />
                <TextField
                  value={day.notes}
                  onChange={(e) => updateField(i, "notes", e.target.value)}
                  label="הערות יום"
                  multiline
                  rows={1}
                  size="small"
                  className="weekly-report-notes-input"
                />
              </Box>
              <Box display="flex" gap={4}>
                <Box flex={1}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography fontWeight="medium" color="green">גנים</Typography>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => addKindergarten(i)}
                    >
                      + גן
                    </Button>
                  </Box>
                  <Box>
                    {(day.kindergartens || []).map((kg, k) => (
                      <Paper key={k} elevation={0} className="weekly-report-form-kindergarten">
                        <Select
                          value={kg.kindergarten}
                          onChange={(e) => updateKG(i, k, "kindergarten", e.target.value)}
                          displayEmpty
                          size="small"
                          className="weekly-report-kindergarten-select"
                        >
                          <MenuItem value="">
                            {kindergartensList.length === 0 ? "טוען..." : "בחר גן"}
                          </MenuItem>
                          {kindergartensList.map((kgItem) => (
                            <MenuItem key={kgItem._id} value={kgItem._id}>
                              {kgItem.name || `${kgItem.institutionSymbol} - ${kgItem.kindergartenTeacherName}`}
                            </MenuItem>
                          ))}
                        </Select>
                        <Box display="flex" gap={2} mb={1}>
                          <TextField
                            type="time"
                            value={kg.startTime || ""}
                            onChange={(e) => updateKG(i, k, "startTime", e.target.value)}
                            label="שעת התחלה"
                            size="small"
                          />
                          <TextField
                            type="time"
                            value={kg.endTime || ""}
                            onChange={(e) => updateKG(i, k, "endTime", e.target.value)}
                            label="שעת סיום"
                            size="small"
                          />
                        </Box>
                        <TextField
                          value={kg.notes || ""}
                          onChange={(e) => updateKG(i, k, "notes", e.target.value)}
                          label="הערות"
                          multiline
                          rows={1}
                          size="small"
                          fullWidth
                        />
                      </Paper>
                    ))}
                  </Box>
                </Box>
                <Box flex={1}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography fontWeight="medium" color="purple">משימות</Typography>
                    <Button
                      variant="contained"
                      color="info"
                      size="small"
                      onClick={() => addTask(i)}
                    >
                      + משימה
                    </Button>
                  </Box>
                  <Box>
                    {(day.tasks || []).map((task, t) => (
                      <Paper key={t} elevation={0} className="weekly-report-form-task">
                        <Box display="flex" gap={2} mb={1}>
                          <TextField
                            value={task.task?.title || ""}
                            onChange={(e) => updateTask(i, t, "task.title", e.target.value)}
                            label="כותרת"
                            size="small"
                          />
                          <TextField
                            value={task.task?.type || ""}
                            onChange={(e) => updateTask(i, t, "task.type", e.target.value)}
                            label="סוג"
                            size="small"
                          />
                        </Box>
                        <TextField
                          value={task.task?.description || ""}
                          onChange={(e) => updateTask(i, t, "task.description", e.target.value)}
                          label="תיאור"
                          multiline
                          rows={1}
                          size="small"
                          fullWidth
                          margin="dense"
                        />
                        <Box display="flex" gap={2} mb={1}>
                          <TextField
                            type="time"
                            value={task.startTime || ""}
                            onChange={(e) => updateTask(i, t, "startTime", e.target.value)}
                            label="שעת התחלה"
                            size="small"
                          />
                          <TextField
                            type="time"
                            value={task.endTime || ""}
                            onChange={(e) => updateTask(i, t, "endTime", e.target.value)}
                            label="שעת סיום"
                            size="small"
                          />
                        </Box>
                        <TextField
                          value={task.notes || ""}
                          onChange={(e) => updateTask(i, t, "notes", e.target.value)}
                          label="הערות"
                          multiline
                          rows={1}
                          size="small"
                          fullWidth
                        />
                      </Paper>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {(currentId || dailyWork.length > 0) && (
          <Box className="weekly-report-form-actions">
            <Button
              variant="contained"
              color="primary"
              onClick={() => saveReport(false)}
              disabled={saving}
              className="weekly-report-save-btn"
            >
              {saving ? "שומר..." : "שמור"}
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => saveReport(true)}
              disabled={saving}
              className="weekly-report-submit-btn"
            >
              {saving ? "שולח..." : "שלח סופי"}
            </Button>
          </Box>
        )}

        {message && (
          <Box
            className={`weekly-report-form-message ${
              message.includes("שגיאה") || message.includes("לא נמצא")
                ? "weekly-report-message-error"
                : "weekly-report-message-info"
            }`}
          >
            {message}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default WeeklyReportForm;