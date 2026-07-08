import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import Notification from "../models/Notification.js";

// Track online users: userId -> Set<socketId>
const onlineUsers = new Map();

let ioInstance = null;

/**
 * Initialize Socket.io and attach all event handlers.
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
    pingTimeout: 60000,
  });

  ioInstance = io;

  // ─── Auth middleware ───────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication error"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select(
        "name username avatar",
      );
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  // ─── Connection ────────────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    const userId = String(socket.user._id);
    console.log(`🔌 Socket connected: ${socket.user.username} (${socket.id})`);

    // Register user as online
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Update lastSeen and broadcast online status
    User.findByIdAndUpdate(userId, { lastSeen: new Date() }).exec();
    io.emit("user:status", { userId, online: true });

    // Join personal room for targeted notifications
    socket.join(userId);

    // ── Send message ─────────────────────────────────────────────────────────
    socket.on(
      "message:send",
      async ({ conversationId, content, type = "text" }) => {
        try {
          const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
          });
          if (!conversation) return;

          const receiverId = conversation.participants.find(
            (p) => String(p) !== userId,
          );

          const message = await Message.create({
            conversation: conversationId,
            sender: userId,
            receiver: receiverId,
            content,
            type,
          });

          // Update conversation
          conversation.lastMessage = message._id;
          const currentUnread =
            conversation.unreadCount.get(String(receiverId)) || 0;
          conversation.unreadCount.set(String(receiverId), currentUnread + 1);
          await conversation.save();

          await message.populate("sender", "name username avatar");

          // Emit to both participants
          io.to(userId).to(String(receiverId)).emit("message:received", {
            message,
            conversationId,
          });

          // Notify receiver if not in the conversation room
          await Notification.create({
            recipient: receiverId,
            actor: userId,
            type: "message",
            referenceModel: "Message",
            referenceId: message._id,
            message: `${socket.user.name} sent you a message`,
          });

          io.to(String(receiverId)).emit("notification:new", {
            type: "message",
            actor: {
              _id: userId,
              name: socket.user.name,
              avatar: socket.user.avatar,
            },
            message: `${socket.user.name} sent you a message`,
          });
        } catch (err) {
          console.error("Socket message:send error:", err);
          socket.emit("error", { message: "Failed to send message" });
        }
      },
    );

    // ── Typing indicators ─────────────────────────────────────────────────────
    socket.on("typing:start", ({ conversationId, receiverId }) => {
      io.to(receiverId).emit("typing:start", {
        conversationId,
        userId,
        name: socket.user.name,
      });
    });

    socket.on("typing:stop", ({ conversationId, receiverId }) => {
      io.to(receiverId).emit("typing:stop", { conversationId, userId });
    });

    // ── Mark messages read ────────────────────────────────────────────────────
    socket.on("messages:read", async ({ conversationId }) => {
      try {
        await Message.updateMany(
          { conversation: conversationId, receiver: userId, readAt: null },
          { $set: { readAt: new Date() } },
        );

        const conv = await Conversation.findById(conversationId);
        if (conv) {
          conv.unreadCount.set(userId, 0);
          await conv.save();
        }

        socket.broadcast.to(conversationId).emit("messages:read", {
          conversationId,
          readBy: userId,
        });
      } catch (err) {
        console.error("Socket messages:read error:", err);
      }
    });

    // ── Join / Leave conversation rooms ───────────────────────────────────────
    socket.on("conversation:join", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("conversation:leave", (conversationId) => {
      socket.leave(conversationId);
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
          io.emit("user:status", { userId, online: false });
        }
      }
      console.log(`🔌 Socket disconnected: ${socket.user.username}`);
    });
  });

  return io;
};

/**
 * Check if a user is currently online.
 * @param {string} userId
 * @returns {boolean}
 */
export const isOnline = (userId) => onlineUsers.has(String(userId));

/**
 * Emit socket event to a specific user's personal room.
 * @param {string} userId
 * @param {string} eventName
 * @param {any} data
 */
export const emitToUser = (userId, eventName, data) => {
  if (ioInstance) {
    ioInstance.to(String(userId)).emit(eventName, data);
  }
};

/**
 * Broadcast a socket event to all connected clients.
 * @param {string} eventName
 * @param {any} data
 */
export const emitToAll = (eventName, data) => {
  if (ioInstance) {
    ioInstance.emit(eventName, data);
  }
};

export default initSocket;
