import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, UserCheck, Sparkles, BookOpen, Tag } from "lucide-react";
import Avatar from "../common/Avatar.jsx";
import Button from "../common/Button.jsx";
import { userApi } from "../../api/index.js";
import toast from "react-hot-toast";

const UserCard = ({ recommendation }) => {
  const { user, score, sharedInterests, sharedCourses } = recommendation;
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      await userApi.toggleFollow(user._id);
      setFollowing((p) => !p);
      toast.success(
        following ? "Unfollowed" : `Followed ${user.name}`,
      );
    } catch {
      toast.error("Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card-hover p-5 flex flex-col gap-4 fade-in">
      {/* Score badge */}
      <div className="flex items-start justify-between gap-3">
        <Link
          to={`/profile/${user.username}`}
          className="flex items-center gap-3 group min-w-0"
        >
          <Avatar src={user.avatar} name={user.name} size="md" />
          <div className="min-w-0">
            <p className="font-semibold truncate group-hover:text-[var(--color-primary)] transition-colors">
              {user.name}
            </p>
            <p className="text-xs text-[var(--color-text-faint)] truncate">
              @{user.username}
            </p>
          </div>
        </Link>

        {score > 0 && (
          <div className="chip chip-blue shrink-0">
            <Sparkles size={11} />
            {score}
          </div>
        )}
      </div>

      {/* University / Department */}
      <div>
        <p className="text-xs text-[var(--color-text-muted)] font-medium">
          {user.university}
        </p>
        <p className="text-xs text-[var(--color-text-faint)]">
          {user.department} · Year {user.year}
        </p>
      </div>

      {/* Shared interests */}
      {sharedInterests?.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Tag size={12} className="text-[#6440d9] shrink-0" />
          {sharedInterests.slice(0, 4).map((i) => (
            <span key={i} className="chip chip-violet">
              {i}
            </span>
          ))}
        </div>
      )}

      {/* Shared courses */}
      {sharedCourses?.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <BookOpen size={12} className="text-[#0d9257] shrink-0" />
          {sharedCourses.slice(0, 3).map((c) => (
            <span key={c} className="chip chip-emerald">
              {c}
            </span>
          ))}
        </div>
      )}

      <Button
        variant={following ? "secondary" : "primary"}
        size="sm"
        onClick={handleFollow}
        loading={loading}
        icon={following ? UserCheck : UserPlus}
        className="mt-auto w-full"
      >
        {following ? "Following" : "Follow"}
      </Button>
    </div>
  );
};

export default UserCard;
