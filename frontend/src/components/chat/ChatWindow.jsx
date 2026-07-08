import { useState, useEffect, useRef, useCallback } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import Avatar from "../common/Avatar.jsx";
import { chatApi } from "../../api/index.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSocket } from "../../context/SocketContext.jsx";

const ChatWindow = ({ conversation, onBack }) => {
  const { user } = useAuth();
  const {
    socket,
    typingUsers,
    emitTypingStart,
    emitTypingStop,
    joinConversation,
    leaveConversation,
    isOnline,
  } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
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
          const isMine =
            message.sender?._id === user._id || message.sender === user._id;
          if (isMine) {
            // Remove temporary placeholder message and add the real database message
            return [...p.filter((m) => !m._temp), message];
          }
          return [...p, message];
        });
      }
    };
    socket.on("message:received", handler);
    return () => socket.off("message:received", handler);
  }, [socket, conversation?._id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
    setInput("");
    emitTypingStop(conversation._id, other._id);
    socket.emit("message:send", {
      conversationId: conversation._id,
      content: input,
    });
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    const day = format(new Date(msg.createdAt), "d MMMM yyyy", { locale: enUS });
    if (!acc[day]) acc[day] = [];
    acc[day].push(msg);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] rounded-t-3xl shrink-0">
        <button
          onClick={onBack}
          className="lg:hidden p-2 -ml-1 rounded-xl hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <Avatar
          src={other?.avatar}
          name={other?.name}
          size="sm"
          online={online}
        />
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate text-[var(--color-text)]">
            {other?.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                online
                  ? "bg-[var(--color-success)] animate-pulse"
                  : "bg-[var(--color-text-faint)]"
              }`}
            />
            <span
              className={`text-xs font-medium ${online ? "text-[var(--color-success)]" : "text-[var(--color-text-faint)]"}`}
            >
              {online ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[var(--color-bg)]">
        {loading ? (
          <div className="flex justify-center pt-8">
            <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          Object.entries(groupedMessages).map(([day, msgs]) => (
            <div key={day}>
              <div className="flex items-center justify-center my-4">
                <span className="chip chip-slate">{day}</span>
              </div>
              <div className="space-y-2">
                {msgs.map((msg) => {
                  const isMine =
                    msg.sender?._id === user._id || msg.sender === user._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""}`}
                    >
                      {!isMine && (
                        <Avatar
                          src={other?.avatar}
                          name={other?.name}
                          size="xs"
                        />
                      )}
                      <div
                        className={`
                          max-w-[75%] sm:max-w-xs px-4 py-2.5 rounded-2xl text-sm shadow-sm
                          ${
                            isMine
                              ? "bg-blue-500 text-white rounded-br-md"
                              : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-bl-md"
                          }
                          ${msg._temp ? "opacity-60" : ""}
                        `}
                      >
                        {msg.content}
                        <p
                          className={`text-[11px] mt-1 ${isMine ? "text-white/70" : "text-[var(--color-text-faint)]"}`}
                        >
                          {format(new Date(msg.createdAt), "HH:mm")}
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
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1 shadow-sm">
              <span
                className="w-2 h-2 rounded-full bg-[var(--color-text-faint)] animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-[var(--color-text-faint)] animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-[var(--color-text-faint)] animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 px-5 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={handleInput}
          placeholder="Write a message..."
          className="input-base rounded-full flex-1 px-4"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="w-11 h-11 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-blue-500 text-white flex items-center justify-center transition-all shrink-0 btn-glow"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
