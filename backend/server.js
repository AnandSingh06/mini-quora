import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors  from "cors";
import path from "path";
import methodOverride from "method-override";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import aiRoutes   from "./routes/aiRoutes.js";

const app  = express();
const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(path.resolve(), "public")));

app.use("/", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/",  aiRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});