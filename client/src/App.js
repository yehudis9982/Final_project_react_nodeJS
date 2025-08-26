
import React from 'react';
import Tasks from './pages/Tasks';
import WeeklyReports from './pages/WeeklyReports';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/weekly-reports" element={<WeeklyReports />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;