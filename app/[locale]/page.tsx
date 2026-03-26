import { Link } from "@/lib/i18n-navigation";
import { Navbar } from "@/components/layout/Navbar";
import { getTranslations } from "next-intl/server";

const OCCASION_CATEGORIES = [
  { slug: "eid", label: "Eid", arabic: "العيد", icon: "🌙", description: "Eid ul-Fitr & Eid ul-Adha", color: "from-amber-900 to-yellow-800" },
  { slug: "ramadan", label: "Ramadan", arabic: "رمضان", icon: "✨", description: "Ramadan Mubarak & Laylatul Qadr", color: "from-indigo-900 to-blue-900" },
  { slug: "nikah", label: "Nikah", arabic: "النكاح", icon: "💍", description: "Islamic Wedding Blessings", color: "from-rose-900 to-pink-900" },
  { slug: "jummah", label: "Jummah", arabic: "الجمعة", icon: "🕌", description: "Jummah Mubarak", color: "from-emerald-900 to-green-900" },
  { slug: "hajj", label: "Hajj & Umrah", arabic: "الحج", icon: "🕋", description: "Pilgrimage Blessings", color: "from-stone-800 to-amber-900" },
  { slug: "general", label: "Blessings", arabic: "أدعية", icon: "🤲", description: "General Islamic Du'a", color: "from-teal-900 to-cyan-900" },
];

