import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { MessageSquare } from "lucide-react";
import Avatar from "../common/Avatar.jsx";
import { useSocket } from "../../context/SocketContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const ConversationList = ({ conversations, activeId, onSelect }) => {
  const { isOnline } = useSocket();
  const { user } = useAuth();

  if (!conversations?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center gap-2 px-6">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-faint)]">
          <MessageSquare size={22} />
        </div>
        <p className="text-sm font-semibold text-[var(--color-text-muted)]">
          Henüz mesajlaşma yok
        </p>
        <p className="text-xs text-[var(--color-text-faint)]">
          Keşfet sekmesinden biri ile başla
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {conversations.map((conv) => {
        const other = conv.otherUser;
        const online = isOnline(other?._id);
        const isActive = conv._id === activeId;
        const hasUnread = conv.unread > 0;
        const lastMsg = conv.lastMessage;
        const timeAgo = lastMsg?.createdAt
          ? formatDistanceToNow(new Date(lastMsg.createdAt), {
              addSuffix: true,
              locale: tr,
            })
          : "";

        return (
          <button
            key={conv._id}
            onClick={() => onSelect(conv)}
            className={`
              relative w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-colors duration-150
              ${
                isActive
                  ? "bg-[var(--color-primary)]/[0.08]"
                  : "hover:bg-[var(--color-surface-2)]"
              }
            `}
          >
            {isActive && (
              <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-full bg-[var(--color-primary)]" />
            )}

            <Avatar
              src={other?.avatar}
              name={other?.name}
              size="sm"
              online={online}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`text-sm truncate ${
                    isActive || hasUnread
                      ? "font-bold text-[var(--color-text)]"
                      : "font-semibold text-[var(--color-text)]"
                  }`}
                >
                  {other?.name}
                </p>
                <span className="text-[11px] text-[var(--color-text-faint)] shrink-0 ml-2">
                  {timeAgo}
                </span>
              </div>
              <p
                className={`text-xs truncate mt-0.5 ${
                  hasUnread
                    ? "text-[var(--color-text-muted)] font-medium"
                    : "text-[var(--color-text-faint)]"
                }`}
              >
                {lastMsg
                  ? (lastMsg.sender === user?._id ? "Sen: " : "") +
                    lastMsg.content
                  : "Sohbet başlat"}
              </p>
            </div>

            {hasUnread && (
              <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--color-primary)] text-white text-[11px] flex items-center justify-center font-bold shadow-sm">
                {conv.unread > 99 ? "99+" : conv.unread}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ConversationList;
