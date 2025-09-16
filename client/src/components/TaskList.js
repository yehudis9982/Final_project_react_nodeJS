import React, { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import axios from "../api/axios";
import { Paper, Typography, Box, Button, List, ListItem, Chip, Dialog, DialogContent, DialogActions, DialogTitle, TextField } from "@mui/material";
import "../css/TaskList.css";
import "../css/TaskForm.css";
import "../css/Dialogs.css";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [formError, setFormError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const consultantId = searchParams.get("consultant");

  useEffect(() => {
    // Check if user is admin (Supervisor)
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setIsAdmin(decoded?.roles === "Supervisor");
    }
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        let url = "http://localhost:2025/api/Task";
        if (consultantId) {
          url += `?consultant=${consultantId}`;
        }
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data);
      } catch (err) {
        setError("שגיאה בטעינת המשימות");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [consultantId]);

  const handleComplete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:2025/api/Task/complete/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prev) =>
        prev.map((task) =>
          task._id === id ? { ...task, completed: true } : task
        )
      );
    } catch {
      alert("שגיאה בסימון המשימה כהושלמה");
    }
  };

  const handleAddTask = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      
      if (!consultantId && user?.roles === "Supervisor") {
        setFormError("יש לבחור יועצת לפני יצירת משימה");
        return;
      }
      
      const payload = {
        title,
        body,
      };
      
      if (consultantId) {
        payload.consultant = consultantId;
      }
      
      const res = await axios.post(
        "http://localhost:2025/api/Task",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTasks((prev) => [...prev, res.data]);
      
      // ניקוי הטופס וסגירת הדיאלוג
      setTitle("");
      setBody("");
      setFormError("");
      setIsDialogOpen(false);
    } catch (err) {
      setFormError("שגיאה בהוספת המשימה");
      console.error(err);
    }
  };

  if (loading) return <div>טוען...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box className="task-list-container">
      <Paper elevation={3} className="task-list-paper">
        <Box className="task-list-header">
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
          <Typography variant="h6" align="center" sx={{ flex: 1 }}>
            המשימות {consultantId ? "ליועצת" : "שלי"}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsDialogOpen(true)}
          className="add-task-btn"
        >
          הוספת משימה חדשה
        </Button>
        <List className="task-list">
          {tasks.map((task) => (
            <ListItem key={task._id} className="task-list-item">
              <Box flex={1}>
                <Link to={`/tasks/${task._id}`} className="task-title-link">{task.title}</Link>
              </Box>
              {task.completed ? (
                <Chip label="✔ הושלם" color="success" size="small" className="task-completed-chip" />
              ) : (
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  onClick={() => handleComplete(task._id)}
                >
                  סמן כהושלם
                </Button>
              )}
            </ListItem>
          ))}
        </List>
      </Paper>
      
      {/* דיאלוג להוספת משימה */}
      <Dialog 
        open={isDialogOpen} 
        onClose={() => {
          setIsDialogOpen(false);
          setTitle("");
          setBody("");
          setFormError("");
        }}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          הוספת משימה חדשה
        </DialogTitle>
        <DialogContent dividers>
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
          {formError && <Typography color="error" align="center">{formError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setIsDialogOpen(false);
              setTitle("");
              setBody("");
              setFormError("");
            }} 
            color="secondary"
          >
            ביטול
          </Button>
          <Button 
            onClick={handleAddTask} 
            color="primary" 
            variant="contained"
            disabled={!title}
          >
            שמור
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskList;