import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "langexam_secret_2024";

router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1", [email]
    );
    if (existing.rows.length > 0)
      return res.status(400).json({ error: "Email déjà utilisé" });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name",
      [email, hash, name]
    );

    const token = jwt.sign(
      { userId: result.rows[0].id },
      SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: result.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1", [email]
    );
    if (result.rows.length === 0)
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });

    const token = jwt.sign(
      { userId: user.id },
      SECRET,
      { expiresIn: "7d" }
    );
   res.json({
  token,
  user: { id: user.id, email: user.email, name: user.name, is_admin: user.is_admin }
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;