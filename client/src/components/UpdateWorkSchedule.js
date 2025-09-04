import React, { useState } from "react";
import axios from "axios";

const UpdateWorkSchedule = () => {
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
 const consultant = JSON.parse(localStorage.getItem("consultant"));
 const token = consultant?.accessToken;
  // אתחול מערך עם 7 ימים ריקים
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
    try {
      const payload = workSchedule.map(day => ({
  ...day,
  startHour: day.isWorkDay ? day.startHour : null,
  endHour: day.isWorkDay ? day.endHour : null,
}));
     await axios.put("http://localhost:2025/api/Consultant/work-schedule", 
  { workSchedule: payload },
  { headers: { Authorization: `Bearer ${token}` } }
);
    } catch (err) {
      console.error("שגיאה:", err);
      alert("אירעה שגיאה בשמירת לוח העבודה");
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
