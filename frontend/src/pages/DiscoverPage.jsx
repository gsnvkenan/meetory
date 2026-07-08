import { useState, useEffect } from "react";
import { Search, Sparkles, Loader2, Info, Users } from "lucide-react";
import UserCard from "../components/discover/UserCard.jsx";
import { discoverApi, userApi } from "../api/index.js";
import toast from "react-hot-toast";

const DiscoverPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
        toast.error("Error loading recommendations.");
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
      toast.error("An error occurred during search.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-7 fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-heading text-2xl md:text-3xl flex items-center gap-2.5">
            Discover
            <span className="chip chip-blue">
              <Sparkles size={12} />
              Meetory
            </span>
          </h1>
          <p className="text-sm text-[var(--color-text-faint)] mt-1.5">
            Find friends and study groups with shared interests
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]"
          />
          <input
            type="text"
            placeholder="Search by name, username, or interests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] pl-12 pr-5 py-3.5 shadow-sm outline-none transition-all focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_rgba(34,88,214,0.12)]"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 inline-flex items-center gap-2 rounded-full px-6 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 btn-glow transition-all cursor-pointer"
        >
          <Search size={16} />
          Search
        </button>
      </form>

      {/* Recommendation System Explanation */}
      {!searchMode && (
        <div className="card p-5 flex gap-4 items-start bg-[var(--color-surface)]">
          <div className="chip chip-blue !p-2.5 shrink-0">
            <Info size={16} />
          </div>
          <div>
            <p className="font-semibold text-sm mb-1.5 flex items-center gap-2">
              How Does the Meetory Matching Algorithm Work?
            </p>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-2.5">
              These scores are calculated instantly based on the following criteria:
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="chip chip-emerald">Shared Courses +15</span>
              <span className="chip chip-violet">Shared Interests +10</span>
              <span className="chip chip-blue">Same Department +20</span>
              <span className="chip chip-amber">Mutual Follows</span>
            </div>
          </div>
        </div>
      )}

      {/* Results grid */}
      <div>
        <h2 className="page-heading text-lg mb-4 flex items-center gap-2">
          <Users size={18} className="text-[var(--color-primary)]" />
          {searchMode ? "Search Results" : "Recommended for You"}
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
          </div>
        ) : recommendations.length === 0 ? (
          <div className="card p-12 text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-muted)] text-2xl">
              👥
            </div>
            <h3 className="text-base font-semibold">No Results Found</h3>
            <p className="text-sm text-[var(--color-text-faint)] max-w-sm">
              {searchMode
                ? "We couldn't find any users matching your search criteria. Check your spelling and try again."
                : "We couldn't find any recommendations for now. Try adding more interests!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
