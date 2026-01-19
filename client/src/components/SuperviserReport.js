import React, { useEffect, useMemo, useState } from "react";
import axios from "../api/axios";
import { useSearchParams } from "react-router-dom";
import { Paper, Typography, Box, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import "../css/SuperviserReport.css";

const API_URL = "http://localhost:2025/api/WeeklyReport";

export default function SuperviserReport() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedConsultantId, setSelectedConsultantId] = useState("all");
  const [expandedReports, setExpandedReports] = useState(new Set());
  const [kindergartens, setKindergartens] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const cid = searchParams.get("consultantId");
    if (cid) setSelectedConsultantId(cid);
  }, [searchParams]);

  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      const [reportsRes, kindergartensRes] = await Promise.all([
        axios.get(API_URL, { headers }),
        axios.get("http://localhost:2025/api/Kindergarten", { headers })
      ]);
      setReports(Array.isArray(reportsRes.data) ? reportsRes.data : []);
      setKindergartens(Array.isArray(kindergartensRes.data) ? kindergartensRes.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "שגיאה בטעינת דוחות");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, []);

  const consultants = useMemo(() => {
    const map = new Map();
    for (const r of reports) {
      const c = r?.consultant;
      if (c && c._id && !map.has(c._id)) {
        const name =
          [c.firstName, c.lastName].filter(Boolean).join(" ") ||
          c.name ||
          c.email ||
          c.tz ||
          c._id;
        map.set(c._id, { _id: c._id, name });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "he")
    );
  }, [reports]);

  const filteredReports = useMemo(() => {
    return selectedConsultantId === "all"
      ? reports
      : reports.filter((r) => r?.consultant?._id === selectedConsultantId);
  }, [reports, selectedConsultantId]);

  const onSelectConsultant = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id === "all") next.delete("consultantId");
    else next.set("consultantId", id);
    setSearchParams(next);
    setSelectedConsultantId(id);
  };

  const totalHours = useMemo(
    () =>
      filteredReports.reduce(
        (acc, r) => acc + (Number(r?.weeklyTotalHours) || 0),
        0
      ),
    [filteredReports]
  );

  const statusCounts = useMemo(() => {
    const m = {};
    for (const r of filteredReports) {
      const k = r?.status || "Unknown";
      m[k] = (m[k] || 0) + 1;
    }
    return m;
  }, [filteredReports]);

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString("he-IL");
    } catch {
      return String(d);
    }
  };

  const toggleExpand = (reportId) => {
    const newExpanded = new Set(expandedReports);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedReports(newExpanded);
  };

  const getKindergartenName = (kgId) => {
    if (typeof kgId === 'object') {
      return kgId?.name || kgId?.institutionSymbol || "גן ללא שם";
    }
    const kg = kindergartens.find(k => k._id === kgId);
    return kg?.name || kg?.institutionSymbol || `גן ${kgId?.slice(-4) || ''}`;
  };

  if (loading) return <div>טוען...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box className="superviser-report-container" dir="rtl">
      <Paper elevation={3} className="superviser-report-paper">
        <Box className="superviser-report-header">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              const token = localStorage.getItem("token");
              if (token) {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                const cid = searchParams.get("consultantId");
                if (decoded?.roles === "Supervisor" && cid) {
                  window.location.href = "/consultants";
                } else if (decoded?.roles === "Supervisor") {
                  window.location.href = "/supervisor-dashboard";
                } else {
                  window.location.href = "/";
                }
              } else {
                window.location.href = "/";
              }
            }}
            className="home-btn"
          >
            ← {searchParams.get("consultantId") ? "רשימת יועצות" : "דף הבית"}
          </Button>
          <Typography variant="h5" align="center" sx={{ flex: 1 }}>
            דוחות שבועיים
          </Typography>
        </Box>
        <Box className="superviser-report-controls">
          <FormControl size="small" className="consultant-select">
            <InputLabel>בחר יועצת</InputLabel>
            <Select
              value={selectedConsultantId}
              label="בחר יועצת"
              onChange={(e) => onSelectConsultant(e.target.value)}
            >
              <MenuItem value="all">הכול</MenuItem>
              {consultants.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" color="primary" onClick={fetchReports}>
            רענן
          </Button>
        </Box>
        <Box className="superviser-report-summary">
          <Typography>סה״כ דוחות: {filteredReports.length}</Typography>
          <Typography>סה״כ שעות: {totalHours}</Typography>
          <Typography>
            סטטוסים:{" "}
            {Object.entries(statusCounts).map(([k, v]) => (
              <span key={k} style={{ marginInlineStart: 8 }}>
                {k}: {v}
              </span>
            ))}
          </Typography>
        </Box>
        <ul className="superviser-report-list">
          {filteredReports
            .slice()
            .sort(
              (a, b) => new Date(b.weekStartDate) - new Date(a.weekStartDate)
            )
            .map((r) => {
              const c = r.consultant || {};
              const name =
                [c.firstName, c.lastName].filter(Boolean).join(" ") ||
                c.name ||
                c.email ||
                c.tz ||
                c._id;
              const isExpanded = expandedReports.has(r._id);

              return (
                <li key={r._id} className="superviser-report-list-item">
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <strong>{name}</strong>
                    <Box display="flex" gap={1}>
                      <span>{r.status}</span>
                      <Button
                        variant="contained"
                        color="info"
                        size="small"
                        onClick={() => toggleExpand(r._id)}
                        className="expand-btn"
                      >
                        {isExpanded ? "הסתר" : "הצג פרטים"}
                      </Button>
                    </Box>
                  </Box>
                  <Typography>שבוע המתחיל: {formatDate(r.weekStartDate)}</Typography>
                  <Typography>סה״כ שעות: {r.weeklyTotalHours ?? 0}</Typography>

                  {isExpanded && (
                    <Box className="superviser-report-details">
                      {(r.dailyWork || []).map((day, index) => (
                        <Box key={index} className="superviser-report-day">
                          <Typography fontWeight="bold">
                            יום {index + 1} - {formatDate(day.date)} ({day.totalHours || 0} שעות)
                          </Typography>
                          {day.notes && (
                            <Typography fontSize={14} color="text.secondary">
                              הערות: {day.notes}
                            </Typography>
                          )}
                          {(day.kindergartens || []).length > 0 && (
                            <Box>
                              <strong style={{ color: "#059669" }}>גנים:</strong>
                              {day.kindergartens.map((kg, kgIndex) => (
                                <Typography key={kgIndex} fontSize={14} marginLeft={2}>
                                  • {getKindergartenName(kg.kindergarten)}
                                  {(kg.startTime || kg.endTime) && ` (${kg.startTime || "--"} - ${kg.endTime || "--"})`}
                                  {kg.notes && ` - ${kg.notes}`}
                                </Typography>
                              ))}
                            </Box>
                          )}
                          {(day.tasks || []).length > 0 && (
                            <Box>
                              <strong style={{ color: "#7c3aed" }}>משימות:</strong>
                              {day.tasks.map((task, taskIndex) => (
                                <Typography key={taskIndex} fontSize={14} marginLeft={2}>
                                  • {task.task?.title || "משימה"}
                                  {task.task?.type && ` (${task.task.type})`}
                                  {(task.startTime || task.endTime) && ` - ${task.startTime || "--"} עד ${task.endTime || "--"}`}
                                  {task.task?.description && ` - ${task.task.description}`}
                                  {task.notes && ` - ${task.notes}`}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </li>
              );
            })}
        </ul>
      </Paper>
      <footer className="superviser-report-footer">
        <Typography variant="body2" align="center">
          כל הזכויות שמורות &copy; 2025 | מערכת יועצות
        </Typography>
      </footer>
    </Box>
  );
}