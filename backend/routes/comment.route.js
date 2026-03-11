import { Router } from 'express';
import { createComment, deleteComment, getAllComments, updateComment } from '../controllers/comment.controller.js';
import { auth } from './../middleware/auth.middleware.js';

const router = Router();

router.route('/:itemType/:itemId').get(getAllComments);
router.route('/:itemType/:itemId').post(auth, createComment);
router.route('/:itemType/:itemId/:commentId').put(auth, updateComment);
router.route('/:itemType/:itemId/:commentId').delete(auth, deleteComment);

export default router;