import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Paper, Typography, Box, Button, List, ListItem } from "@mui/material";
import "../css/SupervisorDashboard.css";

const SupervisorDashboard = ({ consultant, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (onLogout) onLogout();
    navigate("/");
  };

  return (
    <Box className="supervisor-dashboard-container">
      <Paper elevation={3} className="supervisor-dashboard-paper">
        <Typography variant="h5" align="center" gutterBottom>
          שלום {consultant.name || consultant.firstName}!
        </Typography>
        <List className="supervisor-dashboard-list">
          <ListItem>
            <Button
              component={Link}
              to="/consultants"
              variant="contained"
              color="primary"
              fullWidth
            >
              רשימת היועצות
            </Button>
          </ListItem>
          <ListItem>
            <Button
              component={Link}
              to="/reports"
              variant="contained"
              color="secondary"
              fullWidth
            >
              דו"חות
            </Button>
          </ListItem>
          <ListItem>
            <Button
              component={Link}
              to="/settings"
              variant="contained"
              color="info"
              fullWidth
            >
              הגדרות
            </Button>
          </ListItem>
        </List>
        <Button
          variant="outlined"
          color="error"
          onClick={handleLogout}
          className="dashboard-logout-btn"
          fullWidth
        >
          יציאה
        </Button>
      </Paper>
      <footer className="supervisor-dashboard-footer">
        <Typography variant="body2" align="center">
          כל הזכויות שמורות &copy; 2025 | מערכת יועצות
        </Typography>
      </footer>
    </Box>
  );
};

export default SupervisorDashboard;