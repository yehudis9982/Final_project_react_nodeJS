import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ConsultantForm = ({ token }) => {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" ,tz:"",password:"",role:"",phone:""});
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:2025/api/Consultant", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate("/consultants");
    } catch (err) {
      setError("שגיאה בהוספת יועצת");
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
        <h2 style={{ margin: 0 }}>הוספת יועצת חדשה</h2>
        <div></div>
      </div>
      <form onSubmit={handleSubmit}>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <input
        name="firstName"
        placeholder="שם פרטי"
        value={form.firstName}
        onChange={handleChange}
        required
      />
      <input
        name="lastName"
        placeholder="שם משפחה"
        value={form.lastName}
        onChange={handleChange}
        required
      />
      <input
        name="tz"
        placeholder="תעודת זהות"
        value={form.tz}
        onChange={handleChange}
        required
      />
      <input
        name="password"
        placeholder="סיסמה" 
        value={form.password}
        onChange={handleChange}
        required
      />
      <input
        name="phone"
        placeholder=" פאלפון"
        value={form.phone}
        onChange={handleChange}
        required
      />
      <input
        name="email"
        placeholder="אימייל"
        value={form.email}
        onChange={handleChange}
        required
        type="text"
      />
      <input
        name="role"
        placeholder="תפקיד"
        value={form.role}
        onChange={handleChange}
        required
      />
        <button type="submit">הוספה</button>
      </form>
    </div>
  );
};

export default ConsultantForm;