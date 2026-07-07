import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  UserPlus,
  UserCheck,
  MessageSquare,
  Edit3,
  Settings,
  MapPin,
  GraduationCap,
  BookOpen,
  Tag,
  Calendar,
  Loader2,
  Camera,
  X,
  LogOut,
} from "lucide-react";
import Avatar from "../components/common/Avatar.jsx";
import Button from "../components/common/Button.jsx";
import Modal from "../components/common/Modal.jsx";
import Input from "../components/common/Input.jsx";
import PostCard from "../components/feed/PostCard.jsx";
import { userApi, chatApi } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLightboxStore } from "../context/useLightboxStore.js";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser, logout } = useAuth();
  const { openLightbox } = useLightboxStore();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Edit Modal State
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    university: "",
    department: "",
    year: "1",
    interests: "",
    courses: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const isSelf = currentUser?.username === username;

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch user profile
      const { data: userData } = await userApi.getUser(username);
      const userObj = userData.user;
      setProfileUser(userObj);

      // 2. Check if current user is following this profile
      if (currentUser && !isSelf) {
        setIsFollowing(
          userObj.followers.some(
            (fId) => String(fId) === String(currentUser._id),
          ),
        );
      }

      // 3. Fetch user posts
      const { data: postsData } = await userApi.getUserPosts(userObj._id);
      setPosts(postsData.posts || []);
    } catch (err) {
      console.error(err);
      toast.error("Profil yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [username, currentUser, isSelf]);

  useEffect(() => {
    fetchProfileData();
  }, [username, fetchProfileData]);

  const handleFollow = async () => {
    if (!profileUser) return;
    setFollowLoading(true);
    try {
      const { data } = await userApi.toggleFollow(profileUser._id);
      setIsFollowing(data.following);
      // Update local follower count
      setProfileUser((prev) => {
        const next = { ...prev };
        if (data.following) {
          next.followers = [...next.followers, currentUser._id];
        } else {
          next.followers = next.followers.filter(
            (id) => String(id) !== String(currentUser._id),
          );
        }
        return next;
      });
      toast.success(
        data.following ? `${profileUser.name} takip edildi` : "Takip bırakıldı",
      );
    } catch {
      toast.error("İşlem gerçekleştirilemedi");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!profileUser) return;
    try {
      const { data } = await chatApi.getOrCreateConversation(profileUser._id);
      navigate("/chat");
    } catch (err) {
      toast.error("Sohbet başlatılamadı");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast.success("Başarıyla çıkış yapıldı");
    } catch (err) {
      toast.error("Çıkış yapılamadı");
    }
  };

  const openEditModal = () => {
    if (!profileUser) return;
    setEditForm({
      name: profileUser.name || "",
      bio: profileUser.bio || "",
      university: profileUser.university || "",
      department: profileUser.department || "",
      year: String(profileUser.year || "1"),
      interests: profileUser.interests ? profileUser.interests.join(", ") : "",
      courses: profileUser.courses ? profileUser.courses.join(", ") : "",
    });
    setAvatarFile(null);
    setCoverFile(null);
    setEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", editForm.name.trim());
      fd.append("bio", editForm.bio.trim());
      fd.append("university", editForm.university.trim());
      fd.append("department", editForm.department.trim());
      fd.append("year", editForm.year);

      // Parse arrays
      const interestArr = editForm.interests
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
      const courseArr = editForm.courses
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

      // Add multiple fields for interests and courses
      interestArr.forEach((i) => fd.append("interests[]", i));
      courseArr.forEach((c) => fd.append("courses[]", c));

      if (avatarFile) fd.append("avatar", avatarFile);
      if (coverFile) fd.append("coverPhoto", coverFile);

      const { data } = await userApi.updateProfile(fd);
      setProfileUser(data.user);

      // Update global context
      updateUser(data.user);

      toast.success("Profil güncellendi");
      setEditOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Profil güncellenirken hata oluştu");
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="card p-12 text-center">
        <h3 className="page-heading text-lg text-[var(--color-text)]">
          Kullanıcı bulunamadı
        </h3>
        <p className="text-sm text-[var(--color-text-faint)] mt-2">
          Böyle bir profil bulunmuyor veya silinmiş olabilir.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in pb-12">
      {/* Profile Cover & Header Card */}
      <div className="card overflow-hidden">
        {/* Cover */}
        <div className="h-40 md:h-60 relative">
          {profileUser.coverPhoto ? (
            <img
              src={profileUser.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => openLightbox(profileUser.coverPhoto)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1c46ad] via-[#2258d6] to-[#7458f0]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Info Area */}
        <div className="px-6 md:px-8 pb-6 relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 text-center md:text-left">
            <div
              className="relative shrink-0 -mt-12 md:-mt-16 rounded-full border-4 border-[var(--color-surface)] shadow-lg cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => openLightbox(profileUser.avatar)}
            >
              <Avatar
                src={profileUser.avatar}
                name={profileUser.name}
                size="2xl"
              />
            </div>
            <div className="mb-1.5">
              <h1 className="page-heading text-2xl md:text-[1.75rem] text-[var(--color-text)] leading-tight">
                {profileUser.name}
              </h1>
              <p className="text-sm text-[var(--color-text-faint)] font-medium">
                @{profileUser.username}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1.5 mt-2.5 text-sm text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1.5">
                  <GraduationCap
                    size={15}
                    className="text-[var(--color-primary)]"
                  />{" "}
                  {profileUser.university}
                </span>
                <span className="text-[var(--color-text-faint)]">·</span>
                <span className="flex items-center gap-1.5">
                  <BookOpen size={15} className="text-[var(--color-primary)]" />{" "}
                  {profileUser.department}
                </span>
                <span className="chip chip-blue">
                  {profileUser.year}. Sınıf
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-2 mb-1.5 shrink-0">
            {isSelf ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Edit3}
                  onClick={openEditModal}
                >
                  Profili Düzenle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={LogOut}
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                >
                  Çıkış Yap
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant={isFollowing ? "secondary" : "primary"}
                  size="sm"
                  loading={followLoading}
                  icon={isFollowing ? UserCheck : UserPlus}
                  onClick={handleFollow}
                >
                  {isFollowing ? "Takip Ediliyor" : "Takip Et"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={MessageSquare}
                  onClick={handleMessage}
                >
                  Mesaj Gönder
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats segment */}
        <div className="border-t border-[var(--color-border)] px-6 md:px-8 py-4 flex items-center justify-center md:justify-start gap-8 bg-[var(--color-surface-2)]/60">
          <div className="text-center md:text-left">
            <span className="block page-heading text-lg text-[var(--color-text)]">
              {profileUser.followers?.length || 0}
            </span>
            <span className="text-xs text-[var(--color-text-faint)] font-medium">
              Takipçi
            </span>
          </div>
          <div className="w-px h-8 bg-[var(--color-border)]" />
          <div className="text-center md:text-left">
            <span className="block page-heading text-lg text-[var(--color-text)]">
              {profileUser.following?.length || 0}
            </span>
            <span className="text-xs text-[var(--color-text-faint)] font-medium">
              Takip Edilen
            </span>
          </div>
          <div className="w-px h-8 bg-[var(--color-border)]" />
          <div className="text-center md:text-left">
            <span className="block page-heading text-lg text-[var(--color-text)]">
              {posts?.length || 0}
            </span>
            <span className="text-xs text-[var(--color-text-faint)] font-medium">
              Paylaşım
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column – About, Interests, Courses */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-5 space-y-3">
            <h3 className="page-heading text-xs uppercase tracking-wider text-[var(--color-text-faint)]">
              Hakkımda
            </h3>
            <p className="text-sm leading-relaxed text-[var(--color-text-muted)] whitespace-pre-line">
              {profileUser.bio || "Henüz bir biyografi yazılmamış."}
            </p>
          </div>

          <div className="card p-5 space-y-3">
            <h3 className="page-heading text-xs uppercase tracking-wider text-[var(--color-text-faint)] flex items-center gap-1.5">
              <Tag size={13} /> İlgi Alanları
            </h3>
            {profileUser.interests?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profileUser.interests.map((interest) => (
                  <span key={interest} className="chip chip-violet">
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--color-text-faint)]">
                Hiç ilgi alanı eklenmemiş.
              </p>
            )}
          </div>

          <div className="card p-5 space-y-3">
            <h3 className="page-heading text-xs uppercase tracking-wider text-[var(--color-text-faint)] flex items-center gap-1.5">
              <Calendar size={13} /> Dersler
            </h3>
            {profileUser.courses?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profileUser.courses.map((course) => (
                  <span key={course} className="chip chip-emerald">
                    {course}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--color-text-faint)]">
                Hiç ders bilgisi eklenmemiş.
              </p>
            )}
          </div>
        </div>

        {/* Right column – Posts feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="page-heading text-lg text-[var(--color-text)] px-1">
            Gönderiler
          </h2>

          {posts.length === 0 ? (
            <div className="card p-12 text-center text-[var(--color-text-faint)] text-sm">
              Henüz bir paylaşım yapılmamış.
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={{ ...post, author: profileUser }} // Ensure author object matches public mapping
                onDelete={(deletedId) =>
                  setPosts((prev) => prev.filter((p) => p._id !== deletedId))
                }
              />
            ))
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Profili Düzenle"
      >
        <form onSubmit={handleEditSubmit} className="space-y-6 mt-2">
          <div className="space-y-3">
            <h4 className="page-heading text-xs uppercase tracking-wider text-[var(--color-text-faint)]">
              Görseller
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-3.5 flex items-center gap-3">
                <Avatar
                  src={
                    avatarFile
                      ? URL.createObjectURL(avatarFile)
                      : profileUser.avatar
                  }
                  name={profileUser.name}
                  size="md"
                />
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                    Profil Resmi
                  </span>
                  <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[var(--color-surface-3)] hover:bg-[var(--color-border)] text-xs font-medium text-[var(--color-text-muted)] cursor-pointer transition-colors border border-[var(--color-border)] w-fit">
                    <Camera size={13} /> Değiştir
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAvatarFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="card p-3.5 flex items-center gap-3">
                <div className="w-16 h-11 rounded-lg bg-[var(--color-surface-3)] overflow-hidden border border-[var(--color-border)] shrink-0">
                  <img
                    src={
                      coverFile
                        ? URL.createObjectURL(coverFile)
                        : profileUser.coverPhoto || ""
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                    Kapak Görseli
                  </span>
                  <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[var(--color-surface-3)] hover:bg-[var(--color-border)] text-xs font-medium text-[var(--color-text-muted)] cursor-pointer transition-colors border border-[var(--color-border)] w-fit">
                    <Camera size={13} /> Değiştir
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCoverFile(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="page-heading text-xs uppercase tracking-wider text-[var(--color-text-faint)]">
              Genel Bilgiler
            </h4>
            <Input
              label="Ad Soyad"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                Biyografi
              </label>
              <textarea
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
                className="input-base min-h-[80px]"
                placeholder="Kendinden bahset..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="page-heading text-xs uppercase tracking-wider text-[var(--color-text-faint)]">
              Akademik Bilgiler
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Üniversite"
                value={editForm.university}
                onChange={(e) =>
                  setEditForm({ ...editForm, university: e.target.value })
                }
                required
              />

              <Input
                label="Bölüm"
                value={editForm.department}
                onChange={(e) =>
                  setEditForm({ ...editForm, department: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                Sınıf
              </label>
              <select
                value={editForm.year}
                onChange={(e) =>
                  setEditForm({ ...editForm, year: e.target.value })
                }
                className="input-base"
              >
                <option value="1">1. Sınıf</option>
                <option value="2">2. Sınıf</option>
                <option value="3">3. Sınıf</option>
                <option value="4">4. Sınıf</option>
                <option value="5">Lisansüstü</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="page-heading text-xs uppercase tracking-wider text-[var(--color-text-faint)]">
              İlgi Alanları & Dersler
            </h4>
            <Input
              label="İlgi Alanları (Virgülle ayırın)"
              value={editForm.interests}
              onChange={(e) =>
                setEditForm({ ...editForm, interests: e.target.value })
              }
              placeholder="Müzik, Yüzme, Kodlama..."
            />

            <Input
              label="Dersler (Virgülle ayırın)"
              value={editForm.courses}
              onChange={(e) =>
                setEditForm({ ...editForm, courses: e.target.value })
              }
              placeholder="MATH101, COMP202, ENG102..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setEditOpen(false)}
            >
              İptal
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              loading={editLoading}
            >
              Kaydet
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
