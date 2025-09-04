import React, { useState } from 'react';
import axios from '../api/axios';

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
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>{isLogin ? 'כניסה ליועצת' : 'הרשמה ליועצת חדשה'}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="שם פרטי"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="שם משפחה"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
            />
            <input
          type="text"
          placeholder="אימייל"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="טלפון"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
        />
          </>
        )}
        
        <input
          type="text"
          placeholder="סיסמה"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="תעודת זהות"
          value={tz}
          onChange={e => setTz(e.target.value)}
          required
        />
        
        <button type="submit">{isLogin ? 'כניסה' : 'הרשמה'}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} style={{ marginTop: 10 }}>
        {isLogin ? 'אין לך משתמש? להרשמה' : 'יש לך משתמש? לכניסה'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
    </div>
  );
};

export default AuthForm;
