import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function StarRating({ value, onChange, readonly = false, size = 28 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{ fontSize: `${size}px`, cursor: readonly ? "default" : "pointer", color: star <= (hover || value) ? "#f59e0b" : "#e5e5e5", transition: "color 0.1s", lineHeight: 1 }}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function CoursePage() {
  const { courseId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [ratingsData, setRatingsData] = useState({ ratings: [], avg: 0, total: 0 });
  const [enrollCount, setEnrollCount] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5000/courses/${courseId}`)
      .then(res => {
        setCourse(res.data);
        if (res.data.lessons?.length > 0)
          setActiveLesson(res.data.lessons[0]);
      });

    axios.post(`http://localhost:5000/courses/${courseId}/view`).catch(() => {});

    axios.get(`http://localhost:5000/ratings/${courseId}`)
      .then(res => setRatingsData(res.data)).catch(() => {});

    axios.get(`http://localhost:5000/courses/${courseId}/enrollcount`)
      .then(res => setEnrollCount(res.data.count)).catch(() => {});

    if (token) {
      axios.get(`http://localhost:5000/ratings/${courseId}/mine`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        if (res.data) {
          setMyRating(res.data.rating);
          setMyComment(res.data.comment || "");
          setSubmitted(true);
        }
      }).catch(() => {});
    }
  }, [courseId]);

  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) return "https://www.youtube.com/embed/" + url.split("youtu.be/")[1];
    if (url.includes("vimeo.com/")) return "https://player.vimeo.com/video/" + url.split("vimeo.com/")[1];
    return url;
  };

  const submitRating = async () => {
    if (!myRating) return;
    try {
      await axios.post(`http://localhost:5000/ratings/${courseId}`,
        { rating: myRating, comment: myComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const res = await axios.get(`http://localhost:5000/ratings/${courseId}`);
      setRatingsData(res.data);
      setSubmitted(true);
    } catch (err) { console.error(err); }
  };

  if (!course) return (
    <div style={s.page}>
      <p style={{ color: "#afafaf", fontWeight: "700", padding: "2rem" }}>Chargement...</p>
    </div>
  );

  const typeStyle = (type) => ({
    Goethe: { color: "#15803d", bg: "#f0fdf4", border: "#86efac" },
    TCF:    { color: "#d97706", bg: "#fffbeb", border: "#fcd34d" },
    DELF:   { color: "#4338ca", bg: "#f0f4ff", border: "#a5b4fc" },
    DCF:    { color: "#1d4ed8", bg: "#eff6ff", border: "#93c5fd" },
    CÉLIS:  { color: "#7e22ce", bg: "#fdf4ff", border: "#d8b4fe" },
  }[type] || { color: "#6b7280", bg: "#f8f8f8", border: "#e5e5e5" });

  const ts = typeStyle(course.exam_type);

  return (
    <div style={s.page}>
      <div style={s.navbar}>
        <div style={s.navLeft}>
          <span style={s.logo}>🌍 LangExam</span>
          <button onClick={() => navigate("/exams")} style={s.navBtn}>📝 Examens</button>
          <button onClick={() => navigate("/courses")} style={s.navBtn}>🎬 Vidéothèque</button>
        </div>
        <button onClick={() => navigate("/courses")} style={s.navBtn}>← Retour</button>
      </div>

      <div style={s.layout}>

        {/* GAUCHE — player + stats + avis */}
        <div style={s.left}>

          {/* Player */}
          <div style={s.playerWrap}>
            {activeLesson ? (
              <iframe key={activeLesson.id} src={getEmbedUrl(activeLesson.video_url)}
                style={s.player} allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
            ) : (
              <div style={s.playerEmpty}>
                <span style={{ fontSize: "48px" }}>🎬</span>
                <p style={{ color: "#fff", fontWeight: "700", marginTop: "12px" }}>Aucune leçon</p>
              </div>
            )}
          </div>

          {/* Leçon active */}
          {activeLesson && (
            <div style={s.activeLessonBar}>
              <span style={{ fontSize: "14px", fontWeight: "800", color: "#1e1e2e" }}>
                ▶ {activeLesson.title}
              </span>
              {activeLesson.duration_minutes && (
                <span style={s.durationPill}>⏱ {activeLesson.duration_minutes} min</span>
              )}
            </div>
          )}

          {/* Stats bar */}
          <div style={s.statsBar}>
            <div style={s.statItem}>
              <div style={{ display: "flex", gap: "1px" }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} style={{ fontSize: "14px", color: i <= Math.round(ratingsData.avg) ? "#f59e0b" : "#e5e5e5" }}>★</span>
                ))}
              </div>
              <span style={{ fontSize: "14px", fontWeight: "800", color: "#d97706" }}>
                {ratingsData.avg > 0 ? ratingsData.avg : "—"}
              </span>
              <span style={s.statLbl}>({ratingsData.total} avis)</span>
            </div>
            <div style={s.statDiv} />
            <div style={s.statItem}>
              <span>👥</span>
              <span style={s.statVal}>{enrollCount.toLocaleString()}</span>
              <span style={s.statLbl}>étudiants</span>
            </div>
            <div style={s.statDiv} />
            <div style={s.statItem}>
              <span>👁</span>
              <span style={s.statVal}>{(course.views || 0).toLocaleString()}</span>
              <span style={s.statLbl}>vues</span>
            </div>
            <div style={s.statDiv} />
            <div style={s.statItem}>
              <span>🎥</span>
              <span style={s.statVal}>{course.lessons?.length || 0}</span>
              <span style={s.statLbl}>leçons</span>
            </div>
            <div style={s.statDiv} />
            <span style={{ ...s.pricePill, background: course.is_free ? "#f0fdf4" : "#f0f4ff", color: course.is_free ? "#15803d" : "#4338ca", border: `2px solid ${course.is_free ? "#86efac" : "#a5b4fc"}` }}>
              {course.is_free ? "Gratuit" : `${course.price} $`}
            </span>
          </div>

          {/* Section noter */}
          <div style={s.ratingBox}>
            <h3 style={s.boxTitle}>{submitted ? "✅ Ton avis" : "⭐ Donner un avis"}</h3>
            <div style={{ marginBottom: "12px" }}>
              <StarRating value={myRating} onChange={setMyRating} readonly={submitted} size={32} />
            </div>
            <textarea placeholder="Laisse un commentaire (optionnel)..."
              value={myComment} onChange={e => setMyComment(e.target.value)}
              disabled={submitted} style={s.textarea} rows={3} />
            {!submitted ? (
              <button onClick={submitRating} disabled={!myRating}
                style={{ ...s.submitBtn, opacity: myRating ? 1 : 0.5 }}>
                Publier mon avis
              </button>
            ) : (
              <button onClick={() => setSubmitted(false)} style={s.editBtn}>
                Modifier mon avis
              </button>
            )}
          </div>

          {/* Avis */}
          {ratingsData.ratings.length > 0 && (
            <div style={s.reviewsBox}>
              <h3 style={s.boxTitle}>💬 Avis des étudiants</h3>
              {ratingsData.ratings.map(r => (
                <div key={r.id} style={s.reviewItem}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <div style={s.avatar}>{r.user_name?.charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: "800", color: "#1e1e2e" }}>{r.user_name}</div>
                      <StarRating value={r.rating} readonly size={13} />
                    </div>
                    <span style={{ fontSize: "12px", color: "#afafaf", fontWeight: "600" }}>
                      {new Date(r.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  {r.comment && (
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "#6b7280", lineHeight: "1.6" }}>
                      {r.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DROITE — infos + leçons */}
        <div style={s.right}>

          {/* Infos cours */}
          <div style={s.infoBox}>
            <span style={{ ...s.typeBadge, background: ts.bg, color: ts.color, border: `2px solid ${ts.border}` }}>
              {course.exam_type} {course.level || ""}
            </span>
            <h1 style={s.courseTitle}>{course.title}</h1>
            <p style={s.instructor}>👤 {course.instructor_name}</p>
            {course.description && (
              <p style={s.courseDesc}>{course.description}</p>
            )}
          </div>

          {/* Liste leçons */}
          <div style={s.lessonsBox}>
            <div style={s.lessonsHeader}>
              <span style={{ fontSize: "15px", fontWeight: "800", color: "#1e1e2e" }}>📋 Leçons</span>
              <span style={s.lessonCount}>{course.lessons?.length || 0}</span>
            </div>
            <div style={s.lessonList}>
              {course.lessons?.map((lesson, i) => {
                const isActive = activeLesson?.id === lesson.id;
                return (
                  <div key={lesson.id} onClick={() => setActiveLesson(lesson)}
                    style={{ ...s.lessonItem, background: isActive ? "#EEF2FF" : "#fff", borderColor: isActive ? "#a5b4fc" : "#e5e5e5" }}>
                    <div style={{ ...s.lessonNum, background: isActive ? "#4F46E5" : "#f0f0f0", color: isActive ? "#fff" : "#afafaf" }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: "800", color: isActive ? "#3730a3" : "#1e1e2e", marginBottom: "2px" }}>
                        {lesson.title}
                      </div>
                      {lesson.duration_minutes && (
                        <div style={{ fontSize: "11px", fontWeight: "600", color: "#afafaf" }}>
                          ⏱ {lesson.duration_minutes} min
                        </div>
                      )}
                    </div>
                    {lesson.is_free && <span style={s.freePill}>Gratuit</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bouton examen */}
          {course.exam_type && (
            <button onClick={() => navigate("/exams")} style={s.examBtn}>
              📝 Passer un examen {course.exam_type}
            </button>
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
  logo: { fontSize: "18px", fontWeight: "800", color: "#4F46E5", marginRight: "8px" },
  navBtn: { padding: "7px 16px", background: "#fff", border: "2px solid #e5e5e5", borderRadius: "12px", color: "#6b7280", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },

  layout: { maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem", display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" },

  // Gauche
  left: { display: "flex", flexDirection: "column", gap: "12px" },
  playerWrap: { borderRadius: "16px", overflow: "hidden", aspectRatio: "16/9", background: "#1e1e2e" },
  player: { width: "100%", height: "100%", border: "none" },
  playerEmpty: { width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },

  activeLessonBar: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "12px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  durationPill: { fontSize: "12px", fontWeight: "700", color: "#afafaf", background: "#f8f8f8", padding: "4px 10px", borderRadius: "20px", border: "2px solid #e5e5e5" },

  statsBar: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "14px", padding: "12px 18px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" },
  statItem: { display: "flex", alignItems: "center", gap: "5px" },
  statVal: { fontSize: "14px", fontWeight: "800", color: "#1e1e2e" },
  statLbl: { fontSize: "12px", fontWeight: "600", color: "#afafaf" },
  statDiv: { width: "2px", height: "20px", background: "#e5e5e5", borderRadius: "2px" },
  pricePill: { fontSize: "12px", fontWeight: "800", padding: "4px 12px", borderRadius: "20px" },

  ratingBox: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "16px", padding: "1.2rem" },
  boxTitle: { fontSize: "15px", fontWeight: "800", color: "#1e1e2e", marginBottom: "12px" },
  textarea: { width: "100%", padding: "12px 14px", background: "#f8f8f8", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "13px", fontWeight: "600", color: "#1e1e2e", fontFamily: "'Nunito', sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "12px" },
  submitBtn: { width: "100%", padding: "12px", background: "#f59e0b", border: "none", borderRadius: "12px", color: "#fff", fontSize: "14px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 0 #d97706", fontFamily: "'Nunito', sans-serif" },
  editBtn: { width: "100%", padding: "10px", background: "#fff", border: "2px solid #e5e5e5", borderRadius: "12px", color: "#6b7280", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },

  reviewsBox: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "16px", padding: "1.2rem" },
  reviewItem: { borderBottom: "2px solid #f0f4ff", paddingBottom: "12px", marginBottom: "12px" },
  avatar: { width: "36px", height: "36px", borderRadius: "50%", background: "#EEF2FF", border: "2px solid #a5b4fc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "800", color: "#4F46E5", flexShrink: 0 },

  // Droite
  right: { display: "flex", flexDirection: "column", gap: "12px" },
  infoBox: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "16px", padding: "1.2rem" },
  typeBadge: { fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "20px", display: "inline-block", marginBottom: "10px" },
  courseTitle: { fontSize: "18px", fontWeight: "800", color: "#1e1e2e", marginBottom: "8px", lineHeight: "1.4" },
  instructor: { fontSize: "13px", fontWeight: "700", color: "#afafaf", marginBottom: "8px" },
  courseDesc: { fontSize: "13px", fontWeight: "600", color: "#6b7280", lineHeight: "1.6" },

  lessonsBox: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "16px", overflow: "hidden" },
  lessonsHeader: { padding: "12px 16px", borderBottom: "2px solid #e5e5e5", display: "flex", justifyContent: "space-between", alignItems: "center" },
  lessonCount: { fontSize: "12px", fontWeight: "700", color: "#afafaf", background: "#f0f4ff", padding: "3px 10px", borderRadius: "20px", border: "2px solid #e5e5e5" },
  lessonList: { padding: "8px", display: "flex", flexDirection: "column", gap: "6px", maxHeight: "400px", overflowY: "auto" },
  lessonItem: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "2px solid", borderRadius: "12px", cursor: "pointer", transition: "all 0.15s" },
  lessonNum: { width: "30px", height: "30px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", flexShrink: 0 },
  freePill: { fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "20px", background: "#f0fdf4", color: "#15803d", border: "2px solid #86efac", flexShrink: 0 },

  examBtn: { width: "100%", padding: "13px", background: "#4F46E5", border: "none", borderRadius: "14px", color: "#fff", fontSize: "14px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 0 #3730a3", fontFamily: "'Nunito', sans-serif" }
};