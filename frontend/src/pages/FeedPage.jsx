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
        toast.error("Error loading feed.");
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
            Main Feed
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-500">
              <Sparkles size={16} />
            </span>
          </h1>
          <p className="text-sm text-[var(--color-text-faint)] mt-1">
            What's happening in {user?.university} Campus?
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-[var(--color-surface-2)] p-1.5 rounded-full border border-[var(--color-border)] self-start md:self-center">
          <button
            onClick={() => setTab("campus")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              tab === "campus"
                ? "bg-blue-500 text-white shadow-md"
                : "text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
            }`}
          >
            My Campus
          </button>
          <button
            onClick={() => setTab("following")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              tab === "following"
                ? "bg-blue-500 text-white shadow-md"
                : "text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
            }`}
          >
            Following
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
          <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-2xl">
            👋
          </div>
          <h3 className="text-base font-semibold">It's a bit quiet here...</h3>
          <p className="text-sm text-[var(--color-text-faint)] max-w-sm">
            {tab === "campus"
              ? "There are no posts shared on your campus yet. Be the first to share!"
              : "You are not following anyone yet, or they haven't posted anything."}
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
