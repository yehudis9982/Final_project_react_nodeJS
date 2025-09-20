import React, { useState } from "react";
import axios from "axios";
import { Paper, Typography, Box, Button, FormControlLabel, Checkbox, TextField } from "@mui/material";
import "../css/UpdateWorkSchedule.css";

const UpdateWorkSchedule = () => {
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי"];
  const token = localStorage.getItem("token");
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

      const updatedWorkSchedule = res.data?.workSchedule ?? [];
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
      
      // חזרה לדף הבית אחרי שמירה מוצלחת
      setTimeout(() => {
        try {
          const currentToken = localStorage.getItem("token");
          if (currentToken) {
            const decoded = JSON.parse(atob(currentToken.split('.')[1]));
            if (decoded?.roles === "Supervisor") {
              window.location.href = "/supervisor-dashboard";
            } else {
              window.location.href = "/consultant-dashboard";
            }
          } else {
            window.location.href = "/";
          }
        } catch (navError) {
          console.error("Navigation error:", navError);
          window.location.href = "/consultant-dashboard";
        }
      }, 1000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "שגיאה בבקשה";
        alert(msg);
      } else {
        alert("שגיאה לא צפויה");
      }
    }
  };

  return (
    <Box className="update-work-schedule-container">
      <Paper elevation={3} className="update-work-schedule-paper">
        <Box className="update-work-schedule-header">
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
            עדכון לוח עבודה
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          {days.map((day, index) => (
            <Box key={index} className="work-day-row">
              <Typography fontWeight="bold">{day}</Typography>
              <TextField
                type="time"
                label="שעת התחלה"
                value={workSchedule[index].startHour}
                onChange={(e) => handleChange(index, "startHour", e.target.value)}
                disabled={!workSchedule[index].isWorkDay}
                size="small"
                className="work-day-input"
              />
              <TextField
                type="time"
                label="שעת סיום"
                value={workSchedule[index].endHour}
                onChange={(e) => handleChange(index, "endHour", e.target.value)}
                disabled={!workSchedule[index].isWorkDay}
                size="small"
                className="work-day-input"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={workSchedule[index].isWorkDay}
                    onChange={(e) => handleChange(index, "isWorkDay", e.target.checked)}
                    color="primary"
                  />
                }
                label="יום עבודה"
              />
            </Box>
          ))}
          <Button type="submit" variant="contained" color="primary" className="save-btn">
            שמור
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default UpdateWorkSchedule;