import { Calendar, MapPin, Users, Globe, ExternalLink, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Avatar from '../common/Avatar.jsx';
import Button from '../common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLightboxStore } from '../../context/useLightboxStore.js';
import { useState } from 'react';
import { eventApi } from '../../api/index.js';
import toast from 'react-hot-toast';

const categoryLabels = {
  club: { text: 'Kulüp', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  party: { text: 'Parti/Eğlence', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  study: { text: 'Ders/Çalışma', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  sport: { text: 'Spor', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  seminar: { text: 'Seminer/Panel', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  hackathon: { text: 'Hackathon', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  other: { text: 'Diğer', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

const EventCard = ({ event, onDelete }) => {
  const { user } = useAuth();
  const { openLightbox } = useLightboxStore();
  const [attendees, setAttendees] = useState(event.attendees || []);
  const [loading, setLoading] = useState(false);

  const isCreator = event.creator?._id === user?._id || event.creator === user?._id;
  const isAttending = attendees.some(
    (a) => (a._id || a) === user?._id
  );

  const handleAttend = async () => {
    setLoading(true);
    try {
      const { data } = await eventApi.toggleAttend(event._id);
      if (data.attending) {
        setAttendees((prev) => [...prev, user]);
        toast.success('Etkinliğe katılımın onaylandı! 🎉');
      } else {
        setAttendees((prev) => prev.filter((a) => (a._id || a) !== user?._id));
        toast.success('Etkinlik katılımı iptal edildi.');
      }
    } catch {
      toast.error('İşlem tamamlanamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bu etkinliği silmek istediğine emin misin?')) return;
    try {
      await eventApi.deleteEvent(event._id);
      toast.success('Etkinlik silindi');
      if (onDelete) onDelete(event._id);
    } catch {
      toast.error('Silme işlemi başarısız');
    }
  };

  const cat = categoryLabels[event.category] || categoryLabels.other;
  const dateStr = format(new Date(event.startDate), 'dd MMMM yyyy, HH:mm', { locale: tr });

  return (
    <div className="glass overflow-hidden flex flex-col border border-[var(--color-border)] hover:shadow-[0_0_30px_rgba(99,102,241,0.12)] transition-all fade-in">
      {/* Event banner image */}
      <div className="h-40 bg-[var(--color-surface-2)] relative">
        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => openLightbox(event.coverImage)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-violet-900/40 to-indigo-900/40 flex items-center justify-center font-bold text-xs tracking-wider text-[var(--color-text-faint)]">
            MEETORY EVENT
          </div>
        )}

        {/* Category badge */}
        <span className={`absolute top-3 left-3 text-xs px-2.5 py-0.5 rounded-full border font-semibold backdrop-blur-md ${cat.color}`}>
          {cat.text}
        </span>

        {/* Creator control */}
        {isCreator && (
          <button
            onClick={handleDelete}
            title="Etkinliği Sil"
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 text-red-400 hover:bg-black/60 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Details body */}
      <div className="p-4 flex-1 flex flex-col gap-3.5">
        <div>
          <h3 className="font-bold text-base line-clamp-1">{event.title}</h3>
          <p className="text-xs text-[var(--color-text-faint)] line-clamp-2 mt-1">
            {event.description || 'Açıklama bulunmuyor.'}
          </p>
        </div>

        {/* Dynamic details list */}
        <div className="space-y-1.5 text-xs text-[var(--color-text-muted)]">
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-indigo-400 shrink-0" />
            <span>{dateStr}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={13} className="text-indigo-400 shrink-0" />
            <span className="truncate">
              {event.isOnline ? 'Online Etkinlik' : `${event.campus} Kampüsü · ${event.locationName}`}
            </span>
          </div>

          {event.isOnline && event.onlineLink && (
            <div className="flex items-center gap-2">
              <Globe size={13} className="text-emerald-400 shrink-0" />
              <a
                href={event.onlineLink}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-0.5"
              >
                Katılım Linki <ExternalLink size={10} />
              </a>
            </div>
          )}
        </div>

        {/* Attendees & CTA */}
        <div className="mt-auto pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-[var(--color-text-faint)]" />
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">
              {attendees.length} Katılımcı
            </span>
            
            {/* Tiny attendee avatars */}
            <div className="hidden sm:flex -space-x-1.5 ml-1">
              {attendees.slice(0, 3).map((a, i) => (
                <div key={i} className="border border-[var(--color-bg)] rounded-full overflow-hidden w-5 h-5">
                  <Avatar src={a.avatar} name={a.name} size="xs" />
                </div>
              ))}
            </div>
          </div>

          <Button
            variant={isAttending ? 'secondary' : 'primary'}
            size="sm"
            loading={loading}
            onClick={handleAttend}
            className="text-xs px-3.5 py-1"
          >
            {isAttending ? 'Katılıyorsun' : 'Katıl'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
