import {
  Calendar,
  MapPin,
  Users,
  Globe,
  ExternalLink,
  Trash2,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Avatar from "../common/Avatar.jsx";
import Button from "../common/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLightboxStore } from "../../context/useLightboxStore.js";
import { useState } from "react";
import { eventApi } from "../../api/index.js";
import toast from "react-hot-toast";

const categoryLabels = {
  club: { text: "Kulüp", chip: "chip-blue" },
  party: { text: "Parti/Eğlence", chip: "chip-rose" },
  study: { text: "Ders/Çalışma", chip: "chip-emerald" },
  sport: { text: "Spor", chip: "chip-amber" },
  seminar: { text: "Seminer/Panel", chip: "chip-violet" },
  hackathon: { text: "Hackathon", chip: "chip-blue" },
  other: { text: "Diğer", chip: "chip-slate" },
};

const EventCard = ({ event, onDelete }) => {
  const { user } = useAuth();
  const { openLightbox } = useLightboxStore();
  const [attendees, setAttendees] = useState(event.attendees || []);
  const [loading, setLoading] = useState(false);

  const isCreator =
    event.creator?._id === user?._id || event.creator === user?._id;
  const isAttending = attendees.some((a) => (a._id || a) === user?._id);

  const handleAttend = async () => {
    setLoading(true);
    try {
      const { data } = await eventApi.toggleAttend(event._id);
      if (data.attending) {
        setAttendees((prev) => [...prev, user]);
        toast.success("Etkinliğe katılımın onaylandı! 🎉");
      } else {
        setAttendees((prev) => prev.filter((a) => (a._id || a) !== user?._id));
        toast.success("Etkinlik katılımı iptal edildi.");
      }
    } catch {
      toast.error("İşlem tamamlanamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bu etkinliği silmek istediğine emin misin?")) return;
    try {
      await eventApi.deleteEvent(event._id);
      toast.success("Etkinlik silindi");
      if (onDelete) onDelete(event._id);
    } catch {
      toast.error("Silme işlemi başarısız");
    }
  };

  const cat = categoryLabels[event.category] || categoryLabels.other;
  const dateStr = format(new Date(event.startDate), "dd MMMM yyyy, HH:mm", {
    locale: tr,
  });

  return (
    <div className="card card-hover overflow-hidden flex flex-col fade-in">
      {/* Event banner image */}
      <div className="h-44 bg-[var(--color-surface-2)] relative overflow-hidden">
        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover cursor-pointer hover:scale-[1.03] transition-transform duration-300"
            onClick={() => openLightbox(event.coverImage)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#2258d6] via-[#4c6ef0] to-[#7458f0] flex items-center justify-center gap-2 text-white/90">
            <Sparkles size={16} />
            <span className="font-bold text-xs tracking-wider uppercase">
              Meetory Event
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />

        {/* Category badge */}
        <span
          className={`chip ${cat.chip} absolute top-3 left-3 shadow-sm bg-[var(--color-surface)]`}
        >
          {cat.text}
        </span>

        {/* Creator control */}
        {isCreator && (
          <button
            onClick={handleDelete}
            title="Etkinliği Sil"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/45 hover:bg-red-500/90 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Details body */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        <div>
          <h3 className="font-bold text-base text-[var(--color-text)] line-clamp-1">
            {event.title}
          </h3>
          <p className="text-sm text-[var(--color-text-faint)] line-clamp-2 mt-1.5">
            {event.description || "Açıklama bulunmuyor."}
          </p>
        </div>

        {/* Dynamic details list */}
        <div className="space-y-2 text-sm text-[var(--color-text-muted)]">
          <div className="flex items-center gap-2">
            <Calendar
              size={14}
              className="text-[var(--color-primary)] shrink-0"
            />
            <span>{dateStr}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin
              size={14}
              className="text-[var(--color-primary)] shrink-0"
            />
            <span className="truncate">
              {event.isOnline
                ? "Online Etkinlik"
                : `${event.campus} Kampüsü · ${event.locationName}`}
            </span>
          </div>

          {event.isOnline && event.onlineLink && (
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-emerald-500 shrink-0" />
              <a
                href={event.onlineLink}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 font-medium hover:underline flex items-center gap-1"
              >
                Katılım Linki <ExternalLink size={11} />
              </a>
            </div>
          )}
        </div>

        {/* Attendees & CTA */}
        <div className="mt-auto pt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {/* Tiny attendee avatars */}
            {attendees.length > 0 && (
              <div className="flex -space-x-2 shrink-0">
                {attendees.slice(0, 3).map((a, i) => (
                  <div
                    key={i}
                    className="rounded-full ring-2 ring-[var(--color-surface)]"
                  >
                    <Avatar src={a.avatar} name={a.name} size="xs" />
                  </div>
                ))}
              </div>
            )}
            <span className="text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-1 truncate">
              <Users
                size={13}
                className="text-[var(--color-text-faint)] shrink-0"
              />
              {attendees.length} Katılımcı
            </span>
          </div>

          <Button
            variant={isAttending ? "secondary" : "primary"}
            size="sm"
            loading={loading}
            onClick={handleAttend}
            className="shrink-0"
          >
            {isAttending ? "Katılıyorsun" : "Katıl"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
