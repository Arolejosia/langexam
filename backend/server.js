import express from "express";
import cors from "cors";
import examsRoutes from "./routes/exams.js";
import questionsRoutes from "./routes/questions.js";
import submitRoutes from "./routes/submit.js";
import authRoutes from "./routes/auth.js";
import historyRoutes from "./routes/history.js";
import coursesRoutes from "./routes/courses.js";
import instructorsRoutes from "./routes/instructors.js";
import ratingsRoutes from "./routes/ratings.js";
import adminRoutes from "./routes/admin.js";
const PORT = process.env.PORT || 8080;
const app = express();
app.use(cors());
app.use(express.json());

app.use("/exams", examsRoutes);
app.use("/questions", questionsRoutes);
app.use("/submit", submitRoutes);
app.use("/auth", authRoutes);
app.use("/history", historyRoutes);
app.use("/courses", coursesRoutes);
app.use("/instructors", instructorsRoutes);
app.use("/ratings", ratingsRoutes);
app.use("/admin", adminRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});