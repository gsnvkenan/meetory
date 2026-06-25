import { useState, useEffect, useCallback } from 'react';
import { CalendarDays, Sparkles, Loader2, Plus, SlidersHorizontal } from 'lucide-react';
import EventCard from '../components/events/EventCard.jsx';
import CreateEventModal from '../components/events/CreateEventModal.jsx';
import { eventApi } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const categories = [
  { value: '', label: 'Tüm Kategoriler' },
  { value: 'club', label: 'Kulüp' },
  { value: 'party', label: 'Parti/Eğlence' },
  { value: 'study', label: 'Ders/Çalışma' },
  { value: 'sport', label: 'Spor' },
  { value: 'seminar', label: 'Seminer/Panel' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'other', label: 'Diğer' },
];

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      // Default university filter automatically injected inside backend controller via jwt token
      
      const { data } = await eventApi.getEvents(params);
      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
      toast.error('Etkinlikler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchEvents();
  }, [categoryFilter, fetchEvents]);

  const handleEventCreated = (newEvent) => {
    // Add the new event at the beginning of the list if it matches the current category filter
    if (!categoryFilter || newEvent.category === categoryFilter) {
      setEvents((prev) => [newEvent, ...prev]);
    }
  };

  const handleEventDeleted = (deletedId) => {
    setEvents((prev) => prev.filter((e) => e._id !== deletedId));
  };

  return (
    <div className="space-y-6 fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 font-[Outfit]">
            Kampüs Etkinlikleri <CalendarDays size={20} className="text-indigo-400" />
          </h1>
          <p className="text-xs text-[var(--color-text-faint)] mt-0.5">
            {user?.university} bünyesindeki tüm kulüp ve çalışma grupları aktiviteleri
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all btn-glow cursor-pointer"
        >
          <Plus size={16} />
          Etkinlik Oluştur
        </button>
      </div>

      {/* Filter panel */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal size={14} className="text-[var(--color-text-faint)] mr-2" />
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              categoryFilter === cat.value
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="glass p-12 text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <CalendarDays size={20} />
          </div>
          <h3 className="text-base font-semibold">Aktif Etkinlik Bulunmuyor</h3>
          <p className="text-sm text-[var(--color-text-faint)] max-w-sm">
            {categoryFilter
              ? 'Seçilen kategoride yakında gerçekleşecek bir etkinlik bulunmuyor.'
              : 'Yakın zamanda planlanmış bir etkinlik bulunmuyor. Yeni bir tane oluşturarak ilk adımı sen at!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onDelete={handleEventDeleted}
            />
          ))}
        </div>
      )}

      {/* Event creation modal */}
      <CreateEventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleEventCreated}
      />
    </div>
  );
};

export default EventsPage;
