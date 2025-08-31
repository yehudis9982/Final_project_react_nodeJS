import React from "react";
import { useNavigate } from "react-router-dom";

const SupervisorDashboard  = ({ consultant, onLogout }) => {
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
          <a href="/consultants">רשימת היועצות</a>
        </li>
      </ul>
      <button onClick={handleLogout}>יציאה</button>
    </div>
  );
};

export default SupervisorDashboard ;