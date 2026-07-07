import { useState, useRef } from "react";
import { Image, Video, X, Send, Globe, Users } from "lucide-react";
import Avatar from "../common/Avatar.jsx";
import Button from "../common/Button.jsx";
import { postApi } from "../../api/index.js";
import { useAuth } from "../../context/AuthContext.jsx";
import toast from "react-hot-toast";

const CreatePost = ({ onCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((p) => [...p, ...selected]);
    const newPreviews = selected.map((f) => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith("video") ? "video" : "image",
    }));
    setPreviews((p) => [...p, ...newPreviews]);
  };

  const removeFile = (index) => {
    setFiles((p) => p.filter((_, i) => i !== index));
    setPreviews((p) => p.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("visibility", visibility);
      files.forEach((f) => formData.append("media", f));

      const { data } = await postApi.createPost(formData);
      onCreated?.(data.post);
      setContent("");
      setFiles([]);
      setPreviews([]);
      toast.success("Gönderi paylaşıldı!");
    } catch {
      toast.error("Gönderi paylaşılamadı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-5">
      <div className="flex gap-3.5">
        <Avatar src={user?.avatar} name={user?.name} size="md" />
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Kampüste ne var? Paylaş..."
            rows={3}
            className="w-full bg-transparent text-[15px] leading-relaxed resize-none outline-none text-[var(--color-text)] placeholder:text-[var(--color-text-faint)]"
          />

          {/* Media previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {previews.map((p, i) => (
                <div
                  key={i}
                  className="relative rounded-xl overflow-hidden aspect-square border border-[var(--color-border)] group"
                >
                  {p.type === "video" ? (
                    <video src={p.url} className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={p.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/75 rounded-full p-1 text-white transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="p-2.5 rounded-full text-indigo-500 hover:bg-indigo-500/10 transition-colors"
                title="Fotoğraf ekle"
              >
                <Image size={19} />
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="p-2.5 rounded-full text-indigo-500 hover:bg-indigo-500/10 transition-colors"
                title="Video ekle"
              >
                <Video size={19} />
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Visibility toggle */}
              <button
                type="button"
                onClick={() =>
                  setVisibility((p) =>
                    p === "public" ? "followers" : "public",
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 ml-1 rounded-full text-xs font-semibold text-[var(--color-text-faint)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-muted)] transition-colors"
              >
                {visibility === "public" ? (
                  <>
                    <Globe size={13} /> Genel
                  </>
                ) : (
                  <>
                    <Users size={13} /> Takipçiler
                  </>
                )}
              </button>
            </div>

            <Button
              type="submit"
              size="sm"
              loading={loading}
              disabled={!content.trim() && files.length === 0}
              icon={Send}
            >
              Paylaş
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreatePost;
