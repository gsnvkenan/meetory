import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Share2,
  Trash2,
  SendHorizontal,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import Avatar from "../common/Avatar.jsx";
import { postApi } from "../../api/index.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLightboxStore } from "../../context/useLightboxStore.js";
import toast from "react-hot-toast";

const PostCard = ({ post, onDelete, onBookmarkToggle }) => {
  const { user } = useAuth();
  const { openLightbox } = useLightboxStore();
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(
    post.likeCount ?? post.likes?.length ?? 0,
  );
  const [bookmarked, setBookmarked] = useState(post.isBookmarked);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
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
      toast.success(nextState ? "Saved" : "Removed from saved posts");
      onBookmarkToggle?.(post._id, nextState);
    } catch {
      setBookmarked(!nextState);
    }
  };

  const handleDelete = async () => {
    try {
      await postApi.deletePost(post._id);
      toast.success("Post deleted");
      onDelete?.(post._id);
    } catch {
      toast.error("Failed to delete");
    }
    setShowMenu(false);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const { data } = await postApi.addComment(post._id, { content: comment });
      setComments((p) => [...p, data.comment]);
      setComment("");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const author = post.author;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: enUS,
  });

  return (
    <article className="card card-hover p-5 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <Link
          to={`/profile/${author?.username}`}
          className="flex items-center gap-3 group"
        >
          <Avatar src={author?.avatar} name={author?.name} size="sm" />
          <div>
            <p className="font-semibold text-sm group-hover:text-indigo-500 transition-colors">
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
            className="p-1.5 rounded-full hover:bg-[var(--color-surface-2)] text-[var(--color-text-faint)] transition-colors"
          >
            <MoreHorizontal size={18} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-9 z-10 glass p-1.5 min-w-[150px] shadow-xl">
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    window.location.origin + `/post/${post._id}`,
                  );
                  toast.success("Link copied");
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] rounded-xl transition-colors"
              >
                <Share2 size={14} /> Share
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-[15px] leading-relaxed text-[var(--color-text)] mb-3.5 whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* Media */}
      {post.media?.length > 0 && (
        <div
          className={`grid gap-2 mb-3.5 ${
            post.media.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {post.media.map((m, i) =>
            m.type === "video" ? (
              <video
                key={i}
                src={m.url}
                controls
                className="w-full rounded-xl max-h-80 object-cover border border-[var(--color-border)]"
              />
            ) : (
              <img
                key={i}
                src={m.url}
                alt=""
                className="w-full rounded-xl max-h-80 object-cover border border-[var(--color-border)] hover:opacity-95 hover:scale-[1.01] transition-all duration-300 cursor-pointer"
                onClick={() => openLightbox(m.url)}
              />
            ),
          )}
        </div>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {post.tags.map((tag) => (
            <span key={tag} className="chip chip-blue">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-3 border-t border-[var(--color-border)]">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm font-medium px-2.5 py-1.5 rounded-full transition-colors ${
            liked
              ? "text-rose-500"
              : "text-[var(--color-text-faint)] hover:text-rose-500 hover:bg-rose-500/10"
          }`}
        >
          <Heart size={18} className={liked ? "fill-rose-500" : ""} />
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>

        <button
          onClick={() => setShowComments((p) => !p)}
          className="flex items-center gap-1.5 text-sm font-medium px-2.5 py-1.5 rounded-full text-[var(--color-text-faint)] hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors"
        >
          <MessageCircle size={18} />
          {comments.length > 0 && <span>{comments.length}</span>}
        </button>

        <button
          onClick={handleBookmark}
          className={`flex items-center gap-1.5 text-sm font-medium px-2.5 py-1.5 rounded-full transition-colors ml-auto ${
            bookmarked
              ? "text-amber-500"
              : "text-[var(--color-text-faint)] hover:text-amber-500 hover:bg-amber-500/10"
          }`}
        >
          <Bookmark size={18} className={bookmarked ? "fill-amber-500" : ""} />
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-4 space-y-3 pt-4 border-t border-[var(--color-border)]">
          {comments.map((c) => (
            <div key={c._id} className="flex gap-2.5">
              <Avatar src={c.author?.avatar} name={c.author?.name} size="xs" />
              <div className="flex-1 bg-[var(--color-surface-2)] rounded-2xl px-3.5 py-2.5">
                <p className="text-xs font-semibold text-indigo-500">
                  {c.author?.name}
                </p>
                <p className="text-sm mt-0.5 text-[var(--color-text)]">
                  {c.content}
                </p>
              </div>
            </div>
          ))}

          <form onSubmit={handleComment} className="flex items-center gap-2.5">
            <Avatar src={user?.avatar} name={user?.name} size="xs" />
            <div className="flex-1 relative">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="input-base !rounded-full pr-10 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={!comment.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-indigo-500 hover:bg-indigo-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <SendHorizontal size={15} />
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
};

export default PostCard;
