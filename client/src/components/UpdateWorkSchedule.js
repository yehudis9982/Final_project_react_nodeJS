import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Paper, Typography, Box, Button, FormControlLabel, Checkbox, TextField } from "@mui/material";
import "../css/UpdateWorkSchedule.css";

const UpdateWorkSchedule = () => {
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי"];
  const token = localStorage.getItem("token");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const consultantId = searchParams.get("consultantId"); // מזהה היועצת (אם המפקחת עורכת)
  const [consultantName, setConsultantName] = useState("");
  const [workSchedule, setWorkSchedule] = useState(
    days.map((_, index) => ({
      dayOfWeek: index,
      startHour: "",
      endHour: "",
      isWorkDay: false,
    }))
  );

  // טעינת מערכת השעות הקיימת של היועצת
  useEffect(() => {
    const fetchConsultantSchedule = async () => {
      if (!consultantId) return; // אם אין consultantId, זו יועצת שעורכת לעצמה
      
      try {
        const res = await axios.get(`http://localhost:2025/api/Consultant/${consultantId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setConsultantName(`${res.data.firstName} ${res.data.lastName}`);
        
        if (res.data.workSchedule && res.data.workSchedule.length > 0) {
          // עדכון מערכת השעות עם הנתונים הקיימים
          const updatedSchedule = days.map((_, index) => {
            const existingDay = res.data.workSchedule.find(d => d.dayOfWeek === index);
            return existingDay || {
              dayOfWeek: index,
              startHour: "",
              endHour: "",
              isWorkDay: false,
            };
          });
          setWorkSchedule(updatedSchedule);
        }
      } catch (err) {
        console.error("Error fetching consultant schedule:", err);
        alert("שגיאה בטעינת מערכת השעות של היועצת");
      }
    };

    fetchConsultantSchedule();
  }, [consultantId, token]);

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

      // אם יש consultantId, עדכן למפקחת, אחרת עדכן ליועצת עצמה
      const url = consultantId 
        ? `http://localhost:2025/api/Consultant/${consultantId}/work-schedule`
        : "http://localhost:2025/api/Consultant/work-schedule";

      const res = await axios.put(
        url,
        { workSchedule: payload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedWorkSchedule = res.data?.workSchedule ?? [];
      
      // רק אם היועצת עורכת לעצמה, עדכן את localStorage
      if (!consultantId) {
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
      }

      alert(consultantId 
        ? `מערכת השעות של ${consultantName} עודכנה בהצלחה`
        : "לוח העבודה נשמר בהצלחה"
      );
      
      // חזרה לדף המתאים
      setTimeout(() => {
        if (consultantId) {
          // אם מפקחת עדכנה, חזור לרשימת היועצות
          navigate("/consultants");
        } else {
          // אם יועצת עדכנה לעצמה, חזור לדף הבית שלה
          navigate("/consultant-dashboard");
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
              if (consultantId) {
                navigate("/consultants");
              } else {
                navigate("/consultant-dashboard");
              }
            }}
            className="home-btn"
          >
            ← חזור
          </Button>
          <Typography variant="h5" align="center" sx={{ flex: 1 }}>
            {consultantId 
              ? `עדכון מערכת שעות - ${consultantName}` 
              : "עדכון לוח עבודה"
            }
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