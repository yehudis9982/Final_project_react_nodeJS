import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SupervisorNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem("token");
  console.log("token from header:", token);
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
    <div>
      <h2>הערות מהמפקחת</h2>
      {notes.length === 0 ? (
        <div>אין הערות</div>
      ) : (
        <ul>
          {notes.map(note => (
            <li key={note._id}>
              <div><b>תוכן:</b> {note.text}</div>
              <div><b>נכתבה בתאריך:</b> {new Date(note.createdAt).toLocaleString()}</div>
              {note.pinned && <div style={{color: 'red'}}>הערה מוצמדת</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SupervisorNotes;