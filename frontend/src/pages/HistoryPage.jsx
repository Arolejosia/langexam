import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("import.meta.env.VITE_API_URL/history", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { setHistory(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const getScoreStyle = (pct) => {
    if (pct >= 80) return { color: "#22c55e", bg: "#f0fdf4", border: "#86efac" };
    if (pct >= 50) return { color: "#f59e0b", bg: "#fffbeb", border: "#fcd34d" };
    return { color: "#ef4444", bg: "#fef2f2", border: "#fca5a5" };
  };

  const typeStyle = (type) => ({
    Goethe: { bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
    TCF:    { bg: "#fffbeb", color: "#d97706", border: "#fcd34d" },
    DELF:   { bg: "#f0f4ff", color: "#4338ca", border: "#a5b4fc" },
    DCF:    { bg: "#eff6ff", color: "#1d4ed8", border: "#93c5fd" },
    CÉLIS:  { bg: "#fdf4ff", color: "#7e22ce", border: "#d8b4fe" },
  }[type] || { bg: "#f8f8f8", color: "#6b7280", border: "#e5e5e5" });

  return (
    <div style={s.page}>
      <div style={s.navbar}>
        <span style={s.logo}>🌍 LangExam</span>
        <button onClick={() => navigate("/exams")} style={s.navBtn}>← Examens</button>
      </div>

      <div style={s.content}>
        <h1 style={s.title}>Mon historique 📊</h1>
        <p style={s.sub}>Suis ta progression dans le temps</p>

        {loading && <p style={{ color: "#afafaf", fontWeight: "700" }}>Chargement...</p>}

        {!loading && history.length === 0 && (
          <div style={s.empty}>
            <div style={{ fontSize: "48px", marginBottom: "1rem" }}>📭</div>
            <p style={{ color: "#afafaf", fontWeight: "700", marginBottom: "1rem" }}>
              Aucune tentative pour l'instant
            </p>
            <button onClick={() => navigate("/exams")} style={s.btnPrimary}>
              Commencer un examen →
            </button>
          </div>
        )}

        <div style={s.list}>
          {history.map(attempt => {
            const pct = Math.round((attempt.score / attempt.total) * 100);
            const sc = getScoreStyle(pct);
            const ts = typeStyle(attempt.exam_type);
            const date = new Date(attempt.created_at).toLocaleDateString("fr-FR", {
              day: "numeric", month: "long", year: "numeric"
            });

            return (
              <div key={attempt.id} style={s.row}>
                <div style={s.rowLeft}>
                  <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "20px", background: ts.bg, color: ts.color, border: `2px solid ${ts.border}`, display: "inline-block", marginBottom: "4px" }}>
                    {attempt.exam_type} {attempt.level || ""}
                  </span>
                  <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#1e1e2e", margin: 0 }}>
                    {attempt.title}
                  </h3>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#afafaf" }}>{date}</span>
                </div>

                <div style={{ ...s.scoreBadge, background: sc.bg, border: `2px solid ${sc.border}` }}>
                  <div style={{ fontSize: "22px", fontWeight: "800", color: sc.color }}>{pct}%</div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: sc.color }}>{attempt.score}/{attempt.total}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f0f4ff", fontFamily: "'Nunito', sans-serif" },
  navbar: { background: "#fff", borderBottom: "2px solid #e5e5e5", padding: "0 2rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontSize: "18px", fontWeight: "800", color: "#4F46E5" },
  navBtn: { padding: "7px 16px", background: "#fff", border: "2px solid #e5e5e5", borderRadius: "12px", color: "#6b7280", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  content: { maxWidth: "700px", margin: "0 auto", padding: "2.5rem 1.5rem" },
  title: { fontSize: "26px", fontWeight: "800", color: "#1e1e2e", marginBottom: "6px" },
  sub: { fontSize: "14px", fontWeight: "600", color: "#afafaf", marginBottom: "2rem" },
  empty: { textAlign: "center", marginTop: "3rem" },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  row: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "20px", padding: "1.2rem 1.4rem", display: "flex", justifyContent: "space-between", alignItems: "center" },
  rowLeft: { display: "flex", flexDirection: "column", gap: "4px" },
  scoreBadge: { borderRadius: "14px", padding: "10px 16px", textAlign: "center", minWidth: "70px" },
  btnPrimary: { padding: "13px 24px", background: "#4F46E5", border: "none", borderRadius: "14px", color: "#fff", fontSize: "14px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 0 #3730a3", fontFamily: "'Nunito', sans-serif" }
};