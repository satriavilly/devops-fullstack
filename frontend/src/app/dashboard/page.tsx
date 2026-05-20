"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { removeToken, isAuthenticated } from "@/lib/auth";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const HomeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const CogIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);

const navItems = [
  { label: "Dashboard", icon: <HomeIcon />, active: true },
  { label: "Projects", icon: <FolderIcon />, active: false },
  { label: "Tasks", icon: <CheckIcon />, active: false },
  { label: "Team", icon: <UsersIcon />, active: false },
  { label: "Settings", icon: <CogIcon />, active: false },
];

const stats = [
  { label: "Projects", value: "12", sub: "+2 bulan ini" },
  { label: "Tasks Done", value: "48", sub: "dari 53 total" },
  { label: "Team", value: "5", sub: "anggota aktif" },
  { label: "Unread", value: "3", sub: "notifikasi baru" },
];

const activities = [
  { action: "Membuat proyek baru", time: "2 menit lalu", tag: "DevOps" },
  { action: "Menyelesaikan task #23", time: "1 jam lalu", tag: "Frontend" },
  { action: "Update profil", time: "3 jam lalu", tag: null },
  { action: "Bergabung ke tim DevOps", time: "1 hari lalu", tag: "DevOps" },
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
      .catch(() => { removeToken(); router.push("/login"); })
      .finally(() => setLoading(false));
  }, [router]);

  function handleLogout() {
    removeToken();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          Memuat...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-[220px] bg-[#0f172a] flex-shrink-0 flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <Link href="/" className="text-base font-semibold tracking-tight text-white">
            <span className="text-teal-500">My</span>App
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-default transition-colors ${
                item.active
                  ? "bg-white/[0.08] text-white font-medium"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
              }`}
            >
              <span className={item.active ? "text-teal-400" : "text-slate-600"}>
                {item.icon}
              </span>
              {item.label}
            </div>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-3 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-xs font-bold text-teal-400 flex-shrink-0">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">{user?.name}</p>
              <p className="text-xs text-slate-600 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-300 hover:bg-white/[0.04] transition-colors rounded-lg"
          >
            <LogoutIcon />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <div className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-900">Dashboard</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-400">All systems operational</span>
          </div>
        </div>

        <main className="flex-1 px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="bg-white border border-slate-100 rounded-xl p-5 group hover:border-slate-200 transition-colors"
              >
                <p className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wider">
                  {s.label}
                </p>
                <p className="text-4xl font-bold text-slate-900 leading-none mb-2">{s.value}</p>
                <p className="text-xs text-slate-400">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Activity timeline */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-widest">
                  Aktivitas
                </h2>
                <span className="text-xs text-slate-400">24 jam terakhir</span>
              </div>
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[6px] top-1 bottom-1 w-px bg-slate-100" />
                <div className="space-y-6">
                  {activities.map((a, i) => (
                    <div key={i} className="flex gap-4 relative">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-teal-400 bg-white flex-shrink-0 mt-0.5 relative z-10" />
                      <div className="flex-1 min-w-0 pb-1">
                        <p className="text-sm text-slate-700 leading-snug">{a.action}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400">{a.time}</span>
                          {a.tag && (
                            <>
                              <span className="text-slate-200 select-none">·</span>
                              <span className="text-xs bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-100">
                                {a.tag}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Account info */}
            <div className="bg-white border border-slate-100 rounded-xl p-6">
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-widest mb-6">
                Akun
              </h2>
              <div className="space-y-0">
                <div className="py-3.5 border-b border-slate-50">
                  <p className="text-xs text-slate-400 mb-1">Nama</p>
                  <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                </div>
                <div className="py-3.5 border-b border-slate-50">
                  <p className="text-xs text-slate-400 mb-1">Email</p>
                  <p className="text-sm text-slate-700 truncate">{user?.email}</p>
                </div>
                <div className="py-3.5 border-b border-slate-50">
                  <p className="text-xs text-slate-400 mb-1">Bergabung</p>
                  <p className="text-sm text-slate-700">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
                <div className="py-3.5 border-b border-slate-50">
                  <p className="text-xs text-slate-400 mb-1">User ID</p>
                  <p className="text-xs text-slate-500 font-mono truncate">{user?.id}</p>
                </div>
                <div className="py-3.5">
                  <p className="text-xs text-slate-400 mb-1">Status</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <p className="text-sm text-slate-700">Aktif</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
