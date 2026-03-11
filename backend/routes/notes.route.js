import { Router } from "express";
import { auth, adminOnly } from "../middleware/auth.middleware.js";
import {
  allNotes,
  createNotes,
  viewNotes,
  updateNotes,
  deleteNotes,
  downloadNotes,
  toggleLikeNotes,
  previewNotes
} from "../controllers/notes.controller.js";

import { uploadNotes } from "../config/multer.js";
import { handleUploadError } from "../middleware/handleError.js";

const router = Router();

router.route("/").get(allNotes);
router.route("/create").post(
  auth,
  adminOnly,
  uploadNotes.single("avatar"),
  handleUploadError,
  createNotes
);
router.route("/view/:id").get(viewNotes);
router.route("/update/:id").put(auth, adminOnly, updateNotes);
router.route("/delete/:id").delete(auth, adminOnly, deleteNotes);
router.route("/download/:id").get(auth, downloadNotes);
router.route("/preview/:id").get(previewNotes);
router.route("/like/:id").post(auth, toggleLikeNotes);

export default router;
