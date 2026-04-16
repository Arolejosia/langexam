import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../authMiddleware.js";

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  const user_id = req.userId; // ← vrai user via token
  const { exam_id, answers } = req.body;

  try {
    const attemptResult = await pool.query(
      "INSERT INTO attempts (user_id, exam_id, score) VALUES ($1, $2, $3) RETURNING id",
      [user_id, exam_id, 0]
    );
    const attempt_id = attemptResult.rows[0].id;

    let score = 0;

    for (const questionId in answers) {
      const selectedChoice = answers[questionId];
      const correct = await pool.query(
        "SELECT id FROM choices WHERE question_id = $1 AND is_correct = true",
        [questionId]
      );
      const correctId = correct.rows[0].id;

      if (parseInt(selectedChoice) === correctId) score++;

      await pool.query(
        "INSERT INTO answers (attempt_id, question_id, selected_choice_id) VALUES ($1, $2, $3)",
        [attempt_id, questionId, selectedChoice]
      );
    }

    await pool.query(
      "UPDATE attempts SET score = $1 WHERE id = $2",
      [score, attempt_id]
    );

    res.json({ score });

  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

export default router;