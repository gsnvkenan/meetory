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
import { useSocket } from "../context/SocketContext.jsx";
import toast from "react-hot-toast";

const categories = [
  { value: "", label: "All Categories" },
  { value: "club", label: "Club" },
  { value: "party", label: "Party/Fun" },
  { value: "study", label: "Study" },
  { value: "sport", label: "Sport" },
  { value: "seminar", label: "Seminar/Panel" },
  { value: "hackathon", label: "Hackathon" },
  { value: "other", label: "Other" },
];

const EventsPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
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
      toast.error("Error loading events.");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchEvents();
  }, [categoryFilter, fetchEvents]);

  // Keep the event list in sync with real-time socket updates
  useEffect(() => {
    if (!socket) return;

    const matchesFilter = (event) =>
      event.university === user?.university &&
      (!categoryFilter || event.category === categoryFilter);

    const sortByStartDate = (list) =>
      [...list].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    const handleCreated = (event) => {
      if (!matchesFilter(event)) return;
      setEvents((prev) => {
        if (prev.some((e) => e._id === event._id)) return prev;
        return sortByStartDate([event, ...prev]);
      });
    };

    const handleUpdated = (event) => {
      setEvents((prev) => {
        const exists = prev.some((e) => e._id === event._id);
        if (!matchesFilter(event)) {
          return prev.filter((e) => e._id !== event._id);
        }
        if (!exists) return sortByStartDate([event, ...prev]);
        return sortByStartDate(
          prev.map((e) => (e._id === event._id ? event : e)),
        );
      });
    };

    const handleDeleted = ({ eventId }) => {
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
    };

    const handleAttendance = ({ eventId, attendees, attendeeCount }) => {
      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId ? { ...e, attendees, attendeeCount } : e,
        ),
      );
    };

    socket.on("event:created", handleCreated);
    socket.on("event:updated", handleUpdated);
    socket.on("event:deleted", handleDeleted);
    socket.on("event:attendance", handleAttendance);

    return () => {
      socket.off("event:created", handleCreated);
      socket.off("event:updated", handleUpdated);
      socket.off("event:deleted", handleDeleted);
      socket.off("event:attendance", handleAttendance);
    };
  }, [socket, categoryFilter, user?.university]);

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
              Campus Events
            </h1>
            <p className="text-sm text-[var(--color-text-faint)] mt-1">
              All club and study group activities within {user?.university}
            </p>
          </div>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          icon={Plus}
          className="shrink-0"
        >
          Create Event
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
                ? "bg-blue-500 border-transparent text-white shadow-md"
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
          <h3 className="text-base font-bold page-heading">No Active Events</h3>
          <p className="text-sm text-[var(--color-text-faint)] max-w-sm">
            {categoryFilter
              ? "There are no upcoming events in the selected category."
              : "There are no events planned recently. Take the first step by creating a new one!"}
          </p>
          <Button
            onClick={() => setModalOpen(true)}
            icon={Sparkles}
            size="sm"
            className="mt-1"
          >
            Create First Event
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
