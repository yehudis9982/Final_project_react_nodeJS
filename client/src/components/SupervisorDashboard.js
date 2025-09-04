import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
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
    <Link to="/consultants">רשימת היועצות</Link>
  </li>
  <li>
    <Link to="/reports">דו"חות</Link>
  </li>
  <li>
    <Link to="/settings">הגדרות</Link>
  </li>
</ul>
  <button onClick={handleLogout}>יציאה</button>
    </div>
  );
};

export default SupervisorDashboard ;