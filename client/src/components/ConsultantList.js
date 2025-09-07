import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const REPORTS_PATH = "/reports"; // ← עדכן לפי הראוט בפועל

const ConsultantList = ({ token }) => {
  const [consultants, setConsultants] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        const res = await axios.get("http://localhost:2025/api/Consultant", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConsultants(res.data);
      } catch {
        setError("שגיאה בטעינת היועצות");
      }
    };
    fetchConsultants();
  }, [token]);

  const filtered = consultants.filter((c) =>
    (`${c.firstName ?? ""} ${c.lastName ?? ""}`).includes(search)
  );

  if (error) return <div>{error}</div>;

  return (
    <div dir="rtl">
      <h2>רשימת יועצות</h2>
      <button
        style={{ marginBottom: "10px", display: "inline-block" }}
        onClick={() => navigate("/consultants/new")}
      >
        הוספת יועצת חדשה
      </button>

      <input
        type="text"
        placeholder="חיפוש לפי שם יועצת..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "10px", direction: "rtl" }}
      />

      <ul style={{ listStyle: "none", padding: 0 }}>
        {filtered.map((c) => (
          <li
            key={c._id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <span style={{ flex: 1 }}>
              {c.firstName} {c.lastName} - {c.email}
            </span>
            <button
              onClick={() =>
                navigate(`${REPORTS_PATH}?consultantId=${c._id}`)
              }
            >
              צפייה בדוחות שלה
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConsultantList;
