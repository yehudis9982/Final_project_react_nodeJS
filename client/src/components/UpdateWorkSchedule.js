import React, { useState } from "react";
import axios from "axios";

const UpdateWorkSchedule = () => {
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי"];
   const token = localStorage.getItem("token");
  // אתחול מערך עם 6 ימים ריקים
  const [workSchedule, setWorkSchedule] = useState(
    days.map((_, index) => ({
      dayOfWeek: index,
      startHour: "",
      endHour: "",
      isWorkDay: false,
    }))
  );

  const handleChange = (index, field, value) => {
    const newSchedule = [...workSchedule];
    newSchedule[index][field] = value;
    setWorkSchedule(newSchedule);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!token) {
    alert("אין טוקן התחברות – התחבר/י מחדש");
    return;
  }

  // ולידציה בסיסית בצד לקוח
  for (const d of workSchedule) {
    if (d.isWorkDay) {
      if (!d.startHour || !d.endHour) {
        alert("בשעות עבודה חובה למלא התחלה/סיום");
        return;
      }
      if (d.endHour <= d.startHour) {
        alert("שעת סיום חייבת להיות אחרי שעת התחלה");
        return;
      }
    }
  }

  try {
    const payload = workSchedule.map((day) => ({
      ...day,
      startHour: day.isWorkDay ? day.startHour : null,
      endHour: day.isWorkDay ? day.endHour : null,
      dayOfWeek: Number(day.dayOfWeek),
    }));

    const res = await axios.put(
      "http://localhost:2025/api/Consultant/work-schedule",
      { workSchedule: payload },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("עודכן:", res.data);
   const updatedWorkSchedule = res.data?.workSchedule ?? [];

// קריאה בטוחה ל-localStorage עבור consultant
let currentConsultant = {};
try {
  const cStr = localStorage.getItem("consultant");
  currentConsultant = cStr ? JSON.parse(cStr) : {};
} catch (e) {
  currentConsultant = {};
}


localStorage.setItem(
  "consultant",
  JSON.stringify({ ...currentConsultant, workSchedule: updatedWorkSchedule })
);

alert("לוח העבודה נשמר בהצלחה");
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("Axios error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "שגיאה בבקשה";
      alert(msg);
    } else {
      console.error("Unknown error:", err);
      alert("שגיאה לא צפויה");
    }
  }
};


  return (
    <form onSubmit={handleSubmit}>
      <h2>עדכון לוח עבודה</h2>
      {days.map((day, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <strong>{day}</strong>
          <label style={{ marginRight: "5px" }}>
            התחלה:
            <input
              type="time"
              value={workSchedule[index].startHour}
              onChange={(e) =>
                handleChange(index, "startHour", e.target.value)
              }
              disabled={!workSchedule[index].isWorkDay}
            />
          </label>
          <label style={{ marginRight: "5px" }}>
            סיום:
            <input
              type="time"
              value={workSchedule[index].endHour}
              onChange={(e) =>
                handleChange(index, "endHour", e.target.value)
              }
              disabled={!workSchedule[index].isWorkDay}
            />
          </label>
          <label>
            יום עבודה:
            <input
              type="checkbox"
              checked={workSchedule[index].isWorkDay}
              onChange={(e) =>
                handleChange(index, "isWorkDay", e.target.checked)
              }
            />
          </label>
        </div>
      ))}
      <button type="submit">שמור</button>
    </form>
  );
};

export default UpdateWorkSchedule;
