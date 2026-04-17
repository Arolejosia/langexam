import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

export default function AdminPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("users");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [pending, setPending] = useState([]);

  // Créer examen
  const [examForm, setExamForm] = useState({
    title: "", exam_type: "", level: "", duration_minutes: 30
  });

  // Créer question
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionForm, setQuestionForm] = useState({
    question: "", content: "", type: "reading",
    choices: [
      { text: "", is_correct: true },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false }
    ]
  });
  const [qSuccess, setQSuccess] = useState("");
  const [examSuccess, setExamSuccess] = useState("");

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(`${API}/admin/stats`, { headers })
      .then(res => setStats(res.data)).catch(() => navigate("/exams"));
  }, []);

  useEffect(() => {
    if (tab === "users")
      axios.get(`${API}/admin/users`, { headers }).then(res => setUsers(res.data));
    if (tab === "courses")
      axios.get(`${API}/admin/courses`, { headers }).then(res => setCourses(res.data));
    if (tab === "exams" || tab === "create")
      axios.get(`${API}/admin/exams`, { headers }).then(res => setExams(res.data));
    if (tab === "pending")
      axios.get(`${API}/admin/instructors/pending`, { headers }).then(res => setPending(res.data));
  }, [tab]);

  const toggleCourse = async (id) => {
    await axios.patch(`${API}/admin/courses/${id}/toggle`, {}, { headers });
    axios.get(`${API}/admin/courses`, { headers }).then(res => setCourses(res.data));
  };

  const deleteCourse = async (id) => {
    if (!confirm("Supprimer ce cours ?")) return;
    await axios.delete(`${API}/admin/courses/${id}`, { headers });
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const deleteExam = async (id) => {
    if (!confirm("Supprimer cet examen ?")) return;
    await axios.delete(`${API}/admin/exams/${id}`, { headers });
    setExams(prev => prev.filter(e => e.id !== id));
  };

  const approveInstructor = async (id) => {
    await axios.patch(`${API}/admin/instructors/${id}/approve`, {}, { headers });
    setPending(prev => prev.filter(i => i.id !== id));
    setStats(prev => ({ ...prev, pending: prev.pending - 1, instructors: prev.instructors + 1 }));
  };

  const rejectInstructor = async (id) => {
    if (!confirm("Refuser cette demande ?")) return;
    await axios.delete(`${API}/admin/instructors/${id}`, { headers });
    setPending(prev => prev.filter(i => i.id !== id));
  };

  const createExam = async () => {
    if (!examForm.title || !examForm.exam_type) return;
    try {
      await axios.post(`${API}/admin/exams`, examForm, { headers });
      setExamSuccess("Examen créé !");
      setExamForm({ title: "", exam_type: "", level: "", duration_minutes: 30 });
      axios.get(`${API}/admin/exams`, { headers }).then(res => setExams(res.data));
      setTimeout(() => setExamSuccess(""), 3000);
    } catch (err) { console.error(err); }
  };

  const loadQuestions = async (exam) => {
    setSelectedExam(exam);
    const res = await axios.get(`${API}/admin/exams/${exam.id}/questions`, { headers });
    setQuestions(res.data);
  };

  const updateChoice = (i, key, val) => {
    const updated = [...questionForm.choices];
    if (key === "is_correct") {
      updated.forEach((c, idx) => c.is_correct = idx === i);
    } else {
      updated[i][key] = val;
    }
    setQuestionForm(prev => ({ ...prev, choices: updated }));
  };

  const createQuestion = async () => {
    if (!selectedExam || !questionForm.question) return;
    try {
      await axios.post(
        `${API}/admin/exams/${selectedExam.id}/questions`,
        questionForm,
        { headers }
      );
      setQSuccess("Question ajoutée !");
      setQuestionForm({
        question: "", content: "", type: "reading",
        choices: [
          { text: "", is_correct: true },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false }
        ]
      });
      loadQuestions(selectedExam);
      setTimeout(() => setQSuccess(""), 3000);
    } catch (err) { console.error(err); }
  };

  const deleteQuestion = async (id) => {
    if (!confirm("Supprimer cette question ?")) return;
    await axios.delete(`${API}/admin/questions/${id}`, { headers });
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const tabs = [
    { id: "users",   label: "👥 Utilisateurs" },
    { id: "courses", label: "🎬 Cours" },
    { id: "exams",   label: "📝 Examens" },
    { id: "create",  label: "➕ Créer examen" },
    { id: "pending", label: `⏳ En attente (${stats.pending || 0})` },
  ];

  const examTypes = ["Goethe", "TCF", "DELF", "DCF", "CÉLIS"];
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

  return (
    <div style={s.page}>
      <div style={s.navbar}>
        <span style={s.logo}>🛡️ LangExam Admin</span>
        <button onClick={() => navigate("/exams")} style={s.backBtn}>← Retour au site</button>
      </div>

      <div style={s.content}>

        {/* Stats */}
        <div style={s.statsGrid}>
          {[
            { label: "Utilisateurs",     val: stats.users,         color: "#4F46E5" },
            { label: "Cours publiés",    val: stats.courses,       color: "#22c55e" },
            { label: "Formateurs",       val: stats.instructors,   color: "#f59e0b" },
            { label: "En attente",       val: stats.pending,       color: "#ef4444" },
            { label: "Tentatives",       val: stats.attempts,      color: "#8b5cf6" },
            { label: "Cours en attente", val: stats.pendingCourses,color: "#d97706" },
          ].map((st, i) => (
            <div key={i} style={s.statCard}>
              <div style={{ fontSize: "26px", fontWeight: "800", color: st.color }}>{st.val ?? "—"}</div>
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
              <span>Nom</span><span>Email</span><span>Rôle</span><span>Admin</span>
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
                      {u.is_approved ? "Formateur" : "En attente"}
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
              <span>Titre</span><span>Formateur</span><span>Type</span><span>Statut</span><span>Actions</span>
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
                  <button onClick={() => toggleCourse(c.id)} style={s.actionBtn}>{c.is_published ? "Dépublier" : "Publier"}</button>
                  <button onClick={() => deleteCourse(c.id)} style={s.dangerBtn}>Supprimer</button>
                </div>
              </div>
            ))}
            {courses.length === 0 && <p style={s.empty}>Aucun cours.</p>}
          </div>
        )}

        {/* Examens */}
        {tab === "exams" && (
          <div>
            <div style={s.table}>
              <div style={s.tableHead}>
                <span>Titre</span><span>Type</span><span>Niveau</span><span>Questions</span><span>Actions</span>
              </div>
              {exams.map(e => (
                <div key={e.id} style={s.tableRow}>
                  <span style={s.rowName}>{e.title}</span>
                  <span style={s.rowMuted}>{e.exam_type}</span>
                  <span style={s.rowMuted}>{e.level || "—"}</span>
                  <span style={{ ...s.badge, background: "#f0f4ff", color: "#4338ca", border: "2px solid #a5b4fc" }}>
                    {e.question_count} Q
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => { setSelectedExam(e); loadQuestions(e); setTab("questions"); }} style={s.actionBtn}>
                      ➕ Questions
                    </button>
                    <button onClick={() => deleteExam(e.id)} style={s.dangerBtn}>Supprimer</button>
                  </div>
                </div>
              ))}
              {exams.length === 0 && <p style={s.empty}>Aucun examen.</p>}
            </div>
          </div>
        )}

        {/* Créer examen */}
        {tab === "create" && (
          <div style={s.formCard}>
            <h2 style={s.formTitle}>➕ Créer un nouvel examen</h2>

            {examSuccess && <div style={s.success}>{examSuccess}</div>}

            <label style={s.label}>Titre *</label>
            <input placeholder="Ex: Goethe B2 — Test 1"
              value={examForm.title}
              onChange={e => setExamForm(p => ({ ...p, title: e.target.value }))}
              style={s.input} />

            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Type d'examen *</label>
                <select value={examForm.exam_type}
                  onChange={e => setExamForm(p => ({ ...p, exam_type: e.target.value }))}
                  style={s.select}>
                  <option value="">Choisir...</option>
                  {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Niveau</label>
                <select value={examForm.level}
                  onChange={e => setExamForm(p => ({ ...p, level: e.target.value }))}
                  style={s.select}>
                  <option value="">Tous niveaux</option>
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Durée (minutes)</label>
                <input type="number" value={examForm.duration_minutes}
                  onChange={e => setExamForm(p => ({ ...p, duration_minutes: parseInt(e.target.value) }))}
                  style={s.input} />
              </div>
            </div>

            <button onClick={createExam} style={s.btnPrimary}>
              Créer l'examen →
            </button>

            {/* Liste examens existants */}
            {exams.length > 0 && (
              <div style={{ marginTop: "2rem" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#1e1e2e", marginBottom: "12px" }}>
                  Examens existants — clique pour ajouter des questions
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {exams.map(e => (
                    <div key={e.id} style={{ ...s.examItem, borderColor: selectedExam?.id === e.id ? "#4F46E5" : "#e5e5e5", background: selectedExam?.id === e.id ? "#EEF2FF" : "#fff" }}
                      onClick={() => { loadQuestions(e); setTab("questions"); }}>
                      <div>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: "#1e1e2e" }}>{e.title}</span>
                        <span style={{ fontSize: "12px", color: "#afafaf", marginLeft: "8px" }}>{e.exam_type} {e.level}</span>
                      </div>
                      <span style={{ ...s.badge, background: "#f0f4ff", color: "#4338ca", border: "2px solid #a5b4fc" }}>
                        {e.question_count} questions
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Questions */}
        {tab === "questions" && selectedExam && (
          <div>
            <div style={s.formCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
                <div>
                  <h2 style={s.formTitle}>📝 {selectedExam.title}</h2>
                  <p style={{ fontSize: "13px", color: "#afafaf", fontWeight: "600" }}>
                    {questions.length} question(s) — {selectedExam.exam_type} {selectedExam.level}
                  </p>
                </div>
                <button onClick={() => setTab("create")} style={s.actionBtn}>← Retour</button>
              </div>

              {qSuccess && <div style={s.success}>{qSuccess}</div>}

              {/* Formulaire question */}
              <label style={s.label}>Texte de contexte (optionnel)</label>
              <textarea placeholder="Ex: Lesen Sie den folgenden Text..."
                value={questionForm.content}
                onChange={e => setQuestionForm(p => ({ ...p, content: e.target.value }))}
                style={s.textarea} rows={3} />

              <label style={s.label}>Question *</label>
              <input placeholder="Ex: Was ist das Hauptthema des Textes?"
                value={questionForm.question}
                onChange={e => setQuestionForm(p => ({ ...p, question: e.target.value }))}
                style={s.input} />

              <label style={s.label}>Type</label>
              <select value={questionForm.type}
                onChange={e => setQuestionForm(p => ({ ...p, type: e.target.value }))}
                style={{ ...s.select, marginBottom: "1rem" }}>
                <option value="reading">Compréhension écrite</option>
                <option value="listening">Compréhension orale</option>
                <option value="grammar">Grammaire</option>
                <option value="vocabulary">Vocabulaire</option>
              </select>

              <label style={s.label}>Choix de réponses — coche la bonne réponse</label>
              {questionForm.choices.map((choice, i) => (
                <div key={i} style={s.choiceRow}>
                  <input
                    type="radio"
                    name="correct"
                    checked={choice.is_correct}
                    onChange={() => updateChoice(i, "is_correct", true)}
                    style={{ cursor: "pointer", accentColor: "#4F46E5" }}
                  />
                  <span style={{ ...s.choiceLetter, background: choice.is_correct ? "#4F46E5" : "#f0f0f0", color: choice.is_correct ? "#fff" : "#afafaf" }}>
                    {["A", "B", "C", "D"][i]}
                  </span>
                  <input
                    placeholder={`Choix ${["A", "B", "C", "D"][i]}`}
                    value={choice.text}
                    onChange={e => updateChoice(i, "text", e.target.value)}
                    style={{ ...s.input, marginBottom: 0, flex: 1 }}
                  />
                </div>
              ))}

              <button onClick={createQuestion} style={{ ...s.btnPrimary, marginTop: "1rem" }}>
                ➕ Ajouter la question
              </button>
            </div>

            {/* Liste des questions existantes */}
            {questions.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#1e1e2e", marginBottom: "12px" }}>
                  Questions existantes ({questions.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {questions.map((q, i) => (
                    <div key={q.id} style={s.questionItem}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: "12px", fontWeight: "800", color: "#4F46E5", marginRight: "8px" }}>Q{i + 1}</span>
                          <span style={{ fontSize: "14px", fontWeight: "700", color: "#1e1e2e" }}>{q.question}</span>
                          {q.content && <p style={{ fontSize: "12px", color: "#afafaf", marginTop: "4px", fontStyle: "italic" }}>{q.content.slice(0, 80)}...</p>}
                          <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                            {q.choices?.map(c => (
                              <span key={c.id} style={{ fontSize: "11px", fontWeight: "700", padding: "2px 10px", borderRadius: "20px", background: c.is_correct ? "#f0fdf4" : "#f8f8f8", color: c.is_correct ? "#15803d" : "#6b7280", border: `2px solid ${c.is_correct ? "#86efac" : "#e5e5e5"}` }}>
                                {c.is_correct ? "✓ " : ""}{c.text}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => deleteQuestion(q.id)} style={s.dangerBtn}>Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* En attente */}
        {tab === "pending" && (
          <div style={s.table}>
            <div style={s.tableHead}>
              <span>Nom</span><span>Email</span><span>Bio</span><span>Actions</span>
            </div>
            {pending.map(i => (
              <div key={i.id} style={s.tableRow}>
                <span style={s.rowName}>{i.name}</span>
                <span style={s.rowMuted}>{i.email}</span>
                <span style={{ ...s.rowMuted, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.bio || "—"}</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => approveInstructor(i.id)} style={s.approveBtn}>✅ Approuver</button>
                  <button onClick={() => rejectInstructor(i.id)} style={s.dangerBtn}>❌ Refuser</button>
                </div>
              </div>
            ))}
            {pending.length === 0 && <p style={s.empty}>Aucune demande. 🎉</p>}
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
  tabBtn: { padding: "8px 18px", border: "2px solid", borderRadius: "20px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  table: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "16px", overflow: "hidden" },
  tableHead: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", padding: "10px 16px", background: "#f8f8f8", borderBottom: "2px solid #e5e5e5", gap: "10px", fontSize: "11px", fontWeight: "800", color: "#afafaf" },
  tableRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", padding: "12px 16px", borderBottom: "2px solid #f0f4ff", alignItems: "center", gap: "10px" },
  rowName: { fontSize: "13px", fontWeight: "800", color: "#1e1e2e" },
  rowMuted: { fontSize: "12px", fontWeight: "600", color: "#6b7280" },
  badge: { fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "20px", display: "inline-block" },
  empty: { padding: "2rem", textAlign: "center", color: "#afafaf", fontWeight: "700" },
  actionBtn: { padding: "6px 12px", background: "#f0f4ff", border: "2px solid #a5b4fc", borderRadius: "8px", color: "#4338ca", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  approveBtn: { padding: "6px 12px", background: "#f0fdf4", border: "2px solid #86efac", borderRadius: "8px", color: "#15803d", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  dangerBtn: { padding: "6px 12px", background: "#fef2f2", border: "2px solid #fca5a5", borderRadius: "8px", color: "#dc2626", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  formCard: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "20px", padding: "1.8rem" },
  formTitle: { fontSize: "18px", fontWeight: "800", color: "#1e1e2e", marginBottom: "1.2rem" },
  label: { display: "block", fontSize: "12px", fontWeight: "800", color: "#1e1e2e", marginBottom: "6px", marginTop: "14px" },
  input: { width: "100%", padding: "11px 14px", background: "#f8f8f8", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "13px", fontWeight: "600", color: "#1e1e2e", fontFamily: "'Nunito', sans-serif", outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "11px 14px", background: "#f8f8f8", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "13px", fontWeight: "600", color: "#1e1e2e", fontFamily: "'Nunito', sans-serif", outline: "none", boxSizing: "border-box", resize: "vertical" },
  select: { width: "100%", padding: "11px 14px", background: "#f8f8f8", border: "2px solid #e5e5e5", borderRadius: "12px", fontSize: "13px", fontWeight: "600", color: "#1e1e2e", fontFamily: "'Nunito', sans-serif", outline: "none", boxSizing: "border-box" },
  btnPrimary: { width: "100%", padding: "13px", background: "#4F46E5", border: "none", borderRadius: "14px", color: "#fff", fontSize: "14px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 0 #3730a3", fontFamily: "'Nunito', sans-serif", marginTop: "1rem" },
  success: { background: "#f0fdf4", border: "2px solid #86efac", borderRadius: "12px", padding: "10px 14px", fontSize: "13px", fontWeight: "700", color: "#15803d", marginBottom: "1rem" },
  choiceRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" },
  choiceLetter: { width: "30px", height: "30px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", flexShrink: 0 },
  examItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", border: "2px solid", borderRadius: "12px", cursor: "pointer" },
  questionItem: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "14px", padding: "1rem 1.2rem" }
};