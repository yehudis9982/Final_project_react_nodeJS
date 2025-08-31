import React, { useEffect, useState } from "react";
import axios from "axios";

const ConsultantList = ({ token }) => {
  const [consultants, setConsultants] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(""); // שדה חיפוש

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        const res = await axios.get("http://localhost:2025/api/Consultant", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConsultants(res.data);
      } catch (err) {
        setError("שגיאה בטעינת היועצות");
      }
    };
    fetchConsultants();
  }, [token]);

  // סינון היועצות לפי שם פרטי או משפחה
  const filtered = consultants.filter(c =>
    (c.firstName + " " + c.lastName).includes(search)
  );

  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>רשימת יועצות</h2>
      <input
        type="text"
        placeholder="חיפוש לפי שם יועצת..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: "10px", direction: "rtl" }}
      />
      <ul>
        {filtered.map((c) => (
          <li key={c._id}>
            {c.firstName} {c.lastName} - {c.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConsultantList;