import { NavLink, Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import {
  Home,
  Compass,
  MessageCircle,
  CalendarDays,
  ShoppingBag,
  Bell,
  User,
  LogOut,
  Sparkles,
  Bookmark,
  PenSquare,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSocket } from "../../context/SocketContext.jsx";
import Avatar from "../common/Avatar.jsx";

const navItems = [
  { to: "/feed", icon: Home, label: "Feed" },
  { to: "/discover", icon: Compass, label: "Discover" },
  { to: "/chat", icon: MessageCircle, label: "Messages" },
  { to: "/events", icon: CalendarDays, label: "Events" },
  { to: "/market", icon: ShoppingBag, label: "Market" },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { hasUnreadNotifications } = useSocket();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="hidden lg:flex flex-col h-screen w-64 xl:w-72 sticky top-0 shrink-0 p-4 bg-[var(--color-surface)]">
      {/* Logo */}
      <Link to="/feed" className="flex items-center gap-2.5 px-2 mb-6 group">
        <img src={logo} alt="Meetory Logo" className="w-10 h-10 object-contain shrink-0 transition-transform group-hover:scale-105" />
        <span className="text-xl font-extrabold gradient-text font-[Outfit] tracking-tight">
          Meetory
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon size={21} strokeWidth={2.1} />
            <span>{label}</span>
          </NavLink>
        ))}

        <NavLink
          to={`/profile/${user?.username}`}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <User size={21} strokeWidth={2.1} />
          <span>My Profile</span>
        </NavLink>

        <NavLink
          to="/saved"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Bookmark size={21} strokeWidth={2.1} />
          <span>Saved</span>
        </NavLink>

        <NavLink
          to="/notifications"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <div className="relative flex items-center justify-center">
            <Bell size={21} strokeWidth={2.1} />
            {hasUnreadNotifications && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-[var(--color-surface)]" />
            )}
          </div>
          <span>Notifications</span>
        </NavLink>

        {/* Primary CTA — always accessible compose action */}
        <Link
          to="/feed"
          className="mt-3 inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-full py-3 btn-glow transition-all"
        >
          <PenSquare size={16} />
          Create Post
        </Link>
      </nav>

      {/* User card */}
      {user && (
        <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[var(--color-surface-2)] transition-colors">
            <Link to={`/profile/${user.username}`} className="shrink-0">
              <Avatar src={user.avatar} name={user.name} size="sm" />
            </Link>
            <Link to={`/profile/${user.username}`} className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate leading-tight">
                {user.name}
              </p>
              <p className="text-xs text-[var(--color-text-faint)] truncate">
                @{user.username}
              </p>
            </Link>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 text-[var(--color-text-faint)] transition-colors shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
