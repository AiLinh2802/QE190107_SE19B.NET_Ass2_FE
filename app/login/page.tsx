"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, KeyRound, Lock, LogIn, Mail, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { setToken, setUser } from "@/lib/auth";
import { useToast } from "@/components/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.auth.login({ email: email.trim(), password });
      setToken(res.token);
      setUser(res.account);
      toast(`Welcome back, ${res.account.fullName}!`);
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
      toast(err.message || "Failed to log in.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: "admin" | "staff") => {
    setError("");
    if (role === "admin") {
      setEmail("admin@tasktrack.com");
      setPassword("Admin@123456");
    } else {
      setEmail("staff@tasktrack.com");
      setPassword("Staff@123456");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-100">
        
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-500 text-white shadow-lg shadow-brand-500/25">
            <LogIn className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Sign in to TaskTrack</h1>
          <p className="text-sm text-slate-500">Access protected dashboards and management tools</p>
        </div>

        {/* Demo Credentials Tip for Grading */}
        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/70 p-4 text-xs text-amber-900">
          <div className="flex items-center gap-1.5 font-bold mb-2 text-amber-950">
            <ShieldCheck className="h-4 w-4 text-amber-600" />
            <span>Test Accounts (Assignment 2 Grading)</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 mt-2">
            <button
              type="button"
              onClick={() => fillDemo("admin")}
              className="rounded-xl border border-amber-300 bg-white/90 p-2.5 text-left hover:bg-white hover:border-amber-400 transition shadow-xs group"
            >
              <div className="font-bold text-amber-950 flex items-center justify-between">
                <span>Admin Account</span>
                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-extrabold">Role 1</span>
              </div>
              <div className="text-[11px] text-slate-700 font-mono mt-1">admin@tasktrack.com</div>
              <div className="text-[11px] text-amber-800 font-mono font-bold mt-1 bg-amber-100/80 px-2 py-0.5 rounded-md inline-block">
                Pass: Admin@123456
              </div>
            </button>
            <button
              type="button"
              onClick={() => fillDemo("staff")}
              className="rounded-xl border border-amber-300 bg-white/90 p-2.5 text-left hover:bg-white hover:border-amber-400 transition shadow-xs group"
            >
              <div className="font-bold text-amber-950 flex items-center justify-between">
                <span>Staff Account</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-extrabold">Role 0</span>
              </div>
              <div className="text-[11px] text-slate-700 font-mono mt-1">staff@tasktrack.com</div>
              <div className="text-[11px] text-emerald-800 font-mono font-bold mt-1 bg-emerald-100/80 px-2 py-0.5 rounded-md inline-block">
                Pass: Staff@123456
              </div>
            </button>
          </div>
          <p className="mt-2 text-[11px] text-amber-800">
            💡 <i>Bấm vào ô để tự động điền Email & Mật khẩu.</i>
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-700 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Need a staff account?{" "}
          <Link href="/register" className="font-bold text-brand-600 hover:underline">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
}
