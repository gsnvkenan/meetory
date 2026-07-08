import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Rss,
  MessageCircle,
  CalendarDays,
  Compass,
  ShoppingBag,
} from "lucide-react";
import Input from "../components/common/Input.jsx";
import Button from "../components/common/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import toast from "react-hot-toast";

const FEATURES = [
  { icon: Rss, text: "Catch the campus agenda in the feed" },
  { icon: MessageCircle, text: "Chat with your friends instantly" },
  { icon: CalendarDays, text: "Discover events, book your spot" },
  { icon: ShoppingBag, text: "Shop in the marketplace" },
  { icon: Compass, text: "Meet new people on the discover page" },
];

const STATS = [
  { value: "1K+", label: "Active students" },

];

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    let interval;
    const checkHealth = async () => {
      try {
        const res = await api.get("/health");
        if (res.data && res.data.status === "ok") {
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
    if (!form.email) e.email = "Email is required";
    if (!form.password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const e2 = validate();
    if (Object.keys(e2).length) {
      setErrors(e2);
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome! 🎉");
      navigate("/feed");
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed";
      toast.error(msg);

      if (
        msg.includes("Username") ||
        msg.includes("Email") ||
        msg.includes("user")
      ) {
        setErrors({ email: msg });
      } else if (
        msg.includes("Password") ||
        msg.includes("password")
      ) {
        setErrors({ password: msg });
      } else {
        setErrors({ email: msg });
      }
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

      <div className="relative w-full max-w-5xl grid lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {/* LEFT — brand / marketing panel */}
        <div className="hidden lg:flex flex-col justify-between relative p-10 bg-blue-500 text-white overflow-hidden">
          <div className="absolute -top-24 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-14">
              <img src={logo} alt="Meetory Logo" className="w-11 h-11 object-contain shrink-0" />
              <span className="text-2xl font-extrabold font-[Outfit] tracking-tight">

              </span>
            </div>

            <h2 className="page-heading text-3xl leading-tight mb-4">
              All the colors of
              <br />
              campus life are here.
            </h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm mb-10">
              Connect with friends, stay updated on events, share ideas — all in one place.
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
          <div className="flex lg:hidden flex-col items-center mb-8">
            <img src={logo} alt="Meetory Logo" className="w-14 h-14 object-contain mb-4 shrink-0" />
            <h1 className="text-2xl font-extrabold font-[Outfit] text-blue-500">
              Meetory
            </h1>
            <p className="text-[var(--color-text-faint)] text-sm mt-1 text-center">
              Welcome to the campus social network
            </p>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="page-heading text-2xl">Login</h2>
              <p className="text-[var(--color-text-faint)] text-sm mt-1">
                Enter your details to access your account
              </p>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-[var(--color-border)] bg-[var(--color-surface-2)] shadow-sm transition-all duration-300 shrink-0">
              <span
                className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}
              />
              <span
                className={isOnline ? "text-emerald-600" : "text-amber-600"}
              >
                {isOnline ? "Online" : "Connecting..."}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@university.edu"
              icon={Mail}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              autoComplete="email"
            />

            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  icon={Lock}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
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
              Login
            </Button>

            <p className="text-center text-sm text-[var(--color-text-faint)]">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
