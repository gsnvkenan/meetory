import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// ─── Get all conversations for current user ───────────────────────────────────
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .sort({ updatedAt: -1 })
      .populate('participants', 'name username avatar lastSeen')
      .populate({
        path: 'lastMessage',
        select: 'content type createdAt sender',
      });

    // Filter out self from participants display
    const enriched = conversations.map((conv) => {
      const other = conv.participants.find(
        (p) => String(p._id) !== String(req.user._id)
      );
      return {
        ...conv.toObject(),
        otherUser: other,
        unread: conv.unreadCount?.get(String(req.user._id)) || 0,
      };
    });

    res.json({ success: true, conversations: enriched });
  } catch (error) {
    next(error);
  }
};

// ─── Get or create a conversation with another user ───────────────────────────
export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const otherUser = await User.findById(userId).select('name username avatar');
    if (!otherUser) return res.status(404).json({ message: 'User not found' });

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId], $size: 2 },
    }).populate('participants', 'name username avatar lastSeen');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, userId],
      });
      await conversation.populate('participants', 'name username avatar lastSeen');
    }

    res.json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};

// ─── Get messages for a conversation ─────────────────────────────────────────
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    // Verify user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });
    if (!conversation) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({
      conversation: conversationId,
      deletedFor: { $ne: req.user._id },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name username avatar');

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: req.user._id,
        readAt: null,
      },
      { $set: { readAt: new Date() } }
    );

    // Reset unread count
    conversation.unreadCount.set(String(req.user._id), 0);
    await conversation.save();

    res.json({
      success: true,
      messages: messages.reverse(), // chronological order
      hasMore: messages.length === limit,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Send a message (REST fallback – Socket.io is primary) ────────────────────
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content) return res.status(400).json({ message: 'Content required' });

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });
    if (!conversation) return res.status(403).json({ message: 'Access denied' });

    const receiverId = conversation.participants.find(
      (p) => String(p) !== String(req.user._id)
    );

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    // Update conversation's lastMessage and unread count for receiver
    conversation.lastMessage = message._id;
    const currentUnread = conversation.unreadCount.get(String(receiverId)) || 0;
    conversation.unreadCount.set(String(receiverId), currentUnread + 1);
    await conversation.save();

    await message.populate('sender', 'name username avatar');
    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};
