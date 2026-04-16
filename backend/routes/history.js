import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id,
        a.score,
        a.created_at,
        e.title,
        e.exam_type,
        e.level,
        (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) AS total
      FROM attempts a
      JOIN exams e ON a.exam_id = e.id
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC
    `, [req.userId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;