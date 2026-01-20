import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { Paper, Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import Footer from './Footer';
import "../css/ViewWorkSchedule.css";

const ViewWorkSchedule = () => {
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי"];
  const token = localStorage.getItem("token");
  const [workSchedule, setWorkSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWorkSchedule = async () => {
      try {
        // קבלת מידע על היועצת הנוכחית
        const res = await axios.get("http://localhost:2025/api/Consultant/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const schedule = res.data?.workSchedule || [];
        setWorkSchedule(schedule);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching work schedule:", err);
        setError("שגיאה בטעינת מערכת השעות");
        setLoading(false);
      }
    };

    if (token) {
      fetchWorkSchedule();
    } else {
      setError("אין טוקן התחברות");
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <Box className="view-work-schedule-container">
        <Paper elevation={3} className="view-work-schedule-paper">
          <Typography variant="h5" align="center">טוען מערכת שעות...</Typography>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="view-work-schedule-container">
        <Paper elevation={3} className="view-work-schedule-paper">
          <Typography variant="h5" align="center" color="error">{error}</Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => window.location.href = "/consultant-dashboard"}
            className="home-btn"
          >
            חזרה לדף הבית
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="view-work-schedule-container">
      <Paper elevation={3} className="view-work-schedule-paper">
        <Box className="view-work-schedule-header">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => window.location.href = "/consultant-dashboard"}
            className="home-btn"
          >
            ← דף הבית
          </Button>
          <Typography variant="h5" align="center" sx={{ flex: 1 }}>
            מערכת השעות שלי
          </Typography>
        </Box>

        {workSchedule.length === 0 ? (
          <Typography variant="body1" align="center" color="warning.main" sx={{ my: 3 }}>
            עדיין לא הוגדרה מערכת שעות. אנא פנה למפקחת לעדכון מערכת השעות.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center"><strong>יום</strong></TableCell>
                  <TableCell align="center"><strong>שעת התחלה</strong></TableCell>
                  <TableCell align="center"><strong>שעת סיום</strong></TableCell>
                  <TableCell align="center"><strong>סטטוס</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {days.map((day, index) => {
                  const daySchedule = workSchedule.find(s => s.dayOfWeek === index);
                  const isWorkDay = daySchedule?.isWorkDay || false;
                  
                  return (
                    <TableRow key={index}>
                      <TableCell align="center">{day}</TableCell>
                      <TableCell align="center">
                        {isWorkDay && daySchedule?.startHour ? daySchedule.startHour : "-"}
                      </TableCell>
                      <TableCell align="center">
                        {isWorkDay && daySchedule?.endHour ? daySchedule.endHour : "-"}
                      </TableCell>
                      <TableCell align="center">
                        {isWorkDay ? (
                          <span style={{ color: 'green', fontWeight: 'bold' }}>יום עבודה</span>
                        ) : (
                          <span style={{ color: 'gray' }}>לא עובדת</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
  <Footer />
</Box>
);
};

export default ViewWorkSchedule;
