import { useState } from "react";
import { ShoppingBag, MessageSquare, Trash2, MapPin } from "lucide-react";
import Button from "../common/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { marketApi, chatApi } from "../../api/index.js";
import { useNavigate } from "react-router-dom";
import { useLightboxStore } from "../../context/useLightboxStore.js";
import toast from "react-hot-toast";

const categoryLabels = {
  notes: { text: "Ders Notu", chip: "chip-emerald" },
  book: { text: "Kitap", chip: "chip-blue" },
  electronics: { text: "Elektronik", chip: "chip-violet" },
  clothing: { text: "Giyim", chip: "chip-rose" },
  furniture: { text: "Eşya/Mobilya", chip: "chip-amber" },
  other: { text: "Diğer", chip: "chip-slate" },
};

const conditionLabels = {
  new: "Sıfır",
  like_new: "Yeni Gibi",
  good: "İyi",
  fair: "Orta",
  poor: "Yıpranmış",
};

const ListingCard = ({ listing, onDelete }) => {
  const { user } = useAuth();
  const { openLightbox } = useLightboxStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const isSeller =
    listing.seller?._id === user?._id || listing.seller === user?._id;
  const cat = categoryLabels[listing.category] || categoryLabels.other;

  const handleContact = async () => {
    setLoading(true);
    try {
      // 1. Create or get existing conversation
      await chatApi.getOrCreateConversation(listing.seller._id);
      // 2. Redirect to chat
      toast.success("Satıcı ile sohbet başlatıldı 💬");
      navigate("/chat");
    } catch {
      toast.error("Bağlantı kurulamadı");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bu ilanı silmek istediğine emin misin?")) return;
    try {
      await marketApi.deleteListing(listing._id);
      toast.success("İlan kaldırıldı");
      if (onDelete) onDelete(listing._id);
    } catch {
      toast.error("İlan silinemedi");
    }
  };

  return (
    <div className="card card-hover overflow-hidden flex flex-col fade-in">
      {/* Product Image */}
      <div className="h-48 bg-[var(--color-surface-2)] relative overflow-hidden">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover cursor-pointer hover:scale-[1.03] transition-transform duration-300"
            onClick={() => openLightbox(listing.images[0])}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--color-surface-2)] to-[var(--color-surface-3)] flex items-center justify-center gap-2 text-[var(--color-text-faint)]">
            <ShoppingBag size={20} />
            <span className="font-bold text-xs tracking-wider uppercase">
              Fotoğraf Yok
            </span>
          </div>
        )}

        {/* Category badge */}
        <span
          className={`chip ${cat.chip} absolute top-3 left-3 shadow-sm bg-[var(--color-surface)]`}
        >
          {cat.text}
        </span>

        {/* Price tag */}
        <span
          className={`chip absolute bottom-3 right-3 shadow-md border-transparent ${
            listing.isFree
              ? "bg-gradient-to-br from-[#12b76a] to-[#0d9488] text-white"
              : "bg-gradient-to-br from-[#2258d6] to-[#4c6ef0] text-white"
          }`}
        >
          {listing.isFree ? "Ücretsiz" : `${listing.price} TL`}
        </span>

        {/* Seller delete button */}
        {isSeller && (
          <button
            onClick={handleDelete}
            title="İlanı Sil"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/45 hover:bg-red-500/90 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Details Box */}
      <div className="p-5 flex-1 flex flex-col gap-3.5">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-sm text-[var(--color-text)] line-clamp-1 flex-1">
              {listing.title}
            </h3>
            <span className="chip chip-slate shrink-0">
              {conditionLabels[listing.condition] || "İyi"}
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-faint)] line-clamp-2 mt-1.5">
            {listing.description || "Açıklama belirtilmemiş."}
          </p>
        </div>

        {/* Location & Seller Info */}
        <div className="mt-auto pt-3.5 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] min-w-0">
            <MapPin
              size={13}
              className="text-[var(--color-primary)] shrink-0"
            />
            <span className="truncate">
              {listing.campus
                ? `${listing.campus} Kampüsü`
                : listing.university}
            </span>
          </div>

          {!isSeller && (
            <Button
              variant="outline"
              size="sm"
              loading={loading}
              onClick={handleContact}
              icon={MessageSquare}
              className="shrink-0"
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
