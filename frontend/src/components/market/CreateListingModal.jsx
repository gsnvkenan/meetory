import { useState, useEffect } from "react";
import { Camera, X } from "lucide-react";
import Modal from "../common/Modal.jsx";
import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";
import { marketApi } from "../../api/index.js";
import toast from "react-hot-toast";

const CreateListingModal = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "notes",
    price: "",
    isFree: false,
    condition: "good",
    campus: "",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Limit to max 3 images
    if (files.length + imageFiles.length > 3) {
      toast.error("You can add a maximum of 3 photos.");
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Listing title is required");
      return;
    }
    if (!form.isFree && (!form.price || Number(form.price) <= 0)) {
      toast.error(
        "Please specify a valid price or make the listing free.",
      );
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      fd.append("category", form.category);
      fd.append("price", form.isFree ? 0 : Number(form.price));
      fd.append("isFree", form.isFree);
      fd.append("condition", form.condition);
      fd.append("campus", form.campus.trim());

      // Append image files
      imageFiles.forEach((file) => {
        fd.append("images", file); // 'images' matches backend multiselect name
      });

      const { data } = await marketApi.createListing(fd);
      toast.success("Listing successfully published! 🛍️");
      if (onCreated) onCreated(data.listing);

      // Reset form
      setForm({
        title: "",
        description: "",
        category: "notes",
        price: "",
        isFree: false,
        condition: "good",
        campus: "",
      });
      setImageFiles([]);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "An error occurred while creating listing.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post New Listing" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Images preview / Upload */}
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-2">
            Listing Photos{" "}
            <span className="text-[var(--color-text-faint)] font-normal">
              (Maximum of 3)
            </span>
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {imageFiles.map((file, idx) => (
              <div
                key={idx}
                className="relative w-20 h-20 rounded-xl bg-[var(--color-surface-2)] overflow-hidden border border-[var(--color-border)]"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-sm"
                >
                  <X size={11} strokeWidth={3} />
                </button>
              </div>
            ))}
            {imageFiles.length < 3 && (
              <label className="w-20 h-20 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] cursor-pointer flex flex-col items-center justify-center text-[var(--color-text-faint)] hover:text-[var(--color-primary)] transition-colors">
                <Camera size={18} />
                <span className="text-[10px] font-semibold mt-1">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <Input
          label="Listing Title"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Clean Second Hand Graphic Tablet"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[var(--color-text-muted)]">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-base cursor-pointer"
            >
              <option value="notes">Lecture Notes</option>
              <option value="book">Book</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing / Accessory</option>
              <option value="furniture">Furniture / Item</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[var(--color-text-muted)]">
              Condition
            </label>
            <select
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              className="input-base cursor-pointer"
            >
              <option value="new">New / In Box</option>
              <option value="like_new">Like New / Very Lightly Used</option>
              <option value="good">Good / Working</option>
              <option value="fair">Fair / Used</option>
              <option value="poor">Poor / Worn</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-start">
          <Input
            label="Price (GEL)"
            type="number"
            placeholder={form.isFree ? "Free" : "0.00"}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            disabled={form.isFree}
            required={!form.isFree}
          />

          <label className="flex items-center gap-2.5 text-sm font-medium text-[var(--color-text-muted)] cursor-pointer select-none bg-[var(--color-surface-2)] rounded-xl px-3.5 py-3 border border-[var(--color-border)] mt-6">
            <input
              type="checkbox"
              checked={form.isFree}
              onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
              className="accent-[var(--color-primary)] w-4 h-4 rounded"
            />
            I am giving this item away for free
          </label>
        </div>

        <Input
          label="Campus (Delivery Location)"
          placeholder="Campus location..."
          value={form.campus}
          onChange={(e) => setForm({ ...form, campus: e.target.value })}
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" loading={loading}>
            Publish Listing
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateListingModal;
