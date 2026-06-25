import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Compass, MessageCircle, CalendarDays,
  ShoppingBag, Bell, User, LogOut, Sparkles, Bookmark,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import Avatar from '../common/Avatar.jsx';

const navItems = [
  { to: '/feed',     icon: Home,          label: 'Ana Akış' },
  { to: '/discover', icon: Compass,        label: 'Keşfet' },
  { to: '/chat',     icon: MessageCircle,  label: 'Mesajlar' },
  { to: '/events',   icon: CalendarDays,   label: 'Etkinlikler' },
  { to: '/market',   icon: ShoppingBag,    label: 'Pazar' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { hasUnreadNotifications } = useSocket();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col h-screen w-64 sticky top-0 p-4 border-r border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Sparkles size={18} className="text-white" />
        </div>
        <span className="text-xl font-bold gradient-text font-[Outfit]">
          Meetory
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}

        <NavLink
          to={`/profile/${user?.username}`}
          className={({ isActive }) =>
            `nav-item ${isActive ? 'active' : ''}`
          }
        >
          <User size={20} />
          <span>Profilim</span>
        </NavLink>

        <NavLink to="/saved" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Bookmark size={20} />
          <span>Kaydedilenler</span>
        </NavLink>

        <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="relative flex items-center justify-center">
            <Bell size={20} />
            {hasUnreadNotifications && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-[var(--color-surface)]" />
            )}
          </div>
          <span>Bildirimler</span>
        </NavLink>
      </nav>

      {/* User card */}
      {user && (
        <div className="mt-auto pt-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--color-surface-3)] transition-colors">
            <Avatar src={user.avatar} name={user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-[var(--color-text-faint)] truncate">@{user.username}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Çıkış Yap"
              className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-[var(--color-text-faint)] transition-colors"
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
