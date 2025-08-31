import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const KindergartenList = () => {
  const [kindergartens, setKindergartens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchKindergartens = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:2025/api/Kindergarten", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setKindergartens(res.data);
      } catch (err) {
        setError("שגיאה בטעינת הגנים");
      } finally {
        setLoading(false);
      }
    };
    fetchKindergartens();
  }, []);

  if (loading) return <div>טוען...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h3>רשימת הגנים שלי</h3>
      <ul>
        {kindergartens.map((k) => (
          <li key={k._id}>{k.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default KindergartenList;
