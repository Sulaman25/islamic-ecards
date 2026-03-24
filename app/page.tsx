import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const OCCASION_CATEGORIES = [
  {
    slug: "eid",
    label: "Eid",
    arabic: "العيد",
    icon: "🌙",
    description: "Eid ul-Fitr & Eid ul-Adha",
    color: "from-amber-900 to-yellow-800",
  },
  {
    slug: "ramadan",
    label: "Ramadan",
    arabic: "رمضان",
    icon: "✨",
    description: "Ramadan Mubarak & Laylatul Qadr",
    color: "from-indigo-900 to-blue-900",
  },
  {
    slug: "nikah",
    label: "Nikah",
    arabic: "النكاح",
    icon: "💍",
    description: "Islamic Wedding Blessings",
    color: "from-rose-900 to-pink-900",
  },
  {
    slug: "jummah",
    label: "Jummah",
    arabic: "الجمعة",
    icon: "🕌",
    description: "Jummah Mubarak",
    color: "from-emerald-900 to-green-900",
  },
  {
    slug: "hajj",
    label: "Hajj & Umrah",
    arabic: "الحج",
    icon: "🕋",
    description: "Pilgrimage Blessings",
    color: "from-stone-800 to-amber-900",
  },
  {
    slug: "general",
    label: "Blessings",
    arabic: "أدعية",
    icon: "🤲",
    description: "General Islamic Du'a",
    color: "from-teal-900 to-cyan-900",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="pattern-islamic text-white py-24 px-4 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="font-arabic text-2xl text-amber-300 mb-4 tracking-widest">
            بسم الله الرحمن الرحيم
          </p>
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            <span className="text-gold-shimmer">Islamic Ecards</span>
          </h1>
          <p className="text-xl text-stone-300 mb-8 font-light">
            Send beautiful animated cards for Eid, Ramadan, Nikah &amp; more —
            personalized with AI and Quranic wisdom.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/cards"
              className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-full font-semibold text-lg transition-colors shadow-lg"
            >
              Browse Cards
            </Link>
            <Link
              href="/pricing"
              className="border border-amber-400 text-amber-300 hover:bg-amber-900/40 px-8 py-3 rounded-full font-semibold text-lg transition-colors"
            >
              View Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Occasion Categories */}
      <section className="py-16 px-4 max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center text-stone-800 mb-2">
          Choose an Occasion
        </h2>
        <p className="text-center text-stone-500 mb-10">
          Find the perfect card for every Islamic occasion
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {OCCASION_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/cards?occasion=${cat.slug}`}
              className={`card-hover bg-gradient-to-br ${cat.color} text-white rounded-2xl p-6 flex flex-col gap-2 shadow-md`}
            >
              <span className="text-3xl">{cat.icon}</span>
              <div>
                <h3 className="text-xl font-bold">{cat.label}</h3>
                <p className="font-arabic text-amber-300 text-lg">
                  {cat.arabic}
                </p>
              </div>
              <p className="text-sm text-white/70 mt-auto">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-stone-800 mb-12">
            Why Islamic Ecards?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎨",
                title: "Animated Cards",
                desc: "Beautiful Islamic geometric animations with Arabic calligraphy.",
              },
              {
                icon: "🤖",
                title: "AI Messages",
                desc: "Claude AI generates heartfelt, authentic Islamic greetings tailored to you.",
              },
              {
                icon: "📱",
                title: "Share Anywhere",
                desc: "Send via email or WhatsApp — your recipient opens a stunning animated card.",
              },
              {
                icon: "📖",
                title: "Quranic Verses",
                desc: "Include meaningful Quranic verses in Arabic and English.",
              },
              {
                icon: "🌙",
                title: "All Occasions",
                desc: "Eid, Ramadan, Nikah, Hajj, Jummah, Aqiqah and more.",
              },
              {
                icon: "✏️",
                title: "Personalised",
                desc: "Add names, custom messages, choose fonts and colours.",
              },
            ].map((f) => (
              <div key={f.title} className="text-center p-6">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-stone-800 mb-2">
                  {f.title}
                </h3>
                <p className="text-stone-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pattern-islamic text-white py-8 px-4 text-center mt-auto">
        <p className="font-arabic text-amber-300 text-lg mb-1">
          جزاك الله خيراً
        </p>
        <p className="text-stone-400 text-sm">
          Islamic Ecards © {new Date().getFullYear()} — Spreading Blessings
        </p>
      </footer>
    </div>
  );
}
