import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function BecomeInstructorPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [bio, setBio] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!bio.trim()) { setError("Décris-toi en quelques mots."); return; }
    try {
      await axios.post("http://localhost:5000/instructors/apply",
        { bio },
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
        <div style={{ fontSize: "56px", marginBottom: "1rem" }}>🎉</div>
        <h1 style={s.title}>Demande envoyée !</h1>
        <p style={s.sub}>L'équipe LangExam va examiner ta candidature et te répondre rapidement.</p>
        <button onClick={() => navigate("/exams")} style={s.btn}>
          Retour à l'accueil
        </button>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ fontSize: "48px", marginBottom: "1rem" }}>🎓</div>
        <h1 style={s.title}>Devenir formateur</h1>
        <p style={s.sub}>Partage ton expertise avec des milliers d'apprenants en langues.</p>

        {/* Avantages */}
        <div style={s.perks}>
          {[
            { icon: "💰", text: "Gagne 70% sur chaque vente" },
            { icon: "🌍", text: "Touche des apprenants du monde entier" },
            { icon: "📈", text: "Suis tes stats en temps réel" },
            { icon: "🛡️", text: "Plateforme sécurisée et fiable" },
          ].map((p, i) => (
            <div key={i} style={s.perk}>
              <span style={{ fontSize: "20px" }}>{p.icon}</span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e1e2e" }}>{p.text}</span>
            </div>
          ))}
        </div>

        <div style={s.divider} />

        <label style={s.label}>Parle-nous de toi et de ton expertise</label>
        <textarea
          placeholder="Ex: Je suis professeur de langue certifié avec 10 ans d'expérience dans la préparation au Goethe B2 et C1..."
          value={bio}
          onChange={e => setBio(e.target.value)}
          style={s.textarea}
          rows={5}
        />

        {error && <div style={s.error}>{error}</div>}

        <button onClick={handleSubmit} style={s.btn}>
          Envoyer ma candidature →
        </button>

        <p style={s.note}>
          Ta demande sera examinée par notre équipe sous 48h.
        </p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito', sans-serif", padding: "2rem 1rem" },
  card: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "24px", padding: "2.5rem", width: "100%", maxWidth: "520px", textAlign: "center" },
  title: { fontSize: "24px", fontWeight: "800", color: "#1e1e2e", marginBottom: "8px" },
  sub: { fontSize: "14px", fontWeight: "600", color: "#afafaf", marginBottom: "1.5rem" },
  perks: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1.5rem" },
  perk: { display: "flex", alignItems: "center", gap: "10px", background: "#f0f4ff", border: "2px solid #e5e5e5", borderRadius: "12px", padding: "10px 14px", textAlign: "left" },
  divider: { height: "2px", background: "#f0f4ff", borderRadius: "2px", marginBottom: "1.5rem" },
  label: { display: "block", fontSize: "13px", fontWeight: "800", color: "#1e1e2e", marginBottom: "8px", textAlign: "left" },
  textarea: { width: "100%", padding: "12px 14px", background: "#f8f8f8", border: "2px solid #e5e5e5", borderRadius: "14px", fontSize: "13px", fontWeight: "600", color: "#1e1e2e", fontFamily: "'Nunito', sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "12px" },
  error: { background: "#fef2f2", border: "2px solid #fca5a5", borderRadius: "12px", padding: "10px 14px", fontSize: "13px", fontWeight: "700", color: "#dc2626", marginBottom: "12px" },
  btn: { width: "100%", padding: "14px", background: "#4F46E5", border: "none", borderRadius: "14px", color: "#fff", fontSize: "15px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 0 #3730a3", fontFamily: "'Nunito', sans-serif", marginBottom: "12px" },
  note: { fontSize: "12px", fontWeight: "600", color: "#afafaf" }
};