import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import ConversationList from '../components/chat/ConversationList.jsx';
import ChatWindow from '../components/chat/ChatWindow.jsx';
import { chatApi } from '../api/index.js';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

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
        const updatedActive = data.conversations.find(c => c._id === activeConversation._id);
        if (updatedActive) setActiveConversation(updatedActive);
      }
    } catch (err) {
      console.error('Konuşmalar yüklenirken hata:', err);
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
          if (!activeConversation || activeConversation._id !== conversationId) {
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

    socket.on('message:received', handleMessageReceived);
    return () => socket.off('message:received', handleMessageReceived);
  }, [socket, activeConversation, fetchConversations]);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    // Mark as read locally in the list
    setConversations((prev) =>
      prev.map((c) => (c._id === conv._id ? { ...c, unread: 0 } : c))
    );
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-3.5rem)] overflow-hidden flex gap-4 fade-in">
      {/* Sidebar - Conversation List */}
      <div
        className={`
          flex-col w-full lg:w-80 border border-[var(--color-border)] glass rounded-2xl p-4 overflow-y-auto shrink-0
          ${activeConversation ? 'hidden lg:flex' : 'flex'}
        `}
      >
        <div className="mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2 font-[Outfit]">
            Mesajlar <MessageSquare size={18} className="text-indigo-400" />
          </h1>
          <p className="text-xs text-[var(--color-text-faint)]">
            Öğrencilerle kurduğun iletişim kutusu
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            activeId={activeConversation?._id}
            onSelect={handleSelectConversation}
          />
        )}
      </div>

      {/* Main chat window container */}
      <div
        className={`
          flex-1 border border-[var(--color-border)] glass rounded-2xl overflow-hidden relative
          ${!activeConversation ? 'hidden lg:flex items-center justify-center' : 'flex flex-col'}
        `}
      >
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            onBack={() => setActiveConversation(null)}
          />
        ) : (
          <div className="text-center p-8 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2">
              <MessageSquare size={28} />
            </div>
            <h3 className="text-lg font-semibold font-[Outfit]">Sohbet Seçin</h3>
            <p className="text-sm text-[var(--color-text-faint)] max-w-sm">
              Sohbet etmek için sol taraftaki listeden bir arkadaşını seçebilir veya Keşfet sekmesinden yeni profiller bulup mesaj gönderebilirsin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
