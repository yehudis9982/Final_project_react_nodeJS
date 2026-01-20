import React, { useEffect, useMemo, useState } from "react";
import axios from "../api/axios";
import Footer from './Footer';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  MenuItem,
  Divider,
} from "@mui/material";
import "../css/SupervisorSettings.css";

const getTokenConsultant = () => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      return JSON.parse(atob(token.split(".")[1]));
    }
  } catch (error) {
    console.error("Error decoding token:", error);
  }
  return null;
};

const makeDefaultSettings = (consultant) => ({
  profile: {
    firstName: consultant?.firstName || "",
    lastName: consultant?.lastName || "",
    email: consultant?.email || "",
    phone: consultant?.phone || "",
    tz: consultant?.tz || "",
  },
  notifications: {
    emailEnabled: true,
    systemEnabled: true,
    weeklySummary: "weekly",
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
    reportMissing: true,
    taskOverdue: true,
  },
  rulesTemplates: {
    defaultReportStatus: "Draft",
    requireDailyNotes: false,
    minWeeklyHours: 0,
    templateName: "",
  },
  display: {
    theme: "light",
    density: "comfortable",
    dateFormat: "DD/MM/YYYY",
    showReportsColumn: true,
    showTasksColumn: true,
    showKindergartensColumn: true,
  },
  logs: {
    keepDays: 30,
  },
});

const getLogsKey = (consultant) =>
  `logs:${consultant?._id || consultant?.tz || "guest"}`;

