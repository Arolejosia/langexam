import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const payload = isLogin ? { email, password } : { email, password, name };
      const res = await axios.post(`http://localhost:5000${endpoint}`, payload);
      login(res.data.user, res.data.token);
      navigate("/exams");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur connexion");
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>🌍 LangExam</div>
        <h1 style={s.title}>{isLogin ? "Bon retour !" : "Créer un compte"}</h1>
        <p style={s.sub}>Prépare-toi aux examens officiels de langue</p>

        {!isLogin && (
          <input placeholder="Nom complet" value={name}
            onChange={e => setName(e.target.value)} style={s.input} />
        )}
        <input placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} style={s.input} />
        <input placeholder="Mot de passe" type="password" value={password}
          onChange={e => setPassword(e.target.value)} style={s.input} />

        {error && <div style={s.error}>{error}</div>}

        <button onClick={handleSubmit} style={s.btn}>
          {isLogin ? "Se connecter" : "S'inscrire"}
        </button>

        <p style={s.toggle}>
          {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <span onClick={() => setIsLogin(!isLogin)} style={s.link}>
            {isLogin ? "S'inscrire" : "Se connecter"}
          </span>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito', sans-serif", padding: "1rem" },
  card: { background: "#fff", border: "2px solid #e5e5e5", borderRadius: "24px", padding: "2.5rem", width: "100%", maxWidth: "420px" },
  logo: { fontSize: "22px", fontWeight: "800", color: "#4F46E5", marginBottom: "1.5rem" },
  title: { fontSize: "24px", fontWeight: "800", color: "#1e1e2e", marginBottom: "6px" },
  sub: { fontSize: "14px", color: "#afafaf", marginBottom: "1.5rem", fontWeight: "600" },
  input: { width: "100%", padding: "12px 16px", background: "#f8f8f8", border: "2px solid #e5e5e5", borderRadius: "14px", color: "#1e1e2e", fontSize: "14px", fontWeight: "600", marginBottom: "12px", boxSizing: "border-box", outline: "none", fontFamily: "'Nunito', sans-serif" },
  error: { background: "#fef2f2", border: "2px solid #fca5a5", borderRadius: "12px", padding: "10px 14px", fontSize: "13px", fontWeight: "700", color: "#dc2626", marginBottom: "12px" },
  btn: { width: "100%", padding: "14px", background: "#4F46E5", border: "none", borderRadius: "14px", color: "#fff", fontSize: "15px", fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 0 #3730a3", fontFamily: "'Nunito', sans-serif", marginBottom: "1rem" },
  toggle: { fontSize: "13px", color: "#afafaf", textAlign: "center", fontWeight: "600" },
  link: { color: "#4F46E5", cursor: "pointer", fontWeight: "800" }
};