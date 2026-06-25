import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, MessageCircle, Bookmark, MoreHorizontal,
  Share2, Trash2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import Avatar from '../common/Avatar.jsx';
import { postApi } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLightboxStore } from '../../context/useLightboxStore.js';
import toast from 'react-hot-toast';

const PostCard = ({ post, onDelete, onBookmarkToggle }) => {
  const { user } = useAuth();
  const { openLightbox } = useLightboxStore();
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? post.likes?.length ?? 0);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);

  const isOwner = user?._id === post.author?._id || user?._id === post.author;

  const handleLike = async () => {
    setLiked((p) => !p);
    setLikeCount((p) => (liked ? p - 1 : p + 1));
    try {
      await postApi.toggleLike(post._id);
    } catch {
      setLiked((p) => !p);
      setLikeCount((p) => (liked ? p + 1 : p - 1));
    }
  };

  const handleBookmark = async () => {
    const nextState = !bookmarked;
    setBookmarked(nextState);
    try {
      await postApi.toggleBookmark(post._id);
      toast.success(nextState ? 'Kaydedildi' : 'Kaydedilenlerden çıkarıldı');
      onBookmarkToggle?.(post._id, nextState);
    } catch {
      setBookmarked(!nextState);
    }
  };

  const handleDelete = async () => {
    try {
      await postApi.deletePost(post._id);
      toast.success('Gönderi silindi');
      onDelete?.(post._id);
    } catch {
      toast.error('Silinemedi');
    }
    setShowMenu(false);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const { data } = await postApi.addComment(post._id, { content: comment });
      setComments((p) => [...p, data.comment]);
      setComment('');
    } catch {
      toast.error('Yorum eklenemedi');
    }
  };

  const author = post.author;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: tr,
  });

  return (
    <article className="glass p-5 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <Link
          to={`/profile/${author?.username}`}
          className="flex items-center gap-3 group"
        >
          <Avatar src={author?.avatar} name={author?.name} size="sm" />
          <div>
            <p className="font-semibold text-sm group-hover:text-indigo-400 transition-colors">
              {author?.name}
            </p>
            <p className="text-xs text-[var(--color-text-faint)]">
              @{author?.username} · {timeAgo}
            </p>
          </div>
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowMenu((p) => !p)}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-3)] text-[var(--color-text-faint)] transition-colors"
          >
            <MoreHorizontal size={18} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 z-10 glass p-1 min-w-[140px] shadow-xl">
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={14} /> Sil
                </button>
              )}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + `/post/${post._id}`);
                  toast.success('Bağlantı kopyalandı');
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)] rounded-lg transition-colors"
              >
                <Share2 size={14} /> Paylaş
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-sm leading-relaxed text-[var(--color-text)] mb-3 whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* Media */}
      {post.media?.length > 0 && (
        <div
          className={`grid gap-2 mb-3 rounded-xl overflow-hidden ${
            post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}
        >
          {post.media.map((m, i) =>
            m.type === 'video' ? (
              <video
                key={i}
                src={m.url}
                controls
                className="w-full rounded-lg max-h-80 object-cover"
              />
            ) : (
              <img
                key={i}
                src={m.url}
                alt=""
                className="w-full rounded-lg max-h-80 object-cover hover:opacity-95 transition-opacity cursor-pointer"
                onClick={() => openLightbox(m.url)}
              />
            )
          )}
        </div>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-[var(--color-border)]">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            liked ? 'text-red-400' : 'text-[var(--color-text-faint)] hover:text-red-400'
          }`}
        >
          <Heart size={18} className={liked ? 'fill-red-400' : ''} />
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>

        <button
          onClick={() => setShowComments((p) => !p)}
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-faint)] hover:text-indigo-400 transition-colors"
        >
          <MessageCircle size={18} />
          {comments.length > 0 && <span>{comments.length}</span>}
        </button>

        <button
          onClick={handleBookmark}
          className={`flex items-center gap-1.5 text-sm transition-colors ml-auto ${
            bookmarked
              ? 'text-amber-400'
              : 'text-[var(--color-text-faint)] hover:text-amber-400'
          }`}
        >
          <Bookmark size={18} className={bookmarked ? 'fill-amber-400' : ''} />
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-4 space-y-3 pt-3 border-t border-[var(--color-border)]">
          {comments.map((c) => (
            <div key={c._id} className="flex gap-2">
              <Avatar src={c.author?.avatar} name={c.author?.name} size="xs" />
              <div className="flex-1 bg-[var(--color-surface-3)] rounded-xl px-3 py-2">
                <p className="text-xs font-semibold text-indigo-400">{c.author?.name}</p>
                <p className="text-sm mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}

          <form onSubmit={handleComment} className="flex gap-2">
            <Avatar src={user?.avatar} name={user?.name} size="xs" />
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Yorum yaz..."
              className="input-base flex-1 py-2 text-sm"
            />
          </form>
        </div>
      )}
    </article>
  );
};

export default PostCard;
