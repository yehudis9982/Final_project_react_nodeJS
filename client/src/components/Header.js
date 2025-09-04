import React from "react";
import { useNavigate} from "react-router-dom";

const Header = ({ onLogout }) => {
  const navigate = useNavigate()
const handleLogout = () => {
    localStorage.removeItem("token");
    if (onLogout) onLogout();
    navigate("/");
  };

  return (
    <header style={{ padding: "10px", background: "#eee", marginBottom: "20px" }}>
      <button onClick={handleLogout}>יציאה</button>
    </header>
  );
};

export default Header;