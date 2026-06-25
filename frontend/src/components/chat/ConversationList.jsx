import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import Avatar from '../common/Avatar.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const ConversationList = ({ conversations, activeId, onSelect }) => {
  const { isOnline } = useSocket();
  const { user } = useAuth();

  if (!conversations?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-[var(--color-text-faint)] text-sm">
        <p>Henüz mesajlaşma yok</p>
        <p className="text-xs mt-1">Keşfet sekmesinden biri ile başla</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {conversations.map((conv) => {
        const other = conv.otherUser;
        const online = isOnline(other?._id);
        const isActive = conv._id === activeId;
        const lastMsg = conv.lastMessage;
        const timeAgo = lastMsg?.createdAt
          ? formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: true, locale: tr })
          : '';

        return (
          <button
            key={conv._id}
            onClick={() => onSelect(conv)}
            className={`
              flex items-center gap-3 p-3 rounded-xl text-left transition-all
              ${isActive
                ? 'bg-indigo-500/15 border border-indigo-500/30'
                : 'hover:bg-[var(--color-surface-3)]'
              }
            `}
          >
            <Avatar
              src={other?.avatar}
              name={other?.name}
              size="sm"
              online={online}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold truncate">{other?.name}</p>
                <span className="text-xs text-[var(--color-text-faint)] shrink-0 ml-2">
                  {timeAgo}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-faint)] truncate mt-0.5">
                {lastMsg
                  ? (lastMsg.sender === user?._id ? 'Sen: ' : '') + lastMsg.content
                  : 'Sohbet başlat'}
              </p>
            </div>
            {conv.unread > 0 && (
              <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">
                {conv.unread}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ConversationList;
