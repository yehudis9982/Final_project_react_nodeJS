import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';
import {jwtDecode} from 'jwt-decode';
import ConsultantDashboard from '../components/ConsultantDashboard';
import SupervisorDashboard from '../components/SupervisorDashboard';
import { Box } from '@mui/material';
import '../css/Home.css';

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
    <Box className="home-container">
      {!user ? (
        <AuthForm onAuth={setUser} />
      ) : (
        <>
          {decoded?.roles === "Supervisor" ? (
            <SupervisorDashboard 
              consultant={decoded} 
              onLogout={() => {
                setUser(null);
                localStorage.removeItem("token");
              }} 
            />
          ) : (
            <ConsultantDashboard 
              consultant={decoded} 
              onLogout={() => setUser(null)} 
            />
          )}
        </>
      )}
    </Box>
  );
};

export default Home;