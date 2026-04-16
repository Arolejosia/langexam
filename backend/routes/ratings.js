import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../authMiddleware.js";

const router = express.Router();

// Noter un cours
router.post("/:courseId", requireAuth, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    await pool.query(`
      INSERT INTO course_ratings (user_id, course_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, course_id)
      DO UPDATE SET rating = $3, comment = $4
    `, [req.userId, req.params.courseId, rating, comment || null]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupérer les notes d'un cours
router.get("/:courseId", async (req, res) => {
  try {
    const ratings = await pool.query(`
      SELECT r.*, u.name AS user_name
      FROM course_ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.course_id = $1
      ORDER BY r.created_at DESC
    `, [req.params.courseId]);

    const avg = await pool.query(`
      SELECT 
        ROUND(AVG(rating)::numeric, 1) AS avg,
        COUNT(*) AS total
      FROM course_ratings
      WHERE course_id = $1
    `, [req.params.courseId]);

    res.json({
      ratings: ratings.rows,
      avg: parseFloat(avg.rows[0].avg) || 0,
      total: parseInt(avg.rows[0].total) || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Ma note pour un cours
router.get("/:courseId/mine", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM course_ratings WHERE user_id = $1 AND course_id = $2",
      [req.userId, req.params.courseId]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;