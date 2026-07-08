import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import ConversationList from "../components/chat/ConversationList.jsx";
import ChatWindow from "../components/chat/ChatWindow.jsx";
import { chatApi } from "../api/index.js";
import { useSocket } from "../context/SocketContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const ChatPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await chatApi.getConversations();
      setConversations(data.conversations || []);

      // If we already have an active conversation, update its object reference to capture new messages/metadata
      if (activeConversation) {
        const updatedActive = data.conversations.find(
          (c) => c._id === activeConversation._id,
        );
        if (updatedActive) setActiveConversation(updatedActive);
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [activeConversation]);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Listen for socket events to update conversation list in real-time
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = ({ message, conversationId }) => {
      setConversations((prev) => {
        const list = [...prev];
        const index = list.findIndex((c) => c._id === conversationId);

        if (index > -1) {
          const conv = { ...list[index] };
          conv.lastMessage = message;
          // Increment unread count if we are not currently viewing this conversation
          if (
            !activeConversation ||
            activeConversation._id !== conversationId
          ) {
            conv.unread = (conv.unread || 0) + 1;
          }
          // Move conversation to the top
          list.splice(index, 1);
          list.unshift(conv);
          return list;
        } else {
          // If conversation isn't in list (first message), refetch
          fetchConversations();
          return prev;
        }
      });
    };

    socket.on("message:received", handleMessageReceived);
    return () => socket.off("message:received", handleMessageReceived);
  }, [socket, activeConversation, fetchConversations]);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    // Mark as read locally in the list
    setConversations((prev) =>
      prev.map((c) => (c._id === conv._id ? { ...c, unread: 0 } : c)),
    );
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-3.5rem)] overflow-hidden flex gap-5 fade-in">
      {/* Sidebar - Conversation List */}
      <div
        className={`
          flex-col w-full lg:w-[22rem] card rounded-3xl overflow-hidden shrink-0
          ${activeConversation ? "hidden lg:flex" : "flex"}
        `}
      >
        <div className="px-5 py-4 border-b border-[var(--color-border)] shrink-0">
          <h1 className="page-heading text-xl flex items-center gap-2 text-[var(--color-text)]">
            Messages
            <span className="w-7 h-7 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
              <MessageSquare size={15} />
            </span>
          </h1>
          <p className="text-xs text-[var(--color-text-faint)] mt-1">
            Your conversations with other students
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              activeId={activeConversation?._id}
              onSelect={handleSelectConversation}
            />
          )}
        </div>
      </div>

      {/* Main chat window container */}
      <div
        className={`
          flex-1 card rounded-3xl overflow-hidden relative
          ${!activeConversation ? "hidden lg:flex items-center justify-center" : "flex flex-col"}
        `}
      >
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            onBack={() => setActiveConversation(null)}
          />
        ) : (
          <div className="text-center px-10 py-12 flex flex-col items-center gap-4 max-w-sm mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <MessageSquare size={30} />
            </div>
            <h3 className="page-heading text-xl text-[var(--color-text)]">
              Select a Chat
            </h3>
            <p className="text-sm text-[var(--color-text-faint)] leading-relaxed">
              You can select a friend from the list on the left to chat, or find
              new profiles on the Discover tab and send them a message.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
