"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { removeToken, isAuthenticated } from "@/lib/auth";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const stats = [
  { label: "Total Proyek", value: "12", icon: "📁", color: "bg-blue-50 text-blue-700" },
  { label: "Task Selesai", value: "48", icon: "✅", color: "bg-green-50 text-green-700" },
  { label: "Anggota Tim", value: "5", icon: "👥", color: "bg-purple-50 text-purple-700" },
  { label: "Notifikasi", value: "3", icon: "🔔", color: "bg-orange-50 text-orange-700" },
];

const activities = [
  { action: "Membuat proyek baru", time: "2 menit lalu", icon: "📁" },
  { action: "Menyelesaikan task #23", time: "1 jam lalu", icon: "✅" },
  { action: "Update profil", time: "3 jam lalu", icon: "✏️" },
  { action: "Bergabung ke tim DevOps", time: "1 hari lalu", icon: "👥" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        removeToken();
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleLogout() {
    removeToken();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-indigo-600">MyApp</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700 hidden sm:block">
            Halo, <span className="font-semibold">{user?.name}</span>
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Keluar
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Selamat Datang, {user?.name}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Berikut ringkasan aktivitas Anda hari ini.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${s.color} text-xl mb-3`}>
                {s.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Aktivitas */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Aktivitas Terbaru
            </h2>
            <div className="space-y-4">
              {activities.map((a, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{a.action}</p>
                    <p className="text-xs text-gray-500">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profil */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profil Saya</h2>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600 mb-3">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">ID</span>
                <span className="text-gray-700 font-mono text-xs truncate max-w-[130px]">
                  {user?.id}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Bergabung</span>
                <span className="text-gray-700">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("id-ID")
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Status</span>
                <span className="text-green-600 font-medium">Aktif</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
