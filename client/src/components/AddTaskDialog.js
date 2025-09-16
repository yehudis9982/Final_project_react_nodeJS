import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton, FormControl, InputLabel, Select, MenuItem, FormHelperText } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import axios from "../api/axios";
import "../css/AddTaskDialog.css";

const AddTaskDialog = ({ open, onClose, onSave, isAdmin = false }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [consultantId, setConsultantId] = useState("");
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If the dialog is open and user is admin, fetch consultants
    if (open && isAdmin) {
      setLoading(true);
      const token = localStorage.getItem("token");
      axios.get("http://localhost:2025/api/Consultant", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          setConsultants(res.data || []);
        })
        .catch(err => {
          console.error("Error fetching consultants:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, isAdmin]);

  const handleSave = () => {
    onSave({ 
      title, 
      body,
      consultant: isAdmin && consultantId ? consultantId : undefined
    });
    
    // Reset form
    setTitle("");
    setBody("");
    setConsultantId("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        הוספת משימה חדשה
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', left: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          label="כותרת"
          value={title}
          onChange={e => setTitle(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="תיאור"
          value={body}
          onChange={e => setBody(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />
        {isAdmin && (
          <FormControl fullWidth margin="normal">
            <InputLabel id="consultant-select-label">יועצת</InputLabel>
            <Select
              labelId="consultant-select-label"
              value={consultantId}
              onChange={(e) => setConsultantId(e.target.value)}
              label="יועצת"
            >
              <MenuItem value="">
                <em>ללא יועצת</em>
              </MenuItem>
              {consultants.map((consultant) => (
                <MenuItem key={consultant._id} value={consultant._id}>
                  {consultant.firstName} {consultant.lastName}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>בחרי יועצת שתבצע את המשימה</FormHelperText>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">ביטול</Button>
        <Button onClick={handleSave} color="primary" variant="contained">שמור</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTaskDialog;
