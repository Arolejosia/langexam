import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("users");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [pending, setPending] = useState([]);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get("http://localhost:5000/admin/stats", { headers })
      .then(res => setStats(res.data)).catch(() => navigate("/exams"));
  }, []);

  useEffect(() => {
    if (tab === "users")
      axios.get("http://localhost:5000/admin/users", { headers })
        .then(res => setUsers(res.data));
    if (tab === "courses")
      axios.get("http://localhost:5000/admin/courses", { headers })
        .then(res => setCourses(res.data));
    if (tab === "exams")
      axios.get("http://localhost:5000/admin/exams", { headers })
        .then(res => setExams(res.data));
    if (tab === "pending")
      axios.get("http://localhost:5000/admin/instructors/pending", { headers })
        .then(res => setPending(res.data));
  }, [tab]);

  const toggleCourse = async (id) => {
    await axios.patch(`http://localhost:5000/admin/courses/${id}/toggle`, {}, { headers });
    axios.get("http://localhost:5000/admin/courses", { headers })
      .then(res => setCourses(res.data));
  };

  const deleteCourse = async (id) => {
    if (!confirm("Supprimer ce cours ?")) return;
    await axios.delete(`http://localhost:5000/admin/courses/${id}`, { headers });
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const deleteExam = async (id) => {
    if (!confirm("Supprimer cet examen ?")) return;
    await axios.delete(`http://localhost:5000/admin/exams/${id}`, { headers });
    setExams(prev => prev.filter(e => e.id !== id));
  };

  const approveInstructor = async (id) => {
    await axios.patch(`http://localhost:5000/admin/instructors/${id}/approve`, {}, { headers });
    setPending(prev => prev.filter(i => i.id !== id));
    setStats(prev => ({ ...prev, pending: prev.pending - 1, instructors: prev.instructors + 1 }));
  };

  const rejectInstructor = async (id) => {
    if (!confirm("Refuser cette demande ?")) return;
    await axios.delete(`http://localhost:5000/admin/instructors/${id}`, { headers });
    setPending(prev => prev.filter(i => i.id !== id));
    setStats(prev => ({ ...prev, pending: prev.pending - 1 }));
  };

  const tabs = [
    { id: "users",   label: "👥 Utilisateurs" },
    { id: "courses", label: "🎬 Cours" },
    { id: "exams",   label: "📝 Examens" },
    { id: "pending", label: `⏳ En attente (${stats.pending || 0})` },
  ];

  return (
    <div style={s.page}>

      {/* Navbar */}
      <div style={s.navbar}>
        <span style={s.logo}>🛡️ LangExam Admin</span>
        <button onClick={() => navigate("/exams")} style={s.backBtn}>
          ← Retour au site
        </button>
      </div>

      <div style={s.content}>

        {/* Stats */}
        <div style={s.statsGrid}>
          {[
            { label: "Utilisateurs",    val: stats.users,         color: "#4F46E5" },
            { label: "Cours publiés",   val: stats.courses,       color: "#22c55e" },
            { label: "Formateurs",      val: stats.instructors,   color: "#f59e0b" },
            { label: "En attente",      val: stats.pending,       color: "#ef4444" },
            { label: "Tentatives",      val: stats.attempts,      color: "#8b5cf6" },
            { label: "Cours en attente",val: stats.pendingCourses,color: "#d97706" },
          ].map((st, i) => (
            <div key={i} style={s.statCard}>
              <div style={{ fontSize: "26px", fontWeight: "800", color: st.color }}>
                {st.val ?? "—"}
              </div>
              <div style={s.statLbl}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ ...s.tabBtn, background: tab === t.id ? "#4F46E5" : "#fff", color: tab === t.id ? "#fff" : "#6b7280", borderColor: tab === t.id ? "#4F46E5" : "#e5e5e5" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Utilisateurs */}
        {tab === "users" && (
          <div style={s.table}>
            <div style={s.tableHead}>
              <span>Nom</span>
              <span>Email</span>
              <span>Rôle</span>
              <span>Admin</span>
            </div>
            {users.map(u => (
              <div key={u.id} style={s.tableRow}>
                <span style={s.rowName}>{u.name || "—"}</span>
                <span style={s.rowMuted}>{u.email}</span>
                <span>
                  {u.is_admin ? (
                    <span style={{ ...s.badge, background: "#fef2f2", color: "#dc2626", border: "2px solid #fca5a5" }}>Admin</span>
                  ) : u.is_instructor ? (
                    <span style={{ ...s.badge, background: "#f0fdf4", color: "#15803d", border: "2px solid #86efac" }}>
                      {u.is_approved ? "Formateur" : "Formateur (en attente)"}
                    </span>
                  ) : (
                    <span style={{ ...s.badge, background: "#f0f4ff", color: "#4338ca", border: "2px solid #a5b4fc" }}>Étudiant</span>
                  )}
                </span>
                <span style={s.rowMuted}>{u.is_admin ? "✅" : "—"}</span>
              </div>
            ))}
          </div>
        )}

        {/* Cours */}
        {tab === "courses" && (
          <div style={s.table}>
            <div style={s.tableHead}>
              <span>Titre</span>
              <span>Formateur</span>
              <span>Type</span>
              <span>Statut</span>
              <span>Actions</span>
            </div>
            {courses.map(c => (
              <div key={c.id} style={s.tableRow}>
                <span style={s.rowName}>{c.title}</span>
                <span style={s.rowMuted}>{c.instructor_name}</span>
                <span style={s.rowMuted}>{c.exam_type} {c.level || ""}</span>
                <span>
                  <span style={{ ...s.badge, background: c.is_published ? "#f0fdf4" : "#fef2f2", color: c.is_published ? "#15803d" : "#dc2626", border: `2px solid ${c.is_published ? "#86efac" : "#fca5a5"}` }}>
                    {c.is_published ? "Publié" : "Brouillon"}
                  </span>
                </span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => toggleCourse(c.id)} style={s.actionBtn}>
                    {c.is_published ? "Dépublier" : "Publier"}
                  </button>
                  <button onClick={() => deleteCourse(c.id)} style={s.dangerBtn}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <p style={s.empty}>Aucun cours.</p>
            )}
          </div>
        )}

        {/* Examens */}
        {tab === "exams" && (
          <div style={s.table}>
            <div style={s.tableHead}>
              <span>Titre</span>
              <span>Type</span>
              <span>Niveau</span>
              <span>Questions</span>
              <span>Tentatives</span>
              <span>Action</span>
            </div>
            {exams.map(e => (
              <div key={e.id} style={s.tableRow}>
                <span style={s.rowName}>{e.title}</span>
                <span style={s.rowMuted}>{e.exam_type}</span>
                <span style={s.rowMuted}>{e.level || "—"}</span>
                <span style={{ ...s.badge, background: "#f0f4ff", color: "#4338ca", border: "2px solid #a5b4fc" }}>
                  {e.question_count} Q
                </span>
                <span style={s.rowMuted}>{e.attempt_count}</span>
                <button onClick={() => deleteExam(e.id)} style={s.dangerBtn}>
                  Supprimer
                </button>
              </div>
            ))}
            {exams.length === 0 && (
              <p style={s.empty}>Aucun examen.</p>
            )}
          </div>
        )}

        {/* En attente */}
        {tab === "pending" && (
          <div style={s.table}>
            <div style={s.tableHead}>
              <span>Nom</span>
              <span>Email</span>
              <span>Bio</span>
              <span>Actions</span>
            </div>
            {pending.map(i => (
              <div key={i.id} style={s.tableRow}>
                <span style={s.rowName}>{i.name}</span>
                <span style={s.rowMuted}>{i.email}</span>
                <span style={{ ...s.rowMuted, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {i.bio || "—"}
                </span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => approveInstructor(i.id)} style={s.approveBtn}>
                    ✅ Approuver
                  </button>
                  <button onClick={() => rejectInstructor(i.id)} style={s.dangerBtn}>
                    ❌ Refuser
                  </button>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <p style={s.empty}>Aucune demande en attente. 🎉</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f0f4ff", fontFamily: "'Nunito', sans-serif" },
  navbar: { background: "#1e1e2e", padding: "0 2rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontSize: "18px", fontWeight: "800", color: "#fff" },
  backBtn: { padding: "7px 16px", background: "#2a2a3e", border: "2px solid #3a3a5e", borderRadius: "12px", color: "#afafaf", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  content: { maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" },

  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px", marginBottom: "1.5rem" },
  statCard: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "14px", padding: "1rem", textAlign: "center" },
  statLbl: { fontSize: "11px", fontWeight: "700", color: "#afafaf", marginTop: "4px" },

  tabs: { display: "flex", gap: "8px", marginBottom: "1.2rem", flexWrap: "wrap" },
  tabBtn: { padding: "8px 18px", border: "2px solid", borderRadius: "20px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif", transition: "all 0.15s" },

  table: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "16px", overflow: "hidden" },
  tableHead: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", padding: "10px 16px", background: "#f8f8f8", borderBottom: "2px solid #e5e5e5", gap: "10px" },
  tableRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", padding: "12px 16px", borderBottom: "2px solid #f0f4ff", alignItems: "center", gap: "10px" },
  rowName: { fontSize: "13px", fontWeight: "800", color: "#1e1e2e" },
  rowMuted: { fontSize: "12px", fontWeight: "600", color: "#6b7280" },
  badge: { fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "20px", display: "inline-block" },
  empty: { padding: "2rem", textAlign: "center", color: "#afafaf", fontWeight: "700" },

  actionBtn: { padding: "6px 12px", background: "#f0f4ff", border: "2px solid #a5b4fc", borderRadius: "8px", color: "#4338ca", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  approveBtn: { padding: "6px 12px", background: "#f0fdf4", border: "2px solid #86efac", borderRadius: "8px", color: "#15803d", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  dangerBtn: { padding: "6px 12px", background: "#fef2f2", border: "2px solid #fca5a5", borderRadius: "8px", color: "#dc2626", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" }
};