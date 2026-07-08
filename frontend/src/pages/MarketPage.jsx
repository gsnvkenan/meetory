import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  Sparkles,
  Plus,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import ListingCard from "../components/market/ListingCard.jsx";
import CreateListingModal from "../components/market/CreateListingModal.jsx";
import Button from "../components/common/Button.jsx";
import { marketApi } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const categories = [
  { value: "", label: "All Listings" },
  { value: "notes", label: "Lecture Notes" },
  { value: "book", label: "Book" },
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "furniture", label: "Furniture" },
  { value: "other", label: "Other" },
];

const MarketPage = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (freeOnly) params.isFree = "true";
      // University filter automatically handled by backend via JWT

      const { data } = await marketApi.getListings(params);
      setListings(data.listings || []);
    } catch (err) {
      console.error(err);
      toast.error("Error loading listings.");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, freeOnly]);

  useEffect(() => {
    fetchListings();
  }, [categoryFilter, freeOnly, fetchListings]);

  const handleCreated = (newListing) => {
    if (
      (!categoryFilter || newListing.category === categoryFilter) &&
      (!freeOnly || newListing.isFree)
    ) {
      setListings((prev) => [newListing, ...prev]);
    }
  };

  const handleDeleted = (deletedId) => {
    setListings((prev) => prev.filter((l) => l._id !== deletedId));
  };

  return (
    <div className="space-y-7 fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl brand-badge flex items-center justify-center text-white shrink-0">
            <ShoppingBag size={22} />
          </div>
          <div>
            <h1 className="page-heading text-2xl sm:text-3xl text-[var(--color-text)]">
              Student Market
            </h1>
            <p className="text-sm text-[var(--color-text-faint)] mt-1">
              Sell, buy, or share lecture notes, books, or items for free
            </p>
          </div>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          icon={Plus}
          className="shrink-0"
        >
          Post a Listing
        </Button>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col gap-3.5">
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

        {/* Free toggle */}
        <label
          htmlFor="freeOnly"
          className="inline-flex items-center gap-2 pl-1 select-none cursor-pointer w-fit"
        >
          <input
            type="checkbox"
            id="freeOnly"
            checked={freeOnly}
            onChange={(e) => setFreeOnly(e.target.checked)}
            className="accent-[var(--color-primary)] w-4 h-4 rounded cursor-pointer"
          />
          <span className="text-xs font-semibold text-[var(--color-text-muted)]">
            Only show free listings
          </span>
        </label>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <div className="card p-12 md:p-16 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
            <ShoppingBag size={24} />
          </div>
          <h3 className="text-base font-bold page-heading">
            No Active Listings
          </h3>
          <p className="text-sm text-[var(--color-text-faint)] max-w-sm">
            {categoryFilter
              ? "There are currently no active listings in the selected category."
              : "There are no listings published yet. Start selling by posting the first listing!"}
          </p>
          <Button
            onClick={() => setModalOpen(true)}
            icon={Sparkles}
            size="sm"
            className="mt-1"
          >
            Create First Listing
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              onDelete={handleDeleted}
            />
          ))}
        </div>
      )}

      {/* Listing creation modal */}
      <CreateListingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
};

export default MarketPage;
