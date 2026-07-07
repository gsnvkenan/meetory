import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  GraduationCap,
  Calendar,
  BookOpen,
  Rss,
  MessageCircle,
  CalendarDays,
  Compass,
  ShoppingBag,
} from "lucide-react";
import Input from "../components/common/Input.jsx";
import Button from "../components/common/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const FEATURES = [
  { icon: Rss, text: "Akışta kampüsün gündemini yakala" },
  { icon: MessageCircle, text: "Arkadaşlarınla anında mesajlaş" },
  { icon: CalendarDays, text: "Etkinlikleri keşfet, yerini ayırt" },
  { icon: ShoppingBag, text: "Pazar yerinde alışveriş yap" },
  { icon: Compass, text: "Yeni insanlarla keşfet sayfasında tanış" },
];

const STATS = [
  { value: "12K+", label: "Aktif öğrenci" },
  { value: "80+", label: "Üniversite" },
  { value: "500+", label: "Etkinlik" },
];

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    university: "",
    department: "",
    year: "1",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Ad Soyad gerekli";
    if (!form.username.trim()) e.username = "Kullanıcı adı gerekli";

    // Email check for .edu / .edu.tr
    if (!form.email) {
      e.email = "E-posta adresi gerekli";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.(edu|edu\.tr)$/i;
      if (!emailRegex.test(form.email)) {
        e.email =
          "Sadece üniversite e-postaları (.edu veya .edu.tr) geçerlidir";
      }
    }

    if (!form.password || form.password.length < 6) {
      e.password = "Şifre en az 6 karakter olmalıdır";
    }
    if (!form.university.trim()) e.university = "Üniversite adı gerekli";
    if (!form.department.trim()) e.department = "Bölüm bilgisi gerekli";

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        university: form.university.trim(),
        department: form.department.trim(),
        year: Number(form.year),
      });
      toast.success("Kayıt başarılı! Aramıza hoş geldin 🎓");
      navigate("/feed");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Kayıt başarısız. Lütfen bilgileri kontrol et.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 relative overflow-hidden bg-[var(--color-bg)]">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-8%] w-[32rem] h-[32rem] bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-8%] w-[28rem] h-[28rem] bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-6xl my-8 grid lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {/* LEFT — brand / marketing panel */}
        <div className="hidden lg:flex flex-col justify-between relative p-10 bg-gradient-to-br from-[#1c46ad] via-[#2258d6] to-[#7458f0] text-white overflow-hidden">
          <div className="absolute -top-24 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-14">
              <div className="brand-badge w-11 h-11 rounded-2xl flex items-center justify-center shrink-0">
                <Sparkles size={22} className="text-white" />
              </div>
              <span className="text-2xl font-extrabold font-[Outfit] tracking-tight">
                Meetory
              </span>
            </div>

            <h2 className="page-heading text-3xl leading-tight mb-4">
              Kampüsün en sosyal
              <br />
              köşesi seni bekliyor.
            </h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm mb-10">
              Ücretsiz bir hesap oluştur, üniversiteni bul ve kampüs topluluğuna
              katıl.
            </p>

            <ul className="space-y-4">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3.5">
                  <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <Icon size={17} className="text-white" />
                  </span>
                  <span className="text-sm text-white/90 font-medium">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex items-center gap-8 pt-10 mt-10 border-t border-white/15">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold font-[Outfit]">
                  {s.value}
                </p>
                <p className="text-xs text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — form panel */}
        <div className="flex flex-col justify-center p-8 sm:p-12">
          {/* Mobile-only logo */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <div className="brand-badge w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold gradient-text font-[Outfit]">
              Meetory
            </h1>
            <p className="text-[var(--color-text-faint)] text-sm mt-1 text-center">
              Kampüsün en sosyal köşesi seni bekliyor
            </p>
          </div>

          <div className="mb-8">
            <h2 className="page-heading text-2xl">Hesap Oluştur</h2>
            <p className="text-[var(--color-text-faint)] text-sm mt-1">
              Başlamak için bilgilerini eksiksiz doldur
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Ad Soyad"
                placeholder="Ahmet Yılmaz"
                icon={User}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors.name}
              />

              <Input
                label="Kullanıcı Adı"
                placeholder="ahmetyilmaz"
                icon={User}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                error={errors.username}
              />
            </div>

            <Input
              label="Üniversite E-postası"
              type="email"
              placeholder="ogrenci@universite.edu.tr"
              icon={Mail}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />

            <div className="relative">
              <Input
                label="Şifre"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                icon={Lock}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-9 text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Üniversite"
                placeholder="İTÜ, ODTÜ..."
                icon={GraduationCap}
                value={form.university}
                onChange={(e) =>
                  setForm({ ...form, university: e.target.value })
                }
                error={errors.university}
              />

              <Input
                label="Bölüm"
                placeholder="Bilgisayar Müh."
                icon={BookOpen}
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                error={errors.department}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-1.5">
                Sınıf
              </label>
              <div className="relative flex items-center">
                <Calendar
                  size={16}
                  className="absolute left-3.5 text-[var(--color-text-faint)] pointer-events-none"
                />
                <select
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="input-base pl-10 appearance-none"
                >
                  <option value="1">1. Sınıf (Hazırlık / Lisans 1)</option>
                  <option value="2">2. Sınıf</option>
                  <option value="3">3. Sınıf</option>
                  <option value="4">4. Sınıf</option>
                  <option value="5">
                    Lisansüstü (Yüksek Lisans / Doktora)
                  </option>
                </select>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2">
              Kayıt Ol
            </Button>

            <p className="text-center text-sm text-[var(--color-text-faint)]">
              Zaten hesabın var mı?{" "}
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Giriş Yap
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
