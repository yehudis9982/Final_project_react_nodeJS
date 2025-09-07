import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
const WeeklyReportForm = () => {
  const { reportId } = useParams(); // קבלת מזהה הדוח מה-URL
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
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:2025/api/Kindergarten", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setKindergartensList(res.data);
  };
  fetchKindergartens();
}, []);
  // JWT כמחרוזת
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
    data?._id ||
    data?.id ||
    data?.reportId ||
    data?.report?._id ||
    null;

  const safeDW = (arr) =>
    (Array.isArray(arr) ? arr : []).map((d) => ({
      date: d?.date || new Date().toISOString(),
      dayOfWeek: d?.dayOfWeek ?? new Date(d?.date || Date.now()).getDay(),
      totalHours: Number.isFinite(Number(d?.totalHours)) ? Number(d?.totalHours) : 0,
      notes: d?.notes || "",
      kindergartens: Array.isArray(d?.kindergartens) ? d.kindergartens : [],
      tasks: Array.isArray(d?.tasks) ? d.tasks : [],
    }));

  // טעינת דוח לעריכה אם יש reportId
  useEffect(() => {
    if (reportId) {
      const fetchReport = async () => {
        try {
          const { data } = await client.get(`/WeeklyReport/${reportId}`);
          setWeekStartDate(data.weekStartDate || "");
          setDailyWork(safeDW(data.dailyWork));
          setGeneralNotes(data.generalNotes || "");
          setStatus(data.status || "Draft");
        } catch (err) {
          setMessage("שגיאה בטעינת דוח לעריכה");
        }
      };
      fetchReport();
    }
  }, [reportId, client]);

  const createTemplate = async () => {
    if (!token) { setMessage("חסר טוקן. התחברות נדרשת."); return; }
    if (!weekStartDate) { setMessage("יש לבחור תאריך תחילת שבוע"); return; }

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
      // עדכון הסטייטים
      setDailyWork(safeDW(data?.dailyWork));
      setGeneralNotes(data?.generalNotes || "");
      setStatus(data?.status || "Draft");
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
    if (!token) { setMessage("חסר טוקן. התחברות נדרשת."); return; }
    if (!reportId && !reportId) { setMessage("אין reportId לשמירה – צר/י תבנית קודם"); return; }

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
        `/WeeklyReport/${encodeURIComponent(reportId)}`,
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
    <div className="p-4 max-w-4xl mx-auto border rounded">
      <h2 className="text-xl font-bold mb-4">דוח שבועי - יצירה ועריכה</h2>

      {!reportId && (
        <>
          <input
            type="date"
            value={weekStartDate}
            onChange={(e) => setWeekStartDate(e.target.value)}
            className="border p-2 rounded w-full mb-3"
          />
          <button
            onClick={createTemplate}
            className="bg-blue-600 text-white px-4 py-2 rounded mb-4 disabled:opacity-60"
            disabled={!token || creating}
            title={!token ? "חסר טוקן – התחבר/י" : ""}
          >
            {creating ? "יוצר..." : "צור תבנית לשבוע"}
          </button>
        </>
      )}

      {!dailyWork.length && reportId && (
        <p className="text-gray-600">טוען תבנית עריכה...</p>
      )}

      {dailyWork.length > 0 && (
        <>
          <p className="mb-2 text-sm text-gray-700">
            סטטוס: <strong>{status === "Submitted" ? "נשלח" : "טיוטה"}</strong>
          </p>

          <label className="block mb-2">
            הערות כלליות:
            <textarea
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              className="border p-2 rounded w-full mt-1"
            />
          </label>
        </>
      )}

      {dailyWork.map((day, i) => (
        <div key={i} className="border p-3 mb-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">
            יום #{i + 1} - {new Date(day.date).toLocaleDateString()}
          </h3>

          <input
            type="number"
            value={day.totalHours}
            onChange={(e) =>
              updateField(i, "totalHours", Number(e.target.value) || 0)
            }
            placeholder="סה״כ שעות"
            className="border p-2 rounded w-full mb-2"
          />
          <textarea
            value={day.notes}
            onChange={(e) => updateField(i, "notes", e.target.value)}
            placeholder="הערות"
            className="border p-2 rounded w-full mb-2"
          />

          <button
            onClick={() => addKindergarten(i)}
            className="bg-green-600 text-white px-2 py-1 rounded mb-2"
          >
            הוסף גן
          </button>
          {(day.kindergartens || []).map((kg, k) => (
            <div key={k} className="mb-2">
              <select
  value={kg.kindergarten}
  onChange={(e) => updateKG(i, k, "kindergarten", e.target.value)}
  className="border p-2 rounded w-full mb-1"
>
  <option value="">בחר גן</option>
  {kindergartensList.map((kgItem) => (
    <option key={kgItem._id} value={kgItem._id}>
      {kgItem.name}
    </option>
  ))}
</select>
              <input
                type="time"
                value={kg.startTime}
                onChange={(e) => updateKG(i, k, "startTime", e.target.value)}
                className="border p-2 rounded w-full mb-1"
              />
              <input
                type="time"
                value={kg.endTime}
                onChange={(e) => updateKG(i, k, "endTime", e.target.value)}
                className="border p-2 rounded w-full mb-1"
              />
              <textarea
                value={kg.notes}
                onChange={(e) => updateKG(i, k, "notes", e.target.value)}
                className="border p-2 rounded w-full mb-2"
              />
            </div>
          ))}

          <button
            onClick={() => addTask(i)}
            className="bg-purple-600 text-white px-2 py-1 rounded mb-2"
          >
            הוסף משימה
          </button>
          {(day.tasks || []).map((task, t) => (
            <div key={t} className="mb-2">
              <input
                placeholder="כותרת"
                value={task.task?.title || ""}
                onChange={(e) => updateTask(i, t, "task.title", e.target.value)}
                className="border p-2 rounded w-full mb-1"
              />
              <input
                placeholder="סוג"
                value={task.task?.type || ""}
                onChange={(e) => updateTask(i, t, "task.type", e.target.value)}
                className="border p-2 rounded w-full mb-1"
              />
              <textarea
                placeholder="תיאור"
                value={task.task?.description || ""}
                onChange={(e) =>
                  updateTask(i, t, "task.description", e.target.value)
                }
                className="border p-2 rounded w-full mb-1"
              />
              <input
                type="time"
                value={task.startTime || ""}
                onChange={(e) => updateTask(i, t, "startTime", e.target.value)}
                className="border p-2 rounded w-full mb-1"
              />
              <input
                type="time"
                value={task.endTime || ""}
                onChange={(e) => updateTask(i, t, "endTime", e.target.value)}
                className="border p-2 rounded w-full mb-2"
              />
              <textarea
                placeholder="הערות"
                value={task.notes || ""}
                onChange={(e) => updateTask(i, t, "notes", e.target.value)}
                className="border p-2 rounded w-full mb-2"
              />
            </div>
          ))}
        </div>
      ))}

      {(reportId || dailyWork.length > 0) && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => saveReport(false)}
            className="bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "שומר..." : "שמור דוח"}
          </button>
          <button
            onClick={() => saveReport(true)}
            className="bg-green-700 text-white px-4 py-2 rounded disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "שולח..." : "שלח דוח סופי"}
          </button>
        </div>
      )}

      {message && <p className="mt-3 text-blue-800">{message}</p>}
    </div>
  );
};

export default WeeklyReportForm;