import React from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";
import "../css/Header.css";

const Header = ({ onLogout }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("consultant");
    localStorage.clear();
    if (onLogout) onLogout();
    navigate("/");
    window.location.reload();
  };

  return (
    <AppBar position="static" className="header-appbar">
      <Toolbar className="header-toolbar">
        <Box flex={1}>
          <Typography variant="h6" className="header-title">
            מערכת יועצות
          </Typography>
        </Box>
        <Button
          variant="text"
          onClick={handleLogout}
          className="header-logout-btn"
        >
          יציאה
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;