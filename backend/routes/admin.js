import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../authMiddleware.js";

const router = express.Router();

// Middleware admin
const requireAdmin = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT is_admin FROM users WHERE id = $1", [req.userId]
    );
    if (!result.rows[0]?.is_admin)
      return res.status(403).json({ error: "Accès refusé" });
    next();
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Stats globales
router.get("/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await pool.query("SELECT COUNT(*) FROM users");
    const courses = await pool.query("SELECT COUNT(*) FROM courses WHERE is_published = true");
    const instructors = await pool.query("SELECT COUNT(*) FROM instructors WHERE is_approved = true");
    const pending = await pool.query("SELECT COUNT(*) FROM instructors WHERE is_approved = false");
    const attempts = await pool.query("SELECT COUNT(*) FROM attempts");
    const pendingCourses = await pool.query("SELECT COUNT(*) FROM courses WHERE is_published = false");

    res.json({
      users: parseInt(users.rows[0].count),
      courses: parseInt(courses.rows[0].count),
      instructors: parseInt(instructors.rows[0].count),
      pending: parseInt(pending.rows[0].count),
      attempts: parseInt(attempts.rows[0].count),
      pendingCourses: parseInt(pendingCourses.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Liste utilisateurs
router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.*, 
        CASE WHEN i.id IS NOT NULL THEN true ELSE false END AS is_instructor,
        i.is_approved
      FROM users u
      LEFT JOIN instructors i ON i.user_id = u.id
      ORDER BY u.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Liste cours (tous)
router.get("/courses", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.name AS instructor_name,
        COUNT(DISTINCT l.id) AS lesson_count
      FROM courses c
      JOIN instructors i ON c.instructor_id = i.id
      JOIN users u ON i.user_id = u.id
      LEFT JOIN lessons l ON l.course_id = c.id
      GROUP BY c.id, u.name
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Publier / dépublier cours
router.patch("/courses/:id/toggle", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE courses SET is_published = NOT is_published WHERE id = $1 RETURNING is_published",
      [req.params.id]
    );
    res.json({ is_published: result.rows[0].is_published });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Supprimer cours
router.delete("/courses/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM lessons WHERE course_id = $1", [req.params.id]);
    await pool.query("DELETE FROM enrollments WHERE course_id = $1", [req.params.id]);
    await pool.query("DELETE FROM course_ratings WHERE course_id = $1", [req.params.id]);
    await pool.query("DELETE FROM courses WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Formateurs en attente
router.get("/instructors/pending", requireAuth, requireAdmin, async (req, res) => {
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

// Approuver formateur
router.patch("/instructors/:id/approve", requireAuth, requireAdmin, async (req, res) => {
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

// Refuser / supprimer formateur
router.delete("/instructors/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM instructors WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Liste examens
router.get("/exams", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*,
        COUNT(DISTINCT q.id) AS question_count,
        COUNT(DISTINCT a.id) AS attempt_count
      FROM exams e
      LEFT JOIN questions q ON q.exam_id = e.id
      LEFT JOIN attempts a ON a.exam_id = e.id
      GROUP BY e.id
      ORDER BY e.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Supprimer examen
router.delete("/exams/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM answers WHERE attempt_id IN (SELECT id FROM attempts WHERE exam_id = $1)", [req.params.id]);
    await pool.query("DELETE FROM attempts WHERE exam_id = $1", [req.params.id]);
    await pool.query("DELETE FROM choices WHERE question_id IN (SELECT id FROM questions WHERE exam_id = $1)", [req.params.id]);
    await pool.query("DELETE FROM questions WHERE exam_id = $1", [req.params.id]);
    await pool.query("DELETE FROM exams WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;