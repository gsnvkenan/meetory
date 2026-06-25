import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, MessageSquare, UserPlus, Calendar, ShoppingBag, AtSign,
  Bell, Loader2, MessageCircle
} from 'lucide-react';
import Avatar from '../components/common/Avatar.jsx';
import { userApi } from '../api/index.js';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useSocket } from '../context/SocketContext.jsx';
import toast from 'react-hot-toast';

const notificationIcons = {
  like: { icon: Heart, color: 'text-red-400 bg-red-500/10' },
  comment: { icon: MessageCircle, color: 'text-blue-400 bg-blue-500/10' },
  follow: { icon: UserPlus, color: 'text-purple-400 bg-purple-500/10' },
  message: { icon: MessageSquare, color: 'text-indigo-400 bg-indigo-500/10' },
  event_invite: { icon: Calendar, color: 'text-emerald-400 bg-emerald-500/10' },
  market_interest: { icon: ShoppingBag, color: 'text-amber-400 bg-amber-500/10' },
  mention: { icon: AtSign, color: 'text-pink-400 bg-pink-500/10' },
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setHasUnreadNotifications } = useSocket();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await userApi.getNotifications();
        setNotifications(data.notifications || []);
        setHasUnreadNotifications(false);
      } catch (err) {
        console.error(err);
        toast.error('Bildirimler yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="space-y-6 fade-in pb-12">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 font-[Outfit]">
          Bildirimler <Bell size={20} className="text-indigo-400" />
        </h1>
        <p className="text-xs text-[var(--color-text-faint)] mt-0.5">
          Etkinliklerin, gönderilerin ve profilinle ilgili tüm gelişmeler
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass p-12 text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center text-[var(--color-text-faint)]">
            <Bell size={20} />
          </div>
          <h3 className="text-base font-semibold">Bildirim Bulunmuyor</h3>
          <p className="text-sm text-[var(--color-text-faint)] max-w-sm">
            Şimdilik her şey sakin! Yeni aktiviteler gerçekleştiğinde burada görünecek.
          </p>
        </div>
      ) : (
        <div className="glass border border-[var(--color-border)] divide-y divide-[var(--color-border)] overflow-hidden">
          {notifications.map((notif) => {
            const config = notificationIcons[notif.type] || { icon: Bell, color: 'text-indigo-400 bg-indigo-500/10' };
            const IconComponent = config.icon;
            
            // Build custom links based on notification type
            let path = `/profile/${notif.actor?.username}`;
            if (notif.type === 'like' || notif.type === 'comment' || notif.type === 'mention') {
              path = `/feed`; // Simple fallback, or route to details if exists
            } else if (notif.type === 'event_invite') {
              path = `/events`;
            } else if (notif.type === 'market_interest') {
              path = `/market`;
            }

            return (
              <div
                key={notif._id}
                className={`flex gap-4 p-4 hover:bg-[var(--color-surface-3)] transition-colors items-start ${
                  !notif.read ? 'bg-indigo-500/5' : ''
                }`}
              >
                {/* Icon circle */}
                <div className={`p-2.5 rounded-xl ${config.color} shrink-0`}>
                  <IconComponent size={18} />
                </div>

                {/* Actor Avatar */}
                <Link to={`/profile/${notif.actor?.username}`} className="shrink-0">
                  <Avatar src={notif.actor?.avatar} name={notif.actor?.name} size="sm" />
                </Link>

                {/* Message Body */}
                <div className="flex-1 min-w-0 text-sm">
                  <p className="leading-relaxed">
                    <Link
                      to={`/profile/${notif.actor?.username}`}
                      className="font-semibold hover:text-indigo-400 transition-colors"
                    >
                      {notif.actor?.name}
                    </Link>{' '}
                    <span className="text-[var(--color-text-muted)]">
                      {notif.type === 'follow' ? 'seni takip etmeye başladı.' : 
                       notif.type === 'like' ? 'gönderini beğendi.' :
                       notif.type === 'comment' ? 'gönderine yorum yaptı.' :
                       notif.type === 'market_interest' ? 'pazardaki ilanına ilgi duyuyor!' :
                       notif.type === 'event_invite' ? 'seni bir etkinliğe davet etti.' : 
                       notif.message || 'seninle etkileşime girdi.'}
                    </span>
                  </p>
                  <span className="text-xs text-[var(--color-text-faint)] mt-1 block">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: tr })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
