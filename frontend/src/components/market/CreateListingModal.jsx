import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Tag, ShoppingBag, Info } from 'lucide-react';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import { marketApi } from '../../api/index.js';
import toast from 'react-hot-toast';

const CreateListingModal = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'notes',
    price: '',
    isFree: false,
    condition: 'good',
    campus: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Limit to max 3 images
    if (files.length + imageFiles.length > 3) {
      toast.error('En fazla 3 adet fotoğraf ekleyebilirsin.');
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('İlan başlığı gereklidir');
      return;
    }
    if (!form.isFree && (!form.price || Number(form.price) <= 0)) {
      toast.error('Lütfen geçerli bir fiyat belirtin veya ilanı ücretsiz yapın.');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('description', form.description.trim());
      fd.append('category', form.category);
      fd.append('price', form.isFree ? 0 : Number(form.price));
      fd.append('isFree', form.isFree);
      fd.append('condition', form.condition);
      fd.append('campus', form.campus.trim());
      
      // Append image files
      imageFiles.forEach((file) => {
        fd.append('images', file); // 'images' matches backend multiselect name
      });

      const { data } = await marketApi.createListing(fd);
      toast.success('İlan başarıyla yayınlandı! 🛍️');
      if (onCreated) onCreated(data.listing);
      
      // Reset form
      setForm({
        title: '',
        description: '',
        category: 'notes',
        price: '',
        isFree: false,
        condition: 'good',
        campus: '',
      });
      setImageFiles([]);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'İlan oluşturulurken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Content Container */}
      <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl fade-in">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-4">
          <h2 className="text-xl font-bold font-[Outfit]">Yeni İlan Ver</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] text-[var(--color-text-faint)]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Images preview / Upload */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-2 uppercase">İlan Fotoğrafları (En fazla 3 adet)</label>
            <div className="flex flex-wrap items-center gap-3">
              {imageFiles.map((file, idx) => (
                <div key={idx} className="relative w-20 h-16 rounded-xl bg-[var(--color-surface-2)] overflow-hidden border border-[var(--color-border)]">
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] hover:bg-red-600 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {imageFiles.length < 3 && (
                <label className="w-20 h-16 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] cursor-pointer flex flex-col items-center justify-center text-[var(--color-text-faint)] hover:text-[var(--color-text)] transition-colors">
                  <Camera size={18} />
                  <span className="text-[10px] mt-1">Ekle</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <Input
            label="İlan Başlığı"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Örn: Temiz İkinci El Grafik Tablet"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                Kategori
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-base"
              >
                <option value="notes">Ders Notu</option>
                <option value="book">Kitap</option>
                <option value="electronics">Elektronik</option>
                <option value="clothing">Giyim / Aksesuar</option>
                <option value="furniture">Eşya / Mobilya</option>
                <option value="other">Diğer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                Kullanım Durumu
              </label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="input-base"
              >
                <option value="new">Sıfır / Kutusunda</option>
                <option value="like_new">Yeni Gibi / Çok Az Kullanılmış</option>
                <option value="good">İyi / Sorunsuz</option>
                <option value="fair">Orta / Eskimiş</option>
                <option value="poor">Yıpranmış</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Fiyat (TL)"
                type="number"
                placeholder={form.isFree ? 'Ücretsiz' : '0.00'}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                disabled={form.isFree}
                required={!form.isFree}
              />
            </div>
            
            <div className="flex flex-col justify-end pb-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isFree}
                  onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                  className="accent-indigo-600 rounded"
                />
                Bu ürünü ücretsiz veriyorum
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Kampüs (Teslim Yeri)"
              placeholder="Ayazağa, Beşiktaş vb."
              value={form.campus}
              onChange={(e) => setForm({ ...form, campus: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Vazgeç
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={loading}>
              İlanı Yayınla
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListingModal;
