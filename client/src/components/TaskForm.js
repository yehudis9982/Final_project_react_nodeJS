import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../api/axios";

const TaskForm = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const consultantId = searchParams.get("consultant");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // בדיקה: אם אין consultantId והמפקחת מחוברת, לא לאפשר שליחה
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
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button
          type="button"
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
        <h3 style={{ margin: 0 }}>הוספת משימה חדשה</h3>
        <div></div>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="כותרת"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="תיאור"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button type="submit">שמור</button>
      </form>
      {error && <div>{error}</div>}
    </div>
  );
};

export default TaskForm;