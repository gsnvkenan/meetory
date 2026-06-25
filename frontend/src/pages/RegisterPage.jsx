import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Sparkles, GraduationCap, Calendar, BookOpen } from 'lucide-react';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    university: '',
    department: '',
    year: '1',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Ad Soyad gerekli';
    if (!form.username.trim()) e.username = 'Kullanıcı adı gerekli';
    
    // Email check for .edu / .edu.tr
    if (!form.email) {
      e.email = 'E-posta adresi gerekli';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.(edu|edu\.tr)$/i;
      if (!emailRegex.test(form.email)) {
        e.email = 'Sadece üniversite e-postaları (.edu veya .edu.tr) geçerlidir';
      }
    }
    
    if (!form.password || form.password.length < 6) {
      e.password = 'Şifre en az 6 karakter olmalıdır';
    }
    if (!form.university.trim()) e.university = 'Üniversite adı gerekli';
    if (!form.department.trim()) e.department = 'Bölüm bilgisi gerekli';
    
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
      toast.success('Kayıt başarılı! Aramıza hoş geldin 🎓');
      navigate('/feed');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Kayıt başarısız. Lütfen bilgileri kontrol et.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-[var(--color-bg)]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg my-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-4">
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text font-[Outfit]">Meetory</h1>
          <p className="text-[var(--color-text-faint)] text-sm mt-1">
            Kampüsün en sosyal köşesi seni bekliyor
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-8 space-y-5">
          <h2 className="text-xl font-semibold text-center">Hesap Oluştur</h2>

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
              type={showPass ? 'text' : 'password'}
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
              onChange={(e) => setForm({ ...form, university: e.target.value })}
              error={errors.university}
            />

            <Input
              label="Bölüm"
              placeholder="Bilgisayar Müh."
              icon={BookOpen}
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              error={errors.department}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Sınıf
            </label>
            <div className="relative flex items-center">
              <Calendar size={16} className="absolute left-3 text-[var(--color-text-faint)]" />
              <select
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="input-base pl-10 appearance-none bg-[var(--color-surface-2)] border-[var(--color-border)] rounded-xl w-full text-sm outline-none"
              >
                <option value="1">1. Sınıf (Hazırlık / Lisans 1)</option>
                <option value="2">2. Sınıf</option>
                <option value="3">3. Sınıf</option>
                <option value="4">4. Sınıf</option>
                <option value="5">Lisansüstü (Yüksek Lisans / Doktora)</option>
              </select>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2">
            Kayıt Ol
          </Button>

          <p className="text-center text-sm text-[var(--color-text-faint)]">
            Zaten hesabın var mı?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Giriş Yap
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
