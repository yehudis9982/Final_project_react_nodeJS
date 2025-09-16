import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../api/axios";
import { TextField, Button, Paper, Typography, Box } from "@mui/material";
import "../css/TaskForm.css";

const TaskForm = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const consultantId = searchParams.get("consultant");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    if (!consultantId && user?.roles === "Supervisor") {
      setError("יש לבחור יועצת לפני יצירת משימה");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:2025/api/Task",
        consultantId ? { title, body, consultant: consultantId } : { title, body },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/tasks${consultantId ? `?consultant=${consultantId}` : ""}`);
    } catch (err) {
      setError("שגיאה בהוספת משימה");
    }
  };

  return (
    <Box className="task-container">
      <Paper elevation={3} className="task-paper">
        <Box className="task-header">
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
                  window.location.href = "/";
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
            הוספת משימה חדשה
          </Typography>
        </Box>
        <form onSubmit={handleSubmit} className="task-form">
          <TextField
            type="text"
            label="כותרת"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="תיאור"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            multiline
            rows={4}
            fullWidth
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="task-btn"
          >
            שמור
          </Button>
        </form>
        {error && <Typography color="error" align="center">{error}</Typography>}
      </Paper>
      <footer className="task-footer">
        <Typography variant="body2" align="center">
          כל הזכויות שמורות &copy; 2025 | מערכת יועצות
        </Typography>
      </footer>
    </Box>
  );
};

export default TaskForm;