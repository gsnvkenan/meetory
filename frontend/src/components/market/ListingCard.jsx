import { useState } from "react";
import { ShoppingBag, MessageSquare, Trash2, MapPin } from "lucide-react";
import Button from "../common/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { marketApi, chatApi } from "../../api/index.js";
import { useNavigate } from "react-router-dom";
import { useLightboxStore } from "../../context/useLightboxStore.js";
import toast from "react-hot-toast";

const categoryLabels = {
  notes: { text: "Lecture Notes", chip: "chip-emerald" },
  book: { text: "Book", chip: "chip-blue" },
  electronics: { text: "Electronics", chip: "chip-violet" },
  clothing: { text: "Clothing", chip: "chip-rose" },
  furniture: { text: "Furniture/Item", chip: "chip-amber" },
  other: { text: "Other", chip: "chip-slate" },
};

const conditionLabels = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
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
      toast.success("Started chat with seller 💬");
      navigate("/chat");
    } catch {
      toast.error("Failed to connect");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await marketApi.deleteListing(listing._id);
      toast.success("Listing removed");
      if (onDelete) onDelete(listing._id);
    } catch {
      toast.error("Failed to delete listing");
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
          <div className="w-full h-full bg-[var(--color-surface-2)] flex items-center justify-center gap-2 text-[var(--color-text-faint)]">
            <ShoppingBag size={20} />
            <span className="font-bold text-xs tracking-wider uppercase">
              No Image
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
          className={`chip absolute bottom-3 right-3 shadow-md border-transparent ${listing.isFree
              ? "bg-emerald-500 text-white"
              : "bg-blue-500 text-white"
            }`}
        >
          {listing.isFree ? "Free" : `${listing.price} GEL`}
        </span>

        {/* Seller delete button */}
        {isSeller && (
          <button
            onClick={handleDelete}
            title="Delete Listing"
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
              {conditionLabels[listing.condition] || "Good"}
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-faint)] line-clamp-2 mt-1.5">
            {listing.description || "No description specified."}
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
                ? `${listing.campus} Campus`
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
              Contact Seller
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
