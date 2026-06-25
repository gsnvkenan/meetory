import MarketListing from '../models/MarketListing.js';
import { getFileUrl } from '../middleware/upload.js';

// ─── Get all listings ─────────────────────────────────────────────────────────
export const getListings = async (req, res, next) => {
  try {
    const { category, university, isFree, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { status: 'active' };
    filter.university = university || req.user.university;
    if (category) filter.category = category;
    if (isFree === 'true') filter.isFree = true;

    const listings = await MarketListing.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('seller', 'name username avatar university');

    const total = await MarketListing.countDocuments(filter);

    res.json({ success: true, listings, pagination: { page: parseInt(page), total } });
  } catch (error) {
    next(error);
  }
};

// ─── Get single listing ───────────────────────────────────────────────────────
export const getListing = async (req, res, next) => {
  try {
    const listing = await MarketListing.findById(req.params.id)
      .populate('seller', 'name username avatar university');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json({ success: true, listing });
  } catch (error) {
    next(error);
  }
};

// ─── Create listing ───────────────────────────────────────────────────────────
export const createListing = async (req, res, next) => {
  try {
    const { title, description, category, price, isFree, condition, tags } = req.body;

    const images = (req.files || []).map((f) => getFileUrl(f));

    const listing = await MarketListing.create({
      seller: req.user._id,
      title,
      description,
      category,
      price: isFree === 'true' ? 0 : parseFloat(price) || 0,
      isFree: isFree === 'true',
      condition,
      images,
      university: req.user.university,
      campus: req.user.location?.campus || '',
      tags: tags ? JSON.parse(tags) : [],
    });

    await listing.populate('seller', 'name username avatar university');
    res.status(201).json({ success: true, listing });
  } catch (error) {
    next(error);
  }
};

// ─── Update listing ───────────────────────────────────────────────────────────
export const updateListing = async (req, res, next) => {
  try {
    const listing = await MarketListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (String(listing.seller) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const allowedFields = ['title', 'description', 'price', 'isFree', 'condition', 'status', 'tags'];
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) listing[f] = req.body[f];
    });

    await listing.save();
    res.json({ success: true, listing });
  } catch (error) {
    next(error);
  }
};

// ─── Delete listing ───────────────────────────────────────────────────────────
export const deleteListing = async (req, res, next) => {
  try {
    const listing = await MarketListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (String(listing.seller) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    listing.status = 'deleted';
    await listing.save();
    res.json({ success: true, message: 'Listing removed' });
  } catch (error) {
    next(error);
  }
};

// ─── Express interest ─────────────────────────────────────────────────────────
export const expressInterest = async (req, res, next) => {
  try {
    const listing = await MarketListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    listing.interestedUsers.addToSet(req.user._id);
    await listing.save();

    res.json({ success: true, interestedCount: listing.interestedUsers.length });
  } catch (error) {
    next(error);
  }
};
