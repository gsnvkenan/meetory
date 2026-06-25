import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2, Bookmark } from 'lucide-react';
import PostCard from '../components/feed/PostCard.jsx';
import { postApi } from '../api/index.js';
import toast from 'react-hot-toast';

const SavedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  const fetchSavedPosts = useCallback(async (pageNum, isLoadMore = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const { data } = await postApi.getFeed({ tab: 'bookmarks', page: pageNum, limit: 10 });
      if (isLoadMore) {
        setPosts((prev) => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }
      setHasMore(pageNum < data.pagination.pages);
    } catch (err) {
      toast.error('Kaydedilen gönderiler yüklenirken hata oluştu.');
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
    <div className="space-y-6 fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 font-[Outfit]">
            Kaydedilenler <Bookmark size={20} className="text-primary fill-primary/10" />
          </h1>
          <p className="text-xs text-[var(--color-text-faint)] mt-0.5">
            Daha sonra bakmak üzere kaydettiğin gönderiler
          </p>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="glass p-12 text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Bookmark size={20} />
          </div>
          <h3 className="text-base font-semibold">Henüz kaydedilen gönderi yok</h3>
          <p className="text-sm text-[var(--color-text-faint)] max-w-sm">
            Gönderilerin sağ altındaki yer işareti simgesine tıklayarak gönderileri daha sonra okumak üzere buraya kaydedebilirsin.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
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
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
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
