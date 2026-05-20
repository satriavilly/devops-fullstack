import Link from "next/link";

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const BoltIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

const LayersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
  </svg>
);

const features = [
  {
    icon: <ShieldIcon />,
    title: "Auth JWT",
    desc: "Register dan login dengan bcrypt + JWT. Token tersimpan aman di localStorage.",
  },
  {
    icon: <BoltIcon />,
    title: "NestJS Backend",
    desc: "REST API modular dengan TypeORM dan PostgreSQL. Mudah di-extend sesuai kebutuhan.",
  },
  {
    icon: <LayersIcon />,
    title: "App Router",
    desc: "Next.js App Router, server components, dan Tailwind CSS out of the box.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col relative overflow-hidden">
      {/* Background: dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.18]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Background: radial glows */}
      <div className="absolute -top-48 -right-48 w-[640px] h-[640px] rounded-full bg-teal-500/20 blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-48 -left-48 w-[560px] h-[560px] rounded-full bg-indigo-600/15 blur-[110px] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative px-8 py-5 flex items-center justify-between border-b border-white/[0.06]">
        <span className="text-base font-semibold tracking-tight">
          <span className="text-teal-500">My</span>App
        </span>
        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="text-sm px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
          >
            Mulai Sekarang
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-full px-4 py-1.5 text-xs text-slate-400 mb-10 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse inline-block" />
            Next.js · NestJS · PostgreSQL · Docker
          </div>

          <h1 className="text-6xl sm:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
            Scaffold.{" "}
            <span className="text-teal-500">Ship.</span>
            <br />
            Iterate.
          </h1>

          <p className="text-lg text-slate-400 mb-10 max-w-lg mx-auto leading-relaxed">
            Template fullstack
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="px-7 py-3.5 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors text-sm"
            >
              Buat Akun Gratis
            </Link>
            <Link
              href="/login"
              className="px-7 py-3.5 bg-white/[0.05] text-slate-300 font-semibold rounded-lg border border-white/[0.08] hover:bg-white/[0.09] transition-colors text-sm"
            >
              Sudah Punya Akun
            </Link>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="relative py-16 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 text-center mb-10">
            ® DevOps RPL - 2026
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4 group-hover:bg-teal-500/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.06] py-5 px-8 flex items-center justify-between text-xs text-slate-600">
        <span>© {new Date().getFullYear()} MyApp</span>
        <span>Built for learning &amp; demo</span>
      </footer>
    </div>
  );
}
