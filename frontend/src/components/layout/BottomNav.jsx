import { NavLink } from 'react-router-dom';
import { Home, Compass, MessageCircle, CalendarDays, ShoppingBag } from 'lucide-react';

const tabs = [
  { to: '/feed',     icon: Home,           label: 'Akış' },
  { to: '/discover', icon: Compass,         label: 'Keşfet' },
  { to: '/chat',     icon: MessageCircle,   label: 'Mesaj' },
  { to: '/events',   icon: CalendarDays,    label: 'Etkinlik' },
  { to: '/market',   icon: ShoppingBag,     label: 'Pazar' },
];

/**
 * Mobile bottom navigation bar
 */
const BottomNav = () => (
  <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-xl">
    <div className="flex items-center justify-around h-16 px-2">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              isActive
                ? 'text-primary'
                : 'text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} className={isActive ? 'stroke-primary' : ''} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </div>
  </nav>
);

export default BottomNav;
