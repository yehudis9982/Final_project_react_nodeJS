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
    // משוך את כל הגנים
    axios.get("http://localhost:2025/api/Kindergarten", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setAllKindergartens(res.data));

    // משוך את הגנים של היועצת
    axios.get("http://localhost:2025/api/Consultant/me", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      setKindergartens(res.data.kindergartens || []);
      setSelected(res.data.kindergartens?.map(k => k._id) || []);
      setLoading(false);
    }).catch(() => {
      setError("שגיאה בטעינת הגנים");
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => {
    const value = Array.from(e.target.selectedOptions, opt => opt.value);
    setSelected(value);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put("http://localhost:2025/api/Consultant/my-kindergartens", 
        { kindergartens: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("הרשימה עודכנה בהצלחה!");
    } catch (err) {
      setMessage("שגיאה בעדכון הרשימה");
    }
  };

  if (loading) return <div>טוען...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h3>עדכון רשימת הגנים שלי</h3>
      <select multiple value={selected} onChange={handleChange} style={{ width: "100%", height: "200px" }}>
        {allKindergartens.map((k) => (
          <option key={k._id} value={k._id}>{k.name}</option>
        ))}
      </select>
      <button onClick={handleSave}>שמור רשימה</button>
      {message && <p>{message}</p>}
      <h4>הגנים הנוכחיים שלך:</h4>
      <ul>
        {kindergartens.map((k) => (
          <li key={k._id}>{k.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default KindergartenList;
