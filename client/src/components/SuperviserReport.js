import React, { useEffect, useMemo, useState } from "react";
import axios from "../api/axios";
import { useSearchParams } from "react-router-dom";

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

  // קריאת consultantId מ-query string
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const getTotalHours = (dailyWork) => {
    const total = (dailyWork || []).reduce((sum, day) => sum + (Number(day.totalHours) || 0), 0);
    return total > 0 ? total : null;
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
    <div className="p-4" dir="rtl">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button
          onClick={() => {
            const token = localStorage.getItem("token");
            if (token) {
              const decoded = JSON.parse(atob(token.split('.')[1]));
              if (decoded?.roles === "Supervisor") {
                window.location.href = "/supervisor-dashboard";
              } else {
                window.location.href = "/";
              }
            } else {
              window.location.href = "/";
            }
          }}
          style={{
            background: "#6b7280",
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: 4,
            fontSize: "14px",
            cursor: "pointer"
          }}
        >
          ← דף הבית
        </button>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>דוחות שבועיים</h2>
        <div></div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label>בחר יועצת:</label>
        <select
          value={selectedConsultantId}
          onChange={(e) => onSelectConsultant(e.target.value)}
        >
          <option value="all">הכול</option>
          {consultants.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <button onClick={fetchReports}>רענן</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <div>סה״כ דוחות: {filteredReports.length}</div>
        <div>סה״כ שעות: {totalHours}</div>
        <div>
          סטטוסים:{" "}
          {Object.entries(statusCounts).map(([k, v]) => (
            <span key={k} style={{ marginInlineStart: 8 }}>
              {k}: {v}
            </span>
          ))}
        </div>
      </div>

      <ul style={{ marginTop: 16 }}>
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
              <li
                key={r._id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{name}</strong>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span>{r.status}</span>
                    <button 
                      onClick={() => toggleExpand(r._id)}
                      style={{
                        background: "#3b82f6",
                        color: "white",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: "12px",
                        cursor: "pointer"
                      }}
                    >
                      {isExpanded ? "הסתר" : "הצג פרטים"}
                    </button>
                  </div>
                </div>
                <div>שבוע המתחיל: {formatDate(r.weekStartDate)}</div>
                <div>סה״כ שעות: {r.weeklyTotalHours ?? 0}</div>
                
                {isExpanded && (
                  <div style={{ marginTop: 12, padding: 8, backgroundColor: "#f9f9f9", borderRadius: 4 }}>
                    {(r.dailyWork || []).map((day, index) => (
                      <div key={index} style={{ marginBottom: 8, padding: 8, backgroundColor: "white", borderRadius: 4 }}>
                        <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                          יום {index + 1} - {formatDate(day.date)} ({day.totalHours || 0} שעות)
                        </div>
                        {day.notes && <div style={{ fontSize: "14px", color: "#666", marginBottom: 4 }}>הערות: {day.notes}</div>}
                        
                        {(day.kindergartens || []).length > 0 && (
                          <div style={{ marginBottom: 4 }}>
                            <strong style={{ color: "#059669" }}>גנים:</strong>
                            {day.kindergartens.map((kg, kgIndex) => (
                              <div key={kgIndex} style={{ fontSize: "14px", marginLeft: 16 }}>
                                • {getKindergartenName(kg.kindergarten)}
                                {(kg.startTime || kg.endTime) && ` (${kg.startTime || "--"} - ${kg.endTime || "--"})`}
                                {kg.notes && ` - ${kg.notes}`}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {(day.tasks || []).length > 0 && (
                          <div>
                            <strong style={{ color: "#7c3aed" }}>משימות:</strong>
                            {day.tasks.map((task, taskIndex) => (
                              <div key={taskIndex} style={{ fontSize: "14px", marginLeft: 16 }}>
                                • {task.task?.title || "משימה"}
                                {task.task?.type && ` (${task.task.type})`}
                                {(task.startTime || task.endTime) && ` - ${task.startTime || "--"} עד ${task.endTime || "--"}`}
                                {task.task?.description && ` - ${task.task.description}`}
                                {task.notes && ` - ${task.notes}`}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
      </ul>
    </div>
  );
}
