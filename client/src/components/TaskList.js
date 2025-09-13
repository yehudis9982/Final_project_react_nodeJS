import React, { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import axios from "../api/axios";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const consultantId = searchParams.get("consultant");

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
      // רענון הרשימה אחרי סימון כהושלמה
      setTasks((prev) =>
        prev.map((task) =>
          task._id === id ? { ...task, completed: true } : task
        )
      );
    } catch {
      alert("שגיאה בסימון המשימה כהושלמה");
    }
  };

  if (loading) return <div>טוען...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button
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
          style={{
            background: "#6b7280",
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: 4,
            fontSize: "14px",
            cursor: "pointer"
          }}
        >
          ← דף הבית
        </button>
        <h3 style={{ margin: 0 }}>המשימות {consultantId ? "ליועצת" : "שלי"}</h3>
        <div></div>
      </div>
      <button onClick={() => navigate(`/add-task${consultantId ? `?consultant=${consultantId}` : ""}`)}>
        הוספת משימה חדשה
      </button>
      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            <Link to={`/tasks/${task._id}`}>{task.title}</Link>
            {task.completed ? (
              <span style={{ color: "green", marginRight: 8 }}>✔ הושלם</span>
            ) : (
              <button onClick={() => handleComplete(task._id)}>
                סמן כהושלם
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;