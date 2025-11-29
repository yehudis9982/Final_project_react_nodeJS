import React from "react";
import { Paper, Typography, Box, List, ListItem, ListItemButton } from "@mui/material";
import "../css/ConsultantDashboard.css";

const ConsultantDashboard = ({ consultant }) => {
  // אם אין consultant כ-prop, ננסה לקרוא מ-localStorage
  if (!consultant) {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        consultant = decoded;
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }
  return (
    <Box className="dashboard-container">
      <Paper elevation={3} className="dashboard-paper">
        {!consultant ? (
          <Typography variant="h5" align="center">טוען נתונים...</Typography>
        ) : (
          <>
            <Typography variant="h4" align="center" gutterBottom>
              שלום {consultant.name || consultant.firstName}!
            </Typography>
            {(!consultant?.workSchedule || consultant.workSchedule.length === 0) && (
              <Typography variant="body1" color="warning.main" align="center" gutterBottom>
                שימי לב עדיין לא הגדרת שעות עבודה, יש לעדכן בהקדם!
              </Typography>
            )}
            <List className="dashboard-list">
              <ListItem>
                <ListItemButton component="a" href="/tasks">המשימות שלי</ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton component="a" href="/weekly-reports">הדוחות השבועיים שלי</ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton component="a" href="/kindergartens">רשימת הגנים שלי</ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton component="a" href="/view-work-schedule">מערכת השעות שלי</ListItemButton>
              </ListItem>
              <ListItem>
                <ListItemButton component="a" href="/supervisor-notes">הערות מפקחת</ListItemButton>
              </ListItem>
            </List>
          </>
        )}
      </Paper>
      <footer className="dashboard-footer">
        <Typography variant="body2" align="center">
          כל הזכויות שמורות &copy; 2025 | מערכת יועצות
        </Typography>
      </footer>
    </Box>
  );
};

export default ConsultantDashboard;