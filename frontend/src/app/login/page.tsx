"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      setToken(res.data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0f172a] flex-col justify-between p-12 flex-shrink-0 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.14]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-teal-500/20 blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[300px] h-[300px] rounded-full bg-indigo-600/15 blur-[90px] pointer-events-none" />
        <Link href="/" className="relative z-10 text-base font-semibold tracking-tight text-white">
          <span className="text-teal-500">My</span>App
        </Link>
        <div className="relative z-10">
          <blockquote className="text-2xl font-bold text-white leading-snug mb-4">
            "Scaffold yang baik<br />adalah fondasi produk<br />yang great."
          </blockquote>
          <p className="text-slate-500 text-sm">— Template, bukan keterbatasan</p>
        </div>
        <p className="relative z-10 text-slate-700 text-xs">© {new Date().getFullYear()} MyApp</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link href="/" className="text-base font-semibold tracking-tight text-slate-900 lg:hidden">
              <span className="text-teal-500">My</span>App
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Selamat datang</h1>
            <p className="text-slate-400 text-sm mt-1">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 text-slate-900 text-sm transition-all placeholder:text-slate-300"
                placeholder="email@contoh.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 text-slate-900 text-sm transition-all placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm mt-1"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Belum punya akun?{" "}
            <Link href="/register" className="text-teal-500 font-semibold hover:underline">
              Daftar gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
