import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CreateCoursePage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    exam_type: "",
    level: "",
    language: "",
    is_free: true,
    price: "",
    thumbnail_url: ""
  });

  const [lessons, setLessons] = useState([
    { title: "", video_url: "", duration_minutes: "", is_free: true }
  ]);

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const addLesson = () => setLessons(prev => [
    ...prev, { title: "", video_url: "", duration_minutes: "", is_free: false }
  ]);

  const updateLesson = (i, key, val) => {
    const updated = [...lessons];
    updated[i][key] = val;
    setLessons(updated);
  };

  const removeLesson = (i) => setLessons(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    setError("");
    if (!form.title || !form.exam_type || lessons.some(l => !l.title || !l.video_url)) {
      setError("Remplis tous les champs obligatoires.");
      return;
    }
    try {
      await axios.post("import.meta.env.VITE_API_URL/courses",
        { ...form, price: form.is_free ? 0 : parseFloat(form.price) || 0, lessons },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur serveur");
    }
  };

  if (submitted) return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ fontSize: "56px", marginBottom: "1rem" }}>🎬</div>
        <h1 style={s.cardTitle}>Cours soumis !</h1>
        <p style={s.cardSub}>Ton cours est en attente de validation par l'admin. Il sera publié sous peu.</p>
        <button onClick={() => navigate("/exams")} style={s.btnPrimary}>
          Retour à l'accueil
        </button>
      </div>
    </div>
  );

  const examTypes = ["Goethe", "TCF", "DELF", "DCF", "CÉLIS"];
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

  return (
    <div style={s.page}>
      <div style={s.navbar}>
        <span style={s.logo}>🌍 LangExam</span>
        <button onClick={() => navigate("/exams")} style={s.navBtn}>← Retour</button>
      </div>

      <div style={s.content}>
        <h1 style={s.pageTitle}>🎬 Créer un cours</h1>
        <p style={s.pageSub}>Partage ton expertise avec nos apprenants</p>

        {/* Steps */}
        <div style={s.steps}>
          {["Infos générales", "Leçons", "Vérification"].map((label, i) => (
            <div key={i} style={s.stepItem}>
              <div style={{ ...s.stepNum, background: step > i + 1 ? "#22c55e" : step === i + 1 ? "#4F46E5" : "#e5e5e5", color: step >= i + 1 ? "#fff" : "#afafaf" }}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: "12px", fontWeight: "700", color: step === i + 1 ? "#4F46E5" : "#afafaf" }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1 — Infos */}
        {step === 1 && (
          <div style={s.formCard}>
            <h2 style={s.sectionTitle}>Informations générales</h2>

            <label style={s.label}>Titre du cours *</label>
            <input placeholder="Ex: Préparer le Goethe B2 — Compréhension écrite"
              value={form.title} onChange={e => updateForm("title", e.target.value)}
              style={s.input} />

            <label style={s.label}>Description</label>
            <textarea placeholder="Décris ce que les étudiants vont apprendre..."
              value={form.description} onChange={e => updateForm("description", e.target.value)}
              style={s.textarea} rows={4} />

            <div style={s.row}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Type d'examen *</label>
                <select value={form.exam_type} onChange={e => updateForm("exam_type", e.target.value)} style={s.select}>
                  <option value="">Choisir...</option>
                  {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Niveau</label>
                <select value={form.level} onChange={e => updateForm("level", e.target.value)} style={s.select}>
                  <option value="">Tous niveaux</option>
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Langue du cours</label>
                <select value={form.language} onChange={e => updateForm("language", e.target.value)} style={s.select}>
                  <option value="">Choisir...</option>
                  <option value="Français">Français</option>
                  <option value="Anglais">Anglais</option>
                  <option value="Allemand">Allemand</option>
                </select>
              </div>
            </div>

            <label style={s.label}>Miniature (URL image)</label>
            <input placeholder="https://exemple.com/image.jpg"
              value={form.thumbnail_url} onChange={e => updateForm("thumbnail_url", e.target.value)}
              style={s.input} />

            <div style={s.row}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Prix</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => updateForm("is_free", true)}
                    style={{ ...s.toggleBtn, background: form.is_free ? "#4F46E5" : "#fff", color: form.is_free ? "#fff" : "#6b7280", borderColor: form.is_free ? "#4F46E5" : "#e5e5e5" }}>
                    Gratuit
                  </button>
                  <button onClick={() => updateForm("is_free", false)}
                    style={{ ...s.toggleBtn, background: !form.is_free ? "#4F46E5" : "#fff", color: !form.is_free ? "#fff" : "#6b7280", borderColor: !form.is_free ? "#4F46E5" : "#e5e5e5" }}>
                    Payant
                  </button>
                </div>
              </div>
              {!form.is_free && (
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Montant ($)</label>
                  <input type="number" placeholder="19.99"
                    value={form.price} onChange={e => updateForm("price", e.target.value)}
                    style={s.input} />
                </div>
              )}
            </div>

            <button onClick={() => {
              if (!form.title || !form.exam_type) { setError("Titre et type d'examen obligatoires."); return; }
              setError(""); setStep(2);
            }} style={s.btnPrimary}>
              Continuer →
            </button>
            {error && <div style={s.error}>{error}</div>}
          </div>
        )}

        {/* Step 2 — Leçons */}
        {step === 2 && (
          <div style={s.formCard}>
            <h2 style={s.sectionTitle}>Leçons du cours</h2>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#afafaf", marginBottom: "1.2rem" }}>
              Colle des liens YouTube ou Vimeo pour chaque leçon.
            </p>

            {lessons.map((lesson, i) => (
              <div key={i} style={s.lessonBlock}>
                <div style={s.lessonHeader}>
                  <span style={s.lessonNum}>Leçon {i + 1}</span>
                  {lessons.length > 1 && (
                    <button onClick={() => removeLesson(i)} style={s.removeBtn}>✕ Supprimer</button>
                  )}
                </div>

                <label style={s.label}>Titre *</label>
                <input placeholder="Ex: Introduction — Structure de l'examen"
                  value={lesson.title}
                  onChange={e => updateLesson(i, "title", e.target.value)}
                  style={s.input} />

                <label style={s.label}>Lien vidéo (YouTube / Vimeo) *</label>
                <input placeholder="https://www.youtube.com/watch?v=..."
                  value={lesson.video_url}
                  onChange={e => updateLesson(i, "video_url", e.target.value)}
                  style={s.input} />

                <div style={s.row}>
                  <div style={{ flex: 1 }}>
                    <label style={s.label}>Durée (minutes)</label>
                    <input type="number" placeholder="15"
                      value={lesson.duration_minutes}
                      onChange={e => updateLesson(i, "duration_minutes", e.target.value)}
                      style={s.input} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={s.label}>Accès</label>
                    <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
                      <button onClick={() => updateLesson(i, "is_free", true)}
                        style={{ ...s.toggleBtn, background: lesson.is_free ? "#22c55e" : "#fff", color: lesson.is_free ? "#fff" : "#6b7280", borderColor: lesson.is_free ? "#22c55e" : "#e5e5e5" }}>
                        Gratuit
                      </button>
                      <button onClick={() => updateLesson(i, "is_free", false)}
                        style={{ ...s.toggleBtn, background: !lesson.is_free ? "#4F46E5" : "#fff", color: !lesson.is_free ? "#fff" : "#6b7280", borderColor: !lesson.is_free ? "#4F46E5" : "#e5e5e5" }}>
                        Premium
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button onClick={addLesson} style={s.addLessonBtn}>
              + Ajouter une leçon
            </button>

            {error && <div style={s.error}>{error}</div>}

            <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
              <button onClick={() => setStep(1)} style={s.btnGhost}>← Retour</button>
              <button onClick={() => {
                if (lessons.some(l => !l.title || !l.video_url)) {
                  setError("Titre et lien vidéo obligatoires pour chaque leçon.");
                  return;
                }
                setError(""); setStep(3);
              }} style={{ ...s.btnPrimary, flex: 1 }}>
                Vérifier →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Vérification */}
        {step === 3 && (
          <div style={s.formCard}>
            <h2 style={s.sectionTitle}>Vérification finale</h2>

            <div style={s.reviewSection}>
              <div style={s.reviewItem}>
                <span style={s.reviewLbl}>Titre</span>
                <span style={s.reviewVal}>{form.title}</span>
              </div>
              <div style={s.reviewItem}>
                <span style={s.reviewLbl}>Type</span>
                <span style={s.reviewVal}>{form.exam_type} {form.level}</span>
              </div>
              <div style={s.reviewItem}>
                <span style={s.reviewLbl}>Prix</span>
                <span style={s.reviewVal}>{form.is_free ? "Gratuit" : `${form.price} $`}</span>
              </div>
              <div style={s.reviewItem}>
                <span style={s.reviewLbl}>Leçons</span>
                <span style={s.reviewVal}>{lessons.length} leçon(s)</span>
              </div>
            </div>

            <div style={s.lessonPreview}>
              {lessons.map((l, i) => (
                <div key={i} style={s.lessonPreviewItem}>
                  <span style={s.lessonNum}>{i + 1}</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e1e2e", flex: 1 }}>{l.title}</span>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: l.is_free ? "#15803d" : "#4338ca" }}>
                    {l.is_free ? "Gratuit" : "Premium"}
                  </span>
                </div>
              ))}
            </div>

            <div style={s.infoBox}>
              ℹ️ Ton cours sera soumis à l'admin pour validation avant d'être publié.
            </div>

            {error && <div style={s.error}>{error}</div>}

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setStep(2)} style={s.btnGhost}>← Modifier</button>
              <button onClick={handleSubmit} style={{ ...s.btnPrimary, flex: 1 }}>
                🚀 Soumettre le cours
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f0f4ff", fontFamily: "'Nunito', sans-serif" },
  navbar: { background: "#fff", borderBottom: "2px solid #e5e5e5", padding: "0 2rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontSize: "18px", fontWeight: "800", color: "#4F46E5" },
  navBtn: { padding: "7px 16px", background: "#fff", border: "2px solid #e5e5e5", borderRadius: "12px", color: "#6b7280", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  content: { maxWidth: "680px", margin: "0 auto", padding: "2.5rem 1.5rem" },
  pageTitle: { fontSize: "26px", fontWeight: "800", color: "#1e1e2e", marginBottom: "6px" },
  pageSub: { fontSize: "14px", fontWeight: "600", color: "#afafaf", marginBottom: "2rem" },

  steps: { display: "flex", gap: "2rem", marginBottom: "2rem", alignItems: "center" },
  stepItem: { display: "flex", alignItems: "center", gap: "8px" },
  stepNum: { width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800" },

  formCard: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "20px", padding: "1.8rem" },
  sectionTitle: { fontSize: "18px", fontWeight: "800", color: "#1e1e2e", marginBottom: "1.2rem" },
  label: { display: "block", fontSize: "12px", fontWeight: "800", color: "#1e1e2e", marginBottom: "6px", marginTop: "12px" },
  input: { width: "100%", padding: "11px 14px", background: "#f8f8f8", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "13px", fontWeight: "600", color: "#1e1e2e", fontFamily: "'Nunito', sans-serif", outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "11px 14px", background: "#f8f8f8", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "13px", fontWeight: "600", color: "#1e1e2e", fontFamily: "'Nunito', sans-serif", outline: "none", boxSizing: "border-box", resize: "vertical" },
  select: { width: "100%", padding: "11px 14px", background: "#f8f8f8", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "13px", fontWeight: "600", color: "#1e1e2e", fontFamily: "'Nunito', sans-serif", outline: "none", boxSizing: "border-box" },
  row: { display: "flex", gap: "12px", marginTop: "4px" },
  toggleBtn: { padding: "8px 16px", border: "2px solid", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },

  lessonBlock: { background: "#f8f9ff", border: "2px solid #e5e5e5", borderRadius: "14px", padding: "1.2rem", marginBottom: "12px" },
  lessonHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  lessonNum: { fontSize: "12px", fontWeight: "800", color: "#4F46E5", background: "#EEF2FF", border: "2px solid #a5b4fc", padding: "3px 10px", borderRadius: "20px" },
  removeBtn: { fontSize: "12px", fontWeight: "700", color: "#dc2626", background: "#fef2f2", border: "2px solid #fca5a5", padding: "4px 10px", borderRadius: "8px", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  addLessonBtn: { width: "100%", padding: "12px", background: "#f0f4ff", border: "2px dashed #a5b4fc", borderRadius: "12px", color: "#4F46E5", fontSize: "14px", fontWeight: "800", cursor: "pointer", fontFamily: "'Nunito', sans-serif", marginTop: "4px" },

  reviewSection: { background: "#f8f8f8", border: "2px solid #e5e5e5", borderRadius: "12px", padding: "1rem", marginBottom: "1rem" },
  reviewItem: { display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #e5e5e5" },
  reviewLbl: { fontSize: "12px", fontWeight: "700", color: "#afafaf" },
  reviewVal: { fontSize: "13px", fontWeight: "800", color: "#1e1e2e" },
  lessonPreview: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "1rem" },
  lessonPreviewItem: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "#f8f8f8", border: "2px solid #e5e5e5", borderRadius: "10px" },
  infoBox: { background: "#f0f4ff", border: "2px solid #a5b4fc", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", fontWeight: "700", color: "#4338ca", marginBottom: "1rem" },

  error: { background: "#fef2f2", border: "2px solid #fca5a5", borderRadius: "12px", padding: "10px 14px", fontSize: "13px", fontWeight: "700", color: "#dc2626", marginTop: "12px" },
  btnPrimary: { width: "100%", padding: "13px", background: "#4F46E5", border: "none", borderRadius: "14px", color: "#fff", fontSize: "14px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 0 #3730a3", fontFamily: "'Nunito', sans-serif", marginTop: "1rem" },
  btnGhost: { padding: "13px 20px", background: "#fff", border: "2px solid #e5e5e5", borderRadius: "14px", color: "#6b7280", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif", marginTop: "1rem" },

  card: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "24px", padding: "2.5rem", width: "100%", maxWidth: "480px", textAlign: "center" },
  cardTitle: { fontSize: "24px", fontWeight: "800", color: "#1e1e2e", marginBottom: "8px" },
  cardSub: { fontSize: "14px", fontWeight: "600", color: "#afafaf", marginBottom: "1.5rem" }
};