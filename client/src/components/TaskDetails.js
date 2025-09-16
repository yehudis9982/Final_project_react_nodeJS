import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { Paper, Typography, Box, Button } from "@mui/material";
import "../css/TaskDetails.css";

const TaskDetails = () => {
  const { _id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:2025/api/Task/${_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTask(res.data);
      } catch (err) {
        setError("שגיאה בטעינת פרטי המשימה");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [_id]);

  if (loading) return <div>טוען...</div>;
  if (error) return <div>{error}</div>;
  if (!task) return <div>לא נמצאה משימה</div>;

  return (
    <Box className="task-details-container">
      <Paper elevation={3} className="task-details-paper">
        <Box className="task-details-header">
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
          <Typography variant="h6" align="center" sx={{ flex: 1 }}>
            פרטי משימה
          </Typography>
        </Box>
        <Typography><b>כותרת:</b> {task.title}</Typography>
        <Typography><b>תיאור:</b> {task.body}</Typography>
        {/* אפשר להוסיף כאן שדות נוספים */}
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate("/tasks")}
          className="back-btn"
          sx={{ mt: 2 }}
        >
          חזרה לרשימת המשימות
        </Button>
      </Paper>
    </Box>
  );
};

export default TaskDetails;