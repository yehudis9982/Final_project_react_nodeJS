import React, { useState } from "react";
import axios from "axios";

const WeeklyReportForm = () => {
  const [weekStartDate, setWeekStartDate] = useState("");
  const [reportId, setReportId] = useState(null);
  const [dailyWork, setDailyWork] = useState([]);
  const [generalNotes, setGeneralNotes] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("Draft");

  const token = localStorage.getItem("token");

  const createTemplate = async () => {
    try {
      const res = await axios.post(
        "http://localhost:2025/api/WeeklyReport/template",
        { weekStartDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReportId(res.data._id);
      setDailyWork(res.data.dailyWork);
      setGeneralNotes(res.data.generalNotes || "");
      setStatus(res.data.status || "Draft");
      setMessage("תבנית נוצרה בהצלחה, ניתן לערוך ולשלוח.");
    } catch (err) {
      setMessage(err.response?.data?.message || "שגיאה ביצירת תבנית");
    }
  };

  const updateField = (i, field, value) => {
    const copy = [...dailyWork];
    copy[i][field] = value;
    setDailyWork(copy);
  };

  const addKindergarten = (i) => {
    const copy = [...dailyWork];
    copy[i].kindergartens.push({
      kindergarten: "",
      startTime: "",
      endTime: "",
      notes: ""
    });
    setDailyWork(copy);
  };

  const addTask = (i) => {
    const copy = [...dailyWork];
    copy[i].tasks.push({
      task: { title: "", description: "", type: "" },
      startTime: "",
      endTime: "",
      notes: ""
    });
    setDailyWork(copy);
  };

  const saveReport = async (finalize = false) => {
    if (!reportId) return;
    try {
      const payload = {
        dailyWork,
        generalNotes,
        status: finalize ? "Submitted" : "Draft"
      };

      const res = await axios.put(
        `http://localhost:2025/api/WeeklyReport/${reportId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(finalize ? "הדוח נשלח בהצלחה." : "הדוח נשמר בהצלחה.");
      setStatus(res.data.status);
    } catch (err) {
      setMessage(err.response?.data?.message || "שגיאה בשמירה/שליחה");
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto border rounded">
      <h2 className="text-xl font-bold mb-4">דוח שבועי - יצירה ועריכה</h2>

      <input
        type="date"
        value={weekStartDate}
        onChange={(e) => setWeekStartDate(e.target.value)}
        className="border p-2 rounded w-full mb-3"
      />

      <button
        onClick={createTemplate}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        צור תבנית לשבוע
      </button>

      {!dailyWork.length && reportId && (
        <p className="text-gray-600">טוען תבנית עריכה...</p>
      )}

      {dailyWork.length > 0 && (
        <>
          <p className="mb-2 text-sm text-gray-700">סטטוס: <strong>{status === "Submitted" ? "נשלח" : "טיוטה"}</strong></p>

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
          <h3 className="font-semibold mb-2">יום #{i + 1} - {new Date(day.date).toLocaleDateString()}</h3>

          <input
            type="number"
            value={day.totalHours}
            onChange={(e) => updateField(i, "totalHours", Number(e.target.value))}
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
          {day.kindergartens.map((kg, k) => (
            <div key={k} className="mb-2">
              <input
                placeholder="ID גן"
                value={kg.kindergarten}
                onChange={(e) => {
                  const copy = [...dailyWork];
                  copy[i].kindergartens[k].kindergarten = e.target.value;
                  setDailyWork(copy);
                }}
                className="border p-2 rounded w-full mb-1"
              />
              <input
                type="time"
                value={kg.startTime}
                onChange={(e) => {
                  const copy = [...dailyWork];
                  copy[i].kindergartens[k].startTime = e.target.value;
                  setDailyWork(copy);
                }}
                className="border p-2 rounded w-full mb-1"
              />
              <input
                type="time"
                value={kg.endTime}
                onChange={(e) => {
                  const copy = [...dailyWork];
                  copy[i].kindergartens[k].endTime = e.target.value;
                  setDailyWork(copy);
                }}
                className="border p-2 rounded w-full mb-1"
              />
              <textarea
                value={kg.notes}
                onChange={(e) => {
                  const copy = [...dailyWork];
                  copy[i].kindergartens[k].notes = e.target.value;
                  setDailyWork(copy);
                }}
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
          {day.tasks.map((task, t) => (
            <div key={t} className="mb-2">
              <input
                placeholder="כותרת"
                value={task.task.title}
                onChange={(e) => {
                  const copy = [...dailyWork];
                  copy[i].tasks[t].task.title = e.target.value;
                  setDailyWork(copy);
                }}
                className="border p-2 rounded w-full mb-1"
              />
              <input
                placeholder="סוג"
                value={task.task.type}
                onChange={(e) => {
                  const copy = [...dailyWork];
                  copy[i].tasks[t].task.type = e.target.value;
                  setDailyWork(copy);
                }}
                className="border p-2 rounded w-full mb-1"
              />
              <textarea
                placeholder="תיאור"
                value={task.task.description}
                onChange={(e) => {
                  const copy = [...dailyWork];
                  copy[i].tasks[t].task.description = e.target.value;
                  setDailyWork(copy);
                }}
                className="border p-2 rounded w-full mb-1"
              />
              <input
                type="time"
                value={task.startTime}
                onChange={(e) => {
                  const copy = [...dailyWork];
                  copy[i].tasks[t].startTime = e.target.value;
                  setDailyWork(copy);
                }}
                className="border p-2 rounded w-full mb-1"
              />
              <input
                type="time"
                value={task.endTime}
                onChange={(e) => {
                  const copy = [...dailyWork];
                  copy[i].tasks[t].endTime = e.target.value;
                  setDailyWork(copy);
                }}
                className="border p-2 rounded w-full mb-2"
              />
              <textarea
                placeholder="הערות"
                value={task.notes}
                onChange={(e) => {
                  const copy = [...dailyWork];
                  copy[i].tasks[t].notes = e.target.value;
                  setDailyWork(copy);
                }}
                className="border p-2 rounded w-full mb-2"
              />
            </div>
          ))}
        </div>
      ))}

      {reportId && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => saveReport(false)}
            className="bg-blue-700 text-white px-4 py-2 rounded"
          >
            שמור דוח
          </button>
          <button
            onClick={() => saveReport(true)}
            className="bg-green-700 text-white px-4 py-2 rounded"
          >
            שלח דוח סופי
          </button>
        </div>
      )}

      {message && <p className="mt-3 text-blue-800">{message}</p>}
    </div>
  );
};

export default WeeklyReportForm;
