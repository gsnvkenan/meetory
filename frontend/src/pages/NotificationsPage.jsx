import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageSquare,
  UserPlus,
  Calendar,
  ShoppingBag,
  AtSign,
  Bell,
  Loader2,
  MessageCircle,
} from "lucide-react";
import Avatar from "../components/common/Avatar.jsx";
import { userApi } from "../api/index.js";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { useSocket } from "../context/SocketContext.jsx";
import toast from "react-hot-toast";

const notificationIcons = {
  like: { icon: Heart, color: "text-rose-500 bg-rose-500/10" },
  comment: { icon: MessageCircle, color: "text-blue-500 bg-blue-500/10" },
  follow: { icon: UserPlus, color: "text-violet-500 bg-violet-500/10" },
  message: { icon: MessageSquare, color: "text-indigo-500 bg-indigo-500/10" },
  event_invite: { icon: Calendar, color: "text-emerald-500 bg-emerald-500/10" },
  market_interest: {
    icon: ShoppingBag,
    color: "text-amber-500 bg-amber-500/10",
  },
  mention: { icon: AtSign, color: "text-pink-500 bg-pink-500/10" },
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
        toast.error("Bildirimler yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-7 fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="page-heading text-2xl md:text-3xl flex items-center gap-2.5">
          Bildirimler
          <span className="chip chip-blue">
            <Bell size={12} />
            {unreadCount > 0 ? `${unreadCount} yeni` : "Meetory"}
          </span>
        </h1>
        <p className="text-sm text-[var(--color-text-faint)] mt-1.5">
          Etkinliklerin, gönderilerin ve profilinle ilgili tüm gelişmeler
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-faint)]">
            <Bell size={22} />
          </div>
          <h3 className="text-base font-semibold">Bildirim Bulunmuyor</h3>
          <p className="text-sm text-[var(--color-text-faint)] max-w-sm">
            Şimdilik her şey sakin! Yeni aktiviteler gerçekleştiğinde burada
            görünecek.
          </p>
        </div>
      ) : (
        <div className="card divide-y divide-[var(--color-border)] overflow-hidden">
          {notifications.map((notif) => {
            const config = notificationIcons[notif.type] || {
              icon: Bell,
              color: "text-indigo-500 bg-indigo-500/10",
            };
            const IconComponent = config.icon;

            // Build custom links based on notification type
            let path = `/profile/${notif.actor?.username}`;
            if (
              notif.type === "like" ||
              notif.type === "comment" ||
              notif.type === "mention"
            ) {
              path = `/feed`; // Simple fallback, or route to details if exists
            } else if (notif.type === "event_invite") {
              path = `/events`;
            } else if (notif.type === "market_interest") {
              path = `/market`;
            }

            return (
              <div
                key={notif._id}
                className={`relative flex gap-4 p-4 md:p-5 hover:bg-[var(--color-surface-2)] transition-colors items-start ${
                  !notif.read ? "bg-[var(--color-primary)]/[0.04]" : ""
                }`}
              >
                {/* Unread indicator */}
                {!notif.read && (
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                )}

                {/* Icon circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${config.color} shrink-0`}
                >
                  <IconComponent size={18} />
                </div>

                {/* Actor Avatar */}
                <Link
                  to={`/profile/${notif.actor?.username}`}
                  className="shrink-0"
                >
                  <Avatar
                    src={notif.actor?.avatar}
                    name={notif.actor?.name}
                    size="sm"
                  />
                </Link>

                {/* Message Body */}
                <div className="flex-1 min-w-0 text-sm">
                  <p className="leading-relaxed">
                    <Link
                      to={`/profile/${notif.actor?.username}`}
                      className="font-semibold hover:text-[var(--color-primary)] transition-colors"
                    >
                      {notif.actor?.name}
                    </Link>{" "}
                    <span className="text-[var(--color-text-muted)]">
                      {notif.type === "follow"
                        ? "seni takip etmeye başladı."
                        : notif.type === "like"
                          ? "gönderini beğendi."
                          : notif.type === "comment"
                            ? "gönderine yorum yaptı."
                            : notif.type === "market_interest"
                              ? "pazardaki ilanına ilgi duyuyor!"
                              : notif.type === "event_invite"
                                ? "seni bir etkinliğe davet etti."
                                : notif.message || "seninle etkileşime girdi."}
                    </span>
                  </p>
                  <span className="text-xs text-[var(--color-text-faint)] mt-1 block">
                    {formatDistanceToNow(new Date(notif.createdAt), {
                      addSuffix: true,
                      locale: tr,
                    })}
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
