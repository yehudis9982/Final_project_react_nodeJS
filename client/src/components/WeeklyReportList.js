import React, { useEffect, useState, useMemo } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Paper, Typography, Box, Button, Chip, Collapse, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import Footer from './Footer';
import "../css/WeeklyReportList.css";

const WeeklyReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedReports, setExpandedReports] = useState(new Set());
  const [showNewReportDialog, setShowNewReportDialog] = useState(false);
  const [weekStartDate, setWeekStartDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const token = useMemo(() => {
    try {
      const c = localStorage.getItem("consultant");
      const parsed = c ? JSON.parse(c) : null;
      return parsed?.accessToken || localStorage.getItem("token") || "";
    } catch {
      return localStorage.getItem("token") || "";
    }
  }, []);

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

  const getStatusChip = (status) => (
    <Chip
      label={status === "Submitted" ? "נשלח" : "טיוטה"}
      color={status === "Submitted" ? "success" : "warning"}
      size="small"
      sx={{ fontWeight: "bold", mx: 1 }}
    />
  );

  // eslint-disable-next-line no-unused-vars
  const makeEmptyDay = () => ({
    date: new Date().toISOString(),
    dayOfWeek: new Date().getDay(),
    totalHours: "",
    notes: "",
    kindergartens: [],
    tasks: [],
  });

  // eslint-disable-next-line no-unused-vars
  const safeDW = (arr) =>
    (Array.isArray(arr) ? arr : []).map((d) => ({
      date: d?.date || new Date().toISOString(),
      dayOfWeek: d?.dayOfWeek ?? new Date(d?.date || Date.now()).getDay(),
      totalHours: Number.isFinite(Number(d?.totalHours)) && Number(d?.totalHours) > 0 ? Number(d?.totalHours) : "",
      notes: d?.notes || "",
      kindergartens: Array.isArray(d?.kindergartens) ? d.kindergartens : [],
      tasks: Array.isArray(d?.tasks) ? d.tasks : [],
    }));

  const createNewReport = async () => {
    if (!weekStartDate) {
      setMessage("יש לבחור תאריך תחילת שבוע");
      return;
    }

    setSaving(true);
    try {
      // המרת התאריך לפורמט ISO עם הזמן המקומי
      const selectedDate = new Date(weekStartDate + 'T00:00:00');
      const isoDate = selectedDate.toISOString();
      
      const { data } = await axios.post(
        "http://localhost:2025/api/WeeklyReport/template",
        { weekStartDate: isoDate },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 }
      );

      const id = data._id || data.id || data.reportId;
      if (!id) {
        setMessage("נוצרה תבנית ללא מזהה");
        return;
      }

      setMessage("תבנית נוצרה בהצלחה! מעביר לעריכה...");
      
      // סגירת Dialog ומעבר לדף העריכה
      setTimeout(() => {
        setShowNewReportDialog(false);
        setWeekStartDate("");
        setMessage("");
        sessionStorage.setItem('fromWeeklyReports', 'true');
        navigate(`/weekly-reports/edit/${id}`);
      }, 1000);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message;
      if (msg === "Weekly report for this week already exists!") {
        setMessage("כבר קיים דוח שבועי לתאריך זה");
      } else if (err?.code === "ECONNABORTED" || err?.code === "ERR_CANCELED") {
        setMessage("הבקשה פג תוקף, נסה שוב");
      } else {
        setMessage(msg || "שגיאה ביצירת תבנית");
      }
    } finally {
      setSaving(false);
    }
  };

  const openNewReportDialog = () => {
    setShowNewReportDialog(true);
    setWeekStartDate("");
    setMessage("");
  };

  const closeNewReportDialog = () => {
    setShowNewReportDialog(false);
    setWeekStartDate("");
    setMessage("");
  };

  if (loading) return <Box className="weekly-report-list-loading">טוען דוחות...</Box>;
  if (error) return <Box className="weekly-report-list-error">{error}</Box>;

  return (
    <Box className="weekly-report-list-container">
      <Paper elevation={3} className="weekly-report-list-paper">
        <Button
          className="home-btn"
          variant="contained"
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
        >
          ← דף הבית
        </Button>
        <div className="weekly-report-list-header">
          <Typography component="h4">
            הדוחות השבועיים שלי
          </Typography>
        </div>
        <Button
          variant="contained"
          color="primary"
          onClick={openNewReportDialog}
          sx={{ margin: '0 24px 24px', width: 'calc(100% - 48px)' }}
        >
          + דוח שבועי חדש
        </Button>
        {reports.length === 0 ? (
          <Box className="weekly-report-list-empty">
            <Typography align="center" color="text.secondary">
              אין דוחות שבועיים עדיין.
            </Typography>
          </Box>
        ) : (
          <Box className="weekly-report-list-items">
            {reports.map((report) => {
              const isExpanded = expandedReports.has(report._id);
              const totalHours = getTotalHours(report.dailyWork);

              return (
                <Paper key={report._id} elevation={1} className="weekly-report-list-item">
                  <div className="left-content">
                    <Typography fontWeight="bold">
                      שבוע {new Date(report.weekStartDate).toLocaleDateString('he-IL')}
                    </Typography>
                    {getStatusChip(report.status)}
                  </div>
                  <div className="right-content">
                    <Typography variant="body2" className="reported-hours">
                      {totalHours ? `סה"כ ${totalHours} שעות` : 'אין שעות מדווחות'} • {(report.dailyWork || []).length} ימים
                    </Typography>
                    <div className="weekly-report-list-actions">
                      <Button
                        className="show-details-btn"
                        variant="outlined"
                        onClick={() => toggleExpand(report._id)}
                      >
                        {isExpanded ? "הסתר" : "הצג פרטים"}
                      </Button>
                      <Button
                        className="edit-btn"
                        variant="contained"
                        onClick={() => {
                          sessionStorage.setItem('fromWeeklyReports', 'true');
                          navigate(`/weekly-reports/edit/${report._id}`);
                        }}
                      >
                        ערוך
                      </Button>
                    </div>
                  </div>
                  {report.generalNotes && (
                    <Typography variant="body2" color="primary" sx={{ mt: 1, mb: 1 }}>
                      <b>הערות כלליות:</b> {report.generalNotes}
                    </Typography>
                  )}
                  <Collapse in={isExpanded}>
                    <Box className="weekly-report-list-details">
                      {(report.dailyWork || []).map((day, index) => (
                        <Paper key={index} elevation={0} className="weekly-report-list-day">
                          <Typography fontWeight="medium" sx={{ mb: 1 }}>
                            יום {index + 1} - {new Date(day.date).toLocaleDateString('he-IL')}
                            <span style={{ marginRight: 8, color: "#64748b" }}>
                              {day.totalHours && Number(day.totalHours) > 0 ? `(${day.totalHours} שעות)` : '(אין שעות)'}
                            </span>
                          </Typography>
                          {day.notes && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              <b>הערות יום:</b> {day.notes}
                            </Typography>
                          )}
                          <Box display="flex" gap={4}>
                            {(day.kindergartens || []).length > 0 && (
                              <Box flex={1}>
                                <Typography fontWeight="medium" color="green" sx={{ mb: 1 }}>
                                  גנים ({day.kindergartens.length})
                                </Typography>
                                {(day.kindergartens || []).map((kg, kgIndex) => (
                                  <Paper key={kgIndex} elevation={0} className="weekly-report-list-kindergarten">
                                    <Typography variant="body2">
                                      <b>גן:</b> {typeof kg.kindergarten === 'string'
                                        ? kg.kindergarten
                                        : kg.kindergarten?.name || kg.kindergarten?.institutionSymbol || "לא צוין"}
                                    </Typography>
                                    {(kg.startTime || kg.endTime) && (
                                      <Typography variant="caption" color="text.secondary">
                                        זמן: {kg.startTime || "--"} - {kg.endTime || "--"}
                                      </Typography>
                                    )}
                                    {kg.notes && (
                                      <Typography variant="caption" color="text.secondary">
                                        {kg.notes}
                                      </Typography>
                                    )}
                                  </Paper>
                                ))}
                              </Box>
                            )}
                            {(day.tasks || []).length > 0 && (
                              <Box flex={1}>
                                <Typography fontWeight="medium" color="purple" sx={{ mb: 1 }}>
                                  משימות ({day.tasks.length})
                                </Typography>
                                {(day.tasks || []).map((task, taskIndex) => (
                                  <Paper key={taskIndex} elevation={0} className="weekly-report-list-task">
                                    <Typography variant="body2">
                                      <b>{task.task?.title || "משימה ללא כותרת"}</b>
                                      {task.task?.type && (
                                        <span style={{ color: "#a855f7", marginRight: 8 }}>
                                          ({task.task.type})
                                        </span>
                                      )}
                                    </Typography>
                                    {task.task?.description && (
                                      <Typography variant="caption" color="text.secondary">
                                        {task.task.description}
                                      </Typography>
                                    )}
                                    {(task.startTime || task.endTime) && (
                                      <Typography variant="caption" color="text.secondary">
                                        זמן: {task.startTime || "--"} - {task.endTime || "--"}
                                      </Typography>
                                    )}
                                    {task.notes && (
                                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                        {task.notes}
                                      </Typography>
                                    )}
                                  </Paper>
                                ))}
                              </Box>
                            )}
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  </Collapse>
                </Paper>
              );
            })}
          </Box>
        )}
      </Paper>

      {/* דיאלוג ליצירת דוח שבועי */}
      <Dialog
        open={showNewReportDialog}
        onClose={closeNewReportDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>דוח שבועי חדש</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <TextField
              type="date"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
              label="תאריך תחילת שבוע"
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="medium"
            />
          </Box>
          {message && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 1,
                backgroundColor: message.includes("שגיאה") ? "#fee" : "#efe",
                color: message.includes("שגיאה") ? "#c00" : "#060",
              }}
            >
              {message}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNewReportDialog} color="secondary">
            ביטול
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={createNewReport}
            disabled={!token || saving || !weekStartDate}
          >
            {saving ? "יוצר..." : "צור ומשך למילוי"}
          </Button>
        </DialogActions>
      </Dialog>
      <Footer />
    </Box>
  );
};

export default WeeklyReportList;