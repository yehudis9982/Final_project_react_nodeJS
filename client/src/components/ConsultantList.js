import React, { useEffect, useState } from "react";
import axios from "axios"; // אם יש אינסטנס ייעודי – החלף ל ../api/axios
import { useNavigate } from "react-router-dom";
import ConsultantNotesModal from "./ConsultantNotesModal";

const REPORTS_PATH = "/reports"; // עדכן לפי הראוט בפועל

const ConsultantList = () => {
  const [consultants, setConsultants] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [openForId, setOpenForId] = useState(null);
  const navigate = useNavigate();
 const token = localStorage.getItem("token");
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("http://localhost:2025/api/Consultant", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConsultants(res.data || []);
      } catch {
        setError("שגיאה בטעינת היועצות");
      }
    })();
  }, [token]);

  const filtered = consultants.filter((c) =>
    (`${c?.firstName ?? ""} ${c?.lastName ?? ""}`)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (error) return <div>{error}</div>;

  return (
    <div dir="rtl">
      <h2>רשימת יועצות</h2>

      <button
        style={{ marginBottom: 10, display: "inline-block" }}
        onClick={() => navigate("/consultants/new")}
      >
        הוספת יועצת חדשה
      </button>

      <input
        type="text"
        placeholder="חיפוש לפי שם יועצת..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 10, direction: "rtl" }}
      />

      <ul style={{ listStyle: "none", padding: 0 }}>
        {filtered.map((c) => (
          <li
            key={c._id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <span style={{ flex: 1 }}>
              {c.firstName} {c.lastName} - {c.email}
            </span>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => navigate(`${REPORTS_PATH}?consultantId=${c._id}`)}
                title="צפייה בדוחות היועצת"
              >
                דוחות
              </button>

              <button
                onClick={() => setOpenForId(c._id)}
                title="הוספה/צפייה בהערות ליועצת"
              >
                הערות
              </button>
            </div>
          </li>
        ))}
      </ul>

      <ConsultantNotesModal
        open={Boolean(openForId)}
        onClose={() => setOpenForId(null)}
        consultantId={openForId}
        token={token}
      />
    </div>
  );
};

export default ConsultantList;
