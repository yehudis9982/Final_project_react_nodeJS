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
    <form onSubmit={handleSubmit}>
      <h2>הוספת יועצת חדשה</h2>
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
  );
};

export default ConsultantForm;