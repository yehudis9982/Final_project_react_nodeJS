import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const WeeklyReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:2025/api/WeeklyReport", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(res.data);
      } catch (err) {
        setError("שגיאה בטעינת הדוחות השבועיים");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div>טוען...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h3>הדוחות השבועיים שלי</h3>
      <ul>
        {reports.map((report) => (
          <li key={report._id}>שבוע {report.weekNumber} - שעות: {report.totalHours}</li>
        ))}
      </ul>
    </div>
  );
};

export default WeeklyReportList;
