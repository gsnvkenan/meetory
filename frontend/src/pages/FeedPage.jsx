import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2, Sparkles } from "lucide-react";
import CreatePost from "../components/feed/CreatePost.jsx";
import PostCard from "../components/feed/PostCard.jsx";
import { postApi } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const FeedPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("campus"); // 'campus' or 'following'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  const fetchFeed = useCallback(
    async (pageNum, activeTab, isLoadMore = false) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const { data } = await postApi.getFeed({
          tab: activeTab,
          page: pageNum,
          limit: 10,
        });
        if (isLoadMore) {
          setPosts((prev) => [...prev, ...data.posts]);
        } else {
          setPosts(data.posts);
        }
        setHasMore(pageNum < data.pagination.pages);
      } catch (err) {
        toast.error("Akış yüklenirken hata oluştu.");
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  // Fetch initial feed when tab changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchFeed(1, tab, false);
  }, [tab, fetchFeed]);

  // Load more when scrolling to bottom
  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage, tab, true);
    }
  }, [inView, hasMore, loading, loadingMore, page, tab, fetchFeed]);

  const handlePostCreated = (newPost) => {
    // Optimistically add new post to the top of the feed if visibility matches tab constraints
    // If visibility is 'campus' or we're on campus feed, show it.
    // Or if we're on 'following' feed and it's our post, show it.
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  };

  return (
    <div className="space-y-6 fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-heading text-2xl md:text-3xl flex items-center gap-2.5">
            Ana Akış
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/12 to-violet-500/12 text-indigo-500">
              <Sparkles size={16} />
            </span>
          </h1>
          <p className="text-sm text-[var(--color-text-faint)] mt-1">
            {user?.university} Kampüsü'nde neler oluyor?
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-[var(--color-surface-2)] p-1.5 rounded-full border border-[var(--color-border)] self-start md:self-center">
          <button
            onClick={() => setTab("campus")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              tab === "campus"
                ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md"
                : "text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
            }`}
          >
            Kampüsüm
          </button>
          <button
            onClick={() => setTab("following")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              tab === "following"
                ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md"
                : "text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
            }`}
          >
            Takip Ettiklerim
          </button>
        </div>
      </div>

      {/* Share Box */}
      <CreatePost onCreated={handlePostCreated} />

      {/* Feed list */}
      {loading ? (
        <div className="card flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 flex items-center justify-center text-2xl">
            👋
          </div>
          <h3 className="text-base font-semibold">Burası biraz sessiz...</h3>
          <p className="text-sm text-[var(--color-text-faint)] max-w-sm">
            {tab === "campus"
              ? "Henüz kampüsünde paylaşılmış bir gönderi yok. İlk paylaşımı sen yap!"
              : "Henüz takip ettiğin kimse yok veya takip ettiklerin henüz paylaşım yapmadı."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />
          ))}

          {/* Load more indicator */}
          {hasMore && (
            <div ref={ref} className="flex justify-center py-6">
              {loadingMore ? (
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
              ) : (
                <div className="h-4" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedPage;
