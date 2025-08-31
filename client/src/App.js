
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Consultants from './pages/Consultants';
import TaskList from './components/TaskList';
import KindergartenList from './components/KindergartenList';
import WeeklyReportList from './components/WeeklyReportList';
import WeeklyReportForm from './components/WeeklyReportForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/weekly-reports" element={<WeeklyReportList />} />
        <Route path="/kindergartens" element={<KindergartenList />} />
        <Route path="/consultants" element={<Consultants />} />
        <Route path="/weekly-reports/new" element={<WeeklyReportForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;