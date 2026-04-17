import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function QuestionsPage() {
  const { examId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [examTitle, setExamTitle] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    axios.get(`${${import.meta.env.VITE_API_URL}}/exams`).then(res => {
      const exam = res.data.find(e => e.id === parseInt(examId));
      if (exam) { setExamTitle(exam.title); setTimeLeft((exam.duration_minutes || 30) * 60); }
    });
  }, [examId]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/questions/${examId}`)
      .then(res => setQuestions(res.data))
      .catch(err => console.error(err));
  }, [examId]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) { submitExam(true); return; }
    timerRef.current = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  useEffect(() => { setShowAnswer(false); }, [currentIndex]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleChoice = (choiceId) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: choiceId }));
    setShowAnswer(true);
  };

  const submitExam = async (auto = false) => {
    clearTimeout(timerRef.current);
    try {
      const res = await axios.post(
        "${import.meta.env.VITE_API_URL}/submit",
        { exam_id: examId, answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/result", { state: { score: res.data.score, total: questions.length, auto } });
    } catch (err) { console.error(err); }
  };

  if (questions.length === 0 || timeLeft === null) return (
    <div style={s.page}><p style={{ color: "#afafaf", fontWeight: "700" }}>Chargement...</p></div>
  );

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isWarning = timeLeft <= 60;
  const isCritical = timeLeft <= 30;

  const timerStyle = {
    background: isCritical ? "#fef2f2" : isWarning ? "#fffbeb" : "#f0fdf4",
    border: `2px solid ${isCritical ? "#fca5a5" : isWarning ? "#fcd34d" : "#86efac"}`,
    color: isCritical ? "#dc2626" : isWarning ? "#d97706" : "#15803d",
    padding: "6px 14px", borderRadius: "20px", fontSize: "14px", fontWeight: "800"
  };

  return (
    <div style={s.page}>
      <div style={s.container}>

        <div style={s.header}>
          <div>
            <div style={s.examLabel}>{examTitle}</div>
            <div style={s.counter}>Question {currentIndex + 1} / {questions.length}</div>
          </div>
          <div style={timerStyle}>⏱ {formatTime(timeLeft)}</div>
        </div>

        <div style={s.barWrap}>
          <div style={{ ...s.barFill, width: `${progress}%` }} />
        </div>

        <div style={s.card}>
          {currentQuestion.content && (
            <div style={s.context}>{currentQuestion.content}</div>
          )}
          <h2 style={s.question}>{currentQuestion.question}</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {currentQuestion.choices.map((choice, i) => {
              const isSelected = answers[currentQuestion.id] === choice.id;
              const isCorrect = choice.is_correct;
              const letters = ["A", "B", "C", "D"];

              let border = "2px solid #e5e5e5";
              let bg = "#fff";
              let letterBg = "#f0f0f0";
              let letterColor = "#afafaf";
              let textColor = "#3d3d4e";

              if (showAnswer) {
                if (isCorrect) {
                  border = "2px solid #86efac";
                  bg = "#f0fdf4";
                  letterBg = "#22c55e";
                  letterColor = "#fff";
                  textColor = "#15803d";
                } else if (isSelected && !isCorrect) {
                  border = "2px solid #fca5a5";
                  bg = "#fef2f2";
                  letterBg = "#ef4444";
                  letterColor = "#fff";
                  textColor = "#dc2626";
                }
              } else if (isSelected) {
                border = "2px solid #a5b4fc";
                bg = "#EEF2FF";
                letterBg = "#4F46E5";
                letterColor = "#fff";
                textColor = "#3730a3";
              }

              return (
                <div key={choice.id} onClick={() => handleChoice(choice.id)}
                  style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px", border, borderRadius: "16px", background: bg, cursor: "pointer", transition: "all 0.15s", color: textColor, fontSize: "14px", fontWeight: "700" }}>
                  <span style={{ width: "32px", height: "32px", borderRadius: "10px", background: letterBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", flexShrink: 0, color: letterColor }}>
                    {letters[i]}
                  </span>
                  {choice.text}
                </div>
              );
            })}
          </div>
        </div>

        <div style={s.navRow}>
          <button onClick={() => setCurrentIndex(p => p - 1)} disabled={currentIndex === 0} style={s.btnGhost}>
            ← Précédent
          </button>
          {currentIndex === questions.length - 1 ? (
            <button onClick={() => submitExam(false)} style={s.btnPrimary}>
              Terminer 🎯
            </button>
          ) : (
            <button onClick={() => setCurrentIndex(p => p + 1)} style={s.btnPrimary}>
              Suivant →
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f0f4ff", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "2rem 1rem", fontFamily: "'Nunito', sans-serif" },
  container: { width: "100%", maxWidth: "680px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" },
  examLabel: { fontSize: "12px", fontWeight: "700", color: "#afafaf", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: "3px" },
  counter: { fontSize: "16px", fontWeight: "800", color: "#1e1e2e" },
  barWrap: { height: "12px", background: "#e5e5e5", borderRadius: "20px", marginBottom: "1.5rem", overflow: "hidden" },
  barFill: { height: "100%", background: "#4F46E5", borderRadius: "20px", transition: "width 0.4s" },
  card: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "20px", padding: "1.8rem", marginBottom: "1.2rem" },
  context: { fontSize: "13px", color: "#afafaf", fontWeight: "600", fontStyle: "italic", marginBottom: "12px", padding: "10px 14px", background: "#f8f8f8", borderRadius: "12px" },
  question: { fontSize: "18px", fontWeight: "800", color: "#1e1e2e", marginBottom: "1.4rem", lineHeight: "1.5" },
  navRow: { display: "flex", justifyContent: "space-between", gap: "12px" },
  btnGhost: { padding: "12px 24px", background: "#fff", border: "2px solid #e5e5e5", borderRadius: "14px", color: "#afafaf", fontSize: "14px", fontWeight: "800", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  btnPrimary: { padding: "12px 28px", background: "#4F46E5", border: "none", borderRadius: "14px", color: "#fff", fontSize: "14px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 0 #3730a3", fontFamily: "'Nunito', sans-serif" }
};