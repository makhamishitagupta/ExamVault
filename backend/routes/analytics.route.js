import { Router } from 'express';
import { auth, adminOnly } from '../middleware/auth.middleware.js';
import { getAnalytics } from '../controllers/analytics.controller.js';

const router = Router();

router.route('/').get(auth, adminOnly, getAnalytics);

export default router;
