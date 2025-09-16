import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Paper, Typography, Box } from "@mui/material";
import "../css/ConsultantForm.css";

const ConsultantForm = ({ token }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    tz: "",
    password: "",
    role: "",
    phone: ""
  });
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
    <Box className="consultant-container">
      <Paper elevation={3} className="consultant-paper">
        <Box className="consultant-header">
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
            הוספת יועצת חדשה
          </Typography>
        </Box>
        <form onSubmit={handleSubmit} className="consultant-form">
          {error && <Typography color="error" align="center">{error}</Typography>}
          <TextField
            name="firstName"
            label="שם פרטי"
            value={form.firstName}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            name="lastName"
            label="שם משפחה"
            value={form.lastName}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            name="tz"
            label="תעודת זהות"
            value={form.tz}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            name="password"
            label="סיסמה"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            name="phone"
            label="פלאפון"
            value={form.phone}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            name="email"
            label="אימייל"
            value={form.email}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            type="email"
          />
          <TextField
            name="role"
            label="תפקיד"
            value={form.role}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="consultant-btn"
          >
            הוספה
          </Button>
        </form>
      </Paper>
      <footer className="consultant-footer">
        <Typography variant="body2" align="center">
          כל הזכויות שמורות &copy; 2025 | מערכת יועצות
        </Typography>
      </footer>
    </Box>
  );
};

export default ConsultantForm;