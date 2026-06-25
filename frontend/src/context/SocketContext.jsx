import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({});
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/users/notifications/unread-count')
        .then(({ data }) => {
          if (data.success && data.count > 0) {
            setHasUnreadNotifications(true);
          }
        })
        .catch((err) => console.error('Failed to fetch unread count:', err));
    } else {
      setHasUnreadNotifications(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socketUrl = import.meta.env.VITE_API_URL || '/';
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Socket connected');
    });

    socket.on('user:status', ({ userId, online }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (online) next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    socket.on('typing:start', ({ conversationId, userId, name }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: { userId, name },
      }));
    });

    socket.on('typing:stop', ({ conversationId }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
    });

    socket.on('notification:new', (notif) => {
      console.log('🔔 Live notification:', notif);
      toast.success(notif.message, {
        icon: '🔔',
      });
      setHasUnreadNotifications(true);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket error:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const emitTypingStart = (conversationId, receiverId) => {
    socketRef.current?.emit('typing:start', { conversationId, receiverId });
  };

  const emitTypingStop = (conversationId, receiverId) => {
    socketRef.current?.emit('typing:stop', { conversationId, receiverId });
  };

  const joinConversation = (conversationId) => {
    socketRef.current?.emit('conversation:join', conversationId);
  };

  const leaveConversation = (conversationId) => {
    socketRef.current?.emit('conversation:leave', conversationId);
  };

  const sendMessage = (payload) => {
    socketRef.current?.emit('message:send', payload);
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        onlineUsers,
        typingUsers,
        emitTypingStart,
        emitTypingStop,
        joinConversation,
        leaveConversation,
        sendMessage,
        isOnline: (userId) => onlineUsers.has(userId),
        hasUnreadNotifications,
        setHasUnreadNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
