import React from "react";
import { useNavigate } from "react-router-dom";

const ConsultantDashboard = ({ consultant, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (onLogout) onLogout();
    navigate("/");
  };

  return (
    <div>
      <h2>שלום {consultant.name || consultant.firstName}!</h2>
      <ul>
        <li>
          <a href="/tasks">המשימות שלי</a>
        </li>
        <li>
          <a href="/weekly-reports">הדוחות השבועיים שלי</a>
        </li>
        <li>
          <a href="/kindergartens">רשימת הגנים שלי</a>
        </li>
        <li>
          <a href="/weekly-reports/new">דוח שבועי חדש</a>
        </li>
      </ul>
      <button onClick={handleLogout}>יציאה</button>
    </div>
  );
};

export default ConsultantDashboard;