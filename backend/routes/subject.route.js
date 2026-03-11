import { Router } from "express";
import { createSubject, deleteSubject, getAllSubjects, getSubjectById, updateSubject } from "../controllers/subject.controller.js";
import { adminOnly, auth } from "../middleware/auth.middleware.js";

const router = Router();


router.route('/getAll').get(getAllSubjects);
router.route('/create').post(auth, adminOnly, createSubject);
router.route('/getSuject/:id').get(getSubjectById);
router.route('/updateSubject/:id').put(auth, adminOnly, updateSubject);
router.route('/deleteSubject/:id').delete(auth, adminOnly, deleteSubject);

export default router;