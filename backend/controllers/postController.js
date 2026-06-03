import { v4 as uuidv4 } from "uuid";
import jwt  from "jsonwebtoken";
import db   from "../config/db.js";

const SECRET = process.env.JWT_SECRET || "mysecretkey";

// ─── GET ALL POSTS ────────────────────────────────────────
export const getAllPosts = (req, res) => {
  // Identify logged-in user (optional — page is public)
  let currentUser = null;
  const token = req.headers.authorization;

  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET);
      currentUser = decoded.username;
    } catch {}   // token invalid → treat as guest
  }

  db.query(
    "SELECT * FROM posts ORDER BY created_at DESC",
    (err, results) => {
      if (err) return res.status(500).json({ error: "DB error." });

      const posts = results.map((post) => ({
        ...post,
        isOwner:
          currentUser !== null &&
          post.username?.trim().toLowerCase() ===
            currentUser?.trim().toLowerCase(),
      }));

      res.json(posts);
    }
  );
};

// ─── GET SINGLE POST ──────────────────────────────────────
export const getPostById = (req, res) => {
  db.query(
    "SELECT * FROM posts WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err)            return res.status(500).json({ error: "DB error." });
      if (!result.length) return res.status(404).json({ error: "Post not found." });

      res.json(result[0]);
    }
  );
};

// ─── CREATE POST ──────────────────────────────────────────
export const createPost = (req, res) => {
  const { username }    = req.user;           // from JWT via auth middleware
  const { content, topic } = req.body;

  if (!content) return res.status(400).json({ error: "Content is required." });

  const media = req.files ? req.files.map((f) => f.filename) : [];

  db.query(
    "INSERT INTO posts (id, username, content, topic, media) VALUES (?, ?, ?, ?, ?)",
    [uuidv4(), username, content, topic || "", JSON.stringify(media)],
    (err) => {
      if (err) return res.status(500).json({ error: "DB error." });
      res.status(201).json({ message: "Post created successfully." });
    }
  );
};

// ─── UPDATE POST ──────────────────────────────────────────
export const updatePost = (req, res) => {
  const { id }                         = req.params;
  const { content, topic, existingMedia } = req.body;

  db.query(
    "SELECT username FROM posts WHERE id = ?",
    [id],
    (err, result) => {
      if (err)            return res.status(500).json({ error: "DB error." });
      if (!result.length) return res.status(404).json({ error: "Post not found." });

      const postOwner = result[0].username;

      // ── Authorization check ──
      if (
        postOwner?.trim().toLowerCase() !==
        req.user.username?.trim().toLowerCase()
      ) {
        return res.status(403).json({ error: "Unauthorized. You can only edit your own posts." });
      }

      const newImages = req.files ? req.files.map((f) => f.filename) : [];

      let oldImages = [];
      try { oldImages = JSON.parse(existingMedia || "[]"); } catch {}

      const finalImages = [...oldImages, ...newImages];

      db.query(
        "UPDATE posts SET content = ?, topic = ?, media = ? WHERE id = ?",
        [content, topic || "", JSON.stringify(finalImages), id],
        (err) => {
          if (err) return res.status(500).json({ error: "DB error." });
          res.json({ message: "Post updated successfully." });
        }
      );
    }
  );
};

// ─── DELETE POST ──────────────────────────────────────────
export const deletePost = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT username FROM posts WHERE id = ?",
    [id],
    (err, result) => {
      if (err)            return res.status(500).json({ error: "DB error." });
      if (!result.length) return res.status(404).json({ error: "Post not found." });

      const postOwner = result[0].username;

      // ── Authorization check ──
      if (
        postOwner?.trim().toLowerCase() !==
        req.user.username?.trim().toLowerCase()
      ) {
        return res.status(403).json({ error: "Unauthorized. You can only delete your own posts." });
      }

      db.query(
        "DELETE FROM posts WHERE id = ?",
        [id],
        (err) => {
          if (err) return res.status(500).json({ error: "DB error." });
          res.json({ message: "Post deleted successfully." });
        }
      );
    }
  );
};