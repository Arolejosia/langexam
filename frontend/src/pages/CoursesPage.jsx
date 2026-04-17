import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [ratings, setRatings] = useState({});
  const [enrollCounts, setEnrollCounts] = useState({});
  const [filter, setFilter] = useState("Tous");
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("${import.meta.env.VITE_API_URL}/courses")
      .then(res => {
        setCourses(res.data);
        res.data.forEach(course => {
          axios.get(`${import.meta.env.VITE_API_URL}/ratings/${course.id}`)
            .then(r => setRatings(prev => ({ ...prev, [course.id]: r.data })))
            .catch(() => {});
          axios.get(`${import.meta.env.VITE_API_URL}/courses/${course.id}/enrollcount`)
            .then(r => setEnrollCounts(prev => ({ ...prev, [course.id]: r.data.count })))
            .catch(() => {});
        });
      })
      .catch(err => console.error(err));
  }, []);

  const types = ["Tous", "Goethe", "TCF", "DELF", "DCF", "CÉLIS"];
  const filtered = filter === "Tous" ? courses : courses.filter(c => c.exam_type === filter);

  const typeStyle = (type) => ({
    Goethe: { bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
    TCF:    { bg: "#fffbeb", color: "#d97706", border: "#fcd34d" },
    DELF:   { bg: "#f0f4ff", color: "#4338ca", border: "#a5b4fc" },
    DCF:    { bg: "#eff6ff", color: "#1d4ed8", border: "#93c5fd" },
    CÉLIS:  { bg: "#fdf4ff", color: "#7e22ce", border: "#d8b4fe" },
  }[type] || { bg: "#f8f8f8", color: "#6b7280", border: "#e5e5e5" });

  const renderStars = (avg) => [1,2,3,4,5].map(star => (
    <span key={star} style={{ color: star <= Math.round(avg) ? "#f59e0b" : "#e5e5e5", fontSize: "13px" }}>★</span>
  ));

  return (
    <div style={s.page}>
      <div style={s.navbar}>
        <div style={s.navLeft}>
          <span style={s.logo}>🌍 LangExam</span>
          <button onClick={() => navigate("/exams")} style={s.navBtn}>📝 Examens</button>
          <button onClick={() => navigate("/courses")} style={{ ...s.navBtn, color: "#4F46E5", borderColor: "#a5b4fc" }}>🎬 Vidéothèque</button>
          <button onClick={() => navigate("/history")} style={s.navBtn}>📊 Historique</button>
        </div>
      </div>

      <div style={s.content}>
        <h1 style={s.title}>Vidéothèque 🎬</h1>
        <p style={s.sub}>Des cours vidéo par des formateurs qualifiés</p>

        {/* Filtres */}
        <div style={s.filters}>
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              ...s.filterBtn,
              background: filter === t ? "#4F46E5" : "#fff",
              color: filter === t ? "#fff" : "#6b7280",
              borderColor: filter === t ? "#4F46E5" : "#e5e5e5"
            }}>{t}</button>
          ))}
        </div>

        {/* Grille style Udemy */}
        {filtered.length === 0 ? (
          <div style={s.emptyBox}>
            <div style={{ fontSize: "56px", marginBottom: "1rem" }}>🎬</div>
            <p style={{ color: "#afafaf", fontWeight: "700", fontSize: "16px" }}>
              Aucun cours disponible pour le moment.
            </p>
          </div>
        ) : (
          <div style={s.grid}>
            {filtered.map(course => {
              const ts = typeStyle(course.exam_type);
              const avg = ratings[course.id]?.avg || 0;
              const total = ratings[course.id]?.total || 0;
              const students = enrollCounts[course.id] || 0;

              return (
                <div key={course.id} style={s.card}
                  onClick={() => navigate(`/courses/${course.id}`)}>

                  {/* Thumbnail */}
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} style={s.thumbnail} />
                  ) : (
                    <div style={{ ...s.thumbnailPlaceholder, background: ts.bg }}>
                      <span style={{ fontSize: "40px" }}>🎬</span>
                    </div>
                  )}

                  {/* Body */}
                  <div style={s.cardBody}>

                    {/* Titre */}
                    <h3 style={s.cardTitle}>{course.title}</h3>

                    {/* Instructeur */}
                    <p style={s.cardInstructor}>{course.instructor_name}</p>

                    {/* Étoiles + note + avis — exactement comme Udemy */}
                    <div style={s.ratingRow}>
                      <span style={s.avgNum}>{avg > 0 ? avg : "Nouveau"}</span>
                      <div style={{ display: "flex", gap: "1px" }}>
                        {renderStars(avg)}
                      </div>
                      <span style={s.totalAvis}>({total})</span>
                    </div>

                    {/* Étudiants */}
                    <p style={s.students}>
                      👥 {students.toLocaleString()} étudiant{students > 1 ? "s" : ""}
                    </p>

                    {/* Footer — badge + prix */}
                    <div style={s.cardFooter}>
                      <span style={{ ...s.typeBadge, background: ts.bg, color: ts.color, border: `2px solid ${ts.border}` }}>
                        {course.exam_type} {course.level || ""}
                      </span>
                      <span style={{
                        fontSize: "14px", fontWeight: "800",
                        color: course.is_free ? "#15803d" : "#1e1e2e"
                      }}>
                        {course.is_free ? "Gratuit" : `${course.price} $`}
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
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f0f4ff", fontFamily: "'Nunito', sans-serif" },
  navbar: { background: "#fff", borderBottom: "2px solid #e5e5e5", padding: "0 2rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  navLeft: { display: "flex", alignItems: "center", gap: "10px" },
  logo: { fontSize: "18px", fontWeight: "800", color: "#4F46E5", marginRight: "8px" },
  navBtn: { padding: "7px 16px", background: "#fff", border: "2px solid #e5e5e5", borderRadius: "12px", color: "#6b7280", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  content: { maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 1.5rem" },
  title: { fontSize: "26px", fontWeight: "800", color: "#1e1e2e", marginBottom: "6px" },
  sub: { fontSize: "14px", fontWeight: "600", color: "#afafaf", marginBottom: "1.5rem" },
  filters: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "2rem" },
  filterBtn: { padding: "7px 18px", border: "2px solid", borderRadius: "20px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif", transition: "all 0.15s" },

  // Grille Udemy
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" },
  card: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "16px", overflow: "hidden", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" },
  thumbnail: { width: "100%", height: "160px", objectFit: "cover" },
  thumbnailPlaceholder: { width: "100%", height: "160px", display: "flex", alignItems: "center", justifyContent: "center" },
  cardBody: { padding: "14px", display: "flex", flexDirection: "column", gap: "6px" },
  cardTitle: { fontSize: "15px", fontWeight: "800", color: "#1e1e2e", lineHeight: "1.4", marginBottom: "2px" },
  cardInstructor: { fontSize: "12px", fontWeight: "600", color: "#afafaf" },

  // Rating row — comme Udemy
  ratingRow: { display: "flex", alignItems: "center", gap: "5px" },
  avgNum: { fontSize: "13px", fontWeight: "800", color: "#d97706" },
  totalAvis: { fontSize: "12px", fontWeight: "600", color: "#afafaf" },

  students: { fontSize: "12px", fontWeight: "600", color: "#afafaf" },

  // Footer
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px", paddingTop: "8px", borderTop: "2px solid #f0f4ff" },
  typeBadge: { fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "20px" },

  emptyBox: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "18px", padding: "3rem", textAlign: "center" }
};