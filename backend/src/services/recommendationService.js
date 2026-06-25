import User from '../models/User.js';

/**
 * Meetory Friend Recommendation Algorithm
 *
 * Scoring weights:
 *   - Same department:       +20 pts
 *   - Same university:       +5  pts
 *   - Per shared course:     +15 pts
 *   - Per shared interest:   +10 pts
 *   - Mutual followers:      +8  pts each
 *   - Proximity (geo):       +25 pts (same campus), +10 pts (same city)
 */

const WEIGHTS = {
  SAME_DEPARTMENT: 20,
  SAME_UNIVERSITY: 5,
  PER_SHARED_COURSE: 15,
  PER_SHARED_INTEREST: 10,
  PER_MUTUAL_FOLLOWER: 8,
  SAME_CAMPUS: 25,
  SAME_CITY: 10,
};

/**
 * Calculate recommendation score between currentUser and a candidate user.
 * @param {Object} currentUser – the logged-in user document
 * @param {Object} candidate   – a potential friend document
 * @returns {number} score
 */
const calculateScore = (currentUser, candidate) => {
  let score = 0;

  // University match
  if (
    currentUser.university &&
    candidate.university &&
    currentUser.university.toLowerCase() === candidate.university.toLowerCase()
  ) {
    score += WEIGHTS.SAME_UNIVERSITY;
  }

  // Department match
  if (
    currentUser.department &&
    candidate.department &&
    currentUser.department.toLowerCase() === candidate.department.toLowerCase()
  ) {
    score += WEIGHTS.SAME_DEPARTMENT;
  }

  // Shared courses
  const currentCourses = (currentUser.courses || []).map((c) => c.toLowerCase());
  const candidateCourses = (candidate.courses || []).map((c) => c.toLowerCase());
  const sharedCourses = currentCourses.filter((c) => candidateCourses.includes(c));
  score += sharedCourses.length * WEIGHTS.PER_SHARED_COURSE;

  // Shared interests
  const currentInterests = (currentUser.interests || []).map((i) => i.toLowerCase());
  const candidateInterests = (candidate.interests || []).map((i) => i.toLowerCase());
  const sharedInterests = currentInterests.filter((i) => candidateInterests.includes(i));
  score += sharedInterests.length * WEIGHTS.PER_SHARED_INTEREST;

  // Mutual followers
  const currentFollowingSet = new Set(
    (currentUser.following || []).map(String)
  );
  const mutualCount = (candidate.followers || []).filter((f) =>
    currentFollowingSet.has(String(f))
  ).length;
  score += mutualCount * WEIGHTS.PER_MUTUAL_FOLLOWER;

  // Location – campus / city
  const currentCampus = currentUser.location?.campus?.toLowerCase();
  const candidateCampus = candidate.location?.campus?.toLowerCase();
  const currentCity = currentUser.location?.city?.toLowerCase();
  const candidateCity = candidate.location?.city?.toLowerCase();

  if (currentCampus && candidateCampus && currentCampus === candidateCampus) {
    score += WEIGHTS.SAME_CAMPUS;
  } else if (currentCity && candidateCity && currentCity === candidateCity) {
    score += WEIGHTS.SAME_CITY;
  }

  return score;
};

/**
 * Get scored friend recommendations for the given user.
 *
 * Strategy:
 *   1. Fetch a broad candidate pool: same university OR overlapping interests
 *   2. Exclude already-following users and self
 *   3. Score each candidate with calculateScore()
 *   4. Sort descending, return top N
 *
 * @param {string}  userId   – the logged-in user's ObjectId (string)
 * @param {number}  [limit]  – max recommendations to return (default 20)
 * @returns {Promise<Array>} – array of { user, score, sharedInterests, sharedCourses }
 */
export const getRecommendations = async (userId, limit = 20) => {
  const currentUser = await User.findById(userId)
    .select('university department courses interests location followers following');

  if (!currentUser) throw new Error('User not found');

  const excludeIds = [
    currentUser._id,
    ...(currentUser.following || []),
  ];

  // Build candidate filter – broad match pool
  const candidateFilter = {
    _id: { $nin: excludeIds },
    isActive: true,
    $or: [
      { university: currentUser.university },
      { interests: { $in: currentUser.interests || [] } },
      { courses: { $in: currentUser.courses || [] } },
    ],
  };

  // Fetch up to 200 candidates to score (balance accuracy vs. performance)
  const candidates = await User.find(candidateFilter)
    .select('name username avatar bio university department year interests courses location followers following')
    .limit(200)
    .lean();

  // Score and enrich each candidate
  const scored = candidates
    .map((candidate) => {
      const score = calculateScore(currentUser, candidate);

      const sharedInterests = (currentUser.interests || []).filter((i) =>
        (candidate.interests || []).map((x) => x.toLowerCase()).includes(i.toLowerCase())
      );
      const sharedCourses = (currentUser.courses || []).filter((c) =>
        (candidate.courses || []).map((x) => x.toLowerCase()).includes(c.toLowerCase())
      );

      return { user: candidate, score, sharedInterests, sharedCourses };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
};

/**
 * Geo-proximity query – users near the given coordinates.
 * Uses MongoDB $near (2dsphere index on User.location).
 *
 * @param {number[]} coordinates – [longitude, latitude]
 * @param {number}   maxDistance – meters
 * @param {string}   excludeId   – userId to exclude
 */
export const getNearbyUsers = async (coordinates, maxDistance = 5000, excludeId) => {
  return User.find({
    _id: { $ne: excludeId },
    isActive: true,
    'location.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates },
        $maxDistance: maxDistance,
      },
    },
  })
    .select('name username avatar university department location')
    .limit(30);
};
