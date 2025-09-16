import React, { useState } from 'react';
import axios from '../api/axios';
import { TextField, Button, Paper, Typography, Box } from '@mui/material';
import '../css/AuthForm.css';

const AuthForm = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [tz, setTz] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const res = await axios.post('/auth/login', { tz, password });
        localStorage.setItem("token", res.data.accessToken)
        onAuth(res.data);
      } else {
        const res = await axios.post('/Consultant', {
          firstName,
          lastName,
          email,
          password,
          phone,
          tz,
        });
        localStorage.setItem("token", res.data.accessToken)
        onAuth(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה');
    }
  };

  return (
    <Box className="auth-container">
      <Paper elevation={3} className="auth-paper">
        <Typography variant="h5" align="center" gutterBottom>
          {isLogin ? 'כניסה ליועצת' : 'הרשמה ליועצת חדשה'}
        </Typography>
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <TextField
                label="שם פרטי"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                fullWidth
                margin="normal"
              />
              <TextField
                label="שם משפחה"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
                fullWidth
                margin="normal"
              />
              <TextField
                label="אימייל"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                fullWidth
                margin="normal"
              />
              <TextField
                label="טלפון"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                fullWidth
                margin="normal"
              />
            </>
          )}
          <TextField
            label="סיסמה"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="תעודת זהות"
            value={tz}
            onChange={e => setTz(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="auth-btn"
          >
            {isLogin ? 'כניסה' : 'הרשמה'}
          </Button>
        </form>
        <Button
          onClick={() => setIsLogin(!isLogin)}
          color="secondary"
          fullWidth
          className="switch-btn"
        >
          {isLogin ? 'אין לך משתמש? להרשמה' : 'יש לך משתמש? לכניסה'}
        </Button>
        {error && <Typography color="error" align="center" sx={{ mt: 2 }}>{error}</Typography>}
      </Paper>
      <footer className="auth-footer">
        <Typography variant="body2" align="center">
          כל הזכויות שמורות &copy; 2025 | מערכת יועצות
        </Typography>
      </footer>
    </Box>
  );
};

export default AuthForm;