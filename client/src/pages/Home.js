import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';
import ConsultantList from '../components/ConsultantList';
import {jwtDecode} from 'jwt-decode';
import ConsultantDashboard from '../components/ConsultantDashboard';

const Home = () => {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token")
  // מפענחים את ה-token אם יש user
  let decoded = null;
  if (user && token) {
    decoded = jwtDecode(token);
    // decoded יכיל את firstName, roles, email וכו'
  }

  console.log("user:", user);
  console.log("decoded:", decoded);

  return (
    <div>
      <h1>ברוכה הבאה למערכת היועצות</h1>
      {!user ? (
        <AuthForm onAuth={setUser} />
      ) : (
        <div>
          <h2>שלום {decoded?.name || decoded?.email}!</h2>
          <p>התחברת בהצלחה.</p>
          <div>
          {/* אם מפקחת - הצג רשימת יועצות */}
          {decoded?.roles === "Supervisor" ? (
            <ConsultantList token={token} />
          ) : (
            // אחרת - הצג דשבורד ליועצת
            <ConsultantDashboard consultant={decoded} />
          )}
        </div>
        </div>
      )}
    </div>
  );
};

export default Home;