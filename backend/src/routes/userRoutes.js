import { Router } from 'express';
import {
  getUser, updateProfile, toggleFollow,
  getFollowers, getFollowing, getUserPosts,
  searchUsers, getNotifications, getUnreadNotificationsCount,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

router.get('/search', protect, searchUsers);
router.get('/notifications/unread-count', protect, getUnreadNotificationsCount);
router.get('/notifications', protect, getNotifications);
router.get('/:id', protect, getUser);
router.get('/:id/followers', protect, getFollowers);
router.get('/:id/following', protect, getFollowing);
router.get('/:id/posts', protect, getUserPosts);
router.post('/:id/follow', protect, toggleFollow);
router.put(
  '/profile',
  protect,
  upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]),
  updateProfile
);

export default router;
