import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";

const TaskDetails = () => {
  const { _id} = useParams();
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
                window.location.href = "/";
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
        <h3 style={{ margin: 0 }}>פרטי משימה</h3>
        <div></div>
      </div>
      <div>כותרת: {task.title}</div>
      <div>תיאור: {task.body}</div>
      {/* אפשר להוסיף כאן שדות נוספים */}
      <button onClick={() => navigate("/tasks")}>חזרה לרשימת המשימות</button>
    </div>
  );
};

export default TaskDetails;