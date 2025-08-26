import React from "react";
import { Link } from "react-router-dom";
const ConsultantDashboard = ({ consultant }) => {
  return (
    <div>
      <h2>שלום {consultant.name || consultant.firstName}!</h2>
      <ul>
        <li>
          <Link to="/tasks">המשימות שלי</Link>
        </li>
        <li>
          <Link to="/weekly-reports">הדוחות השבועיים שלי</Link>
        </li>
      </ul>
    </div>
  );
};

export default ConsultantDashboard;