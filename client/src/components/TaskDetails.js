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
      <h3>פרטי משימה</h3>
      <div>כותרת: {task.title}</div>
      <div>תיאור: {task.body}</div>
      {/* אפשר להוסיף כאן שדות נוספים */}
      <button onClick={() => navigate("/tasks")}>חזרה לרשימת המשימות</button>
    </div>
  );
};

export default TaskDetails;