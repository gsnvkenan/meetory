import { Router } from 'express';
import {
  getConversations, getOrCreateConversation,
  getMessages, sendMessage,
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, getOrCreateConversation);
router.get('/conversations/:conversationId/messages', protect, getMessages);
router.post('/conversations/:conversationId/messages', protect, sendMessage);

export default router;
