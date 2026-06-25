import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Plus, Loader2, SlidersHorizontal } from 'lucide-react';
import ListingCard from '../components/market/ListingCard.jsx';
import CreateListingModal from '../components/market/CreateListingModal.jsx';
import { marketApi } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const categories = [
  { value: '', label: 'Tüm İlanlar' },
  { value: 'notes', label: 'Ders Notu' },
  { value: 'book', label: 'Kitap' },
  { value: 'electronics', label: 'Elektronik' },
  { value: 'clothing', label: 'Giyim' },
  { value: 'furniture', label: 'Eşya' },
  { value: 'other', label: 'Diğer' },
];

const MarketPage = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (freeOnly) params.isFree = 'true';
      // University filter automatically handled by backend via JWT
      
      const { data } = await marketApi.getListings(params);
      setListings(data.listings || []);
    } catch (err) {
      console.error(err);
      toast.error('İlanlar yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, freeOnly]);

  useEffect(() => {
    fetchListings();
  }, [categoryFilter, freeOnly, fetchListings]);

  const handleCreated = (newListing) => {
    if ((!categoryFilter || newListing.category === categoryFilter) && (!freeOnly || newListing.isFree)) {
      setListings((prev) => [newListing, ...prev]);
    }
  };

  const handleDeleted = (deletedId) => {
    setListings((prev) => prev.filter((l) => l._id !== deletedId));
  };

  return (
    <div className="space-y-6 fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 font-[Outfit]">
            Öğrenci Pazarı <ShoppingBag size={20} className="text-indigo-400" />
          </h1>
          <p className="text-xs text-[var(--color-text-faint)] mt-0.5">
            Ders notu, kitap veya eşyalarını sat, satın al ya da ücretsiz paylaş
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all btn-glow cursor-pointer"
        >
          <Plus size={16} />
          İlan Ver
        </button>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col gap-3">
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

        {/* Free toggle */}
        <div className="flex items-center gap-2 pl-1 select-none">
          <input
            type="checkbox"
            id="freeOnly"
            checked={freeOnly}
            onChange={(e) => setFreeOnly(e.target.checked)}
            className="accent-indigo-600 rounded cursor-pointer"
          />
          <label htmlFor="freeOnly" className="text-xs font-semibold text-[var(--color-text-muted)] cursor-pointer">
            Sadece ücretsiz paylaşılan ilanları göster
          </label>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <div className="glass p-12 text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <ShoppingBag size={20} />
          </div>
          <h3 className="text-base font-semibold">Aktif İlan Bulunmuyor</h3>
          <p className="text-sm text-[var(--color-text-faint)] max-w-sm">
            {categoryFilter
              ? 'Seçilen kategoride şu an aktif bir ilan bulunmuyor.'
              : 'Henüz yayında olan bir ilan bulunmuyor. İlk ilanı vererek satışa başla!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
