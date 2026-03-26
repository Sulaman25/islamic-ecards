import { Navbar } from "@/components/layout/Navbar";
import { AuroraBackground } from "@/components/home/AuroraBackground";
import { CustomCursor } from "@/components/home/CustomCursor";
import { SocialTicker } from "@/components/home/SocialTicker";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustBar } from "@/components/home/TrustBar";
import { OccasionMedallions } from "@/components/home/OccasionMedallions";
import { MoodFilter } from "@/components/home/MoodFilter";
import { MasonryGrid } from "@/components/home/MasonryGrid";
import { Link } from "@/lib/i18n-navigation";

const FEATURED_CARDS = [
  { id: "eid-crescent",    gradient: "linear-gradient(135deg,#b8860b,#f0d080)", icon: "🌙", title: "Eid al-Fitr Mubarak",   sub: "Celebrate with gold",  badge: "NEW" },
  { id: "ramadan-lantern", gradient: "linear-gradient(135deg,#1a1a5e,#4040a0)", icon: "🏮", title: "Ramadan Kareem",          sub: "30 days of blessing",  badge: "POPULAR" },
  { id: "nikah-gold",      gradient: "linear-gradient(135deg,#6b2737,#c0456e)", icon: "💍", title: "Nikah Mubarak",           sub: "Islamic wedding card",  badge: "ANIMATED" },
  { id: "qadr-night",      gradient: "linear-gradient(135deg,#050520,#1a1a60)", icon: "✨", title: "Laylatul Qadr",           sub: "Night of Power",        badge: "PREMIUM" },
  { id: "hajj-kaaba",      gradient: "linear-gradient(135deg,#2d2010,#5a4020)", icon: "🕋", title: "Hajj Mubarak",            sub: "Pilgrimage blessings",  badge: "HOT" },
];

const BADGE_COLORS: Record<string, string> = {
  NEW: "rgba(255,107,157,0.85)", POPULAR: "rgba(240,208,128,0.85)",
  ANIMATED: "rgba(78,205,196,0.85)", PREMIUM: "#f0d080", HOT: "rgba(255,80,50,0.85)",
};
const BADGE_TEXT: Record<string, string> = {
  NEW: "#1a000d", POPULAR: "#1a1000", ANIMATED: "#001a18", PREMIUM: "#0a0700", HOT: "#fff",
};

export default function HomePage() {
  return (
    <div style={{ background: "var(--v3-bg)", color: "var(--v3-text)", minHeight: "100vh", overflowX: "hidden" }}>
      {/* Background layers */}
      <AuroraBackground />
      <CustomCursor />

      {/* Navigation */}
      <Navbar />

      {/* Social ticker */}
      <div style={{ marginTop: "64px" }}>
        <SocialTicker />
      </div>

      {/* Hero */}
      <HeroSection />

      {/* Trust bar */}
      <TrustBar />

      {/* ── Occasion Medallions ─────────────────────────── */}
      <section style={{ position: "relative", zIndex: 2, padding: "48px 32px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "24px" }}>
          <h2 className="v3-section-title">Browse by Occasion</h2>
          <Link href="/cards" style={{ fontSize: "0.82rem", color: "var(--gold)", opacity: 0.7, textDecoration: "none" }}>
            View all →
          </Link>
        </div>
        <OccasionMedallions />
      </section>

      {/* ── Featured Carousel ────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 2, padding: "48px 32px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "24px" }}>
          <h2 className="v3-section-title">Featured Cards</h2>
          <Link href="/cards" style={{ fontSize: "0.82rem", color: "var(--gold)", opacity: 0.7, textDecoration: "none" }}>
            See all →
          </Link>
        </div>
        <div style={{ display: "flex", gap: "20px", overflowX: "auto", paddingBottom: "8px", scrollbarWidth: "none" }}>
          {FEATURED_CARDS.map(card => (
            <Link
              key={card.id}
              href={`/customize/${card.id}`}
              className="v3-featured-card"
              style={{ textDecoration: "none", display: "block" }}
            >
              <div style={{ position: "absolute", inset: 0, background: card.gradient, opacity: 0.9 }} />
              <div style={{ position: "absolute", top: "12px", left: "12px", background: BADGE_COLORS[card.badge], color: BADGE_TEXT[card.badge], fontSize: "0.65rem", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase", padding: "3px 8px", borderRadius: "4px" }}>
                {card.badge}
              </div>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "20px", background: "linear-gradient(0deg,rgba(0,0,0,0.7) 0%,transparent 55%)" }}>
                <p style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "4px", color: "#fff" }}>{card.title}</p>
                <p style={{ fontSize: "0.75rem", opacity: 0.65, color: "#fff" }}>{card.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Discovery: Mood Filter + Masonry ─────────────── */}
      <section style={{ position: "relative", zIndex: 2, padding: "48px 32px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 className="v3-section-title">Discover by Mood</h2>
        </div>
        <MoodFilter />
        <MasonryGrid />
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 2, padding: "0 32px 56px" }}>
        <div className="v3-cta-banner">
          <p style={{ fontSize: "0.75rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "12px", opacity: 0.8 }}>
            Start for free
          </p>
          <h2 style={{ fontSize: "clamp(1.6rem,4vw,2.6rem)", fontWeight: 800, marginBottom: "12px", color: "#fff" }}>
            Send Blessings Today
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--v3-text-dim)", marginBottom: "28px", maxWidth: "420px", margin: "0 auto 28px" }}>
            3 free cards per month. No credit card required. Upgrade anytime for unlimited sends.
          </p>
          <Link href="/cards" className="v3-cta-btn">Browse Cards →</Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="v3-footer" style={{ position: "relative", zIndex: 2 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--gold)", marginBottom: "8px" }}>☽ Noor Cards</p>
          <p style={{ fontSize: "0.82rem", color: "var(--v3-text-dim)", lineHeight: 1.6, maxWidth: "220px" }}>
            Beautiful animated Islamic ecards with AI-generated greetings and Quranic wisdom.
          </p>
        </div>
        <div className="v3-footer-col">
          <h4>Cards</h4>
          <Link href="/cards">Browse All</Link>
          <Link href="/cards?occasion=eid">Eid Cards</Link>
          <Link href="/cards?occasion=ramadan">Ramadan Cards</Link>
          <Link href="/cards?occasion=nikah">Nikah Cards</Link>
        </div>
        <div className="v3-footer-col">
          <h4>Account</h4>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/sign-in">Sign In</Link>
        </div>
        <div className="v3-footer-col">
          <h4>Occasions</h4>
          <Link href="/cards?occasion=jummah">Jummah</Link>
          <Link href="/cards?occasion=hajj">Hajj & Umrah</Link>
          <Link href="/cards?occasion=aqiqah">Aqiqah</Link>
          <Link href="/cards?occasion=general">Du&apos;a & Blessings</Link>
        </div>
      </footer>
      <div style={{ position: "relative", zIndex: 2, borderTop: "1px solid var(--v3-border)", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: "0.78rem", color: "var(--v3-text-dim)" }}>Islamic Ecards © {new Date().getFullYear()} — Spreading Blessings</p>
        <p style={{ fontSize: "0.78rem", color: "var(--v3-text-dim)", fontFamily: "var(--font-arabic, serif)" }}>جزاك الله خيراً</p>
      </div>
    </div>
  );
}
