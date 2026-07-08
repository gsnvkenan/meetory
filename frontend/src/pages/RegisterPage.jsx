import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
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
  { icon: Rss, text: "Catch the campus agenda in the feed" },
  { icon: MessageCircle, text: "Chat with your friends instantly" },
  { icon: CalendarDays, text: "Discover events, book your spot" },
  { icon: ShoppingBag, text: "Shop in the marketplace" },
  { icon: Compass, text: "Meet new people on the discover page" },
];

const STATS = [
  { value: "1K+", label: "Active students" },

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
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.username.trim()) e.username = "Username is required";

    // Email check for .edu / .edu.tr
    if (!form.email) {
      e.email = "Email address is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.(edu|edu\.ge)$/i;
      if (!emailRegex.test(form.email)) {
        e.email =
          "Only university emails (.edu or .edu.tr) are valid";
      }
    }

    if (!form.password || form.password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }
    if (!form.university.trim()) e.university = "University name is required";
    if (!form.department.trim()) e.department = "Department info is required";

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
      toast.success("Registration successful! Welcome to the community 🎓");
      navigate("/feed");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
        "Registration failed. Please check your information.",
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
              The most social
              <br />
              corner of the campus awaits you.
            </h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm mb-10">
              Create a free account, find your university and join the campus community.
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
              The most social corner of the campus awaits you
            </p>
          </div>

          <div className="mb-8">
            <h2 className="page-heading text-2xl">Create Account</h2>
            <p className="text-[var(--color-text-faint)] text-sm mt-1">
              Fill in your information completely to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                icon={User}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors.name}
              />

              <Input
                label="Username"
                placeholder="johndoe"
                icon={User}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                error={errors.username}
              />
            </div>

            <Input
              label="University Email"
              type="email"
              placeholder="student@university.edu"
              icon={Mail}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />

            <div className="relative">
              <Input
                label="Password"
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
                label="University"
                placeholder="TSU, GTU..."
                icon={GraduationCap}
                value={form.university}
                onChange={(e) =>
                  setForm({ ...form, university: e.target.value })
                }
                error={errors.university}
              />

              <Input
                label="Department"
                placeholder="Computer Engineering"
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
                Class / Year
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
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="6">
                    Master
                  </option>
                </select>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2">
              Register
            </Button>

            <p className="text-center text-sm text-[var(--color-text-faint)]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
