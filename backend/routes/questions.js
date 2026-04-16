import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/:examId", async (req, res) => {
  const { examId } = req.params;

  const result = await pool.query(`
    SELECT 
      q.id,
      q.question,
      q.content,
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', c.id,
          'text', c.text,
          'is_correct', c.is_correct
        )
      ) AS choices
    FROM questions q
    JOIN choices c ON q.id = c.question_id
    WHERE q.exam_id = $1
    GROUP BY q.id;
  `, [examId]);

  res.json(result.rows);
});

export default router;