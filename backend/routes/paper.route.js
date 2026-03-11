import { Router } from "express";
import { auth, adminOnly } from "../middleware/auth.middleware.js";
import { createPaper, deletePaper, downloadPaper, viewPapers, allPapers, updatePaper, toggleLikePaper, previewPaper } from "../controllers/paper.controller.js";
import {handleUploadError} from '../middleware/handleError.js';

import multer from "multer"
// const upload = multer({ dest: 'uploads/' })
import { uploadPaper } from "../config/multer.js";

const router = Router();

router.route('/').get(allPapers)



router.post(
  "/create",
  auth,
  adminOnly,
  uploadPaper.single("avatar"),
  handleUploadError,
  createPaper
);

router.route('/view/:id').get(viewPapers);
router.route('/update/:id').put(auth, adminOnly, updatePaper);
router.route('/delete/:id').delete(auth, adminOnly, deletePaper);
router.route('/download/:id').get(auth, downloadPaper);
router.route('/preview/:id').get(previewPaper);
router.route('/like/:id').post(auth, toggleLikePaper);

export default router;