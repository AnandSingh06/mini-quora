import bcrypt from "bcryptjs";
import jwt    from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import db from "../config/db.js";

const SECRET = process.env.JWT_SECRET || "mysecretkey";

// ─── REGISTER ────────────────────────────────────────────
export const register = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required." });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
      [uuidv4(), username, hashed],
      (err) => {
        if (err) return res.status(409).json({ error: "Username already exists." });
        res.status(201).json({ message: "Registered successfully." });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};

// ─── LOGIN ───────────────────────────────────────────────
export const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required." });
  }

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, result) => {
      if (err)              return res.status(500).json({ error: "Server error." });
      if (!result.length)   return res.status(404).json({ error: "User not found." });

      const user    = result[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) return res.status(401).json({ error: "Wrong password." });

      const token = jwt.sign({ id: user.id, username: user.username }, SECRET);

      res.json({ token, username: user.username });
    }
  );
};