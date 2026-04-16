import { useLocation, useNavigate } from "react-router-dom";

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total, auto } = location.state || {};

  if (score === undefined) return (
    <div style={s.page}><p style={{ color: "#afafaf", fontWeight: "700" }}>Aucun résultat</p></div>
  );

  const percentage = Math.round((score / total) * 100);

  let emoji, label, color, shadow;
  if (percentage >= 80) { emoji = "🏆"; label = "Excellent !"; color = "#22c55e"; shadow = "#16a34a"; }
  else if (percentage >= 50) { emoji = "👍"; label = "Bon travail !"; color = "#f59e0b"; shadow = "#d97706"; }
  else { emoji = "💪"; label = "Continue !"; color = "#ef4444"; shadow = "#dc2626"; }

  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={s.page}>
      <div style={s.container}>

        {auto && (
          <div style={s.autoBanner}>⏰ Temps écoulé — examen soumis automatiquement</div>
        )}

        <div style={s.emojiWrap}>{emoji}</div>
        <h1 style={{ ...s.label, color }}>{label}</h1>

        <div style={s.scoreCircle}>
          <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="60" cy="60" r="44" fill="none" stroke="#e5e5e5" strokeWidth="8"/>
            <circle cx="60" cy="60" r="44" fill="none" stroke={color}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s ease" }}/>
          </svg>
          <div style={s.scoreInner}>
            <span style={{ fontSize: "26px", fontWeight: "800", color }}>{percentage}%</span>
          </div>
        </div>

        <div style={s.statsRow}>
          <div style={{ ...s.statCard, borderColor: "#86efac" }}>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#22c55e" }}>{score}</div>
            <div style={s.statLbl}>✅ Correctes</div>
          </div>
          <div style={{ ...s.statCard, borderColor: "#fca5a5" }}>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#ef4444" }}>{total - score}</div>
            <div style={s.statLbl}>❌ Incorrectes</div>
          </div>
          <div style={{ ...s.statCard, borderColor: "#e5e5e5" }}>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#1e1e2e" }}>{total}</div>
            <div style={s.statLbl}>📝 Total</div>
          </div>
        </div>

        <div style={s.btnRow}>
          <button onClick={() => navigate("/exams")} style={s.btnGhost}>← Examens</button>
          <button onClick={() => navigate("/history")}
            style={{ ...s.btnPrimary, background: color, boxShadow: `0 4px 0 ${shadow}` }}>
            Voir l'historique
          </button>
        </div>

      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", fontFamily: "'Nunito', sans-serif" },
  container: { width: "100%", maxWidth: "420px", textAlign: "center" },
  autoBanner: { background: "#fef2f2", border: "2px solid #fca5a5", borderRadius: "14px", padding: "10px 16px", fontSize: "13px", fontWeight: "700", color: "#dc2626", marginBottom: "1.5rem" },
  emojiWrap: { fontSize: "56px", marginBottom: "8px" },
  label: { fontSize: "28px", fontWeight: "800", marginBottom: "1.5rem" },
  scoreCircle: { position: "relative", width: "120px", height: "120px", margin: "0 auto 2rem" },
  scoreInner: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" },
  statsRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "2rem" },
  statCard: { background: "#fff", border: "2px solid", borderRadius: "16px", padding: "16px 10px" },
  statLbl: { fontSize: "11px", fontWeight: "700", color: "#afafaf", marginTop: "4px" },
  btnRow: { display: "flex", gap: "12px" },
  btnGhost: { flex: 1, padding: "13px", background: "#fff", border: "2px solid #e5e5e5", borderRadius: "14px", color: "#6b7280", fontSize: "14px", fontWeight: "800", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  btnPrimary: { flex: 1, padding: "13px", border: "none", borderRadius: "14px", color: "#fff", fontSize: "14px", fontWeight: "800", cursor: "pointer", fontFamily: "'Nunito', sans-serif" }
};