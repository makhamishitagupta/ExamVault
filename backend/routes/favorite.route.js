import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import { getMyFavorites, toggleFavorite } from "../controllers/favorite.controller.js";

const router = Router();

router.route('/').get(auth, getMyFavorites);
router.route('/addFav/:id').post(auth, toggleFavorite);

export default router;