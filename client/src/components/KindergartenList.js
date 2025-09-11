import React, { useEffect, useState } from "react";
import axios from "../api/axios";

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
    <div>
      <h3>הגנים שלי</h3>
      <button style={{ float: "left", marginBottom: 10 }} onClick={handleAdd}>
        + הוספת גן
      </button>
      {showAddForm && (
        <form onSubmit={handleFormSubmit} style={{ marginBottom: 20 }}>
          <input
            name="institutionSymbol"
            placeholder="סמל מוסד"
            value={formData.institutionSymbol}
            onChange={handleFormChange}
            required
          />
          <input
            name="city"
            placeholder="עיר"
            value={formData.city}
            onChange={handleFormChange}
            required
          />
          <input
            name="street"
            placeholder="רחוב"
            value={formData.street}
            onChange={handleFormChange}
            required
          />
          <input
            name="bildingNumber"
            placeholder="מספר בניין"
            value={formData.bildingNumber}
            onChange={handleFormChange}
            required
          />
          <input
            name="zipCode"
            placeholder="מיקוד"
            value={formData.zipCode}
            onChange={handleFormChange}
            required
          />
          <input
            name="kindergartenTeacherName"
            placeholder="שם הגננת"
            value={formData.kindergartenTeacherName}
            onChange={handleFormChange}
            required
          />
          <input
            name="phone"
            placeholder="טלפון"
            value={formData.phone}
            onChange={handleFormChange}
            required
          />
          <input
            name="age"
            placeholder="גיל"
            value={formData.age}
            onChange={handleFormChange}
            required
          />
          <button type="submit">{editId ? "עדכן גן" : "הוסף גן"}</button>
          <button type="button" onClick={() => setShowAddForm(false)}>ביטול</button>
        </form>
      )}
      {message && <p style={{ color: "green" }}>{message}</p>}
      <ul>
        {kindergartens.map((k) => (
          <li key={k._id}>
            {k.institutionSymbol} — {k.kindergartenTeacherName} — {k.address?.city} {k.address?.street} {k.address?.bildingNumber}
            <button style={{ marginRight: 8 }} onClick={() => handleEdit(k)}>
              עדכן
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default KindergartenList;