import express from "express";
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/postController.js";
import auth   from "../middleware/auth.js";
import upload from "../config/multer.js";

const router = express.Router();

router.get(  "/",     getAllPosts);                           // public
router.get(  "/:id",  getPostById);                          // public
router.post( "/",     auth, upload.array("media", 5), createPost);   // protected
router.put(  "/:id",  auth, upload.array("media", 5), updatePost);   // protected
router.delete("/:id", auth, deletePost);                     // protected

export default router;