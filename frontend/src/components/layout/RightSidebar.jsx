import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  UserPlus,
  UserCheck,
  CalendarDays,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import Avatar from "../common/Avatar.jsx";
import { discoverApi, eventApi, userApi } from "../../api/index.js";
import { useSocket } from "../../context/SocketContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const FollowRow = ({ rec }) => {
  const { user } = rec;
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userApi.toggleFollow(user._id);
      setFollowing((p) => !p);
    } catch {
      /* silent — non-critical widget */
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      to={`/profile/${user.username}`}
      className="flex items-center gap-2.5 py-2 px-1 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors -mx-1"
    >
      <Avatar src={user.avatar} name={user.name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate leading-tight">{user.name}</p>
        <p className="text-xs text-[var(--color-text-faint)] truncate">
          @{user.username}
        </p>
      </div>
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`shrink-0 p-2 rounded-full transition-colors ${
          following
            ? "bg-[var(--color-surface-3)] text-[var(--color-text-muted)]"
            : "bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/16"
        }`}
        title={following ? "Following" : "Follow"}
      >
        {following ? <UserCheck size={14} /> : <UserPlus size={14} />}
      </button>
    </Link>
  );
};

const categoryChip = {
  club: "chip-blue",
  party: "chip-rose",
  study: "chip-emerald",
  sport: "chip-amber",
  seminar: "chip-violet",
  hackathon: "chip-violet",
  other: "chip-slate",
};

const RightSidebar = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [recs, setRecs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [recRes, eventRes] = await Promise.allSettled([
          discoverApi.getRecommendations(),
          eventApi.getEvents(),
        ]);
        if (recRes.status === "fulfilled") {
          setRecs((recRes.value.data.recommendations || []).slice(0, 3));
        }
        if (eventRes.status === "fulfilled") {
          const upcoming = (eventRes.value.data.events || [])
            .filter((e) => new Date(e.startDate) >= new Date())
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
          setEvents(upcoming.slice(0, 2));
        }
      } catch {
        /* silent — non-critical widget */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Keep the "Upcoming Events" widget in sync with real-time socket updates
  useEffect(() => {
    if (!socket) return;

    const upsert = (list, event) => {
      const filtered = list.filter((e) => e._id !== event._id);
      return [...filtered, event]
        .filter((e) => new Date(e.startDate) >= new Date())
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 2);
    };

    const handleCreated = (event) => {
      if (event.university !== user?.university) return;
      setEvents((prev) => upsert(prev, event));
    };

    const handleUpdated = (event) => {
      if (event.university !== user?.university) {
        setEvents((prev) => prev.filter((e) => e._id !== event._id));
        return;
      }
      setEvents((prev) => upsert(prev, event));
    };

    const handleDeleted = ({ eventId }) => {
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
    };

    socket.on("event:created", handleCreated);
    socket.on("event:updated", handleUpdated);
    socket.on("event:deleted", handleDeleted);

    return () => {
      socket.off("event:created", handleCreated);
      socket.off("event:updated", handleUpdated);
      socket.off("event:deleted", handleDeleted);
    };
  }, [socket, user?.university]);

  return (
    <aside className="hidden xl:flex flex-col w-80 shrink-0 sticky top-0 h-screen overflow-y-auto p-4 gap-4">
      {/* Search */}
      <Link
        to="/discover"
        className="input-base flex items-center gap-2.5 text-[var(--color-text-faint)] rounded-full hover:bg-[var(--color-surface-3)] transition-colors"
      >
        <Search size={16} />
        <span className="text-sm">Search Meetory...</span>
      </Link>

      {/* Who to follow */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-extrabold text-[15px] page-heading">
            Who to Follow?
          </h3>
        </div>
        {loading ? (
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="skeleton w-9 h-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3 w-2/3 rounded" />
                  <div className="skeleton h-2.5 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : recs.length === 0 ? (
          <p className="text-xs text-[var(--color-text-faint)] py-2">
            No recommendations for now.
          </p>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {recs.map((rec) => (
              <FollowRow key={rec.user._id} rec={rec} />
            ))}
          </div>
        )}
        <Link
          to="/discover"
          className="flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:underline mt-2 pt-2"
        >
          See all <ArrowRight size={13} />
        </Link>
      </div>

      {/* Upcoming events */}
      <div className="card p-4">
        <h3 className="font-extrabold text-[15px] page-heading mb-1">
          Upcoming Events
        </h3>
        {loading ? (
          <div className="space-y-3 pt-2">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="text-xs text-[var(--color-text-faint)] py-2">
            No upcoming events.
          </p>
        ) : (
          <div className="flex flex-col gap-1 pt-1">
            {events.map((event) => (
              <Link
                key={event._id}
                to="/events"
                className="flex flex-col gap-1 py-2.5 px-1 -mx-1 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold truncate">{event.title}</p>
                  <span
                    className={`chip ${categoryChip[event.category] || "chip-slate"} shrink-0`}
                  >
                    <CalendarDays size={10} />
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-faint)]">
                  <MapPin size={11} className="shrink-0" />
                  <span className="truncate">
                    {format(new Date(event.startDate), "d MMM, HH:mm", {
                      locale: enUS,
                    })}
                    {event.locationName ? ` · ${event.locationName}` : ""}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
        <Link
          to="/events"
          className="flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:underline mt-2 pt-2"
        >
          See all <ArrowRight size={13} />
        </Link>
      </div>

      {/* Footer */}
      <div className="px-2 text-[11px] text-[var(--color-text-faint)] leading-relaxed">
        <div className="flex flex-wrap gap-x-2.5 gap-y-1 mb-1.5">
          <span className="hover:underline cursor-pointer">About</span>
          <span className="hover:underline cursor-pointer">Privacy</span>
          <span className="hover:underline cursor-pointer">Terms</span>
          <span className="hover:underline cursor-pointer">Help</span>
        </div>
        © {new Date().getFullYear()} Meetory Inc.
      </div>
    </aside>
  );
};

export default RightSidebar;