const SupervisorSettings = ({ consultant }) => {
  const resolvedConsultant = useMemo(
    () => consultant || getTokenConsultant(),
    [consultant]
  );
  const [tabIndex, setTabIndex] = useState(0);
  const [settings, setSettings] = useState(() =>
    makeDefaultSettings(resolvedConsultant)
  );
  const [saveMessage, setSaveMessage] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("לא נמצא טוקן התחברות.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    axios
      .get("/settings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setSettings(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "שגיאה בטעינת הגדרות.");
        setSettings(makeDefaultSettings(resolvedConsultant));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [resolvedConsultant]);

  useEffect(() => {
    const key = getLogsKey(resolvedConsultant);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (error) {
        console.error("Error reading logs:", error);
      }
    }
  }, [resolvedConsultant]);

  const handleSave = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("לא נמצא טוקן התחברות.");
      return;
    }
    setError("");
    axios
      .put("/settings", settings, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setSettings(res.data);
        setSaveMessage("השינויים נשמרו בהצלחה");
        setTimeout(() => setSaveMessage(""), 2500);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "שגיאה בשמירת הגדרות.");
      });
  };

  const handleExport = (filename, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const addLogSample = () => {
    const newLog = {
      id: Date.now(),
      action: "עדכון הגדרות",
      at: new Date().toISOString(),
    };
    const updated = [newLog, ...logs].slice(0, 200);
    setLogs(updated);
    localStorage.setItem(getLogsKey(resolvedConsultant), JSON.stringify(updated));
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem(getLogsKey(resolvedConsultant));
  };

  return (
    <Box className="settings-container">
      <Paper elevation={3} className="settings-paper">
        <Box className="settings-header" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button
            variant="contained"
            color="secondary"
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
            className="home-btn"
          >
            ← דף הבית
          </Button>
          <Typography variant="h4" align="center" sx={{ flex: 1 }}>
            הגדרות מערכת
          </Typography>
        </Box>
        {loading && (
          <Typography variant="body2" align="center" className="settings-muted">
            טוען הגדרות...
          </Typography>
        )}
        {error && (
          <Typography variant="body2" align="center" color="error">
            {error}
          </Typography>
        )}
        <Tabs
          value={tabIndex}
          onChange={(_, value) => setTabIndex(value)}
          className="settings-tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="פרופיל" />
          <Tab label="התראות" />
          <Tab label="כללים ותבניות" />
          <Tab label="תצוגה" />
          <Tab label="ייצוא ולוגים" />
        </Tabs>

        {tabIndex === 0 && (
          <Box className="settings-section">
            <Typography variant="h6" gutterBottom>
              פרטי פרופיל
            </Typography>
            <Box className="settings-grid">
              <TextField
                label="שם פרטי"
                value={settings.profile.firstName}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, firstName: e.target.value },
                  }))
                }
                fullWidth
              />
              <TextField
                label="שם משפחה"
                value={settings.profile.lastName}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, lastName: e.target.value },
                  }))
                }
                fullWidth
              />
              <TextField
                label="אימייל"
                value={settings.profile.email}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, email: e.target.value },
                  }))
                }
                fullWidth
              />
              <TextField
                label="טלפון"
                value={settings.profile.phone}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, phone: e.target.value },
                  }))
                }
                fullWidth
              />
              <TextField
                label="תעודת זהות"
                value={settings.profile.tz}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, tz: e.target.value },
                  }))
                }
                fullWidth
              />
            </Box>
          </Box>
        )}

        {tabIndex === 1 && (
          <Box className="settings-section">
            <Typography variant="h6" gutterBottom>
              התראות ועדכונים
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.emailEnabled}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        emailEnabled: e.target.checked,
                      },
                    }))
                  }
                />
              }
              label="קבלת התראות במייל"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.systemEnabled}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        systemEnabled: e.target.checked,
                      },
                    }))
                  }
                />
              }
              label="קבלת התראות מערכת"
            />
            <TextField
              select
              label="סיכום דוחות"
              value={settings.notifications.weeklySummary}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    weeklySummary: e.target.value,
                  },
                }))
              }
              fullWidth
              margin="normal"
            >
              <MenuItem value="daily">יומי</MenuItem>
              <MenuItem value="weekly">שבועי</MenuItem>
              <MenuItem value="monthly">חודשי</MenuItem>
            </TextField>
            <Box className="settings-grid">
              <TextField
                label="שעת תחילת שקט"
                type="time"
                value={settings.notifications.quietHoursStart}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      quietHoursStart: e.target.value,
                    },
                  }))
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="שעת סיום שקט"
                type="time"
                value={settings.notifications.quietHoursEnd}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      quietHoursEnd: e.target.value,
                    },
                  }))
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.reportMissing}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        reportMissing: e.target.checked,
                      },
                    }))
                  }
                />
              }
              label="התראה על דוחות חסרים"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.taskOverdue}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        taskOverdue: e.target.checked,
                      },
                    }))
                  }
                />
              }
              label="התראה על משימות באיחור"
            />
          </Box>
        )}

        {tabIndex === 2 && (
          <Box className="settings-section">
            <Typography variant="h6" gutterBottom>
              כללים ותבניות
            </Typography>
            <TextField
              label="שם תבנית ברירת מחדל"
              value={settings.rulesTemplates.templateName}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  rulesTemplates: {
                    ...prev.rulesTemplates,
                    templateName: e.target.value,
                  },
                }))
              }
              fullWidth
              margin="normal"
            />
            <TextField
              select
              label="סטטוס דוח ברירת מחדל"
              value={settings.rulesTemplates.defaultReportStatus}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  rulesTemplates: {
                    ...prev.rulesTemplates,
                    defaultReportStatus: e.target.value,
                  },
                }))
              }
              fullWidth
              margin="normal"
            >
              <MenuItem value="Draft">טיוטה</MenuItem>
              <MenuItem value="Submitted">הוגש</MenuItem>
              <MenuItem value="Approved">מאושר</MenuItem>
              <MenuItem value="Rejected">נדחה</MenuItem>
            </TextField>
            <TextField
              label="שעות שבועיות מינימליות"
              type="number"
              value={settings.rulesTemplates.minWeeklyHours}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  rulesTemplates: {
                    ...prev.rulesTemplates,
                    minWeeklyHours: Number(e.target.value),
                  },
                }))
              }
              fullWidth
              margin="normal"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.rulesTemplates.requireDailyNotes}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      rulesTemplates: {
                        ...prev.rulesTemplates,
                        requireDailyNotes: e.target.checked,
                      },
                    }))
                  }
                />
              }
              label="לדרוש הערות יומיות"
            />
          </Box>
        )}

        {tabIndex === 3 && (
          <Box className="settings-section">
            <Typography variant="h6" gutterBottom>
              תצוגה וממשק
            </Typography>
            <TextField
              select
              label="ערכת צבעים"
              value={settings.display.theme}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  display: { ...prev.display, theme: e.target.value },
                }))
              }
              fullWidth
              margin="normal"
            >
              <MenuItem value="light">בהיר</MenuItem>
              <MenuItem value="dark">כהה</MenuItem>
            </TextField>
            <TextField
              select
              label="צפיפות רשימות"
              value={settings.display.density}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  display: { ...prev.display, density: e.target.value },
                }))
              }
              fullWidth
              margin="normal"
            >
              <MenuItem value="comfortable">נוח</MenuItem>
              <MenuItem value="compact">דחוס</MenuItem>
            </TextField>
            <TextField
              label="פורמט תאריך"
              value={settings.display.dateFormat}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  display: { ...prev.display, dateFormat: e.target.value },
                }))
              }
              fullWidth
              margin="normal"
            />
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">עמודות מוצגות</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.display.showReportsColumn}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      display: {
                        ...prev.display,
                        showReportsColumn: e.target.checked,
                      },
                    }))
                  }
                />
              }
              label="דוחות"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.display.showTasksColumn}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      display: {
                        ...prev.display,
                        showTasksColumn: e.target.checked,
                      },
                    }))
                  }
                />
              }
              label="משימות"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.display.showKindergartensColumn}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      display: {
                        ...prev.display,
                        showKindergartensColumn: e.target.checked,
                      },
                    }))
                  }
                />
              }
              label="גנים"
            />
          </Box>
        )}

        {tabIndex === 4 && (
          <Box className="settings-section">
            <Typography variant="h6" gutterBottom>
              ייצוא ולוגים
            </Typography>
            <Typography variant="body2" className="settings-muted">
              אפשר לייצא את ההגדרות הנוכחיות או להוריד לוגים של פעולות.
            </Typography>
            <Box className="settings-actions">
              <Button
                variant="contained"
                onClick={() =>
                  handleExport("supervisor-settings.json", settings)
                }
              >
                ייצוא הגדרות
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleExport("activity-logs.json", logs)}
              >
                ייצוא לוגים
              </Button>
            </Box>
            <Divider sx={{ my: 2 }} />
            <TextField
              label="שמירת לוגים (ימים)"
              type="number"
              value={settings.logs.keepDays}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  logs: { ...prev.logs, keepDays: Number(e.target.value) },
                }))
              }
              fullWidth
              margin="normal"
            />
            <Box className="settings-actions">
              <Button variant="outlined" onClick={addLogSample}>
                הוסף לוג לדוגמה
              </Button>
              <Button color="error" onClick={clearLogs}>
                נקה לוגים
              </Button>
            </Box>
            {logs.length === 0 && (
              <Typography variant="body2" className="settings-muted">
                אין לוגים זמינים כרגע.
              </Typography>
            )}
          </Box>
        )}

        <Divider sx={{ my: 3 }} />
        <Box className="settings-actions">
          <Button variant="contained" onClick={handleSave} disabled={loading}>
            שמור שינויים
          </Button>
          {saveMessage && (
            <Typography variant="body2" color="success.main">
              {saveMessage}
            </Typography>
          )}
        </Box>
      </Paper>
      <Footer />
    </Box>
  );
};

export default SupervisorSettings;
