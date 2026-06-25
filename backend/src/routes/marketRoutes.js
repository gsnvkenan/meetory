import { Router } from 'express';
import {
  getListings, getListing, createListing,
  updateListing, deleteListing, expressInterest,
} from '../controllers/marketController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

router.get('/', protect, getListings);
router.get('/:id', protect, getListing);
router.post('/', protect, upload.array('images', 5), createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);
router.post('/:id/interest', protect, expressInterest);

export default router;
