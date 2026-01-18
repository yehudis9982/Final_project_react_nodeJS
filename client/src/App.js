
import React from 'react';  
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ConsultantList from './components/ConsultantList'
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import TaskDetails from './components/TaskDetails';
import KindergartenList from './components/KindergartenList';
import WeeklyReportList from './components/WeeklyReportList';
import WeeklyReportForm from './components/WeeklyReportForm';
import SupervisorDashboard  from './components/SupervisorDashboard'
import ConsultantForm from './components/ConsultantForm';
import { useState } from 'react';
import Header from './components/Header'
import UpdateWorkSchedule from './components/UpdateWorkSchedule';
import ViewWorkSchedule from './components/ViewWorkSchedule';
import SupervisorWeeklyReports from './components/SuperviserReport';
import SupervisorNotes from './components/SupervisorNotes';
import ConsultantDashboard from './components/ConsultantDashboard';
import SupervisorSettings from './components/SupervisorSettings';
function App() {
  // טעינת נתוני היועצת מהטוקן
  const [consultant, setConsultant] = useState(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        return decoded;
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
    return null;
  });

  // פונקציית יציאה
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setConsultant(null);
  };
  return (
    <BrowserRouter>
     <Header onLogout={handleLogout} /> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/add-task" element={<TaskForm />} />
        <Route path="/tasks/:_id" element={<TaskDetails />} />
        <Route path="/weekly-reports" element={<WeeklyReportList />} />
        <Route path="/kindergartens" element={<KindergartenList />} />
        <Route path="/supervisor-dashboard" element={
        <SupervisorDashboard consultant={consultant} onLogout={handleLogout} /> } />
        <Route path="/consultants" element={<ConsultantList  />} />
        <Route path="/weekly-reports/new" element={<WeeklyReportForm />} />
        <Route path="/weekly-reports/edit/:reportId" element={<WeeklyReportForm />} />
        <Route path="/consultants/new" element={<ConsultantForm token={localStorage.getItem("token")} />} />
        <Route path="/UpdateWorkSchdule" element={<UpdateWorkSchedule/>  } />
        <Route path="/view-work-schedule" element={<ViewWorkSchedule/>  } />
        <Route path="/reports" element={<SupervisorWeeklyReports/>  } />
        <Route path="/supervisor-notes" element={<SupervisorNotes />} />
        <Route path="/consultant-dashboard" element={<ConsultantDashboard consultant={consultant} />} />
        <Route path="/settings" element={<SupervisorSettings consultant={consultant} />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
