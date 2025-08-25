// דף הבית
import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';

const Home = () => {
  const [user, setUser] = useState(null);

  return (
    <div>
      <h1>ברוכה הבאה למערכת היועצות</h1>
      {!user ? (
        <AuthForm onAuth={setUser} />
      ) : (
        <div>
          <h2>שלום {user.firstName || user.email}!</h2>
          <p>התחברת בהצלחה.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
