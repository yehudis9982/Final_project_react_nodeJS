import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { Button, TextField, Checkbox, FormControlLabel, Typography, Box } from "@mui/material";
import "../css/ConsultantNotesModal.css";

export default function ConsultantNotesModal({ open, onClose, consultantId, token }) {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [pinned, setPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchNotes = async () => {
    if (!consultantId) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`http://localhost:2025/api/Consultant/${consultantId}/notes`, { headers });
      setNotes(Array.isArray(data?.notes) ? data.notes : []);
    } catch (err) {
      setError(err?.response?.data?.message || "שגיאה בטעינת הערות");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, consultantId]);

  const addNote = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      await axios.post(
        `http://localhost:2025/api/Consultant/${consultantId}/notes`,
        { text, pinned },
        { headers }
      );
      setText("");
      setPinned(false);
      await fetchNotes();
    } catch (err) {
      setError(err?.response?.data?.message || "שגיאה בהוספת הערה");
    } finally {
      setLoading(false);
    }
  };

  const togglePin = async (noteId, current) => {
    try {
      await axios.put(
        `http://localhost:2025/api/Consultant/${consultantId}/notes/${noteId}`,
        { pinned: !current },
        { headers }
      );
      await fetchNotes();
    } catch (err) {
      setError(err?.response?.data?.message || "שגיאה בעדכון הערה");
    }
  };

  const removeNote = async (noteId) => {
    if (!window.confirm("למחוק הערה?")) return;
    try {
      await axios.delete(`http://localhost:2025/api/Consultant/${consultantId}/notes/${noteId}`, { headers });
      await fetchNotes();
    } catch (err) {
      setError(err?.response?.data?.message || "שגיאה במחיקה");
    }
  };

  if (!open) return null;

  return (
    <div className="notes-backdrop">
      <Box className="notes-modal" dir="rtl">
        <Box className="notes-header">
          <Typography variant="h6"><strong>הערות למטפלת</strong></Typography>
          <Button variant="outlined" color="secondary" onClick={onClose}>סגור</Button>
        </Box>

        <Box className="notes-form">
          <TextField
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="כתוב/י הערה..."
            multiline
            rows={3}
            fullWidth
            margin="normal"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                color="primary"
              />
            }
            label="להצמדה"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={addNote}
            disabled={loading || !text.trim()}
            className="add-note-btn"
          >
            הוספה
          </Button>
        </Box>

        {loading ? (
          <Typography align="center">טוען...</Typography>
        ) : error ? (
          <Typography color="error" align="center">{error}</Typography>
        ) : (
          <ul className="notes-list">
            {notes.length === 0 && <li className="notes-empty">אין הערות</li>}
            {notes.map((n) => (
              <li key={n._id} className="note-item">
                <Box display="flex" justifyContent="space-between" gap={2}>
                  <Box>
                    <Typography fontWeight={600}>
                      {n?.author?.firstName} {n?.author?.lastName}
                      {n.pinned ? <span className="note-badge">מוצמד</span> : null}
                    </Typography>
                    <Typography style={{ whiteSpace: "pre-wrap" }}>{n.text}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(n.createdAt).toLocaleString("he-IL")}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="text"
                      color="warning"
                      size="small"
                      onClick={() => togglePin(n._id, n.pinned)}
                    >
                      {n.pinned ? "בטל הצמדה" : "הצמד"}
                    </Button>
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      onClick={() => removeNote(n._id)}
                    >
                      מחק
                    </Button>
                  </Box>
                </Box>
              </li>
            ))}
          </ul>
        )}
      </Box>
    </div>
  );
}