import express from "express";
import { generatePost, improvePost } from "../controllers/aiController.js";

const router = express.Router();

router.post("/generate", generatePost);
router.post("/improve",  improvePost);

export default router;