/** Inline SVG geometric overlay for each occasion card */
function OccasionPattern({ slug }: { slug: string }) {
  // Each slug gets a distinct simple Islamic geometric motif
  if (slug === "eid") {
    // Crescent + star grid
    return (
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="pat-eid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="12" fill="none" stroke="#c9a84c" strokeWidth="1" />
            <circle cx="24" cy="20" r="9" fill="#1a1208" />
            <polygon points="20,8 21.5,13 27,13 22.5,16.5 24,22 20,18.5 16,22 17.5,16.5 13,13 18.5,13" fill="#c9a84c" opacity="0.6" transform="scale(0.5) translate(20,16)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pat-eid)" opacity="0.12" />
      </svg>
    );
  }
  if (slug === "ramadan") {
    // Geometric diamond lattice
    return (
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="pat-ramadan" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
            <polygon points="18,2 34,18 18,34 2,18" fill="none" stroke="#c9a84c" strokeWidth="1" />
            <polygon points="18,8 28,18 18,28 8,18" fill="none" stroke="#c9a84c" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pat-ramadan)" opacity="0.12" />
      </svg>
    );
  }
  if (slug === "nikah") {
    // Interlocking rings / arabesque
    return (
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="pat-nikah" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
            <circle cx="16" cy="24" r="10" fill="none" stroke="#c9a84c" strokeWidth="1" />
            <circle cx="32" cy="24" r="10" fill="none" stroke="#c9a84c" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pat-nikah)" opacity="0.12" />
      </svg>
    );
  }
  if (slug === "jummah") {
    // 6-pointed star grid
    return (
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="pat-jummah" x="0" y="0" width="44" height="44" patternUnits="userSpaceOnUse">
            <polygon points="22,4 26,16 38,16 29,24 32,36 22,29 12,36 15,24 6,16 18,16" fill="none" stroke="#c9a84c" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pat-jummah)" opacity="0.12" />
      </svg>
    );
  }
  if (slug === "hajj") {
    // Concentric squares (Kaaba-inspired)
    return (
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="pat-hajj" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect x="4" y="4" width="32" height="32" fill="none" stroke="#c9a84c" strokeWidth="1" />
            <rect x="10" y="10" width="20" height="20" fill="none" stroke="#c9a84c" strokeWidth="0.7" />
            <rect x="16" y="16" width="8" height="8" fill="none" stroke="#c9a84c" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pat-hajj)" opacity="0.12" />
      </svg>
    );
  }
  // general — arabesque cross grid
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="pat-general" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <line x1="15" y1="0" x2="15" y2="30" stroke="#c9a84c" strokeWidth="0.6" />
          <line x1="0" y1="15" x2="30" y2="15" stroke="#c9a84c" strokeWidth="0.6" />
          <circle cx="15" cy="15" r="4" fill="none" stroke="#c9a84c" strokeWidth="0.8" />
          <circle cx="15" cy="15" r="1.5" fill="#c9a84c" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pat-general)" opacity="0.12" />
    </svg>
  );
}

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative min-h-[85vh] flex items-center justify-center text-white overflow-hidden"
        style={{ background: "#0d2318" }}
      >
        {/* Radial gold glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201,168,76,0.13) 0%, rgba(201,168,76,0.04) 50%, transparent 100%)",
          }}
        />

        {/* Large rotating 8-pointed star SVG — decorative background */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none animate-slow-rotate"
          style={{ opacity: 0.06 }}
        >
          <svg
            width="820"
            height="820"
            viewBox="0 0 820 820"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* 8-pointed star built from two overlapping squares */}
            <g fill="#c9a84c" fillRule="evenodd">
              <polygon points="410,30 500,320 790,410 500,500 410,790 320,500 30,410 320,320" />
              <polygon
                points="410,30 500,320 790,410 500,500 410,790 320,500 30,410 320,320"
                transform="rotate(22.5 410 410)"
              />
            </g>
          </svg>
        </div>

        {/* Small tiling Islamic plus pattern (reusing existing class) */}
        <div className="absolute inset-0 pattern-islamic opacity-40 pointer-events-none" />

        {/* Hero content */}
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          {/* Bismillah */}
          <p
            className="font-arabic text-3xl md:text-4xl text-amber-300 mb-4 tracking-widest animate-fade-up"
            style={{ textShadow: "0 0 24px rgba(201,168,76,0.4)" }}
          >
            بسم الله الرحمن الرحيم
          </p>

          {/* Gold divider */}
          <div className="flex items-center justify-center gap-3 mb-6 animate-fade-up-delay-1">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#c9a84c]" />
            <span style={{ color: "#c9a84c", fontSize: "0.6rem" }}>✦</span>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#c9a84c]" />
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-5 leading-tight animate-fade-up-delay-1">
            <span className="text-gold-shimmer">Islamic Ecards</span>
          </h1>

          <p className="text-xl text-stone-300 mb-10 font-light animate-fade-up-delay-2">
            {t("heroSubtitle")}
          </p>

          <div className="flex flex-wrap gap-4 justify-center animate-fade-up-delay-3">
            <Link
              href="/cards"
              className="px-8 py-3 rounded-full font-semibold text-lg transition-all shadow-lg"
              style={{
                background: "#c9a84c",
                color: "#1a1208",
              }}
            >
              {t("browseCards")}
            </Link>
            <Link
              href="/pricing"
              className="border border-[#c9a84c]/70 text-[#c9a84c] hover:bg-[#c9a84c]/10 px-8 py-3 rounded-full font-semibold text-lg transition-all"
            >
              {t("viewPlans")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Arabic decorative separator ─────────────────────── */}
      <div
        className="flex items-center justify-center gap-4 py-8"
        style={{ background: "#faf3e8" }}
      >
        <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-[#c9a84c]/40" />
        <span className="font-arabic text-[#c9a84c] text-2xl tracking-widest">✦ ✦ ✦</span>
        <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-[#c9a84c]/40" />
      </div>

      {/* ── Occasion Categories ──────────────────────────────── */}
      <section className="py-16 px-4 max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-2 animate-fade-up" style={{ color: "#1a1208" }}>
          {t("chooseOccasion")}
        </h2>
        <p className="text-center mb-10 animate-fade-up-delay-1" style={{ color: "#6b5a3e" }}>
          {t("occasionSubtitle")}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {OCCASION_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/cards?occasion=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl p-6 flex flex-col gap-3 shadow-lg card-hover transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #1a1208 0%, #2d1b0e 100%)",
                borderTop: "2px solid rgba(201,168,76,0.6)",
              }}
            >
              {/* Geometric pattern overlay */}
              <OccasionPattern slug={cat.slug} />

              {/* Gold top border brightens on hover via Tailwind group */}
              <div
                className="absolute inset-x-0 top-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "#c9a84c" }}
              />

              {/* Icon — small, top-right */}
              <span
                className="absolute top-4 right-4 text-xl opacity-60 group-hover:opacity-90 transition-opacity"
                aria-hidden="true"
              >
                {cat.icon}
              </span>

              {/* Text content */}
              <div className="relative z-10 mt-2">
                <p
                  className="font-arabic text-2xl mb-1 leading-relaxed"
                  style={{ color: "#c9a84c" }}
                >
                  {cat.arabic}
                </p>
                <h3 className="text-xl font-bold text-white">{cat.label}</h3>
              </div>

              <p className="relative z-10 text-sm mt-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
                {cat.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Arabic decorative separator ─────────────────────── */}
      <div className="flex items-center justify-center gap-4 py-6" style={{ background: "#faf3e8" }}>
        <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-[#c9a84c]/40" />
        <span className="font-arabic text-[#c9a84c] text-2xl tracking-widest">✦ ✦ ✦</span>
        <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-[#c9a84c]/40" />
      </div>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-16 px-4" style={{ background: "#0f1f14" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12 animate-fade-up">
            {t("whyTitle")}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "🎨", title: "Animated Cards", desc: "Beautiful Islamic geometric animations with Arabic calligraphy." },
              { icon: "🤖", title: "AI Messages", desc: "Claude AI generates heartfelt, authentic Islamic greetings tailored to you." },
              { icon: "📱", title: "Share Anywhere", desc: "Send via email or WhatsApp — your recipient opens a stunning animated card." },
              { icon: "📖", title: "Quranic Verses", desc: "Include meaningful Quranic verses in Arabic and English." },
              { icon: "🌙", title: "All Occasions", desc: "Eid, Ramadan, Nikah, Hajj, Jummah, Aqiqah and more." },
              { icon: "✏️", title: "Personalised", desc: "Add names, custom messages, choose fonts and colours." },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl p-6 text-center transition-all duration-300"
                style={{
                  border: "1px solid rgba(201,168,76,0.2)",
                  background: "rgba(255,255,255,0.05)",
                }}
                onMouseEnter={undefined}
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: "#c9a84c" }}
                >
                  {f.title}
                </h3>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="pattern-islamic text-white py-10 px-4 text-center mt-auto">
        <p
          className="font-arabic text-amber-300 text-2xl mb-2"
          style={{ textShadow: "0 0 16px rgba(201,168,76,0.3)" }}
        >
          جزاك الله خيراً
        </p>
        <p className="font-arabic text-amber-200/60 text-base mb-3">
          أكثر من مئة بطاقة إسلامية مصمَّمة بعناية
        </p>
        <p className="text-stone-400 text-sm">
          Islamic Ecards © {new Date().getFullYear()} — {t("footerTagline")}
        </p>
      </footer>
    </div>
  );
}
