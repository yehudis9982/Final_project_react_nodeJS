import React, { useEffect, useState } from "react";
import axios from "../api/axios";

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
    <div style={styles.backdrop}>
      <div style={styles.modal} dir="rtl">
        <div style={styles.header}>
          <strong>הערות למטפלת</strong>
          <button onClick={onClose}>סגור</button>
        </div>

        <div style={{ marginBottom: 8 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="כתוב/י הערה..."
            rows={3}
            style={{ width: "100%" }}
          />
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
            להצמדה
          </label>
          <div>
            <button onClick={addNote} disabled={loading || !text.trim()}>הוספה</button>
          </div>
        </div>

        {loading ? (
          <div>טוען...</div>
        ) : error ? (
          <div style={{ color: "#c00" }}>{error}</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {notes.length === 0 && <li style={{ color: "#666" }}>אין הערות</li>}
            {notes.map((n) => (
              <li key={n._id} style={styles.noteItem}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {n?.author?.firstName} {n?.author?.lastName}
                      {n.pinned ? <span style={styles.badge}>מוצמד</span> : null}
                    </div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{n.text}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {new Date(n.createdAt).toLocaleString("he-IL")}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => togglePin(n._id, n.pinned)}>
                      {n.pinned ? "בטל הצמדה" : "הצמד"}
                    </button>
                    <button onClick={() => removeNote(n._id)}>מחק</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  modal: {
    width: "min(720px, 96vw)",
    background: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  },
  header: { display: "flex", justifyContent: "space-between", marginBottom: 8 },
  noteItem: { border: "1px solid #eee", borderRadius: 8, padding: 8, marginBottom: 8 },
  badge: { marginInlineStart: 8, fontSize: 11, color: "#444", background: "#eee", padding: "2px 6px", borderRadius: 6 },
};