import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import ConsultantNotesModal from "./ConsultantNotesModal";
import { Paper, Typography, Box, Button, TextField, List, ListItem, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import "../css/ConsultantList.css";
import "../css/ConsultantForm.css";
import "../css/Dialogs.css";

const REPORTS_PATH = "/reports";

const ConsultantList = () => {
  const [consultants, setConsultants] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [openForId, setOpenForId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [consultantToDelete, setConsultantToDelete] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    tz: "",
    password: "",
    role: "",
    phone: ""
  });
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("http://localhost:2025/api/Consultant", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConsultants(res.data || []);
      } catch {
        setError("שגיאה בטעינת היועצות");
      }
    })();
  }, [token]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddConsultant = async () => {
    try {
      await axios.post("http://localhost:2025/api/Consultant", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // רענון רשימת היועצות
      const res = await axios.get("http://localhost:2025/api/Consultant", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConsultants(res.data || []);
      
      // סגירת הדיאלוג וניקוי הטופס
      setIsDialogOpen(false);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        tz: "",
        password: "",
        role: "",
        phone: ""
      });
      setFormError("");
    } catch (err) {
      setFormError("שגיאה בהוספת יועצת");
    }
  };

  const handleDeleteClick = (consultant) => {
    setConsultantToDelete(consultant);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!consultantToDelete) return;
    
    try {
      await axios.delete(`http://localhost:2025/api/Consultant/${consultantToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // רענון רשימת היועצות
      const res = await axios.get("http://localhost:2025/api/Consultant", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConsultants(res.data || []);
      
      // סגירת הדיאלוג
      setDeleteDialogOpen(false);
      setConsultantToDelete(null);
    } catch (err) {
      alert("שגיאה במחיקת היועצת");
      setDeleteDialogOpen(false);
      setConsultantToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setConsultantToDelete(null);
  };

  const filtered = consultants.filter((c) =>
    (`${c?.firstName ?? ""} ${c?.lastName ?? ""}`)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (error) return <div>{error}</div>;

  return (
    <Box className="consultant-list-container">
      <Paper elevation={3} className="consultant-list-paper">
        <Box className="consultant-list-header">
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
            רשימת יועצות
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsDialogOpen(true)}
          className="add-btn"
        >
          הוספת יועצת חדשה
        </Button>
        <TextField
          type="text"
          placeholder="חיפוש לפי שם יועצת..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          margin="normal"
          className="search-input"
        />
        <List className="consultant-list">
          {filtered.map((c) => (
            <ListItem
              key={c._id}
              className="consultant-list-item"
              disablePadding
            >
              <Box flex={1}>
                {c.firstName} {c.lastName} - {c.email}
              </Box>
              <Box className="consultant-list-actions">
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => navigate(`${REPORTS_PATH}?consultantId=${c._id}`)}
                  title="צפייה בדוחות היועצת"
                >
                  דוחות
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={() => setOpenForId(c._id)}
                  title="הוספה/צפייה בהערות ליועצת"
                >
                  הערות
                </Button>
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  onClick={() => navigate(`/tasks?consultant=${c._id}`)}
                  title="צפייה/הוספת משימות ליועצת"
                >
                  משימות
                </Button>
                <Button
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={() => navigate(`/UpdateWorkSchdule?consultantId=${c._id}`)}
                  title="עדכון מערכת שעות ליועצת"
                >
                  מערכת שעות
                </Button>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleDeleteClick(c)}
                  title="מחיקת יועצת"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
      <ConsultantNotesModal
        open={Boolean(openForId)}
        onClose={() => setOpenForId(null)}
        consultantId={openForId}
        token={token}
      />
      
      {/* דיאלוג להוספת יועצת חדשה */}
      <Dialog 
        open={isDialogOpen} 
        onClose={() => {
          setIsDialogOpen(false);
          setForm({
            firstName: "",
            lastName: "",
            email: "",
            tz: "",
            password: "",
            role: "",
            phone: ""
          });
          setFormError("");
        }}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          הוספת יועצת חדשה
        </DialogTitle>
        <DialogContent dividers>
          {formError && <Typography color="error" align="center">{formError}</Typography>}
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
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setIsDialogOpen(false);
              setForm({
                firstName: "",
                lastName: "",
                email: "",
                tz: "",
                password: "",
                role: "",
                phone: ""
              });
              setFormError("");
            }} 
            color="secondary"
          >
            ביטול
          </Button>
          <Button 
            onClick={handleAddConsultant} 
            color="primary" 
            variant="contained"
          >
            הוספה
          </Button>
        </DialogActions>
      </Dialog>

      {/* דיאלוג אישור מחיקה */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          אישור מחיקת יועצת
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            האם את/ה בטוח/ה שברצונך למחוק את היועצת{" "}
            <strong>
              {consultantToDelete?.firstName} {consultantToDelete?.lastName}
            </strong>
            ?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            פעולה זו אינה ניתנת לביטול!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            ביטול
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            מחק
          </Button>
        </DialogActions>
      </Dialog>

      <footer className="consultant-list-footer">
        <Typography variant="body2" align="center">
          כל הזכויות שמורות &copy; 2025 | מערכת יועצות
        </Typography>
      </footer>
    </Box>
  );
};

export default ConsultantList;