import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const KindergartenList = () => {
  const [kindergartens, setKindergartens] = useState([]);
  const [allKindergartens, setAllKindergartens] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    (async () => {
      try {
        const [allRes, meRes] = await Promise.all([
          axios.get("http://localhost:2025/api/Kindergarten", { headers }),
          axios.get("http://localhost:2025/api/consultant/me", { headers }), // ← ודא התאמה לראוטר
        ]);

        setAllKindergartens(allRes.data || []);

        const myKindergartens = meRes.data?.kindergartens || [];
        setKindergartens(myKindergartens);
        setSelected(myKindergartens.map(k => k._id));
      } catch (err) {
        const serverMsg = err?.response?.data?.message;
        setError(serverMsg || "שגיאה בטעינת הגנים");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const value = Array.from(e.target.selectedOptions, opt => opt.value);
    setSelected(value);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        "http://localhost:2025/api/consultant/my-kindergartens", // ← ודא התאמה לראוטר
        { kindergartens: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("הרשימה עודכנה בהצלחה!");
    } catch (err) {
      const serverMsg = err?.response?.data?.message;
      setMessage(serverMsg || "שגיאה בעדכון הרשימה");
    }
  };

  if (loading) return <div>טוען...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h3>עדכון רשימת הגנים שלי</h3>

      <select multiple value={selected} onChange={handleChange} style={{ width: "100%", height: "200px" }}>
        {allKindergartens.map((k) => (
          <option key={k._id} value={k._id}>
            {/* אין שדה name במודל; נשתמש בשדות קיימים לתצוגה */}
            {k.institutionSymbol} — {k.kindergartenTeacherName}
          </option>
        ))}
      </select>

      <button onClick={handleSave}>שמור רשימה</button>
      {message && <p>{message}</p>}

      <h4>הגנים הנוכחיים שלך:</h4>
      <ul>
        {kindergartens.map((k) => (
          <li key={k._id}>
            {k.institutionSymbol} — {k.kindergartenTeacherName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default KindergartenList;
