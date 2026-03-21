import { Router } from "express";
import { registerUser, loginUser, googleSignIn, logoutUser, updateProfile, getProfile, createAdmin, deleteProfile } from "../controllers/user.controller.js";
import { auth, adminOnly } from "../middleware/auth.middleware.js";

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/google-signin').post(googleSignIn);
router.route('/logout').post(logoutUser);
router.route('/update-profile').post(auth, updateProfile);
router.route('/delete-profile').delete(auth, deleteProfile);
router.get("/me", auth, getProfile);
router.route('/admin/create').post(auth, adminOnly, createAdmin);

export default router;