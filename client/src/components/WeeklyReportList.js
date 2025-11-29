import React, { useEffect, useState, useMemo } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Paper, Typography, Box, Button, Chip, Collapse, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem } from "@mui/material";
import "../css/WeeklyReportList.css";

const WeeklyReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedReports, setExpandedReports] = useState(new Set());
  const [showNewReportDialog, setShowNewReportDialog] = useState(false);
  const [weekStartDate, setWeekStartDate] = useState("");
  const [dailyWork, setDailyWork] = useState([]);
  const [generalNotes, setGeneralNotes] = useState("");
  const [currentReportId, setCurrentReportId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [kindergartensList, setKindergartensList] = useState([]);
  const navigate = useNavigate();

  const token = useMemo(() => {
    try {
      const c = localStorage.getItem("consultant");
      const parsed = c ? JSON.parse(c) : null;
      return parsed?.accessToken || localStorage.getItem("token") || "";
    } catch {
      return localStorage.getItem("token") || "";
    }
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:2025/api/WeeklyReport", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(res.data);
      } catch (err) {
        setError("שגיאה בטעינת הדוחות השבועיים");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

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

  const toggleExpand = (reportId) => {
    const newExpanded = new Set(expandedReports);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedReports(newExpanded);
  };

  const getTotalHours = (dailyWork) => {
    const total = (dailyWork || []).reduce((sum, day) => sum + (Number(day.totalHours) || 0), 0);
    return total > 0 ? total : null;
  };

  const getStatusChip = (status) => (
    <Chip
      label={status === "Submitted" ? "נשלח" : "טיוטה"}
      color={status === "Submitted" ? "success" : "warning"}
      size="small"
      sx={{ fontWeight: "bold", mx: 1 }}
    />
  );

  const makeEmptyDay = () => ({
    date: new Date().toISOString(),
    dayOfWeek: new Date().getDay(),
    totalHours: "",
    notes: "",
    kindergartens: [],
    tasks: [],
  });

  const safeDW = (arr) =>
    (Array.isArray(arr) ? arr : []).map((d) => ({
      date: d?.date || new Date().toISOString(),
      dayOfWeek: d?.dayOfWeek ?? new Date(d?.date || Date.now()).getDay(),
      totalHours: Number.isFinite(Number(d?.totalHours)) && Number(d?.totalHours) > 0 ? Number(d?.totalHours) : "",
      notes: d?.notes || "",
      kindergartens: Array.isArray(d?.kindergartens) ? d.kindergartens : [],
      tasks: Array.isArray(d?.tasks) ? d.tasks : [],
    }));

  const createNewReport = async () => {
    if (!weekStartDate) {
      setMessage("יש לבחור תאריך תחילת שבוע");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:2025/api/WeeklyReport/template",
        { weekStartDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const id = data._id || data.id || data.reportId;
      if (!id) {
        setMessage("נוצרה תבנית ללא מזהה");
        return;
      }

      setCurrentReportId(id);
      const days = safeDW(data.dailyWork);
      setDailyWork(days.length ? days : [makeEmptyDay()]);
      setGeneralNotes(data.generalNotes || "");
      setMessage("תבנית נוצרה בהצלחה");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message;
      if (msg === "Weekly report for this week already exists!") {
        setMessage("כבר קיים דוח שבועי לתאריך זה");
      } else {
        setMessage(msg || "שגיאה ביצירת תבנית");
      }
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
    if (!currentReportId) {
      setMessage("אין reportId לשמירה");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        dailyWork,
        generalNotes,
        status: finalize ? "Submitted" : "Draft",
      };

      await axios.put(
        `http://localhost:2025/api/WeeklyReport/${currentReportId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(finalize ? "הדוח נשלח בהצלחה" : "הדוח נשמר בהצלחה");
      
      // רענון רשימת הדוחות
      const res = await axios.get("http://localhost:2025/api/WeeklyReport", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);

      // סגירת הדיאלוג לאחר שליחה מוצלחת
      setTimeout(() => {
        setShowNewReportDialog(false);
        setCurrentReportId(null);
        setDailyWork([]);
        setGeneralNotes("");
        setWeekStartDate("");
        setMessage("");
      }, 1500);
    } catch (err) {
      setMessage(err?.response?.data?.message || "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const openNewReportDialog = () => {
    setShowNewReportDialog(true);
    setCurrentReportId(null);
    setDailyWork([]);
    setGeneralNotes("");
    setWeekStartDate("");
    setMessage("");
  };

  const closeNewReportDialog = () => {
    setShowNewReportDialog(false);
    setCurrentReportId(null);
    setDailyWork([]);
    setGeneralNotes("");
    setWeekStartDate("");
    setMessage("");
  };

  if (loading) return <Box className="weekly-report-list-loading">טוען דוחות...</Box>;
  if (error) return <Box className="weekly-report-list-error">{error}</Box>;

  return (
    <Box className="weekly-report-list-container">
      <Paper elevation={3} className="weekly-report-list-paper">
        <Box className="weekly-report-list-header">
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
          <Typography variant="h5" align="center" sx={{ flex: 1 }}>
            הדוחות השבועיים שלי
          </Typography>
        </Box>
        
        <Box sx={{ padding: "20px", textAlign: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={openNewReportDialog}
            sx={{ mb: 2, fontSize: "1.1rem", padding: "10px 30px" }}
          >
            + דוח שבועי חדש
          </Button>
        </Box>

        {reports.length === 0 ? (
          <Box className="weekly-report-list-empty">
            <Typography align="center" color="text.secondary">
              אין דוחות שבועיים עדיין. לחץ על "דוח שבועי חדש" כדי להתחיל.
            </Typography>
          </Box>
        ) : (
          <Box className="weekly-report-list-items">
            {reports.map((report) => {
              const isExpanded = expandedReports.has(report._id);
              const totalHours = getTotalHours(report.dailyWork);

              return (
                <Paper key={report._id} elevation={1} className="weekly-report-list-item">
                  <Box className="weekly-report-list-item-header">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography fontWeight="bold">
                        שבוע {new Date(report.weekStartDate).toLocaleDateString('he-IL')}
                      </Typography>
                      {getStatusChip(report.status)}
                      <Typography variant="body2" color="text.secondary">
                        {totalHours ? `סה"כ ${totalHours} שעות` : 'אין שעות מדווחות'} • {(report.dailyWork || []).length} ימים
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Button
                        variant="outlined"
                        color="info"
                        size="small"
                        onClick={() => toggleExpand(report._id)}
                      >
                        {isExpanded ? "הסתר" : "הצג פרטים"}
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => {
                          sessionStorage.setItem('fromWeeklyReports', 'true');
                          navigate(`/weekly-reports/edit/${report._id}`);
                        }}
                      >
                        ערוך
                      </Button>
                    </Box>
                  </Box>
                  {report.generalNotes && (
                    <Typography variant="body2" color="primary" sx={{ mt: 1, mb: 1 }}>
                      <b>הערות כלליות:</b> {report.generalNotes}
                    </Typography>
                  )}
                  <Collapse in={isExpanded}>
                    <Box className="weekly-report-list-details">
                      {(report.dailyWork || []).map((day, index) => (
                        <Paper key={index} elevation={0} className="weekly-report-list-day">
                          <Typography fontWeight="medium" sx={{ mb: 1 }}>
                            יום {index + 1} - {new Date(day.date).toLocaleDateString('he-IL')}
                            <span style={{ marginRight: 8, color: "#64748b" }}>
                              {day.totalHours && Number(day.totalHours) > 0 ? `(${day.totalHours} שעות)` : '(אין שעות)'}
                            </span>
                          </Typography>
                          {day.notes && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              <b>הערות יום:</b> {day.notes}
                            </Typography>
                          )}
                          <Box display="flex" gap={4}>
                            {(day.kindergartens || []).length > 0 && (
                              <Box flex={1}>
                                <Typography fontWeight="medium" color="green" sx={{ mb: 1 }}>
                                  גנים ({day.kindergartens.length})
                                </Typography>
                                {(day.kindergartens || []).map((kg, kgIndex) => (
                                  <Paper key={kgIndex} elevation={0} className="weekly-report-list-kindergarten">
                                    <Typography variant="body2">
                                      <b>גן:</b> {typeof kg.kindergarten === 'string'
                                        ? kg.kindergarten
                                        : kg.kindergarten?.name || kg.kindergarten?.institutionSymbol || "לא צוין"}
                                    </Typography>
                                    {(kg.startTime || kg.endTime) && (
                                      <Typography variant="caption" color="text.secondary">
                                        זמן: {kg.startTime || "--"} - {kg.endTime || "--"}
                                      </Typography>
                                    )}
                                    {kg.notes && (
                                      <Typography variant="caption" color="text.secondary">
                                        {kg.notes}
                                      </Typography>
                                    )}
                                  </Paper>
                                ))}
                              </Box>
                            )}
                            {(day.tasks || []).length > 0 && (
                              <Box flex={1}>
                                <Typography fontWeight="medium" color="purple" sx={{ mb: 1 }}>
                                  משימות ({day.tasks.length})
                                </Typography>
                                {(day.tasks || []).map((task, taskIndex) => (
                                  <Paper key={taskIndex} elevation={0} className="weekly-report-list-task">
                                    <Typography variant="body2">
                                      <b>{task.task?.title || "משימה ללא כותרת"}</b>
                                      {task.task?.type && (
                                        <span style={{ color: "#a855f7", marginRight: 8 }}>
                                          ({task.task.type})
                                        </span>
                                      )}
                                    </Typography>
                                    {task.task?.description && (
                                      <Typography variant="caption" color="text.secondary">
                                        {task.task.description}
                                      </Typography>
                                    )}
                                    {(task.startTime || task.endTime) && (
                                      <Typography variant="caption" color="text.secondary">
                                        זמן: {task.startTime || "--"} - {task.endTime || "--"}
                                      </Typography>
                                    )}
                                    {task.notes && (
                                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                        {task.notes}
                                      </Typography>
                                    )}
                                  </Paper>
                                ))}
                              </Box>
                            )}
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  </Collapse>
                </Paper>
              );
            })}
          </Box>
        )}
      </Paper>

      {/* דיאלוג ליצירת/עריכת דוח שבועי */}
      <Dialog
        open={showNewReportDialog}
        onClose={closeNewReportDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>דוח שבועי חדש</DialogTitle>
        <DialogContent dividers>
          {!currentReportId && (
            <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                type="date"
                value={weekStartDate}
                onChange={(e) => setWeekStartDate(e.target.value)}
                label="תאריך תחילת שבוע"
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ flex: 1 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={createNewReport}
                disabled={!token}
              >
                צור תבנית
              </Button>
            </Box>
          )}

          {currentReportId && (
            <>
              <TextField
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                multiline
                rows={2}
                fullWidth
                label="הערות כלליות לדוח"
                margin="normal"
              />

              <Box sx={{ mt: 2 }}>
                {dailyWork.map((day, i) => (
                  <Paper key={i} elevation={2} sx={{ p: 2, mb: 2, backgroundColor: "#f9fafb" }}>
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
                        sx={{ width: "150px" }}
                      />
                      <TextField
                        value={day.notes}
                        onChange={(e) => updateField(i, "notes", e.target.value)}
                        label="הערות יום"
                        multiline
                        rows={1}
                        size="small"
                        fullWidth
                      />
                    </Box>
                    
                    <Box display="flex" gap={4}>
                      {/* גנים */}
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
                        {(day.kindergartens || []).map((kg, k) => (
                          <Paper key={k} elevation={0} sx={{ p: 1, mb: 1, backgroundColor: "white" }}>
                            <Select
                              value={kg.kindergarten}
                              onChange={(e) => updateKG(i, k, "kindergarten", e.target.value)}
                              displayEmpty
                              size="small"
                              fullWidth
                              sx={{ mb: 1 }}
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

                      {/* משימות */}
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
                        {(day.tasks || []).map((task, t) => (
                          <Paper key={t} elevation={0} sx={{ p: 1, mb: 1, backgroundColor: "white" }}>
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
                              sx={{ mb: 1 }}
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
                  </Paper>
                ))}
              </Box>

              {message && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: message.includes("שגיאה") ? "#fee" : "#efe",
                    color: message.includes("שגיאה") ? "#c00" : "#060",
                  }}
                >
                  {message}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNewReportDialog} color="secondary">
            סגור
          </Button>
          {currentReportId && (
            <>
              <Button
                onClick={() => saveReport(false)}
                color="primary"
                variant="contained"
                disabled={saving}
              >
                {saving ? "שומר..." : "שמור"}
              </Button>
              <Button
                onClick={() => saveReport(true)}
                color="success"
                variant="contained"
                disabled={saving}
              >
                {saving ? "שולח..." : "שלח סופי"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WeeklyReportList;