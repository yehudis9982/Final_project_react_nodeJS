import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { TextField, Button, Paper, Typography, Box, List, ListItem } from "@mui/material";
import "../css/KindergartenList.css";

const KindergartenList = () => {
  const [kindergartens, setKindergartens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    institutionSymbol: "",
    street: "",
    city: "",
    bildingNumber: "",
    zipCode: "",
    kindergartenTeacherName: "",
    phone: "",
    age: ""
  });

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // טען את הגנים של היועצת
  const fetchKindergartens = async () => {
    try {
      const res = await axios.get("http://localhost:2025/api/Kindergarten", { headers });
      setKindergartens(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "שגיאה בטעינת הגנים");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKindergartens();
    // eslint-disable-next-line
  }, []);

  // עדכון ערכי הטופס
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // שמירת גן חדש או עדכון גן קיים
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    const payload = {
      institutionSymbol: formData.institutionSymbol,
      address: {
        street: formData.street,
        city: formData.city,
        bildingNumber: parseInt(formData.bildingNumber) || 0,
        zipCode: formData.zipCode
      },
      kindergartenTeacherName: formData.kindergartenTeacherName,
      phone: formData.phone,
      age: parseInt(formData.age) || 0
    };
    
    console.log("Sending payload:", payload); // לוג לבדיקה
    
    try {
      if (editId) {
        await axios.put(
          `http://localhost:2025/api/Kindergarten/${editId}`,
          payload,
          { headers }
        );
        setMessage("הגן עודכן בהצלחה!");
      } else {
        const response = await axios.post(
          "http://localhost:2025/api/Kindergarten",
          payload,
          { headers }
        );
        console.log("Response:", response.data); // לוג לבדיקה
        setMessage("הגן נוסף בהצלחה!");
      }
      
      // ניקוי הטופס וסגירתו
      setShowAddForm(false);
      setEditId(null);
      setFormData({
        institutionSymbol: "",
        street: "",
        city: "",
        bildingNumber: "",
        zipCode: "",
        kindergartenTeacherName: "",
        phone: "",
        age: ""
      });
      
      // רענון הרשימה
      await fetchKindergartens();
      
    } catch (err) {
      console.error("Error saving kindergarten:", err);
      const errorMsg = err?.response?.data?.message || 
                      err?.response?.data?.error ||
                      err?.message || 
                      "שגיאה בשמירה";
      setError(errorMsg);
    }
  };

  // פתיחת טופס עדכון עם ערכי הגן
  const handleEdit = (k) => {
    setEditId(k._id);
    setFormData({
      institutionSymbol: k.institutionSymbol,
      street: k.address?.street || "",
      city: k.address?.city || "",
      bildingNumber: k.address?.bildingNumber || "",
      zipCode: k.address?.zipCode || "",
      kindergartenTeacherName: k.kindergartenTeacherName,
      phone: k.phone,
      age: k.age
    });
    setShowAddForm(true);
    setMessage("");
    setError("");
  };

  // פתיחת טופס הוספה
  const handleAdd = () => {
    setEditId(null);
    setFormData({
      institutionSymbol: "",
      street: "",
      city: "",
      bildingNumber: "",
      zipCode: "",
      kindergartenTeacherName: "",
      phone: "",
      age: ""
    });
    setShowAddForm(true);
    setMessage("");
    setError("");
  };

  if (loading) return <div>טוען...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box className="kindergarten-container">
      <Paper elevation={3} className="kindergarten-paper">
        <Box className="kindergarten-header">
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
          <Typography variant="h5" align="center" sx={{ flex: 1 }}>
            הגנים שלי
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleAdd}
          className="add-btn"
        >
          + הוספת גן
        </Button>
        {showAddForm && (
          <form onSubmit={handleFormSubmit} className="kindergarten-form">
            <TextField
              name="institutionSymbol"
              label="סמל מוסד"
              value={formData.institutionSymbol}
              onChange={handleFormChange}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              name="city"
              label="עיר"
              value={formData.city}
              onChange={handleFormChange}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              name="street"
              label="רחוב"
              value={formData.street}
              onChange={handleFormChange}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              name="bildingNumber"
              label="מספר בניין"
              value={formData.bildingNumber}
              onChange={handleFormChange}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              name="zipCode"
              label="מיקוד"
              value={formData.zipCode}
              onChange={handleFormChange}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              name="kindergartenTeacherName"
              label="שם הגננת"
              value={formData.kindergartenTeacherName}
              onChange={handleFormChange}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              name="phone"
              label="טלפון"
              value={formData.phone}
              onChange={handleFormChange}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              name="age"
              label="גיל"
              value={formData.age}
              onChange={handleFormChange}
              required
              fullWidth
              margin="normal"
            />
            <Box display="flex" gap={2} mt={2}>
              <Button type="submit" variant="contained" color="primary">
                {editId ? "עדכן גן" : "הוסף גן"}
              </Button>
              <Button type="button" variant="outlined" color="secondary" onClick={() => setShowAddForm(false)}>
                ביטול
              </Button>
            </Box>
          </form>
        )}
        {message && <Typography color="success.main" align="center" sx={{ mt: 2 }}>{message}</Typography>}
        {error && <Typography color="error.main" align="center" sx={{ mt: 2 }}>{error}</Typography>}
        <List className="kindergarten-list">
          {kindergartens.map((k) => (
            <ListItem key={k._id} className="kindergarten-list-item">
              <Box flex={1}>
                {k.institutionSymbol} — {k.kindergartenTeacherName} — {k.address?.city} {k.address?.street} {k.address?.bildingNumber}
              </Box>
              <Button variant="outlined" color="primary" size="small" onClick={() => handleEdit(k)}>
                עדכן
              </Button>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default KindergartenList;