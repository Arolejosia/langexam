import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../authMiddleware.js";


const router = express.Router();

// Devenir formateur (demande)
router.post("/apply", requireAuth, async (req, res) => {
  const { bio } = req.body;
  try {
    const existing = await pool.query(
      "SELECT id FROM instructors WHERE user_id = $1", [req.userId]
    );
    if (existing.rows.length > 0)
      return res.status(400).json({ error: "Demande déjà soumise" });

    await pool.query(
      "INSERT INTO instructors (user_id, bio) VALUES ($1, $2)",
      [req.userId, bio]
    );
    res.json({ success: true, message: "Demande soumise — en attente d'approbation" });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Admin — liste des demandes
router.get("/pending", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, u.name, u.email
      FROM instructors i
      JOIN users u ON i.user_id = u.id
      WHERE i.is_approved = false
      ORDER BY i.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Admin — approuver formateur
router.patch("/:id/approve", requireAuth, async (req, res) => {
  try {
    await pool.query(
      "UPDATE instructors SET is_approved = true WHERE id = $1",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Mon profil formateur
router.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM instructors WHERE user_id = $1",
      [req.userId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Pas formateur" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Mes cours + stats
router.get("/my-courses", requireAuth, async (req, res) => {
  try {
    const instructor = await pool.query(
      "SELECT id FROM instructors WHERE user_id = $1 AND is_approved = true",
      [req.userId]
    );
    if (instructor.rows.length === 0)
      return res.status(403).json({ error: "Non autorisé" });

    const result = await pool.query(`
      SELECT 
        c.*,
        COUNT(DISTINCT e.id) AS enrolled_count,
        COUNT(DISTINCT l.id) AS lesson_count,
        ROUND(AVG(r.rating)::numeric, 1) AS avg_rating,
        COUNT(DISTINCT r.id) AS total_ratings
      FROM courses c
      LEFT JOIN enrollments e ON e.course_id = c.id
      LEFT JOIN lessons l ON l.course_id = c.id
      LEFT JOIN course_ratings r ON r.course_id = c.id
      WHERE c.instructor_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `, [instructor.rows[0].id]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Stats globales formateur
router.get("/my-stats", requireAuth, async (req, res) => {
  try {
    const instructor = await pool.query(
      "SELECT id FROM instructors WHERE user_id = $1 AND is_approved = true",
      [req.userId]
    );
    if (instructor.rows.length === 0)
      return res.status(403).json({ error: "Non autorisé" });

    const result = await pool.query(`
      SELECT 
        COUNT(DISTINCT c.id) AS total_courses,
        COUNT(DISTINCT e.id) AS total_students,
        COALESCE(SUM(c.views), 0) AS total_views,
        ROUND(AVG(r.rating)::numeric, 1) AS avg_rating
      FROM courses c
      LEFT JOIN enrollments e ON e.course_id = c.id
      LEFT JOIN course_ratings r ON r.course_id = c.id
      WHERE c.instructor_id = $1
    `, [instructor.rows[0].id]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;