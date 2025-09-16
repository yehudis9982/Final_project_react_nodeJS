import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';
import {jwtDecode} from 'jwt-decode';
import ConsultantDashboard from '../components/ConsultantDashboard';
import SupervisorDashboard from '../components/SupervisorDashboard';
import { Paper, Typography, Box } from '@mui/material';
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
        <>
          <Paper elevation={3} className="home-paper">
            <Typography variant="h4" className="home-title">
              ברוכה הבאה למערכת היועצות
            </Typography>
            <AuthForm onAuth={setUser} />
          </Paper>
        </>
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
      <footer className="home-footer">
        <Typography variant="body2" align="center">
          כל הזכויות שמורות &copy; 2025 | מערכת יועצות
        </Typography>
      </footer>
    </Box>
  );
};

export default Home;