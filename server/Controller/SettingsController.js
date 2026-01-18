const Consultant = require("../models/Consultant");

const isSupervisorRole = (roles) => {
  if (Array.isArray(roles)) {
    return roles.includes("Supervisor");
  }
  return roles === "Supervisor";
};

const buildDefaultSettings = (consultant) => ({
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

const mergeSettings = (defaults, existing = {}) => ({
  profile: { ...defaults.profile, ...(existing.profile || {}) },
  notifications: { ...defaults.notifications, ...(existing.notifications || {}) },
  rulesTemplates: { ...defaults.rulesTemplates, ...(existing.rulesTemplates || {}) },
  display: { ...defaults.display, ...(existing.display || {}) },
  logs: { ...defaults.logs, ...(existing.logs || {}) },
});

const sanitizeSettings = (payload, defaults) => ({
  profile: {
    firstName: typeof payload?.profile?.firstName === "string"
      ? payload.profile.firstName
      : defaults.profile.firstName,
    lastName: typeof payload?.profile?.lastName === "string"
      ? payload.profile.lastName
      : defaults.profile.lastName,
    email: typeof payload?.profile?.email === "string"
      ? payload.profile.email
      : defaults.profile.email,
    phone: typeof payload?.profile?.phone === "string"
      ? payload.profile.phone
      : defaults.profile.phone,
    tz: typeof payload?.profile?.tz === "string"
      ? payload.profile.tz
      : defaults.profile.tz,
  },
  notifications: {
    emailEnabled: typeof payload?.notifications?.emailEnabled === "boolean"
      ? payload.notifications.emailEnabled
      : defaults.notifications.emailEnabled,
    systemEnabled: typeof payload?.notifications?.systemEnabled === "boolean"
      ? payload.notifications.systemEnabled
      : defaults.notifications.systemEnabled,
    weeklySummary: typeof payload?.notifications?.weeklySummary === "string"
      ? payload.notifications.weeklySummary
      : defaults.notifications.weeklySummary,
    quietHoursStart: typeof payload?.notifications?.quietHoursStart === "string"
      ? payload.notifications.quietHoursStart
      : defaults.notifications.quietHoursStart,
    quietHoursEnd: typeof payload?.notifications?.quietHoursEnd === "string"
      ? payload.notifications.quietHoursEnd
      : defaults.notifications.quietHoursEnd,
    reportMissing: typeof payload?.notifications?.reportMissing === "boolean"
      ? payload.notifications.reportMissing
      : defaults.notifications.reportMissing,
    taskOverdue: typeof payload?.notifications?.taskOverdue === "boolean"
      ? payload.notifications.taskOverdue
      : defaults.notifications.taskOverdue,
  },
  rulesTemplates: {
    defaultReportStatus: typeof payload?.rulesTemplates?.defaultReportStatus === "string"
      ? payload.rulesTemplates.defaultReportStatus
      : defaults.rulesTemplates.defaultReportStatus,
    requireDailyNotes: typeof payload?.rulesTemplates?.requireDailyNotes === "boolean"
      ? payload.rulesTemplates.requireDailyNotes
      : defaults.rulesTemplates.requireDailyNotes,
    minWeeklyHours: Number.isFinite(Number(payload?.rulesTemplates?.minWeeklyHours))
      ? Number(payload.rulesTemplates.minWeeklyHours)
      : defaults.rulesTemplates.minWeeklyHours,
    templateName: typeof payload?.rulesTemplates?.templateName === "string"
      ? payload.rulesTemplates.templateName
      : defaults.rulesTemplates.templateName,
  },
  display: {
    theme: typeof payload?.display?.theme === "string"
      ? payload.display.theme
      : defaults.display.theme,
    density: typeof payload?.display?.density === "string"
      ? payload.display.density
      : defaults.display.density,
    dateFormat: typeof payload?.display?.dateFormat === "string"
      ? payload.display.dateFormat
      : defaults.display.dateFormat,
    showReportsColumn: typeof payload?.display?.showReportsColumn === "boolean"
      ? payload.display.showReportsColumn
      : defaults.display.showReportsColumn,
    showTasksColumn: typeof payload?.display?.showTasksColumn === "boolean"
      ? payload.display.showTasksColumn
      : defaults.display.showTasksColumn,
    showKindergartensColumn: typeof payload?.display?.showKindergartensColumn === "boolean"
      ? payload.display.showKindergartensColumn
      : defaults.display.showKindergartensColumn,
  },
  logs: {
    keepDays: Number.isFinite(Number(payload?.logs?.keepDays))
      ? Number(payload.logs.keepDays)
      : defaults.logs.keepDays,
  },
});

const getSettings = async (req, res) => {
  if (!isSupervisorRole(req.consultant?.roles)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const consultant = await Consultant.findById(req.consultant.id).exec();
  if (!consultant) {
    return res.status(404).json({ message: "Consultant not found" });
  }
  const defaults = buildDefaultSettings(consultant);
  const merged = mergeSettings(defaults, consultant.supervisorSettings || {});
  consultant.supervisorSettings = merged;
  await consultant.save();
  return res.json(merged);
};

const updateSettings = async (req, res) => {
  if (!isSupervisorRole(req.consultant?.roles)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const consultant = await Consultant.findById(req.consultant.id).exec();
  if (!consultant) {
    return res.status(404).json({ message: "Consultant not found" });
  }
  const defaults = buildDefaultSettings(consultant);
  const sanitized = sanitizeSettings(req.body, defaults);
  consultant.supervisorSettings = sanitized;
  await consultant.save();
  return res.json(sanitized);
};

module.exports = {
  getSettings,
  updateSettings,
};
