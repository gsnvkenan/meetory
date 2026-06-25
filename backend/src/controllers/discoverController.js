import { getRecommendations, getNearbyUsers } from '../services/recommendationService.js';

// ─── Get friend recommendations ───────────────────────────────────────────────
export const getDiscoverRecommendations = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const recommendations = await getRecommendations(String(req.user._id), limit);
    res.json({ success: true, recommendations });
  } catch (error) {
    next(error);
  }
};

// ─── Get nearby users ─────────────────────────────────────────────────────────
export const getNearby = async (req, res, next) => {
  try {
    const { lng, lat, maxDistance } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ message: 'lng and lat query params are required' });
    }

    const users = await getNearbyUsers(
      [parseFloat(lng), parseFloat(lat)],
      parseInt(maxDistance) || 5000,
      String(req.user._id)
    );

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};
