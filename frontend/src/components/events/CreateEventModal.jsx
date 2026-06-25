import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Calendar, MapPin, Users, Globe, BookOpen } from 'lucide-react';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import { eventApi } from '../../api/index.js';
import toast from 'react-hot-toast';

const CreateEventModal = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'other',
    startDate: '',
    locationName: '',
    campus: '',
    maxAttendees: '',
    isOnline: false,
    onlineLink: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Etkinlik başlığı gereklidir');
      return;
    }
    if (!form.startDate) {
      toast.error('Etkinlik tarihi gereklidir');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('description', form.description.trim());
      fd.append('category', form.category);
      fd.append('startDate', new Date(form.startDate).toISOString());
      fd.append('locationName', form.locationName.trim());
      fd.append('campus', form.campus.trim());
      fd.append('isOnline', form.isOnline);
      if (form.isOnline) {
        fd.append('onlineLink', form.onlineLink.trim());
      }
      if (form.maxAttendees) {
        fd.append('maxAttendees', Number(form.maxAttendees));
      }
      if (imageFile) {
        fd.append('coverImage', imageFile);
      }

      const { data } = await eventApi.createEvent(fd);
      toast.success('Etkinlik oluşturuldu! 📅');
      if (onCreated) onCreated(data.event);
      // Reset form
      setForm({
        title: '',
        description: '',
        category: 'other',
        startDate: '',
        locationName: '',
        campus: '',
        maxAttendees: '',
        isOnline: false,
        onlineLink: '',
      });
      setImageFile(null);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Etkinlik oluşturulurken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Content wrapper */}
      <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl fade-in">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-4">
          <h2 className="text-xl font-bold font-[Outfit]">Yeni Etkinlik Oluştur</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] text-[var(--color-text-faint)]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Banner cover input */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-2 uppercase">Kapak Görseli</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-14 rounded-xl bg-[var(--color-surface-2)] overflow-hidden border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-faint)]">
                {imageFile ? (
                  <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Calendar size={20} />
                )}
              </div>
              <label className="p-2 rounded-xl bg-[var(--color-surface-3)] hover:bg-[var(--color-border)] text-xs text-[var(--color-text-muted)] cursor-pointer transition-colors border border-[var(--color-border)] flex items-center gap-1.5">
                <Camera size={14} /> Seç
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
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5 uppercase">Kategori</label>
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

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="isOnline"
              className="accent-indigo-600 rounded cursor-pointer"
              checked={form.isOnline}
              onChange={(e) => setForm({ ...form, isOnline: e.target.checked })}
            />
            <label htmlFor="isOnline" className="text-xs font-medium text-[var(--color-text-muted)] cursor-pointer">
              Online Etkinlik (Zoom, Teams, Meet vb.)
            </label>
          </div>

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
                onChange={(e) => setForm({ ...form, locationName: e.target.value })}
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

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5 uppercase">Açıklama</label>
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

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Vazgeç
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={loading}>
              Oluştur
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CreateEventModal;
