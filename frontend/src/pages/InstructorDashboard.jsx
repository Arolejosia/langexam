import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function InstructorDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notInstructor, setNotInstructor] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    Promise.all([
      axios.get("${import.meta.env.VITE_API_URL}/instructors/me", { headers }),
      axios.get("${import.meta.env.VITE_API_URL}/instructors/my-stats", { headers }),
      axios.get("${import.meta.env.VITE_API_URL}/instructors/my-courses", { headers })
    ])
      .then(([, statsRes, coursesRes]) => {
        setStats(statsRes.data);
        setCourses(coursesRes.data);
        setLoading(false);
      })
      .catch(err => {
        if (err.response?.status === 403 || err.response?.status === 404)
          setNotInstructor(true);
        setLoading(false);
      });
  }, []);

  const renderStars = (avg) => [1,2,3,4,5].map(i => (
    <span key={i} style={{ color: i <= Math.round(avg || 0) ? "#f59e0b" : "#e5e5e5", fontSize: "14px" }}>★</span>
  ));

  const typeStyle = (type) => ({
    Goethe: { color: "#15803d", bg: "#f0fdf4", border: "#86efac" },
    TCF:    { color: "#d97706", bg: "#fffbeb", border: "#fcd34d" },
    DELF:   { color: "#4338ca", bg: "#f0f4ff", border: "#a5b4fc" },
    DCF:    { color: "#1d4ed8", bg: "#eff6ff", border: "#93c5fd" },
    CÉLIS:  { color: "#7e22ce", bg: "#fdf4ff", border: "#d8b4fe" },
  }[type] || { color: "#6b7280", bg: "#f8f8f8", border: "#e5e5e5" });

  if (loading) return (
    <div style={s.page}>
      <p style={{ color: "#afafaf", fontWeight: "700", padding: "2rem" }}>Chargement...</p>
    </div>
  );

  if (notInstructor) return (
    <div style={s.page}>
      <div style={s.notInstructor}>
        <div style={{ fontSize: "56px", marginBottom: "1rem" }}>🎓</div>
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1e1e2e", marginBottom: "8px" }}>
          Tu n'es pas encore formateur
        </h1>
        <p style={{ fontSize: "14px", fontWeight: "600", color: "#afafaf", marginBottom: "1.5rem" }}>
          Rejoins la plateforme et partage ton expertise avec nos apprenants.
        </p>
        <button onClick={() => navigate("/become-instructor")} style={s.btnPrimary}>
          Devenir formateur →
        </button>
      </div>
    </div>
  );

  return (
    <div style={s.page}>

      {/* Navbar */}
      <div style={s.navbar}>
        <div style={s.navLeft}>
          <span style={s.logo}>🌍 LangExam</span>
          <span style={s.instructorBadge}>🎓 Espace formateur</span>
        </div>
        <div style={s.navRight}>
          <button onClick={() => navigate("/exams")} style={s.navBtn}>← Site étudiant</button>
          <button onClick={() => navigate("/create-course")} style={s.createBtn}>
            + Nouveau cours
          </button>
        </div>
      </div>

      <div style={s.content}>

        <h1 style={s.title}>Mon dashboard 📊</h1>
        <p style={s.sub}>Suis tes performances en temps réel</p>

        {/* Stats */}
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#4F46E5" }}>
              {stats.total_courses || 0}
            </div>
            <div style={s.statLbl}>🎬 Cours créés</div>
          </div>
          <div style={s.statCard}>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#22c55e" }}>
              {stats.total_students || 0}
            </div>
            <div style={s.statLbl}>👥 Étudiants</div>
          </div>
          <div style={s.statCard}>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#f59e0b" }}>
              {parseInt(stats.total_views || 0).toLocaleString()}
            </div>
            <div style={s.statLbl}>👁 Vues totales</div>
          </div>
          <div style={s.statCard}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
              <span style={{ fontSize: "28px", fontWeight: "800", color: "#f59e0b" }}>
                {stats.avg_rating > 0 ? parseFloat(stats.avg_rating).toFixed(1) : "—"}
              </span>
            </div>
            <div style={s.statLbl}>⭐ Note moyenne</div>
          </div>
        </div>

        {/* Mes cours */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <div>
              <h2 style={s.sectionTitle}>Mes cours</h2>
              <p style={s.sectionSub}>{courses.length} cours au total</p>
            </div>
            <button onClick={() => navigate("/create-course")} style={s.createBtn}>
              + Nouveau cours
            </button>
          </div>

          {courses.length === 0 ? (
            <div style={s.empty}>
              <span style={{ fontSize: "48px" }}>🎬</span>
              <p style={{ fontWeight: "700", color: "#afafaf", marginTop: "1rem", marginBottom: "1rem" }}>
                Tu n'as pas encore créé de cours.
              </p>
              <button onClick={() => navigate("/create-course")} style={s.btnPrimary}>
                Créer mon premier cours →
              </button>
            </div>
          ) : (
            <div style={s.courseList}>
              {courses.map(course => {
                const ts = typeStyle(course.exam_type);
                return (
                  <div key={course.id} style={s.courseRow}>

                    {/* Thumbnail */}
                    <div style={{ ...s.courseThumbnail, background: ts.bg }}>
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: "28px" }}>🎬</span>
                      )}
                    </div>

                    {/* Infos */}
                    <div style={s.courseInfo}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ ...s.typeBadge, background: ts.bg, color: ts.color, border: `2px solid ${ts.border}` }}>
                          {course.exam_type} {course.level || ""}
                        </span>
                        <span style={{ ...s.statusBadge, background: course.is_published ? "#f0fdf4" : "#fffbeb", color: course.is_published ? "#15803d" : "#d97706", border: `2px solid ${course.is_published ? "#86efac" : "#fcd34d"}` }}>
                          {course.is_published ? "✅ Publié" : "⏳ En attente"}
                        </span>
                      </div>
                      <h3 style={s.courseTitle}>{course.title}</h3>
                      <div style={s.courseMeta}>
                        <span>🎥 {course.lesson_count} leçons</span>
                        <span>·</span>
                        <span>{course.is_free ? "Gratuit" : `${course.price} $`}</span>
                      </div>
                    </div>

                    {/* Stats cours */}
                    <div style={s.courseStats}>
                      <div style={s.courseStat}>
                        <span style={{ fontSize: "18px", fontWeight: "800", color: "#22c55e" }}>
                          {course.enrolled_count || 0}
                        </span>
                        <span style={s.courseStatLbl}>étudiants</span>
                      </div>
                      <div style={s.courseStat}>
                        <span style={{ fontSize: "18px", fontWeight: "800", color: "#f59e0b" }}>
                          {course.avg_rating > 0 ? parseFloat(course.avg_rating).toFixed(1) : "—"}
                        </span>
                        <span style={s.courseStatLbl}>note</span>
                      </div>
                      <div style={s.courseStat}>
                        <span style={{ fontSize: "18px", fontWeight: "800", color: "#4F46E5" }}>
                          {(course.views || 0).toLocaleString()}
                        </span>
                        <span style={s.courseStatLbl}>vues</span>
                      </div>
                    </div>

                    {/* Étoiles */}
                    <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
                      {renderStars(course.avg_rating)}
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#afafaf", marginLeft: "4px" }}>
                        ({course.total_ratings || 0})
                      </span>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => navigate(`/courses/${course.id}`)}
                      style={s.viewBtn}>
                      Voir →
                    </button>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips */}
        <div style={s.tipsBox}>
          <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#1e1e2e", marginBottom: "12px" }}>
            💡 Conseils pour améliorer tes cours
          </h3>
          <div style={s.tipsGrid}>
            {[
              { icon: "🎥", tip: "Ajoute des leçons courtes (10-15 min max)" },
              { icon: "⭐", tip: "Réponds aux avis pour fidéliser tes étudiants" },
              { icon: "📝", tip: "Lie tes cours à des examens blancs disponibles" },
              { icon: "🔄", tip: "Mets à jour tes cours régulièrement" },
            ].map((t, i) => (
              <div key={i} style={s.tip}>
                <span style={{ fontSize: "20px" }}>{t.icon}</span>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#6b7280" }}>{t.tip}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f0f4ff", fontFamily: "'Nunito', sans-serif" },
  navbar: { background: "#fff", borderBottom: "2px solid #e5e5e5", padding: "0 2rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  navLeft: { display: "flex", alignItems: "center", gap: "12px" },
  navRight: { display: "flex", alignItems: "center", gap: "10px" },
  logo: { fontSize: "18px", fontWeight: "800", color: "#4F46E5" },
  instructorBadge: { fontSize: "12px", fontWeight: "800", color: "#d97706", background: "#fff7e6", border: "2px solid #fcd34d", padding: "4px 12px", borderRadius: "20px" },
  navBtn: { padding: "7px 16px", background: "#fff", border: "2px solid #e5e5e5", borderRadius: "12px", color: "#6b7280", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  createBtn: { padding: "9px 18px", background: "#4F46E5", border: "none", borderRadius: "12px", color: "#fff", fontSize: "13px", fontWeight: "800", cursor: "pointer", boxShadow: "0 3px 0 #3730a3", fontFamily: "'Nunito', sans-serif" },

  content: { maxWidth: "1000px", margin: "0 auto", padding: "2.5rem 1.5rem" },
  title: { fontSize: "26px", fontWeight: "800", color: "#1e1e2e", marginBottom: "6px" },
  sub: { fontSize: "14px", fontWeight: "600", color: "#afafaf", marginBottom: "2rem" },

  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "2rem" },
  statCard: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "16px", padding: "1.2rem", textAlign: "center" },
  statLbl: { fontSize: "12px", fontWeight: "700", color: "#afafaf", marginTop: "4px" },

  section: { marginBottom: "2rem" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" },
  sectionTitle: { fontSize: "18px", fontWeight: "800", color: "#1e1e2e", marginBottom: "4px" },
  sectionSub: { fontSize: "13px", fontWeight: "600", color: "#afafaf" },

  empty: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "16px", padding: "3rem", textAlign: "center" },

  courseList: { display: "flex", flexDirection: "column", gap: "10px" },
  courseRow: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "16px", padding: "1rem 1.2rem", display: "flex", alignItems: "center", gap: "16px" },
  courseThumbnail: { width: "80px", height: "56px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
  courseInfo: { flex: 1 },
  typeBadge: { fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "20px" },
  statusBadge: { fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "20px" },
  courseTitle: { fontSize: "14px", fontWeight: "800", color: "#1e1e2e", marginBottom: "4px" },
  courseMeta: { display: "flex", gap: "8px", fontSize: "12px", fontWeight: "600", color: "#afafaf" },
  courseStats: { display: "flex", gap: "16px" },
  courseStat: { display: "flex", flexDirection: "column", alignItems: "center" },
  courseStatLbl: { fontSize: "10px", fontWeight: "700", color: "#afafaf" },

  viewBtn: { padding: "7px 14px", background: "#f0f4ff", border: "2px solid #a5b4fc", borderRadius: "10px", color: "#4338ca", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif", flexShrink: 0 },

  tipsBox: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "16px", padding: "1.4rem" },
  tipsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" },
  tip: { display: "flex", alignItems: "center", gap: "10px", background: "#f8f9ff", border: "2px solid #e5e5e5", borderRadius: "12px", padding: "10px 14px" },

  notInstructor: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "24px", padding: "3rem", maxWidth: "480px", margin: "4rem auto", textAlign: "center" },
  btnPrimary: { padding: "13px 24px", background: "#4F46E5", border: "none", borderRadius: "14px", color: "#fff", fontSize: "14px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 0 #3730a3", fontFamily: "'Nunito', sans-serif" }
};