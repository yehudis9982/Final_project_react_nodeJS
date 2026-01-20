import React, { useState } from 'react';
import axios from '../api/axios';
import { TextField, Button, Paper, Typography, Box, Link, Divider } from '@mui/material';
import Footer from './Footer';
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
      const errorMessage = err.response?.data?.message || '';
      
      // הודעות שגיאה ידידותיות למשתמש
      if (errorMessage.toLowerCase().includes('unauthorized') || err.response?.status === 401) {
        setError('תעודת זהות או סיסמה שגויים');
      } else if (errorMessage.includes('ת.ז. חייבת להיות ייחודית')) {
        setError('תעודת זהות כבר קיימת במערכת');
      } else if (errorMessage) {
        setError(errorMessage);
      } else {
        setError('שגיאה בהתחברות, נסה שוב');
      }
    }
  };

  return (
    <>
      {/* הדר עליון */}
      <Box className="auth-top-header">
        <Box className="auth-top-header-content">
          <Typography variant="h6" className="auth-logo-text">
            מערכת ניהול יועצות
          </Typography>
          <Box className="auth-top-links">
            <Link 
              href="https://www.gov.il/he/pages/accessibility_edu" 
              target="_blank"
              rel="noopener noreferrer"
              className="auth-top-link"
            >
              הצהרת נגישות
            </Link>
            <Link 
              href="https://www.gov.il/he/departments/ministry-of-education/govil-landing-page" 
              target="_blank"
              rel="noopener noreferrer"
              className="auth-top-link"
            >
              מדריך למשתמש
            </Link>
          </Box>
        </Box>
      </Box>

      <Box className="auth-container">
        {/* כותרת ראשית */}
        <Box className="auth-header">
          <Typography variant="h2" className="auth-main-title">
            ברוכים הבאים
            <br />
            למערכת ניהול יועצות
          </Typography>
        </Box>

      <Paper elevation={6} className="auth-paper">
        <Box className="auth-form-icon">
          <Box className="auth-icon-circle">
            <span className="auth-icon-text">👤</span>
          </Box>
        </Box>
        
        <Typography variant="h5" align="center" className="auth-form-title">
          {isLogin ? 'כניסה למערכת' : 'הרשמה למערכת'}
        </Typography>
        
        <Box className="auth-form-subtitle">
          <Typography variant="body2" align="center" color="text.secondary">
            {isLogin ? 'הזן את פרטי ההתחברות שלך' : 'צור חשבון חדש במערכת'}
          </Typography>
        </Box>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <Box className="auth-signup-fields">
              <TextField
                label="שם פרטי"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                fullWidth
                margin="normal"
                variant="outlined"
                className="auth-input"
              />
              <TextField
                label="שם משפחה"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
                fullWidth
                margin="normal"
                variant="outlined"
                className="auth-input"
              />
              <TextField
                label="אימייל"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                fullWidth
                margin="normal"
                variant="outlined"
                className="auth-input"
              />
              <TextField
                label="טלפון"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                fullWidth
                margin="normal"
                variant="outlined"
                className="auth-input"
              />
            </Box>
          )}
          
          <Box className="auth-login-fields">
            <TextField
              label="תעודת זהות"
              value={tz}
              onChange={e => setTz(e.target.value)}
              required
              fullWidth
              margin="normal"
              variant="outlined"
              className="auth-input auth-input-primary"
              placeholder="הזן 9 ספרות"
            />
            <TextField
              label="סיסמה"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              fullWidth
              margin="normal"
              variant="outlined"
              className="auth-input auth-input-primary"
              placeholder="הזן סיסמה"
            />
          </Box>
          
          <Button 
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="auth-submit-btn"
          >
            {isLogin ? 'כניסה' : 'הרשמה'}
          </Button>

          {error && (
            <Typography color="error" align="center" className="auth-error">
              {error}
            </Typography>
          )}

          {isLogin && (
            <Box className="auth-help-links">
              <Link href="#" underline="hover" className="auth-link">
                שכחת סיסמה?
              </Link>
            </Box>
          )}
        </form>

        <Divider sx={{ my: 2 }} />

        <Box className="auth-switch-container">
          <Typography variant="body2" display="inline" color="text.secondary">
            {isLogin ? 'אין לך חשבון?' : 'כבר יש לך חשבון?'}
          </Typography>
          <Button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="auth-switch-btn"
            size="small"
          >
            {isLogin ? 'הירשם עכשיו' : 'התחבר עכשיו'}
          </Button>
        </Box>
      </Paper>

      </Box>

      <Footer />
    </>
  );
};

export default AuthForm;