import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-indigo-600">MyApp</span>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
            Build Something{" "}
            <span className="text-indigo-600">Awesome</span>{" "}
            Today
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto">
            Aplikasi fullstack modern dengan Next.js, NestJS, dan PostgreSQL.
            Mulai perjalanan Anda sekarang.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-lg shadow-md"
            >
              Mulai Gratis
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-xl border-2 border-indigo-600 hover:bg-indigo-50 transition-colors text-lg"
            >
              Masuk
            </Link>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Fitur Utama
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔐",
                title: "Autentikasi Aman",
                desc: "JWT-based authentication dengan hashing password bcrypt.",
              },
              {
                icon: "⚡",
                title: "Performa Tinggi",
                desc: "Backend NestJS yang cepat dengan TypeORM dan PostgreSQL.",
              },
              {
                icon: "🎨",
                title: "UI Modern",
                desc: "Tampilan bersih dengan Next.js App Router dan Tailwind CSS.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm">
        © {new Date().getFullYear()} MyApp. Built with Next.js + NestJS + PostgreSQL.
      </footer>
    </div>
  );
}
