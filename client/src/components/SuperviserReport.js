import React, { useEffect, useMemo, useState } from "react";
import axios from "../api/axios";
import { useSearchParams } from "react-router-dom";

const API_URL = "http://localhost:2025/api/WeeklyReport";

export default function SuperviserReport() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedConsultantId, setSelectedConsultantId] = useState("all");
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
      const { data } = await axios.get(API_URL, { headers });
      setReports(Array.isArray(data) ? data : []);
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

  if (loading) return <div>טוען...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4" dir="rtl">
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
                  <span>{r.status}</span>
                </div>
                <div>שבוע המתחיל: {formatDate(r.weekStartDate)}</div>
                <div>סה״כ שעות: {r.weeklyTotalHours ?? 0}</div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
