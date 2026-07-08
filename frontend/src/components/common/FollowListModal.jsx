import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Users } from "lucide-react";
import Modal from "./Modal.jsx";
import Avatar from "./Avatar.jsx";
import { userApi } from "../../api/index.js";

/**
 * Modal that lists a user's followers or following, fetched on demand.
 */
const FollowListModal = ({ isOpen, onClose, userId, type }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !userId) return;

    let active = true;
    setLoading(true);

    const request =
      type === "following"
        ? userApi.getFollowing(userId)
        : userApi.getFollowers(userId);

    request
      .then(({ data }) => {
        if (!active) return;
        setList(data[type] || []);
      })
      .catch(() => {
        if (active) setList([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, userId, type]);

  const title = type === "following" ? "Following" : "Followers";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 text-[var(--color-primary)] animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-faint)]">
            <Users size={20} />
          </div>
          <p className="text-sm text-[var(--color-text-faint)]">
            {type === "following"
              ? "Not following anyone yet."
              : "No followers yet."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto -mx-2">
          {list.map((u) => (
            <Link
              key={u._id}
              to={`/profile/${u.username}`}
              onClick={onClose}
              className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors"
            >
              <Avatar src={u.avatar} name={u.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-[var(--color-text)]">
                  {u.name}
                </p>
                <p className="text-xs text-[var(--color-text-faint)] truncate">
                  @{u.username}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default FollowListModal;
