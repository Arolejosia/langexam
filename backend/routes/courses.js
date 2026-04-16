import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../authMiddleware.js";

const router = express.Router();

// Tous les cours publiés
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        u.name AS instructor_name,
        COUNT(DISTINCT l.id) AS lesson_count,
        ROUND(AVG(r.rating)::numeric, 1) AS avg_rating,
        COUNT(DISTINCT r.id) AS total_ratings
      FROM courses c
      JOIN instructors i ON c.instructor_id = i.id
      JOIN users u ON i.user_id = u.id
      LEFT JOIN lessons l ON l.course_id = c.id
      LEFT JOIN course_ratings r ON r.course_id = c.id
      WHERE c.is_published = true
      GROUP BY c.id, u.name
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Détail cours + leçons
router.get("/:courseId", async (req, res) => {
  try {
    const course = await pool.query(`
      SELECT c.*, u.name AS instructor_name
      FROM courses c
      JOIN instructors i ON c.instructor_id = i.id
      JOIN users u ON i.user_id = u.id
      WHERE c.id = $1
    `, [req.params.courseId]);

    if (course.rows.length === 0)
      return res.status(404).json({ error: "Cours introuvable" });

    const lessons = await pool.query(`
      SELECT * FROM lessons
      WHERE course_id = $1
      ORDER BY order_index ASC
    `, [req.params.courseId]);

    res.json({ ...course.rows[0], lessons: lessons.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// S'inscrire à un cours
router.post("/:courseId/enroll", requireAuth, async (req, res) => {
  try {
    await pool.query(
      "INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [req.userId, req.params.courseId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Vérifier si inscrit
router.get("/:courseId/enrolled", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2",
      [req.userId, req.params.courseId]
    );
    res.json({ enrolled: result.rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Mes cours
router.get("/my/enrolled", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.name AS instructor_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN instructors i ON c.instructor_id = i.id
      JOIN users u ON i.user_id = u.id
      WHERE e.user_id = $1
      ORDER BY e.enrolled_at DESC
    `, [req.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});


router.get("/:courseId/enrollcount", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) AS count FROM enrollments WHERE course_id = $1",
      [req.params.courseId]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// Incrémenter les vues
router.post("/:courseId/view", async (req, res) => {
  try {
    await pool.query(
      "UPDATE courses SET views = views + 1 WHERE id = $1",
      [req.params.courseId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// Soumettre un cours (formateur)
router.post("/", requireAuth, async (req, res) => {
  const { title, description, language, level, exam_type, is_free, price, thumbnail_url, lessons } = req.body;
  try {
    // Vérifier que l'user est formateur approuvé
    const instructor = await pool.query(
      "SELECT id FROM instructors WHERE user_id = $1 AND is_approved = true",
      [req.userId]
    );
    if (instructor.rows.length === 0)
      return res.status(403).json({ error: "Tu n'es pas formateur approuvé" });

    const instructor_id = instructor.rows[0].id;

    // Créer le cours
    const course = await pool.query(`
      INSERT INTO courses (instructor_id, title, description, language, level, exam_type, is_free, price, thumbnail_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [instructor_id, title, description, language, level, exam_type, is_free, price || 0, thumbnail_url]);

    const course_id = course.rows[0].id;

    // Insérer les leçons
    for (let i = 0; i < lessons.length; i++) {
      const { title: ltitle, video_url, duration_minutes, is_free: lf } = lessons[i];
      await pool.query(`
        INSERT INTO lessons (course_id, title, video_url, duration_minutes, is_free, order_index)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [course_id, ltitle, video_url, duration_minutes || null, lf || false, i]);
    }

    res.json({ success: true, course_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;