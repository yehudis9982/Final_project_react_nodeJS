import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

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
        if (!token) {
          console.log("אין טוקן - לא ניתן לטעון גנים");
          return;
        }
        const res = await axios.get("http://localhost:2025/api/Kindergarten", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("תגובת שרת גנים:", res.data);
        setKindergartensList(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("שגיאה בטעינת גנים:", error);
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

  // טעינת דוח לעריכה אם יש מזהה
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

      // משוך מיד את הדוח המלא כדי למלא dailyWork להצגה
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
    <div className="p-4 max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <button
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
            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
          >
            ← דף הבית
          </button>
          <h2 className="text-xl font-bold">דוח שבועי</h2>
          <div></div>
        </div>

        {!currentId && (
          <div className="flex gap-2 mb-4">
            <input
              type="date"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={createTemplate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={!token || creating}
            >
              {creating ? "יוצר..." : "צור תבנית"}
            </button>
          </div>
        )}

        {currentId && dailyWork.length === 0 && (
          <div className="bg-yellow-50 p-3 rounded mb-4">
            <p className="text-yellow-800 mb-2">לא קיימים ימים בתבנית.</p>
            <button
              onClick={() => setDailyWork([makeEmptyDay()])}
              className="bg-yellow-600 text-white px-3 py-1 rounded"
            >
              הוסף יום
            </button>
          </div>
        )}

        {dailyWork.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-sm">סטטוס: 
                <span className={status === "Submitted" ? "text-green-600 font-semibold" : "text-orange-600 font-semibold"}>
                  {status === "Submitted" ? "נשלח" : "טיוטה"}
                </span>
              </span>
            </div>
            <textarea
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              rows="2"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="הערות כלליות לדוח..."
            />
          </div>
        )}

        <div className="space-y-4">
          {dailyWork.map((day, i) => (
            <div key={i} className="border rounded p-4 bg-gray-50">
              <h3 className="font-semibold mb-3">
                יום #{i + 1} - {new Date(day.date).toLocaleDateString('he-IL')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <input
                  type="number"
                  value={day.totalHours}
                  onChange={(e) => updateField(i, "totalHours", e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="סה״כ שעות"
                  min="0"
                  step="0.5"
                  className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  value={day.notes}
                  onChange={(e) => updateField(i, "notes", e.target.value)}
                  placeholder="הערות יום"
                  rows="1"
                  className="md:col-span-2 p-2 border rounded focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* גנים */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-700">גנים</h4>
                    <button
                      onClick={() => addKindergarten(i)}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                    >
                      + גן
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {(day.kindergartens || []).map((kg, k) => (
                      <div key={k} className="bg-green-50 p-2 rounded border">
                        <select
                          value={kg.kindergarten}
                          onChange={(e) => updateKG(i, k, "kindergarten", e.target.value)}
                          className="w-full p-1 border rounded mb-2 text-sm"
                        >
                          <option value="">
                            {kindergartensList.length === 0 ? "טוען..." : "בחר גן"}
                          </option>
                          {kindergartensList.map((kgItem) => (
                            <option key={kgItem._id} value={kgItem._id}>
                              {kgItem.name || `${kgItem.institutionSymbol} - ${kgItem.kindergartenTeacherName}`}
                            </option>
                          ))}
                        </select>
                        
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input
                            type="time"
                            value={kg.startTime || ""}
                            onChange={(e) => updateKG(i, k, "startTime", e.target.value)}
                            className="p-1 border rounded text-sm"
                          />
                          <input
                            type="time"
                            value={kg.endTime || ""}
                            onChange={(e) => updateKG(i, k, "endTime", e.target.value)}
                            className="p-1 border rounded text-sm"
                          />
                        </div>
                        
                        <textarea
                          value={kg.notes || ""}
                          onChange={(e) => updateKG(i, k, "notes", e.target.value)}
                          rows="1"
                          className="w-full p-1 border rounded text-sm resize-none"
                          placeholder="הערות..."
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* משימות */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-purple-700">משימות</h4>
                    <button
                      onClick={() => addTask(i)}
                      className="bg-purple-600 text-white px-2 py-1 rounded text-xs"
                    >
                      + משימה
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {(day.tasks || []).map((task, t) => (
                      <div key={t} className="bg-purple-50 p-2 rounded border">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input
                            value={task.task?.title || ""}
                            onChange={(e) => updateTask(i, t, "task.title", e.target.value)}
                            placeholder="כותרת"
                            className="p-1 border rounded text-sm"
                          />
                          <input
                            value={task.task?.type || ""}
                            onChange={(e) => updateTask(i, t, "task.type", e.target.value)}
                            placeholder="סוג"
                            className="p-1 border rounded text-sm"
                          />
                        </div>
                        
                        <textarea
                          value={task.task?.description || ""}
                          onChange={(e) => updateTask(i, t, "task.description", e.target.value)}
                          rows="1"
                          placeholder="תיאור"
                          className="w-full p-1 border rounded text-sm mb-2 resize-none"
                        />
                        
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input
                            type="time"
                            value={task.startTime || ""}
                            onChange={(e) => updateTask(i, t, "startTime", e.target.value)}
                            className="p-1 border rounded text-sm"
                          />
                          <input
                            type="time"
                            value={task.endTime || ""}
                            onChange={(e) => updateTask(i, t, "endTime", e.target.value)}
                            className="p-1 border rounded text-sm"
                          />
                        </div>
                        
                        <textarea
                          value={task.notes || ""}
                          onChange={(e) => updateTask(i, t, "notes", e.target.value)}
                          rows="1"
                          placeholder="הערות"
                          className="w-full p-1 border rounded text-sm resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(currentId || dailyWork.length > 0) && (
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <button
              onClick={() => saveReport(false)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "שומר..." : "שמור"}
            </button>
            <button
              onClick={() => saveReport(true)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "שולח..." : "שלח סופי"}
            </button>
          </div>
        )}

        {message && (
          <div className={`mt-3 p-3 rounded text-sm ${
            message.includes("שגיאה") || message.includes("לא נמצא") 
              ? "bg-red-50 text-red-800" 
              : "bg-blue-50 text-blue-800"
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyReportForm;
