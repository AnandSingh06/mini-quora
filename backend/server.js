import dotenv from "dotenv";
dotenv.config();

import express from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import methodOverride from "method-override";
import db from "./db.js";
import OpenAI from "openai";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const app = express();

// 🔐 SECRET
const SECRET = "mysecretkey";

// 🤖 AI CLIENT
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// 📁 MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(path.resolve(), "public")));
app.use(methodOverride("_method"));

// ================= AUTH MIDDLEWARE =================
const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.json({ error: "Invalid token" });
  }
};

// ================= REGISTER =================
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
    [uuidv4(), username, hashed],
    (err) => {
      if (err) return res.json({ error: "User exists" });
      res.json({ message: "Registered" });
    }
  );
});

// ================= LOGIN =================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username=?",
    [username],
    async (err, result) => {
      if (result.length === 0)
        return res.json({ error: "User not found" });

      const user = result[0];

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.json({ error: "Wrong password" });

      const token = jwt.sign({ id: user.id, username }, SECRET);

      res.json({ token, username });
    }
  );
});

// ================= GET POSTS (✅ FIXED isOwner) =================
app.get("/api/posts", (req, res) => {
  const token = req.headers.authorization;

  // ✅ Extract the logged-in username from token
  let currentUser = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET);
      currentUser = decoded.username;
    } catch {}
  }

  db.query(
    "SELECT * FROM posts ORDER BY created_at DESC",
    (err, results) => {
      if (err) return res.json({ error: "DB error" });

      const updatedPosts = results.map((post) => ({
        ...post,
        // ✅ FIXED: compare post owner with logged-in user (case-insensitive)
        isOwner:
          currentUser !== null &&
          post.username?.trim().toLowerCase() ===
            currentUser?.trim().toLowerCase(),
      }));

      res.json(updatedPosts);
    }
  );
});

// ================= CREATE POST (✅ FIXED: get username from token) =================
app.post("/api/posts", auth, upload.array("media", 5), (req, res) => {
  // ✅ FIXED: use authenticated user, not user-supplied body field
  const { username } = req.user;
  const { content, topic } = req.body;

  const media = req.files ? req.files.map((f) => f.filename) : [];

  db.query(
    "INSERT INTO posts (id, username, content, topic, media) VALUES (?, ?, ?, ?, ?)",
    [uuidv4(), username, content, topic, JSON.stringify(media)],
    (err) => {
      if (err) return res.json({ error: "DB error" });
      res.json({ message: "Post created" });
    }
  );
});

// ================= GET SINGLE =================
app.get("/api/posts/:id", (req, res) => {
  db.query(
    "SELECT * FROM posts WHERE id=?",
    [req.params.id],
    (err, result) => {
      if (result.length === 0)
        return res.json({ error: "Post not found" });

      res.json(result[0]);
    }
  );
});

// ================= UPDATE =================
app.put("/api/posts/:id", auth, upload.array("media", 5), (req, res) => {
  const { id } = req.params;
  const { content, topic, existingMedia } = req.body;

  db.query("SELECT username FROM posts WHERE id=?", [id], (err, result) => {
    if (result.length === 0) {
      return res.json({ error: "Post not found" });
    }

    const postOwner = result[0].username;

    if (
      postOwner?.trim().toLowerCase() !==
      req.user.username?.trim().toLowerCase()
    ) {
      return res.json({ error: "Unauthorized" });
    }

    const newImages = req.files.map((f) => f.filename);

    let oldImages = [];
    try {
      oldImages = JSON.parse(existingMedia || "[]");
    } catch {}

    const finalImages = [...oldImages, ...newImages];

    db.query(
      "UPDATE posts SET content=?, topic=?, media=? WHERE id=?",
      [content, topic, JSON.stringify(finalImages), id],
      () => res.json({ message: "Updated" })
    );
  });
});

// ================= DELETE =================
app.delete("/api/posts/:id", auth, (req, res) => {
  const { id } = req.params;

  db.query("SELECT username FROM posts WHERE id=?", [id], (err, result) => {
    if (result.length === 0) {
      return res.json({ error: "Post not found" });
    }

    const postOwner = result[0].username;

    if (
      postOwner?.trim().toLowerCase() !==
      req.user.username?.trim().toLowerCase()
    ) {
      return res.json({ error: "Unauthorized" });
    }

    db.query("DELETE FROM posts WHERE id=?", [id], () => {
      res.json({ message: "Deleted" });
    });
  });
});

// ================= AI =================
app.post("/generate", async (req, res) => {
  const { topic } = req.body;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `Write a short professional post about ${topic}`,
      },
    ],
  });

  res.json({ content: response.choices[0].message.content });
});

app.post("/improve", async (req, res) => {
  const { content } = req.body;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `Improve this:\n${content}`,
      },
    ],
  });

  res.json({ content: response.choices[0].message.content });
});

// ================= SERVER =================
const port = process.env.PORT || 8081;

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});