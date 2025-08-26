import React, { useEffect, useState } from "react";
import axios from "axios";

const ConsultantList = ({ token }) => {
  const [consultants, setConsultants] = useState([]);
  const [error, setError] = useState("");

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

  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>רשימת יועצות</h2>
      <ul>
        {consultants.map((c) => (
          <li key={c._id}>
            {c.firstName} {c.lastName} - {c.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConsultantList;