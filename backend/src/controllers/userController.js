import User from '../models/User.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { getFileUrl } from '../middleware/upload.js';
import { emitToUser } from '../services/socketService.js';

const PUBLIC_FIELDS = 'name username avatar coverPhoto bio university department year interests courses location followers following createdAt';

// ─── Get user by id or username ───────────────────────────────────────────────
export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: id }
      : { username: id };

    const user = await User.findOne(query).select(PUBLIC_FIELDS);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─── Update profile ───────────────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'bio', 'department', 'year', 'courses',
      'interests', 'location', 'university',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Handle avatar / cover photo upload
    if (req.files?.avatar?.[0]) {
      updates.avatar = getFileUrl(req.files.avatar[0]);
    }
    if (req.files?.coverPhoto?.[0]) {
      updates.coverPhoto = getFileUrl(req.files.coverPhoto[0]);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select(PUBLIC_FIELDS);

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─── Follow / Unfollow ────────────────────────────────────────────────────────
export const toggleFollow = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user._id;

    if (targetId === String(currentUserId)) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: 'User not found' });

    const isFollowing = target.followers.some((id) => String(id) === String(currentUserId));

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(targetId, { $pull: { followers: currentUserId } });
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetId } });
      return res.json({ success: true, following: false });
    } else {
      // Follow
      await User.findByIdAndUpdate(targetId, { $addToSet: { followers: currentUserId } });
      await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetId } });

      // Create notification
      const notification = await Notification.create({
        recipient: targetId,
        actor: currentUserId,
        type: 'follow',
        message: `${req.user.name} started following you`,
      });

      await notification.populate('actor', 'name username avatar');
      emitToUser(targetId, 'notification:new', notification);

      return res.json({ success: true, following: true });
    }
  } catch (error) {
    next(error);
  }
};

// ─── Get followers / following lists ─────────────────────────────────────────
export const getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name username avatar university department')
      .select('followers');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, followers: user.followers });
  } catch (error) {
    next(error);
  }
};

export const getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'name username avatar university department')
      .select('following');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, following: user.following });
  } catch (error) {
    next(error);
  }
};

// ─── Get user's posts ─────────────────────────────────────────────────────────
export const getUserPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name username avatar');

    const total = await Post.countDocuments({ author: req.params.id });

    res.json({
      success: true,
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Search users ─────────────────────────────────────────────────────────────
export const searchUsers = async (req, res, next) => {
  try {
    const { q, university, department } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
      ];
    }
    if (university) filter.university = { $regex: university, $options: 'i' };
    if (department) filter.department = { $regex: department, $options: 'i' };

    const users = await User.find(filter)
      .select('name username avatar university department interests')
      .limit(20);

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// ─── Get notifications ────────────────────────────────────────────────────────
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('actor', 'name username avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    // Mark all as read
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
};

// ─── Get unread notifications count ──────────────────────────────────────────
export const getUnreadNotificationsCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, read: false });
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};
