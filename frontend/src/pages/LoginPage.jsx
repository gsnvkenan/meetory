import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    let interval;
    const checkHealth = async () => {
      try {
        const res = await api.get('/health');
        if (res.data && res.data.status === 'ok') {
          setIsOnline(true);
          clearInterval(interval);
        }
      } catch (err) {
        setIsOnline(false);
      }
    };

    checkHealth();
    // Check every 5 seconds to wake up sleep mode on free instances (e.g. Render)
    interval = setInterval(checkHealth, 5000);

    return () => clearInterval(interval);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'E-posta gerekli';
    if (!form.password) e.password = 'Şifre gerekli';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }

    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Hoş geldin! 🎉');
      navigate('/feed');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Giriş başarısız');
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

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-4">
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text font-[Outfit]">Meetory</h1>
          <p className="text-[var(--color-text-faint)] text-sm mt-1">
            Kampüs sosyal ağına hoş geldin
          </p>

          <div className="flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full text-xs font-medium border border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md shadow-sm transition-all duration-300">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <span className={isOnline ? 'text-emerald-600' : 'text-amber-600'}>
              {isOnline ? 'Online' : 'Bağlanıyor...'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass p-8 space-y-5">
          <h2 className="text-xl font-semibold text-center">Giriş Yap</h2>

          <Input
            label="E-posta"
            type="email"
            placeholder="sen@universite.edu.tr"
            icon={Mail}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            autoComplete="email"
          />

          <div>
            <div className="relative">
              <Input
                label="Şifre"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                icon={Lock}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-9 text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Giriş Yap
          </Button>

          <p className="text-center text-sm text-[var(--color-text-faint)]">
            Hesabın yok mu?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Kayıt Ol
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
