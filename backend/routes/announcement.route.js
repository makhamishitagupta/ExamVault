import express from "express";
import {
  createAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
} from "../controllers/announcement.controller.js";
import { adminOnly, auth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", auth, adminOnly, createAnnouncement);
router.get("/viewAll", getAllAnnouncements);
router.put("/update/:id", auth, adminOnly, updateAnnouncement);
router.delete("/delete/:id", auth, adminOnly, deleteAnnouncement);

export default router;
