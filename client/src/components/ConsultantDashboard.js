import React from "react"

const ConsultantDashboard = ({ consultant }) => {
 

  return (
    <div>
      {!consultant
  ? <h2>טוען נתונים...</h2>
  : <h2>שלום {consultant.name || consultant.firstName}!</h2>
}
     {(!consultant?.workSchedule || consultant.workSchedule.length === 0) && (
  <h3>שימי לב עדיין לא הגדרת שעות עבודה ,יש לעדכן בהקדם!</h3>
)}
      <ul>
        <li>
          <a href="/tasks">המשימות שלי</a>
        </li>
        <li>
          <a href="/weekly-reports">הדוחות השבועיים שלי</a>
        </li>
        <li>
          <a href="/kindergartens">רשימת הגנים שלי</a>
        </li>
        <li>
          <a href="/weekly-reports/new">דוח שבועי חדש</a>
        </li>
        <li>
          <a href="/UpdateWorkSchdule">עדכון מערכת השעות</a>
        </li>
        <li>
          <a href="/supervisor-notes">הערות מפקחת</a>
        </li>
      </ul>
    </div>
  );
};

export default ConsultantDashboard;