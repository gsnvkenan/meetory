import { useState } from 'react';
import { Tag, ShoppingBag, MessageSquare, Trash2, MapPin } from 'lucide-react';
import Button from '../common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { marketApi, chatApi } from '../../api/index.js';
import { useNavigate } from 'react-router-dom';
import { useLightboxStore } from '../../context/useLightboxStore.js';
import toast from 'react-hot-toast';

const categoryLabels = {
  notes: { text: 'Ders Notu', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  book: { text: 'Kitap', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  electronics: { text: 'Elektronik', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  clothing: { text: 'Giyim', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  furniture: { text: 'Eşya/Mobilya', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  other: { text: 'Diğer', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

const conditionLabels = {
  new: 'Sıfır',
  like_new: 'Yeni Gibi',
  good: 'İyi',
  fair: 'Orta',
  poor: 'Yıpranmış',
};

const ListingCard = ({ listing, onDelete }) => {
  const { user } = useAuth();
  const { openLightbox } = useLightboxStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const isSeller = listing.seller?._id === user?._id || listing.seller === user?._id;
  const cat = categoryLabels[listing.category] || categoryLabels.other;

  const handleContact = async () => {
    setLoading(true);
    try {
      // 1. Create or get existing conversation
      await chatApi.getOrCreateConversation(listing.seller._id);
      // 2. Redirect to chat
      toast.success('Satıcı ile sohbet başlatıldı 💬');
      navigate('/chat');
    } catch {
      toast.error('Bağlantı kurulamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bu ilanı silmek istediğine emin misin?')) return;
    try {
      await marketApi.deleteListing(listing._id);
      toast.success('İlan kaldırıldı');
      if (onDelete) onDelete(listing._id);
    } catch {
      toast.error('İlan silinemedi');
    }
  };

  return (
    <div className="glass overflow-hidden flex flex-col border border-[var(--color-border)] hover:shadow-[0_0_30px_rgba(99,102,241,0.12)] transition-all fade-in">
      {/* Product Image */}
      <div className="h-44 bg-[var(--color-surface-2)] relative">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => openLightbox(listing.images[0])}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-indigo-950/30 to-violet-950/30 flex items-center justify-center font-bold text-xs tracking-wider text-[var(--color-text-faint)]">
            FOTOĞRAF YOK
          </div>
        )}

        {/* Category badge */}
        <span className={`absolute top-3 left-3 text-xs px-2.5 py-0.5 rounded-full border font-semibold backdrop-blur-md ${cat.color}`}>
          {cat.text}
        </span>

        {/* Price tag */}
        <span className="absolute bottom-3 right-3 text-xs px-2.5 py-1 rounded-lg font-bold bg-emerald-600 text-white shadow-lg">
          {listing.isFree ? 'Ücretsiz' : `${listing.price} TL`}
        </span>

        {/* Seller delete button */}
        {isSeller && (
          <button
            onClick={handleDelete}
            title="İlanı Sil"
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 text-red-400 hover:bg-black/60 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Details Box */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-sm line-clamp-1 flex-1">{listing.title}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--color-surface-3)] text-[var(--color-text-muted)] shrink-0 border border-[var(--color-border)]">
              {conditionLabels[listing.condition] || 'İyi'}
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-faint)] line-clamp-2 mt-1">
            {listing.description || 'Açıklama belirtilmemiş.'}
          </p>
        </div>

        {/* Location & Seller Info */}
        <div className="mt-auto pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] min-w-0">
            <MapPin size={12} className="text-indigo-400 shrink-0" />
            <span className="truncate">
              {listing.campus ? `${listing.campus} Kampüsü` : listing.university}
            </span>
          </div>

          {!isSeller && (
            <Button
              variant="outline"
              size="sm"
              loading={loading}
              onClick={handleContact}
              icon={MessageSquare}
              className="text-xs px-3 py-1 gap-1.5"
            >
              Satıcıya Yaz
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
