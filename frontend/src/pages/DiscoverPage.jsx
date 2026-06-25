import { useState, useEffect } from 'react';
import { Search, Sparkles, SlidersHorizontal, Loader2, Info } from 'lucide-react';
import UserCard from '../components/discover/UserCard.jsx';
import { discoverApi, userApi } from '../api/index.js';
import toast from 'react-hot-toast';

const DiscoverPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);

  // Fetch recommendations
  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      try {
        const { data } = await discoverApi.getRecommendations();
        setRecommendations(data.recommendations || []);
      } catch (err) {
        console.error(err);
        toast.error('Öneriler yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchMode(false);
      // Reload recommendations
      setLoading(true);
      try {
        const { data } = await discoverApi.getRecommendations();
        setRecommendations(data.recommendations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setSearchMode(true);
    try {
      const { data } = await userApi.searchUsers({ q: searchQuery.trim() });
      // Map searched users to the shape UserCard expects
      const mapped = (data.users || []).map((u) => ({
        user: u,
        score: 0,
        sharedInterests: u.interests || [],
        sharedCourses: u.courses || [],
      }));
      setRecommendations(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Arama sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 font-[Outfit]">
            Keşfet <Sparkles size={20} className="text-indigo-400" />
          </h1>
          <p className="text-xs text-[var(--color-text-faint)] mt-0.5">
            Ortak ilgi alanlarına sahip arkadaşlarını ve ders çalışma gruplarını bul
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
          <input
            type="text"
            placeholder="İsim, kullanıcı adı veya ilgi alanına göre ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-12 py-3 rounded-2xl w-full text-sm bg-[var(--color-surface-2)] border-[var(--color-border)] outline-none"
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl px-5 text-sm font-semibold transition-all btn-glow flex items-center gap-2 cursor-pointer"
        >
          <Search size={16} />
          Ara
        </button>
      </form>

      {/* Recommendation System Explanation */}
      {!searchMode && (
        <div className="flex gap-3 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-indigo-300">
          <Info size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Meetory Eşleşme Algoritması Nasıl Çalışır?</p>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              Bu puanlar ortak aldığınız dersler (+15 Puan), ortak ilgi alanlarınız (+10 Puan), aynı bölümde okuyor olmanız (+20 Puan) ve ortak takip ettiğiniz kişilere göre anlık olarak hesaplanır.
            </p>
          </div>
        </div>
      )}

      {/* Results grid */}
      <div>
        <h2 className="text-lg font-bold mb-4 font-[Outfit]">
          {searchMode ? 'Arama Sonuçları' : 'Senin İçin Önerilenler'}
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : recommendations.length === 0 ? (
          <div className="glass p-12 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center text-[var(--color-text-muted)]">
              👥
            </div>
            <h3 className="text-base font-semibold">Sonuç Bulunamadı</h3>
            <p className="text-sm text-[var(--color-text-faint)] max-w-sm">
              {searchMode
                ? 'Arama kriterlerine uygun hiçbir kullanıcı bulamadık. Kelimeleri kontrol edip tekrar dene.'
                : 'Şu an için yeni bir öneri bulamadık. Daha fazla ilgi alanı eklemeyi dene!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <UserCard key={rec.user._id} recommendation={rec} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
