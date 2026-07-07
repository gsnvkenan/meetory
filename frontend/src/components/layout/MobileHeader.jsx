import { Link, NavLink } from "react-router-dom";
import { Sparkles, Bookmark, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSocket } from "../../context/SocketContext.jsx";
import Avatar from "../common/Avatar.jsx";

/**
 * Mobile top navigation bar, hidden on large screens
 */
const MobileHeader = () => {
  const { user } = useAuth();
  const { hasUnreadNotifications } = useSocket();

  return (
    <header className="lg:hidden sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-xl">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <Link
          to="/feed"
          className="flex items-center gap-2 group active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-xl brand-badge flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-lg font-extrabold gradient-text font-[Outfit] tracking-tight">
            Meetory
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {/* Saved Posts Button */}
          <NavLink
            to="/saved"
            className={({ isActive }) =>
              `p-2 rounded-full transition-all ${
                isActive
                  ? "text-[var(--color-primary)] bg-[var(--color-primary)]/8"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-2)]"
              }`
            }
            title="Kaydedilenler"
          >
            <Bookmark size={20} />
          </NavLink>

          {/* Notifications Button */}
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `p-2 rounded-full transition-all ${
                isActive
                  ? "text-[var(--color-primary)] bg-[var(--color-primary)]/8"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-2)]"
              }`
            }
            title="Bildirimler"
          >
            <div className="relative flex items-center justify-center">
              <Bell size={20} />
              {hasUnreadNotifications && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-[var(--color-surface)] animate-pulse" />
              )}
            </div>
          </NavLink>

          {/* Profile Button */}
          {user && (
            <Link
              to={`/profile/${user.username}`}
              className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-[var(--color-primary)]/20 transition-all ml-1"
              title="Profilim"
            >
              <Avatar src={user.avatar} name={user.name} size="xs" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
