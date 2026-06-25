import { Router } from 'express';
import {
  getEvents, getEvent, createEvent,
  toggleAttend, updateEvent, deleteEvent,
} from '../controllers/eventController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

router.get('/', protect, getEvents);
router.get('/:id', protect, getEvent);
router.post('/', protect, upload.single('coverImage'), createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);
router.post('/:id/attend', protect, toggleAttend);

export default router;
