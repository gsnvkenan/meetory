import { useState, useEffect } from "react";
import { Camera, Calendar, MapPin, Users, Globe, BookOpen } from "lucide-react";
import Modal from "../common/Modal.jsx";
import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";
import { eventApi } from "../../api/index.js";
import toast from "react-hot-toast";

const CreateEventModal = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other",
    startDate: "",
    locationName: "",
    campus: "",
    maxAttendees: "",
    isOnline: false,
    onlineLink: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Etkinlik başlığı gereklidir");
      return;
    }
    if (!form.startDate) {
      toast.error("Etkinlik tarihi gereklidir");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      fd.append("category", form.category);
      fd.append("startDate", new Date(form.startDate).toISOString());
      fd.append("locationName", form.locationName.trim());
      fd.append("campus", form.campus.trim());
      fd.append("isOnline", form.isOnline);
      if (form.isOnline) {
        fd.append("onlineLink", form.onlineLink.trim());
      }
      if (form.maxAttendees) {
        fd.append("maxAttendees", Number(form.maxAttendees));
      }
      if (imageFile) {
        fd.append("coverImage", imageFile);
      }

      const { data } = await eventApi.createEvent(fd);
      toast.success("Etkinlik oluşturuldu! 📅");
      if (onCreated) onCreated(data.event);
      // Reset form
      setForm({
        title: "",
        description: "",
        category: "other",
        startDate: "",
        locationName: "",
        campus: "",
        maxAttendees: "",
        isOnline: false,
        onlineLink: "",
      });
      setImageFile(null);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Etkinlik oluşturulurken hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Yeni Etkinlik Oluştur"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Banner cover input */}
        <div className="flex items-center gap-4 bg-[var(--color-surface-2)] rounded-2xl p-3.5 border border-[var(--color-border)]">
          <div className="w-24 h-16 rounded-xl bg-[var(--color-surface)] overflow-hidden border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-faint)] shrink-0">
            {imageFile ? (
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <Calendar size={20} />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--color-text)] mb-1.5">
              Kapak Görseli
            </p>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-surface-3)] text-xs font-semibold text-[var(--color-text-muted)] cursor-pointer transition-colors border border-[var(--color-border)]">
              <Camera size={13} /> Görsel Seç
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <Input
          label="Etkinlik Başlığı"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Örn: Algoritma Yarışması Tanıtım Toplantısı"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Tarih & Saat"
            type="datetime-local"
            required
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-[var(--color-text-muted)]">
              Kategori
            </label>
            <select
              className="input-base cursor-pointer"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="other">Kategori Seçin</option>
              <option value="seminar">Seminer / Panel</option>
              <option value="workshop">Atölye / Workshop</option>
              <option value="hackathon">Hackathon / Proje</option>
              <option value="social">Sosyal Etkinlik</option>
              <option value="sport">Spor</option>
              <option value="concert">Konser / Tiyatro</option>
            </select>
          </div>
        </div>

        <label
          htmlFor="isOnline"
          className="flex items-center gap-2.5 bg-[var(--color-surface-2)] rounded-xl px-3.5 py-3 border border-[var(--color-border)] cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="isOnline"
            className="accent-[var(--color-primary)] w-4 h-4 rounded cursor-pointer"
            checked={form.isOnline}
            onChange={(e) => setForm({ ...form, isOnline: e.target.checked })}
          />
          <span className="text-sm font-medium text-[var(--color-text-muted)]">
            Online Etkinlik (Zoom, Teams, Meet vb.)
          </span>
        </label>

        {form.isOnline ? (
          <Input
            label="Etkinlik Bağlantısı (Link)"
            value={form.onlineLink}
            onChange={(e) => setForm({ ...form, onlineLink: e.target.value })}
            placeholder="https://..."
            icon={Globe}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Konum / Mekan"
              placeholder="Örn: D Blok Konferans Salonu"
              icon={MapPin}
              value={form.locationName}
              onChange={(e) =>
                setForm({ ...form, locationName: e.target.value })
              }
            />
            <Input
              label="Kampüs"
              placeholder="Örn: Davutpaşa"
              icon={BookOpen}
              value={form.campus}
              onChange={(e) => setForm({ ...form, campus: e.target.value })}
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-sm font-semibold text-[var(--color-text-muted)]">
            Açıklama
          </label>
          <textarea
            className="input-base min-h-20 max-h-32 resize-y"
            rows={3}
            placeholder="Etkinlik detayları, katılım koşulları vb..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="w-1/2">
          <Input
            label="Kontenjan Sınırı"
            type="number"
            min={1}
            placeholder="Sınırsız"
            icon={Users}
            value={form.maxAttendees}
            onChange={(e) => setForm({ ...form, maxAttendees: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Vazgeç
          </Button>
          <Button variant="primary" size="sm" type="submit" loading={loading}>
            Oluştur
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateEventModal;
