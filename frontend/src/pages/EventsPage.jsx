import { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  Sparkles,
  Loader2,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import EventCard from "../components/events/EventCard.jsx";
import CreateEventModal from "../components/events/CreateEventModal.jsx";
import Button from "../components/common/Button.jsx";
import { eventApi } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const categories = [
  { value: "", label: "Tüm Kategoriler" },
  { value: "club", label: "Kulüp" },
  { value: "party", label: "Parti/Eğlence" },
  { value: "study", label: "Ders/Çalışma" },
  { value: "sport", label: "Spor" },
  { value: "seminar", label: "Seminer/Panel" },
  { value: "hackathon", label: "Hackathon" },
  { value: "other", label: "Diğer" },
];

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
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
      toast.error("Etkinlikler yüklenirken hata oluştu.");
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
    <div className="space-y-7 fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl brand-badge flex items-center justify-center text-white shrink-0">
            <CalendarDays size={22} />
          </div>
          <div>
            <h1 className="page-heading text-2xl sm:text-3xl text-[var(--color-text)]">
              Kampüs Etkinlikleri
            </h1>
            <p className="text-sm text-[var(--color-text-faint)] mt-1">
              {user?.university} bünyesindeki tüm kulüp ve çalışma grupları
              aktiviteleri
            </p>
          </div>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          icon={Plus}
          className="shrink-0"
        >
          Etkinlik Oluştur
        </Button>
      </div>

      {/* Filter panel */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal
          size={14}
          className="text-[var(--color-text-faint)] mr-1 shrink-0"
        />
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`chip px-4 py-2 text-xs transition-all ${
              categoryFilter === cat.value
                ? "bg-gradient-to-br from-[#2258d6] to-[#4c6ef0] border-transparent text-white shadow-md"
                : "chip-slate hover:text-[var(--color-text)] hover:border-[var(--color-primary)]/25"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="card p-12 md:p-16 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
            <CalendarDays size={24} />
          </div>
          <h3 className="text-base font-bold page-heading">
            Aktif Etkinlik Bulunmuyor
          </h3>
          <p className="text-sm text-[var(--color-text-faint)] max-w-sm">
            {categoryFilter
              ? "Seçilen kategoride yakında gerçekleşecek bir etkinlik bulunmuyor."
              : "Yakın zamanda planlanmış bir etkinlik bulunmuyor. Yeni bir tane oluşturarak ilk adımı sen at!"}
          </p>
          <Button
            onClick={() => setModalOpen(true)}
            icon={Sparkles}
            size="sm"
            className="mt-1"
          >
            İlk Etkinliği Oluştur
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
