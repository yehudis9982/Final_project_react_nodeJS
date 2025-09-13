import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const WeeklyReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedReports, setExpandedReports] = useState(new Set());
  const navigate = useNavigate();

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

  const toggleExpand = (reportId) => {
    const newExpanded = new Set(expandedReports);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedReports(newExpanded);
  };

  const getTotalHours = (dailyWork) => {
    const total = (dailyWork || []).reduce((sum, day) => sum + (Number(day.totalHours) || 0), 0);
    return total > 0 ? total : null;
  };

  const getStatusBadge = (status) => {
    const isSubmitted = status === "Submitted";
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        isSubmitted ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
      }`}>
        {isSubmitted ? "נשלח" : "טיוטה"}
      </span>
    );
  };

  if (loading) return <div className="p-4 text-center">טוען דוחות...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            const token = localStorage.getItem("token");
            if (token) {
              const decoded = JSON.parse(atob(token.split('.')[1]));
              if (decoded?.roles === "Supervisor") {
                window.location.href = "/supervisor-dashboard";
              } else {
                window.location.href = "/consultant-dashboard";
              }
            } else {
              window.location.href = "/";
            }
          }}
          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
        >
          ← דף הבית
        </button>
        <h3 className="text-2xl font-bold">הדוחות השבועיים שלי</h3>
        <div></div>
      </div>
      
      {reports.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>אין דוחות שבועיים עדיין</p>
          <button 
            onClick={() => navigate('/weekly-reports/new')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            צור דוח חדש
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const isExpanded = expandedReports.has(report._id);
            const totalHours = getTotalHours(report.dailyWork);
            
            return (
              <div key={report._id} className="bg-white border rounded-lg shadow-sm">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h4 className="font-semibold text-lg">
                        שבוע {new Date(report.weekStartDate).toLocaleDateString('he-IL')}
                      </h4>
                      {getStatusBadge(report.status)}
                      <span className="text-sm text-gray-600">
                        {totalHours ? `סה"כ ${totalHours} שעות` : 'אין שעות מדווחות'} • {(report.dailyWork || []).length} ימים
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleExpand(report._id)}
                        className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                      >
                        {isExpanded ? "הסתר" : "הצג פרטים"}
                      </button>
                      <button
                        onClick={() => navigate(`/weekly-reports/edit/${report._id}`)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        ערוך
                      </button>
                    </div>
                  </div>
                  
                  {report.generalNotes && (
                    <p className="mt-2 text-sm text-gray-700 bg-blue-50 p-2 rounded">
                      <strong>הערות כלליות:</strong> {report.generalNotes}
                    </p>
                  )}
                </div>

                {isExpanded && (
                  <div className="p-4">
                    <div className="space-y-4">
                      {(report.dailyWork || []).map((day, index) => (
                        <div key={index} className="border rounded p-3 bg-gray-50">
                          <h5 className="font-medium mb-2">
                            יום {index + 1} - {new Date(day.date).toLocaleDateString('he-IL')} 
                            <span className="text-sm text-gray-600 mr-2">
                              {day.totalHours && Number(day.totalHours) > 0 ? `(${day.totalHours} שעות)` : '(אין שעות)'}
                            </span>
                          </h5>
                          
                          {day.notes && (
                            <p className="text-sm text-gray-700 mb-2 bg-white p-2 rounded">
                              <strong>הערות יום:</strong> {day.notes}
                            </p>
                          )}

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* גנים */}
                            {(day.kindergartens || []).length > 0 && (
                              <div>
                                <h6 className="font-medium text-green-700 mb-2">גנים ({day.kindergartens.length})</h6>
                                <div className="space-y-2">
                                  {day.kindergartens.map((kg, kgIndex) => (
                                    <div key={kgIndex} className="bg-green-50 p-2 rounded border">
                                      <div className="text-sm">
                                        <div className="font-medium">גן: {
                                          typeof kg.kindergarten === 'string' 
                                            ? kg.kindergarten 
                                            : kg.kindergarten?.name || kg.kindergarten?.institutionSymbol || "לא צוין"
                                        }</div>
                                        {(kg.startTime || kg.endTime) && (
                                          <div className="text-gray-600">
                                            זמן: {kg.startTime || "--"} - {kg.endTime || "--"}
                                          </div>
                                        )}
                                        {kg.notes && (
                                          <div className="text-gray-700 mt-1">{kg.notes}</div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* משימות */}
                            {(day.tasks || []).length > 0 && (
                              <div>
                                <h6 className="font-medium text-purple-700 mb-2">משימות ({day.tasks.length})</h6>
                                <div className="space-y-2">
                                  {day.tasks.map((task, taskIndex) => (
                                    <div key={taskIndex} className="bg-purple-50 p-2 rounded border">
                                      <div className="text-sm">
                                        <div className="font-medium">
                                          {task.task?.title || "משימה ללא כותרת"}
                                          {task.task?.type && (
                                            <span className="text-purple-600 mr-2">({task.task.type})</span>
                                          )}
                                        </div>
                                        {task.task?.description && (
                                          <div className="text-gray-700 mt-1">{task.task.description}</div>
                                        )}
                                        {(task.startTime || task.endTime) && (
                                          <div className="text-gray-600">
                                            זמן: {task.startTime || "--"} - {task.endTime || "--"}
                                          </div>
                                        )}
                                        {task.notes && (
                                          <div className="text-gray-700 mt-1 italic">{task.notes}</div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeeklyReportList;