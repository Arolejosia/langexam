import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/exams")
      .then(res => setExams(res.data))
      .catch(err => console.error(err));
    axios.get("http://localhost:5000/courses")
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  const examStyle = (type) => ({
    Goethe: { bg: "#f0fdf4", border: "#86efac", color: "#15803d", dot: "#22c55e" },
    TCF:    { bg: "#fffbeb", border: "#fcd34d", color: "#d97706", dot: "#f59e0b" },
    DELF:   { bg: "#f0f4ff", border: "#a5b4fc", color: "#4338ca", dot: "#6366f1" },
    DCF:    { bg: "#eff6ff", border: "#93c5fd", color: "#1d4ed8", dot: "#3b82f6" },
    CÉLIS:  { bg: "#fdf4ff", border: "#d8b4fe", color: "#7e22ce", dot: "#a855f7" },
  }[type] || { bg: "#f8f8f8", border: "#e5e5e5", color: "#6b7280", dot: "#9ca3af" });

  const renderStars = (avg) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= Math.round(avg) ? "#f59e0b" : "#e5e5e5", fontSize: "13px" }}>★</span>
      );
    }
    return stars;
  };

  return (
    <div style={s.page}>

      {/* Navbar */}
      <div style={s.navbar}>
        <div style={s.navLeft}>
          <span style={s.logo}>🌍 LangExam</span>
          <button onClick={() => navigate("/exams")} style={s.navBtn}>📝 Examens</button>
          <button onClick={() => navigate("/courses")} style={s.navBtn}>🎬 Vidéothèque</button>
          {user?.is_admin && (
  <button onClick={() => navigate("/admin")} style={{ ...s.navBtn, color: "#dc2626", borderColor: "#fca5a5" }}>
    🛡️ Admin
  </button>
  
)}
<button onClick={() => navigate("/become-instructor")} style={s.navBtn}>
  🎓 Devenir formateur
</button>
<button onClick={() => navigate("/instructor")} style={s.navBtn}>
  🎓 Mon espace
</button>
          <button onClick={() => navigate("/history")} style={s.navBtn}>📊 Historique</button>
        </div>
        <div style={s.navRight}>
          <div style={s.streak}>🔥 {user?.name?.split(" ")[0] || user?.email}</div>
          <button onClick={handleLogout} style={s.logoutBtn}>Déconnexion</button>
        </div>
      </div>

      <div style={s.content}>

        {/* Hero */}
        <div style={s.hero}>
          <h1 style={s.heroTitle}>Bonjour {user?.name?.split(" ")[0] || ""} 👋</h1>
          <p style={s.heroSub}>Prépare-toi aux examens officiels de langue</p>
          <div style={s.heroStats}>
            <div style={s.heroStat}>
              <span style={s.heroStatNum}>{exams.length}</span>
              <span style={s.heroStatLbl}>Examens blancs</span>
            </div>
            <div style={s.heroStatDivider} />
            <div style={s.heroStat}>
              <span style={s.heroStatNum}>{courses.length}</span>
              <span style={s.heroStatLbl}>Cours vidéo</span>
            </div>
            <div style={s.heroStatDivider} />
            <div style={s.heroStat}>
              <span style={s.heroStatNum}>6</span>
              <span style={s.heroStatLbl}>Certifications</span>
            </div>
          </div>
        </div>

        {/* Section examens */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <div>
              <h2 style={s.sectionTitle}>📝 Examens blancs</h2>
              <p style={s.sectionSub}>Teste-toi dans les conditions réelles</p>
            </div>
            <button onClick={() => navigate("/exams")} style={s.seeAll}>Voir tout →</button>
          </div>
          <div style={s.examGrid}>
            {exams.slice(0, 3).map(exam => {
              const st = examStyle(exam.exam_type);
              return (
                <div key={exam.id} style={{ ...s.examCard, background: st.bg, borderColor: st.border }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: st.dot }} />
                    <span style={{ fontSize: "11px", fontWeight: "800", color: st.color, textTransform: "uppercase", letterSpacing: ".05em" }}>
                      {exam.exam_type} {exam.level || ""}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#1e1e2e", marginBottom: "8px" }}>
                    {exam.title}
                  </h3>
                  {exam.duration_minutes && (
                    <span style={s.pill}>⏱ {exam.duration_minutes} min</span>
                  )}
                  <button onClick={() => navigate(`/exam/${exam.id}`)}
                    style={{ ...s.startBtn, background: st.dot, boxShadow: `0 4px 0 ${st.color}`, marginTop: "12px" }}>
                    Commencer →
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section cours style Udemy */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <div>
              <h2 style={s.sectionTitle}>🎬 Cours vidéo</h2>
              <p style={s.sectionSub}>Apprends avec des formateurs qualifiés</p>
            </div>
            <button onClick={() => navigate("/courses")} style={s.seeAll}>Voir tout →</button>
          </div>

          {courses.length === 0 ? (
            <div style={s.emptyBox}>
              <span style={{ fontSize: "40px" }}>🎬</span>
              <p style={{ fontWeight: "700", color: "#afafaf", marginTop: "10px" }}>
                Les premiers cours arrivent bientôt !
              </p>
            </div>
          ) : (
            <div style={s.courseGrid}>
              {courses.slice(0, 4).map(course => {
                const st = examStyle(course.exam_type);
                return (
                  <div key={course.id} style={s.courseCard}
                    onClick={() => navigate(`/courses/${course.id}`)}>

                    {/* Thumbnail */}
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} style={s.thumbnail} />
                    ) : (
                      <div style={{ ...s.thumbnailPlaceholder, background: st.bg }}>
                        <span style={{ fontSize: "40px" }}>🎬</span>
                        <span style={{ fontSize: "11px", fontWeight: "800", color: st.color, marginTop: "8px" }}>
                          {course.exam_type}
                        </span>
                      </div>
                    )}

                    {/* Infos */}
                    <div style={s.courseBody}>
                      <h3 style={s.courseTitle}>{course.title}</h3>
                      <p style={s.courseInstructor}>{course.instructor_name}</p>

                      {/* Étoiles + avis */}
                      <div style={s.courseRating}>
                        <span style={{ fontSize: "13px", fontWeight: "800", color: "#d97706" }}>
                          {course.avg_rating > 0 ? parseFloat(course.avg_rating).toFixed(1) : "Nouveau"}
                        </span>
                        <div style={{ display: "flex", gap: "1px" }}>
                          {renderStars(course.avg_rating || 0)}
                        </div>
                        {course.total_ratings > 0 && (
                          <span style={{ fontSize: "12px", fontWeight: "600", color: "#afafaf" }}>
                            ({course.total_ratings})
                          </span>
                        )}
                      </div>

                      {/* Prix */}
                      <div style={s.courseFooter}>
                        <span style={{ ...s.priceBadge, background: course.is_free ? "#f0fdf4" : "#f0f4ff", color: course.is_free ? "#15803d" : "#4338ca", border: `2px solid ${course.is_free ? "#86efac" : "#a5b4fc"}` }}>
                          {course.is_free ? "Gratuit" : `${course.price} $`}
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#afafaf" }}>
                          🎥 {course.lesson_count} leçons
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f0f4ff", fontFamily: "'Nunito', sans-serif" },
  navbar: { background: "#fff", borderBottom: "2px solid #e5e5e5", padding: "0 2rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  navLeft: { display: "flex", alignItems: "center", gap: "10px" },
  navRight: { display: "flex", alignItems: "center", gap: "10px" },
  logo: { fontSize: "18px", fontWeight: "800", color: "#4F46E5", marginRight: "8px" },
  navBtn: { padding: "7px 16px", background: "#fff", border: "2px solid #e5e5e5", borderRadius: "12px", color: "#6b7280", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  streak: { background: "#fff7e6", border: "2px solid #fcd34d", borderRadius: "20px", padding: "5px 14px", fontSize: "13px", fontWeight: "700", color: "#d97706" },
  logoutBtn: { padding: "7px 16px", background: "#fef2f2", border: "2px solid #fca5a5", borderRadius: "12px", color: "#dc2626", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  content: { maxWidth: "1000px", margin: "0 auto", padding: "2.5rem 1.5rem" },

  hero: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "20px", padding: "2rem", marginBottom: "2rem" },
  heroTitle: { fontSize: "26px", fontWeight: "800", color: "#1e1e2e", marginBottom: "8px" },
  heroSub: { fontSize: "14px", fontWeight: "600", color: "#afafaf", marginBottom: "1.5rem" },
  heroStats: { display: "flex", alignItems: "center", gap: "2rem" },
  heroStat: { display: "flex", flexDirection: "column", alignItems: "center" },
  heroStatNum: { fontSize: "28px", fontWeight: "800", color: "#4F46E5" },
  heroStatLbl: { fontSize: "12px", fontWeight: "700", color: "#afafaf" },
  heroStatDivider: { width: "2px", height: "40px", background: "#e5e5e5", borderRadius: "2px" },

  section: { marginBottom: "2.5rem" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" },
  sectionTitle: { fontSize: "18px", fontWeight: "800", color: "#1e1e2e", marginBottom: "4px" },
  sectionSub: { fontSize: "13px", fontWeight: "600", color: "#afafaf" },
  seeAll: { padding: "7px 16px", background: "#fff", border: "2px solid #e5e5e5", borderRadius: "12px", color: "#4F46E5", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },

  examGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" },
  examCard: { border: "2px solid", borderRadius: "18px", padding: "1.2rem", display: "flex", flexDirection: "column" },
  pill: { fontSize: "12px", fontWeight: "700", color: "#6b7280", background: "#fff", border: "2px solid #e5e5e5", borderRadius: "20px", padding: "3px 10px", alignSelf: "flex-start" },
  startBtn: { width: "100%", padding: "11px", border: "none", borderRadius: "12px", color: "#fff", fontSize: "13px", fontWeight: "800", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },

  // Cours style Udemy
  courseGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" },
  courseCard: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "16px", overflow: "hidden", cursor: "pointer", transition: "transform 0.15s, border-color 0.15s" },
  thumbnail: { width: "100%", height: "140px", objectFit: "cover" },
  thumbnailPlaceholder: { width: "100%", height: "140px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  courseBody: { padding: "12px" },
  courseTitle: { fontSize: "14px", fontWeight: "800", color: "#1e1e2e", marginBottom: "4px", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  courseInstructor: { fontSize: "12px", fontWeight: "600", color: "#afafaf", marginBottom: "6px" },
  courseRating: { display: "flex", alignItems: "center", gap: "4px", marginBottom: "8px" },
  courseFooter: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  priceBadge: { fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "20px" },
  emptyBox: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "18px", padding: "3rem", textAlign: "center" }
};