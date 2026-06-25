import { Router } from 'express';
import {
  getFeed, createPost, updatePost, deletePost,
  toggleLike, addComment, deleteComment, toggleBookmark, getPost,
} from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

router.get('/', protect, getFeed);
router.get('/:id', protect, getPost);
router.post('/', protect, upload.array('media', 10), createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);
router.post('/:id/bookmark', protect, toggleBookmark);

export default router;
