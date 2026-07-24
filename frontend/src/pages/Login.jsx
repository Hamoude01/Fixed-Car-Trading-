import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { formatApiError } from "../lib/api";

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

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0A0A0A]" data-testid="login-page">
      <div className="hidden lg:flex flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-[#10B981]"><Car size={18} /></span>
          <span className="font-heading font-bold text-lg">HamoudeCarTrade</span>
        </div>
        <div>
          <h2 className="font-heading text-4xl font-semibold tracking-tight leading-tight">Admin<br />control panel</h2>
          <p className="text-zinc-400 mt-4 max-w-sm">Manage listings, upload photos and keep your inventory fresh.</p>
        </div>
        <p className="text-xs text-zinc-600">© {new Date().getFullYear()} Car Trading Ireland</p>
      </div>

      <div className="bg-white grid place-items-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm" data-testid="login-form">
          <span className="grid place-items-center w-12 h-12 rounded-xl bg-[#F3F4F6] mb-6"><Lock size={20} /></span>
          <h1 className="font-heading text-2xl font-semibold tracking-tight mb-1">Sign in</h1>
          <p className="text-sm text-zinc-500 mb-8">Enter your admin credentials to continue.</p>

          <label className="overline block mb-1.5">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="login-email"
            className="w-full h-11 px-3 rounded-md border border-zinc-200 mb-5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]" />

          <label className="overline block mb-1.5">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="login-password"
            className="w-full h-11 px-3 rounded-md border border-zinc-200 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]" />

          <button type="submit" disabled={loading} data-testid="login-submit"
            className="w-full h-11 rounded-lg bg-[#0A0A0A] text-white font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-60">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
