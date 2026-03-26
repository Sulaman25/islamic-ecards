import { Navbar } from "@/components/layout/Navbar";
import { AuroraBackground } from "@/components/home/AuroraBackground";
import { CustomCursor } from "@/components/home/CustomCursor";
import { SocialTicker } from "@/components/home/SocialTicker";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustBar } from "@/components/home/TrustBar";
import { OccasionMedallions } from "@/components/home/OccasionMedallions";
import { HeroSpotlight } from "@/components/home/HeroSpotlight";
import { DiscoverGrid }  from "@/components/home/DiscoverGrid";
import { Link } from "@/lib/i18n-navigation";

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

      {/* ── Hero Spotlight (calendar-curated featured cards) ── */}
      <section style={{ position: "relative", zIndex: 2, padding: "48px 32px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "28px" }}>
          <h2 className="v3-section-title">Featured Cards</h2>
          <a href="/cards" style={{ fontSize: "0.82rem", color: "var(--gold)", opacity: 0.7, textDecoration: "none" }}>See all →</a>
        </div>
        <HeroSpotlight />
      </section>

      {/* ── Discover Grid ─────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 2, padding: "48px 32px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "24px" }}>
          <h2 className="v3-section-title">Discover Cards</h2>
        </div>
        <DiscoverGrid />
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
