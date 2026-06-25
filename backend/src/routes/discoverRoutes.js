import { Router } from 'express';
import { getDiscoverRecommendations, getNearby } from '../controllers/discoverController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/recommendations', protect, getDiscoverRecommendations);
router.get('/nearby', protect, getNearby);

export default router;
