
import React from 'react';  
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ConsultantList from './components/ConsultantList'
import TaskList from './components/TaskList';
import KindergartenList from './components/KindergartenList';
import WeeklyReportList from './components/WeeklyReportList';
import WeeklyReportForm from './components/WeeklyReportForm';
import SupervisorDashboard  from './components/SupervisorDashboard'
import ConsultantForm from './components/ConsultantForm';
import { useState } from 'react';
import Header from './components/Header'
import UpdateWorkSchedule from './components/UpdateWorkSchedule';
import SupervisorWeeklyReports from './components/SuperviserReport';
function App() {
  // דוגמה לסטייט של consultant
  const [consultant, setConsultant] = useState({ name: "מפקחת" });

  // דוגמה לפונקציית יציאה
  const handleLogout = () => {
    setConsultant(null);
    // אפשר להוסיף פעולות נוספות כאן
  };
  return (
    <BrowserRouter>
     <Header onLogout={handleLogout} /> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/weekly-reports" element={<WeeklyReportList />} />
        <Route path="/kindergartens" element={<KindergartenList />} />
        <Route path="/supervisor-dashboard" element={
        <SupervisorDashboard consultant={consultant} onLogout={handleLogout} /> } />
        <Route path="/consultants" element={<ConsultantList token={localStorage.getItem("token")} />} />
        <Route path="/weekly-reports/new" element={<WeeklyReportForm />} />
        <Route path="/weekly-reports/edit/:reportId" element={<WeeklyReportForm />} />
        <Route path="/consultants/new" element={<ConsultantForm token={localStorage.getItem("token")} />} />
        <Route path="/UpdateWorkSchdule" element={<UpdateWorkSchedule/>  } />
         <Route path="/reports" element={<SupervisorWeeklyReports/>  } />

        
      </Routes>
    </BrowserRouter>
  );
}

export default App;