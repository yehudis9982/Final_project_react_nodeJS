import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { TextField, Button, Paper, Typography, Box, List, ListItem, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import "../css/KindergartenList.css";
import "../css/Dialogs.css";

const KindergartenList = () => {
  const [kindergartens, setKindergartens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDialogSubmit = async () => {
    setError("");
    const address = {
      street: formData.street,
      city: formData.city,
      bildingNumber: formData.bildingNumber,
      zipCode: formData.zipCode
    };
    try {
      await axios.post(
        "http://localhost:2025/api/Kindergarten",
        {
          institutionSymbol: formData.institutionSymbol,
          address,
          kindergartenTeacherName: formData.kindergartenTeacherName,
          phone: formData.phone,
          age: formData.age
        },
        { headers }
      );
      setMessage("הגן נוסף בהצלחה!");
      
      // רענון רשימת הגנים
      fetchKindergartens();
      
      // סגירת הדיאלוג וניקוי הטופס
      setIsDialogOpen(false);
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
    } catch (err) {
      setError(err?.response?.data?.message || "שגיאה בשמירת הגן");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const address = {
      street: formData.street,
      city: formData.city,
      bildingNumber: formData.bildingNumber,
      zipCode: formData.zipCode
    };
    try {
      if (editId) {
        await axios.put(
          `http://localhost:2025/api/Kindergarten/${editId}`,
          {
            institutionSymbol: formData.institutionSymbol,
            address,
            kindergartenTeacherName: formData.kindergartenTeacherName,
            phone: formData.phone,
            age: formData.age
          },
          { headers }
        );
        setMessage("הגן עודכן בהצלחה!");
      } else {
        await axios.post(
          "http://localhost:2025/api/Kindergarten",
          {
            institutionSymbol: formData.institutionSymbol,
            address,
            kindergartenTeacherName: formData.kindergartenTeacherName,
            phone: formData.phone,
            age: formData.age
          },
          { headers }
        );
        setMessage("הגן נוסף בהצלחה!");
      }
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
      fetchKindergartens();
    } catch (err) {
      setError(err?.response?.data?.message || "שגיאה בשמירה");
    }
  };

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
        <Typography variant="h5" align="center" gutterBottom>
          הגנים שלי
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setIsDialogOpen(true)}
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
        {message && <Typography color="success.main" align="center">{message}</Typography>}
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
      
      {/* דיאלוג להוספת גן חדש */}
      <Dialog 
        open={isDialogOpen} 
        onClose={() => {
          setIsDialogOpen(false);
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
          setError("");
        }}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          הוספת גן חדש
        </DialogTitle>
        <DialogContent dividers>
          {error && <Typography color="error" align="center">{error}</Typography>}
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
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setIsDialogOpen(false);
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
              setError("");
            }} 
            color="secondary"
          >
            ביטול
          </Button>
          <Button 
            onClick={handleDialogSubmit} 
            color="primary" 
            variant="contained"
          >
            הוסף גן
          </Button>
        </DialogActions>
      </Dialog>
      <footer className="kindergarten-footer">
        <Typography variant="body2" align="center">
          כל הזכויות שמורות &copy; 2025 | מערכת יועצות
        </Typography>
      </footer>
    </Box>
  );
};

export default KindergartenList;