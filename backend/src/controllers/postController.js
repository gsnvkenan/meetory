import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { getFileUrl } from '../middleware/upload.js';
import { emitToUser } from '../services/socketService.js';

const AUTHOR_FIELDS = 'name username avatar university';

// ─── Get feed ────────────────────────────────────────────────────────────────
export const getFeed = async (req, res, next) => {
  try {
    const { tab = 'campus', page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let filter = {};

    if (tab === 'following') {
      // Only posts from users the current user follows
      filter = { author: { $in: [...req.user.following, req.user._id] } };
    } else if (tab === 'bookmarks' || tab === 'saved') {
      // Only posts bookmarked by the current user
      filter = { bookmarks: req.user._id };
    } else {
      // Campus-wide feed: same university
      filter = { university: req.user.university };
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', AUTHOR_FIELDS)
      .populate('comments.author', 'name username avatar')
      .lean();

    // Attach isLiked / isBookmarked for the current user
    const userId = String(req.user._id);
    const enriched = posts.map((post) => ({
      ...post,
      isLiked: post.likes.some((id) => String(id) === userId),
      isBookmarked: post.bookmarks.some((id) => String(id) === userId),
      likeCount: post.likes.length,
      commentCount: post.comments.length,
    }));

    const total = await Post.countDocuments(filter);
    res.json({
      success: true,
      posts: enriched,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Create post ──────────────────────────────────────────────────────────────
export const createPost = async (req, res, next) => {
  try {
    const { content, visibility, tags } = req.body;

    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: 'Post must have content or media' });
    }

    const media = (req.files || []).map((file) => ({
      url: getFileUrl(file),
      type: file.mimetype.startsWith('video') ? 'video' : 'image',
    }));

    const post = await Post.create({
      author: req.user._id,
      content: content || '',
      media,
      visibility: visibility || 'public',
      tags: tags ? JSON.parse(tags) : [],
      university: req.user.university,
      campus: req.user.location?.campus || '',
    });

    await post.populate('author', AUTHOR_FIELDS);
    res.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// ─── Update post ──────────────────────────────────────────────────────────────
export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { content, visibility, tags } = req.body;
    if (content !== undefined) post.content = content;
    if (visibility !== undefined) post.visibility = visibility;
    if (tags !== undefined) post.tags = JSON.parse(tags);

    await post.save();
    await post.populate('author', AUTHOR_FIELDS);
    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// ─── Delete post ──────────────────────────────────────────────────────────────
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── Toggle like ──────────────────────────────────────────────────────────────
export const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id;
    const isLiked = post.likes.some((id) => String(id) === String(userId));

    if (isLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.addToSet(userId);
      // Notify author (not for self-likes)
      if (String(post.author) !== String(userId)) {
        const notification = await Notification.create({
          recipient: post.author,
          actor: userId,
          type: 'like',
          referenceModel: 'Post',
          referenceId: post._id,
          message: `${req.user.name} liked your post`,
        });
        await notification.populate('actor', 'name username avatar');
        emitToUser(post.author, 'notification:new', notification);
      }
    }

    await post.save();
    res.json({ success: true, liked: !isLiked, likeCount: post.likes.length });
  } catch (error) {
    next(error);
  }
};

// ─── Add comment ─────────────────────────────────────────────────────────────
export const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Comment content required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ author: req.user._id, content });
    await post.save();
    await post.populate('comments.author', 'name username avatar');

    const newComment = post.comments[post.comments.length - 1];

    if (String(post.author) !== String(req.user._id)) {
      const notification = await Notification.create({
        recipient: post.author,
        actor: req.user._id,
        type: 'comment',
        referenceModel: 'Post',
        referenceId: post._id,
        message: `${req.user.name} commented on your post`,
      });
      await notification.populate('actor', 'name username avatar');
      emitToUser(post.author, 'notification:new', notification);
    }

    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    next(error);
  }
};

// ─── Delete comment ───────────────────────────────────────────────────────────
export const deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const isAuthor = String(comment.author) === String(req.user._id);
    const isPostOwner = String(post.author) === String(req.user._id);
    if (!isAuthor && !isPostOwner) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.deleteOne();
    await post.save();
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── Toggle bookmark ──────────────────────────────────────────────────────────
export const toggleBookmark = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id;
    const isBookmarked = post.bookmarks.some((id) => String(id) === String(userId));

    if (isBookmarked) {
      post.bookmarks.pull(userId);
    } else {
      post.bookmarks.addToSet(userId);
    }

    await post.save();
    res.json({ success: true, bookmarked: !isBookmarked });
  } catch (error) {
    next(error);
  }
};

// ─── Get single post ──────────────────────────────────────────────────────────
export const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', AUTHOR_FIELDS)
      .populate('comments.author', 'name username avatar');

    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};
