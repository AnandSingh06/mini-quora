import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "mysecretkey";

const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "No token. Please login." });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;   // { id, username }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

export default auth;