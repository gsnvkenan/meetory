import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2, Bookmark } from "lucide-react";
import PostCard from "../components/feed/PostCard.jsx";
import { postApi } from "../api/index.js";
import toast from "react-hot-toast";

const SavedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  const fetchSavedPosts = useCallback(async (pageNum, isLoadMore = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const { data } = await postApi.getFeed({
        tab: "bookmarks",
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
      toast.error("Error loading saved posts.");
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchSavedPosts(1, false);
  }, [fetchSavedPosts]);

  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSavedPosts(nextPage, true);
    }
  }, [inView, hasMore, loading, loadingMore, page, fetchSavedPosts]);

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  };

  const handleBookmarkToggled = (postId, isBookmarked) => {
    if (!isBookmarked) {
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    }
  };

  return (
    <div className="space-y-7 fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="page-heading text-2xl md:text-3xl flex items-center gap-2.5">
          Saved
          <span className="chip chip-amber">
            <Bookmark size={12} />
            {posts.length}
          </span>
        </h1>
        <p className="text-sm text-[var(--color-text-faint)] mt-1.5">
          Posts you've saved to look at later
        </p>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
            <Bookmark size={22} />
          </div>
          <h3 className="text-base font-semibold">
            No saved posts yet
          </h3>
          <p className="text-sm text-[var(--color-text-faint)] max-w-sm">
            You can save posts here to read them later by clicking the bookmark
            icon on the bottom right of the posts.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={handlePostDeleted}
              onBookmarkToggle={handleBookmarkToggled}
            />
          ))}

          {/* Load more */}
          {hasMore && (
            <div ref={ref} className="flex justify-center py-6">
              {loadingMore ? (
                <Loader2 className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
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

export default SavedPage;
