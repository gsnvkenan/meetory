import { NavLink } from "react-router-dom";
import {
  Home,
  Compass,
  MessageCircle,
  CalendarDays,
  ShoppingBag,
} from "lucide-react";

const tabs = [
  { to: "/feed", icon: Home, label: "Akış" },
  { to: "/discover", icon: Compass, label: "Keşfet" },
  { to: "/chat", icon: MessageCircle, label: "Mesaj" },
  { to: "/events", icon: CalendarDays, label: "Etkinlik" },
  { to: "/market", icon: ShoppingBag, label: "Pazar" },
];

/**
 * Mobile bottom navigation bar
 */
const BottomNav = () => (
  <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
    <div className="flex items-center justify-around h-16 px-1">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[11px] font-semibold transition-colors ${
              isActive
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-text-faint)]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`p-1.5 rounded-full transition-colors ${isActive ? "bg-[var(--color-primary)]/10" : ""}`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
              </div>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </div>
  </nav>
);

export default BottomNav;
