import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, UserCheck, Sparkles, BookOpen, Tag } from 'lucide-react';
import Avatar from '../common/Avatar.jsx';
import Button from '../common/Button.jsx';
import { userApi } from '../../api/index.js';
import toast from 'react-hot-toast';

const UserCard = ({ recommendation }) => {
  const { user, score, sharedInterests, sharedCourses } = recommendation;
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      await userApi.toggleFollow(user._id);
      setFollowing((p) => !p);
      toast.success(following ? 'Takipten çıkıldı' : `${user.name} takip edildi`);
    } catch {
      toast.error('İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-5 flex flex-col gap-4 hover:shadow-[0_0_30px_rgba(99,102,241,0.12)] transition-shadow fade-in">
      {/* Score badge */}
      <div className="flex items-start justify-between">
        <Link
          to={`/profile/${user.username}`}
          className="flex items-center gap-3 group"
        >
          <Avatar src={user.avatar} name={user.name} size="md" />
          <div>
            <p className="font-semibold group-hover:text-indigo-400 transition-colors">
              {user.name}
            </p>
            <p className="text-xs text-[var(--color-text-faint)]">
              @{user.username}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold">
          <Sparkles size={11} />
          {score}
        </div>
      </div>

      {/* University / Department */}
      <div>
        <p className="text-xs text-[var(--color-text-muted)] font-medium">
          {user.university}
        </p>
        <p className="text-xs text-[var(--color-text-faint)]">
          {user.department} · {user.year}. Sınıf
        </p>
      </div>

      {/* Shared interests */}
      {sharedInterests?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <Tag size={12} className="text-violet-400 shrink-0 mt-0.5" />
          {sharedInterests.slice(0, 4).map((i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20"
            >
              {i}
            </span>
          ))}
        </div>
      )}

      {/* Shared courses */}
      {sharedCourses?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <BookOpen size={12} className="text-emerald-400 shrink-0 mt-0.5" />
          {sharedCourses.slice(0, 3).map((c) => (
            <span
              key={c}
              className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            >
              {c}
            </span>
          ))}
        </div>
      )}

      <Button
        variant={following ? 'secondary' : 'primary'}
        size="sm"
        onClick={handleFollow}
        loading={loading}
        icon={following ? UserCheck : UserPlus}
        className="mt-auto"
      >
        {following ? 'Takip Ediliyor' : 'Takip Et'}
      </Button>
    </div>
  );
};

export default UserCard;
