import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Avatar from '../common/Avatar.jsx';
import { chatApi } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';

const ChatWindow = ({ conversation, onBack }) => {
  const { user } = useAuth();
  const { socket, typingUsers, emitTypingStart, emitTypingStop, joinConversation, leaveConversation, isOnline } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef();
  const typingTimeoutRef = useRef();

  const other = conversation?.otherUser;
  const online = isOnline(other?._id);
  const isTyping = typingUsers[conversation?._id];

  const fetchMessages = useCallback(async () => {
    if (!conversation?._id) return;
    setLoading(true);
    try {
      const { data } = await chatApi.getMessages(conversation._id);
      setMessages(data.messages);
    } finally {
      setLoading(false);
    }
  }, [conversation?._id]);

  useEffect(() => {
    fetchMessages();
    if (conversation?._id) {
      joinConversation(conversation._id);
    }
    return () => {
      if (conversation?._id) leaveConversation(conversation._id);
    };
  }, [conversation?._id, fetchMessages, joinConversation, leaveConversation]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;
    const handler = ({ message, conversationId }) => {
      if (conversationId === conversation?._id) {
        setMessages((p) => {
          const isMine = message.sender?._id === user._id || message.sender === user._id;
          if (isMine) {
            // Remove temporary placeholder message and add the real database message
            return [...p.filter((m) => !m._temp), message];
          }
          return [...p, message];
        });
      }
    };
    socket.on('message:received', handler);
    return () => socket.off('message:received', handler);
  }, [socket, conversation?._id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleInput = (e) => {
    setInput(e.target.value);
    emitTypingStart(conversation._id, other._id);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop(conversation._id, other._id);
    }, 1500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    const tempMsg = {
      _id: Date.now(),
      content: input,
      sender: { _id: user._id, name: user.name, avatar: user.avatar },
      createdAt: new Date().toISOString(),
      _temp: true,
    };
    setMessages((p) => [...p, tempMsg]);
    setInput('');
    emitTypingStop(conversation._id, other._id);
    socket.emit('message:send', {
      conversationId: conversation._id,
      content: input,
    });
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    const day = format(new Date(msg.createdAt), 'd MMMM yyyy', { locale: tr });
    if (!acc[day]) acc[day] = [];
    acc[day].push(msg);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[var(--color-border)] glass rounded-t-2xl">
        <button
          onClick={onBack}
          className="lg:hidden p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] text-[var(--color-text-muted)]"
        >
          <ArrowLeft size={20} />
        </button>
        <Avatar src={other?.avatar} name={other?.name} size="sm" online={online} />
        <div>
          <p className="font-semibold">{other?.name}</p>
          <p className={`text-xs ${online ? 'text-emerald-400' : 'text-[var(--color-text-faint)]'}`}>
            {online ? 'Çevrimiçi' : 'Çevrimdışı'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center pt-8">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          Object.entries(groupedMessages).map(([day, msgs]) => (
            <div key={day}>
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-[var(--color-border)]" />
                <span className="text-xs text-[var(--color-text-faint)] px-2">{day}</span>
                <div className="flex-1 h-px bg-[var(--color-border)]" />
              </div>
              <div className="space-y-2">
                {msgs.map((msg) => {
                  const isMine = msg.sender?._id === user._id || msg.sender === user._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}
                    >
                      {!isMine && (
                        <Avatar src={other?.avatar} name={other?.name} size="xs" />
                      )}
                      <div
                        className={`
                          max-w-xs px-4 py-2.5 rounded-2xl text-sm
                          ${isMine
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : 'bg-[var(--color-surface-3)] text-[var(--color-text)] rounded-bl-sm'
                          }
                          ${msg._temp ? 'opacity-70' : ''}
                        `}
                      >
                        {msg.content}
                        <p className={`text-xs mt-1 ${isMine ? 'text-indigo-200' : 'text-[var(--color-text-faint)]'}`}>
                          {format(new Date(msg.createdAt), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2">
            <Avatar src={other?.avatar} name={other?.name} size="xs" />
            <div className="bg-[var(--color-surface-3)] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--color-text-faint)] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[var(--color-text-faint)] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-[var(--color-text-faint)] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-[var(--color-border)] flex gap-3">
        <input
          type="text"
          value={input}
          onChange={handleInput}
          placeholder="Mesaj yaz..."
          className="input-base flex-1"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center transition-colors btn-glow"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
