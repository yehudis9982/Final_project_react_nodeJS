import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Paper, Typography, Box, List, ListItem, Chip } from '@mui/material';
import "../css/SupervisorNotes.css";

function SupervisorNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get('http://localhost:2025/api/Consultant/me/notes', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setNotes(res.data.notes || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'שגיאה');
        setLoading(false);
      });
  }, [token]);

  if (loading) return <div>טוען הערות...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box className="supervisor-notes-container">
      <Paper elevation={3} className="supervisor-notes-paper">
        <Typography variant="h5" align="center" gutterBottom>
          הערות מהמפקחת
        </Typography>
        {notes.length === 0 ? (
          <Typography align="center" color="text.secondary">אין הערות</Typography>
        ) : (
          <List className="supervisor-notes-list">
            {notes.map(note => (
              <ListItem key={note._id} className="supervisor-notes-list-item">
                <Box flex={1}>
                  <Typography><b>תוכן:</b> {note.text}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    <b>נכתבה בתאריך:</b> {new Date(note.createdAt).toLocaleString("he-IL")}
                  </Typography>
                </Box>
                {note.pinned && <Chip label="הערה מוצמדת" color="error" size="small" className="supervisor-notes-pinned" />}
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}

export default SupervisorNotes;