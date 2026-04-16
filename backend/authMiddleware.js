import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "langexam_secret_2024";

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header)
    return res.status(401).json({ error: "Non authentifié" });

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Token invalide" });
  }
};