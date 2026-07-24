import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { formatApiError } from "../lib/api";

const HERO = "https://images.pexels.com/photos/16176576/pexels-photo-16176576.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate("/admin");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full h-11 px-3 rounded-sm border border-[#2B2B2B] bg-[#0A0A0A] text-sm text-[#F9F9F9] focus:outline-none focus:ring-1 focus:ring-[#C5A880] focus:border-[#C5A880] transition-colors";

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#050505]" data-testid="login-page">
      <div className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden">
        <img src={HERO} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-[#050505]/30" />
        <div className="relative flex items-center gap-2.5">
          <span className="grid place-items-center w-9 h-9 rounded-sm bg-[#C5A880] text-[#050505]"><Car size={18} /></span>
          <span className="font-heading font-semibold text-lg">HamoudeCarTrade</span>
        </div>
        <div className="relative">
          <h2 className="font-heading text-4xl font-light tracking-tight leading-tight">Command<br /><span className="text-[#C5A880]">Center</span></h2>
          <p className="text-[#888] mt-4 max-w-sm">Manage listings, review sell requests, and keep your showroom running.</p>
        </div>
        <p className="relative text-xs text-[#555]">© {new Date().getFullYear()} Car Trading Ireland</p>
      </div>

      <div className="grid place-items-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm" data-testid="login-form">
          <span className="grid place-items-center w-12 h-12 rounded-sm bg-[#1A1A1A] text-[#C5A880] mb-6"><Lock size={20} /></span>
          <h1 className="font-heading text-2xl font-light tracking-tight mb-1">Sign in</h1>
          <p className="text-sm text-[#888] mb-8">Enter your admin credentials to continue.</p>

          <label className="overline block mb-2 text-[#888]">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="login-email" className={`${inputCls} mb-5`} />

          <label className="overline block mb-2 text-[#888]">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="login-password" className={`${inputCls} mb-6`} />

          <button type="submit" disabled={loading} data-testid="login-submit"
            className="w-full h-11 rounded-sm bg-[#C5A880] text-[#050505] font-semibold hover:bg-[#E0C39C] transition-colors disabled:opacity-60">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
