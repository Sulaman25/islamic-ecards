"use client";
// components/home/HomePageClient.tsx
// Full homepage UI matching homepage-full.html.
// Sections: Hero (lanterns) · Trending Cards · What's Coming Up
//           (countdown + upcoming strip + card of day + reminders) · How It Works · Footer

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/lib/i18n-navigation";
import { AuroraBackground } from "@/components/home/AuroraBackground";
import { CustomCursor } from "@/components/home/CustomCursor";
import { Navbar } from "@/components/layout/Navbar";
import type { UpcomingOccasion } from "@/lib/hijri/occasions";
import { TemplateCardPreview } from "@/components/cards/TemplateCardPreview";
import type { CardCanvasTemplate } from "@/components/cards/CardCanvas";
import { applySpecialTemplateArtwork } from "@/lib/card-themes/special-template-artwork";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TrendingCard {
  id: string;
  titleEn: string;
  titleAr: string;
  bgColor: string;
  bgImageUrl?: string;
  animationFile?: string;
  animationStyle?: string | null;
  isPremium: boolean;
  occasionSlug: string;
  occasionNameEn: string;
}

interface CardOfTheDay {
  id: string;
  titleEn: string;
  titleAr: string;
  bgColor: string;
  bgImageUrl?: string;
  animationFile?: string;
  animationStyle?: string | null;
  occasionNameEn: string;
  occasionSlug: string;
}

interface Props {
  trendingCards: TrendingCard[];
  cardOfTheDay: CardOfTheDay | null;
  nextOccasion: UpcomingOccasion | null;
  upcomingOccasions: UpcomingOccasion[];
}

// ─── Static lantern data ──────────────────────────────────────────────────────

const LANTERNS = [
  { slug: "eid-ul-fitr", arabic: "عيد مبارك",   occasion: "Eid al-Fitr",  name: "Moonrise Blessing",  icon: "🎁",  bg: "linear-gradient(145deg,#0f2d1a,#1a4a2a,#0a1f10)", glow: "rgba(50,200,100,.5)",  anim: "hpFloatA", dur: "6s",   delay: "0s",   str: 30, w: 180, h: 240 },
  { slug: "ramadan",     arabic: "رمضان كريم",  occasion: "Ramadan",      name: "The Sacred Month",   icon: "📿",  bg: "linear-gradient(145deg,#1a0f2d,#2d1a4a,#100a1f)", glow: "rgba(130,60,220,.5)", anim: "hpFloatB", dur: "7s",   delay: ".8s",  str: 60, w: 220, h: 300 },
  { slug: "nikah",       arabic: "مبروك",        occasion: "Nikah",        name: "A New Beginning",    icon: "💍",  bg: "linear-gradient(145deg,#2d1a0f,#4a2d1a,#1f100a)", glow: "rgba(200,120,30,.5)", anim: "hpFloatC", dur: "8s",   delay: "1.5s", str: 20, w: 260, h: 340 },
  { slug: "hajj",        arabic: "حج مبرور",    occasion: "Hajj",         name: "Mabrook al-Hajj",    icon: "🕋",  bg: "linear-gradient(145deg,#0f1a2d,#1a2d4a,#0a101f)", glow: "rgba(30,100,220,.5)", anim: "hpFloatD", dur: "6.5s", delay: ".3s",  str: 50, w: 240, h: 310 },
  { slug: "eid-ul-adha", arabic: "عيد الأضحى", occasion: "Eid al-Adha",  name: "Blessed Sacrifice",  icon: "🐑",  bg: "linear-gradient(145deg,#1a2d0f,#2d4a1a,#101f0a)", glow: "rgba(80,200,80,.5)",  anim: "hpFloatE", dur: "7.5s", delay: "1.1s", str: 35, w: 200, h: 260 },
  { slug: "aqiqah",      arabic: "نور",          occasion: "New Born",     name: "A New Noor",         icon: "🕯️", bg: "linear-gradient(145deg,#2d2a0f,#4a421a,#1f1c0a)", glow: "rgba(220,200,60,.5)", anim: "hpFloatF", dur: "5.8s", delay: ".6s",  str: 70, w: 160, h: 200 },
];

const LANTERN_LEFT = ["4%", "18%", "36%", "57%", "74%", "88%"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OCCASION_ICONS: Record<string, string> = {
  "eid-ul-fitr": "🌙", "eid-ul-adha": "🐑", "ramadan": "📿",
  "laylatul-qadr": "✨", "nikah": "💍", "hajj": "🕋",
  "jummah": "🌙", "aqiqah": "🕯️", "mawlid": "☪️",
  "islamic-new-year": "🌙", "general": "✨",
};

const SLUG_BG: Record<string, string> = {
  "eid-ul-fitr": "linear-gradient(145deg,#0f2d1a,#1a4a2a)",
  "eid-ul-adha": "linear-gradient(145deg,#1a2d0f,#2d4a1a)",
  "ramadan":     "linear-gradient(145deg,#1a0f2d,#2d1a4a)",
  "nikah":       "linear-gradient(145deg,#2d1a0f,#4a2d1a)",
  "hajj":        "linear-gradient(145deg,#0f1a2d,#1a2d4a)",
  "jummah":      "linear-gradient(145deg,#180810,#2c1022)",
  "aqiqah":      "linear-gradient(145deg,#2d2a0f,#4a421a)",
  "general":     "linear-gradient(145deg,#0d0b1e,#1a1635)",
};

function slugBg(slug: string, fallback: string) {
  return SLUG_BG[slug] ?? fallback ?? "linear-gradient(145deg,#0a1a0a,#1a2a1a)";
}

function toPreviewTemplate(card: TrendingCard | CardOfTheDay): CardCanvasTemplate {
  return applySpecialTemplateArtwork({
    bgColor: card.bgColor,
    bgImageUrl: card.bgImageUrl,
    titleAr: card.titleAr,
    titleEn: card.titleEn,
    animationFile: card.animationFile,
    animationStyle: card.animationStyle,
    occasion: {
      slug: card.occasionSlug,
      nameEn: card.occasionNameEn,
    },
  });
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// ─── Countdown hook ───────────────────────────────────────────────────────────

function useCountdown(target: Date | null) {
  const [t, setT] = useState({ days: "--", hours: "--", mins: "--", secs: "--" });
  useEffect(() => {
    if (!target) return;
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setT({
        days:  pad(Math.floor(diff / 86_400_000)),
        hours: pad(Math.floor((diff % 86_400_000) / 3_600_000)),
        mins:  pad(Math.floor((diff % 3_600_000) / 60_000)),
        secs:  pad(Math.floor((diff % 60_000) / 1_000)),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HomePageClient({
  trendingCards,
  cardOfTheDay,
  nextOccasion,
  upcomingOccasions,
}: Props) {
  const router = useRouter();
  const cd = useCountdown(nextOccasion?.nextDate ?? null);

  const upcomingStrip = upcomingOccasions.slice(1, 4);
  const reminderList  = upcomingOccasions.slice(0, 4);

  return (
    <>
      <style>{HP_CSS}</style>
      <div className="hp-root">
        {/* Fixed background layers */}
        <div className="hp-stars" aria-hidden="true" />
        <div className="hp-geo-bg" aria-hidden="true" />
        <div className="hp-aurora-bg" aria-hidden="true" />
        <AuroraBackground />
        <CustomCursor />

        {/* Nav */}
        <Navbar />

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <section className="hp-hero">
          <div className="hp-moon" aria-hidden="true">
            <div className="hp-moon-outer" />
            <div className="hp-moon-cutout" />
          </div>

          <p className="hp-bismillah">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>

          <div className="hp-hero-copy">
            <p className="hp-hero-label">Islamic Ecards Platform</p>
            <h1 className="hp-hero-h1">
              Send Blessings<br />with <em>Noor</em>
            </h1>
            <p className="hp-hero-sub">
              Beautiful animated Islamic ecards for every occasion — Eid, Ramadan, Nikah, Hajj &amp; more.
            </p>
            <div className="hp-hero-actions">
              <button className="hp-btn-primary" onClick={() => router.push("/cards")}>
                Browse Cards →
              </button>
              <button className="hp-btn-ghost" onClick={() => router.push("/pricing")}>
                See Pricing
              </button>
            </div>
          </div>

          {/* Lantern stage */}
          <div className="hp-lantern-stage" aria-hidden="true">
            {LANTERNS.map((l, i) => (
              <div
                key={l.slug}
                className="hp-lantern-wrap"
                style={{ left: LANTERN_LEFT[i] }}
                onClick={() => router.push(`/cards?occasion=${l.slug}`)}
              >
                <div className="hp-string" style={{ height: l.str }} />
                <div
                  className="hp-lantern-card"
                  style={{
                    width: l.w,
                    height: l.h,
                    background: l.bg,
                    animation: `${l.anim} ${l.dur} ease-in-out infinite ${l.delay}`,
                  }}
                >
                  <div
                    className="hp-card-motif"
                    style={{ fontSize: i === 1 || i === 2 ? "3.5rem" : "2.2rem" }}
                  >
                    {l.icon}
                  </div>
                  <div className="hp-card-inner">
                    <div className="hp-card-arabic">{l.arabic}</div>
                    <div className="hp-card-occasion">{l.occasion}</div>
                    <div className="hp-card-name">{l.name}</div>
                  </div>
                </div>
                <div className="hp-lantern-glow" style={{ background: l.glow }} />
              </div>
            ))}
          </div>
        </section>

        <hr className="hp-divider" />

        {/* ══ TRENDING CARDS ════════════════════════════════════════════════ */}
        <div className="hp-section hp-featured-section" style={{ paddingTop: 70 }}>
          <div className="hp-feat-header">
            <div>
              <div className="hp-feat-title">Trending This Season</div>
              <div className="hp-feat-sub">Most sent cards right now</div>
            </div>
            <Link href="/cards" className="hp-see-all">View all cards →</Link>
          </div>
          <div className="hp-cards-grid">
            {trendingCards.map((card, i) => (
              <div
                key={card.id}
                className="hp-feat-card"
                onClick={() => router.push(`/customize/${card.id}`)}
              >
                <div
                  className="hp-feat-card-img"
                  style={{ background: slugBg(card.occasionSlug, card.bgColor) }}
                >
                  <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
                    <TemplateCardPreview
                      template={toPreviewTemplate(card)}
                      variant="floating"
                      cardWidth="136px"
                    />
                  </div>
                </div>
                {i === 0 && <div className="hp-feat-badge">TRENDING</div>}
                {card.isPremium && i !== 0 && (
                  <div className="hp-feat-badge" style={{ background: "rgba(167,139,250,.9)", color: "#fff" }}>
                    ✦ PRO
                  </div>
                )}
                <div className="hp-feat-card-body">
                  <div className="hp-feat-card-occasion">{card.occasionNameEn}</div>
                  <div className="hp-feat-card-name">{card.titleEn}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="hp-divider" />

        {/* ══ WHAT'S COMING UP ══════════════════════════════════════════════ */}
        <div className="hp-section hp-countdown-section">
          <span className="hp-section-label">Never Miss a Blessed Occasion</span>
          <div className="hp-section-title">What&apos;s Coming Up</div>
          <div style={{ textAlign: "center", marginTop: -36, marginBottom: 36 }}>
            <span style={{ fontSize: ".62rem", color: "rgba(240,208,128,.35)", letterSpacing: 1 }}>
              🌙 Dates calculated from hardcoded 2026–2027 Islamic occasions · Updates each year
            </span>
          </div>

          {/* Hero countdown */}
          {nextOccasion && (
            <div className="hp-hero-countdown">
              <div className="hp-hc-left">
                <div className="hp-hc-urgency">
                  <div className="hp-urgency-dot" />
                  NEXT OCCASION
                </div>
                <div className="hp-hc-name">{nextOccasion.nameEn}</div>
                <div className="hp-hc-arabic">{nextOccasion.nameAr}</div>
                <div className="hp-hc-desc">{nextOccasion.description}</div>
                <button
                  className="hp-hc-cta"
                  onClick={() => router.push(`/cards?occasion=${nextOccasion.slug}`)}
                >
                  Browse {nextOccasion.nameEn} Cards →
                </button>
              </div>
              <div className="hp-hc-right">
                <span className="hp-hc-icon">{nextOccasion.icon}</span>
                <div className="hp-countdown-tiles">
                  {[
                    { v: cd.days,  l: "Days"  },
                    { v: cd.hours, l: "Hours" },
                    { v: cd.mins,  l: "Mins"  },
                    { v: cd.secs,  l: "Secs"  },
                  ].map((t, i) => (
                    <div key={t.l} style={{ display: "contents" }}>
                      <div className="hp-tile">
                        <span className="hp-tile-num">{t.v}</span>
                        <span className="hp-tile-label">{t.l}</span>
                      </div>
                      {i < 3 && <div className="hp-tile-sep">:</div>}
                    </div>
                  ))}
                </div>
                <div className="hp-hc-hijri">in {nextOccasion.daysAway} days</div>
              </div>
            </div>
          )}

          {/* Upcoming strip */}
          <div className="hp-upcoming-strip">
            {upcomingStrip.map((occ) => {
              const soon = occ.daysAway <= 14;
              const pct  = Math.max(0, Math.min(100, Math.round((1 - occ.daysAway / 180) * 100)));
              return (
                <div
                  key={occ.slug}
                  className={`hp-upcoming-card${soon ? " soon" : ""}`}
                  onClick={() => router.push(`/cards?occasion=${occ.slug}`)}
                >
                  <span className="hp-uc-icon">{occ.icon}</span>
                  <div className="hp-uc-name">{occ.nameEn}</div>
                  <div className="hp-uc-days">in <strong>{occ.daysAway} days</strong></div>
                  <div className="hp-uc-bar-wrap">
                    <div className="hp-uc-bar" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Daily row */}
          <div className="hp-daily-row">
            {/* Card of the Day */}
            <div className="hp-daily-card">
              <div className="hp-daily-badge">✨ CARD OF THE DAY</div>
              <div className="hp-daily-title">Today&apos;s Blessed Card</div>
              <div className="hp-daily-sub">
                A new card is revealed every day. Share it, save it, or send it to someone who needs a reminder of Allah&apos;s blessings.
              </div>
              <div
                className="hp-daily-preview"
                style={{
                  background: cardOfTheDay
                    ? slugBg(cardOfTheDay.occasionSlug, cardOfTheDay.bgColor)
                    : "linear-gradient(145deg,#1a0f2d,#2d1a4a)",
                }}
              >
                {cardOfTheDay ? (
                  <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
                    <TemplateCardPreview
                      template={toPreviewTemplate(cardOfTheDay)}
                      variant="floating"
                      cardWidth="104px"
                    />
                  </div>
                ) : (
                  <span style={{ position: "relative", zIndex: 1 }}>🌙</span>
                )}
              </div>
              <div className="hp-daily-actions">
                <button
                  className="hp-btn-sm-gold"
                  onClick={() => cardOfTheDay && router.push(`/customize/${cardOfTheDay.id}`)}
                >
                  Send This Card →
                </button>
                <button className="hp-btn-sm-ghost">Save for Later</button>
              </div>
            </div>

            {/* Reminder card */}
            <div className="hp-reminder-card">
              <div>
                <div className="hp-reminder-title">🔔 Remind Me to Send</div>
                <div className="hp-reminder-sub">
                  Get notified before upcoming occasions so you never send a card late.
                </div>
                <div className="hp-reminder-list">
                  {reminderList.map((occ) => (
                    <div
                      key={occ.slug}
                      className="hp-reminder-item"
                      onClick={() => router.push(`/cards?occasion=${occ.slug}`)}
                    >
                      <span className="hp-ri-icon">{occ.icon}</span>
                      <span className="hp-ri-name">{occ.nameEn}</span>
                      <span className="hp-ri-days">in {occ.daysAway} days</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="hp-btn-reminder">Set Occasion Reminders →</button>
            </div>
          </div>
        </div>

        <hr className="hp-divider" />

        {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
        <div className="hp-section hp-how-section" style={{ paddingTop: 70 }}>
          <h2 className="hp-how-title">Sending takes 60 seconds</h2>
          <p className="hp-how-sub">
            No account needed to browse — sign up only when you&apos;re ready to send
          </p>
          <div className="hp-how-steps">
            {[
              { num: "01", icon: "🎴", title: "Pick a Card",    desc: "Browse 200+ animated Islamic ecards across 12 occasions. Filter by mood, style, or occasion." },
              { num: "02", icon: "✍️", title: "Personalise It", desc: "Add your message — type it yourself or let our AI craft a beautiful Islamic greeting for you." },
              { num: "03", icon: "💌", title: "Send with Love", desc: "Send via email or WhatsApp in one tap. Schedule it for the perfect moment." },
            ].map((s) => (
              <div key={s.num} className="hp-how-step">
                <div className="hp-step-num">{s.num}</div>
                <div className="hp-step-icon">{s.icon}</div>
                <div className="hp-step-title">{s.title}</div>
                <div className="hp-step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
        <footer className="hp-footer">
          <div className="hp-footer-logo">
            <span style={{ color: "#f0d080" }}>☽</span>
            <span style={{ fontSize: ".75rem", color: "rgba(255,255,255,.3)", letterSpacing: 2 }}>
              NOOR CARDS
            </span>
          </div>
          <span className="hp-footer-copy">
            © {new Date().getFullYear()} Noor Cards · Made with love for the Ummah
          </span>
          <div className="hp-footer-links">
            <Link href="/privacy" className="hp-footer-link">Privacy</Link>
            <Link href="/terms"   className="hp-footer-link">Terms</Link>
            <Link href="/contact" className="hp-footer-link">Contact</Link>
          </div>
        </footer>
      </div>
    </>
  );
}

// ─── Scoped CSS (hp- prefix — zero collision with globals) ────────────────────

const HP_CSS = `
.hp-root {
  background: #03020a;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow-x: hidden;
}

/* ── Background layers ── */
.hp-stars {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(1px 1px at 15% 12%, rgba(255,255,255,.8) 0%, transparent 100%),
    radial-gradient(1px 1px at 27% 34%, rgba(255,255,255,.4) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 41% 8%, rgba(240,208,128,.7) 0%, transparent 100%),
    radial-gradient(1px 1px at 55% 22%, rgba(255,255,255,.5) 0%, transparent 100%),
    radial-gradient(1px 1px at 68% 5%, rgba(255,255,255,.6) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 78% 18%, rgba(240,208,128,.5) 0%, transparent 100%),
    radial-gradient(1px 1px at 88% 31%, rgba(255,255,255,.4) 0%, transparent 100%),
    radial-gradient(1px 1px at 9% 45%, rgba(255,255,255,.3) 0%, transparent 100%),
    radial-gradient(1px 1px at 32% 55%, rgba(255,255,255,.5) 0%, transparent 100%),
    radial-gradient(1px 1px at 61% 62%, rgba(255,255,255,.4) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 74% 44%, rgba(255,255,255,.6) 0%, transparent 100%),
    radial-gradient(1px 1px at 92% 57%, rgba(240,208,128,.4) 0%, transparent 100%),
    radial-gradient(1px 1px at 83% 75%, rgba(255,255,255,.5) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 4% 20%, rgba(255,255,255,.5) 0%, transparent 100%),
    radial-gradient(1px 1px at 96% 10%, rgba(255,255,255,.4) 0%, transparent 100%);
}
.hp-geo-bg {
  position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: .025;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cpath d='M60 10 L70 40 L100 40 L76 58 L85 88 L60 70 L35 88 L44 58 L20 40 L50 40 Z' fill='none' stroke='%23f0d080' stroke-width='1'/%3E%3Ccircle cx='60' cy='60' r='28' fill='none' stroke='%23f0d080' stroke-width='.5'/%3E%3C/svg%3E");
  background-size: 120px 120px;
}
.hp-aurora-bg {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 60% 40% at 20% 60%, rgba(10,40,25,.5) 0%, transparent 70%),
    radial-gradient(ellipse 50% 35% at 80% 40%, rgba(20,10,40,.4) 0%, transparent 70%);
}

/* ── Shared section wrapper ── */
.hp-section { position: relative; z-index: 10; max-width: 1100px; margin: 0 auto; }

/* ── Hero ── */
.hp-hero {
  position: relative; z-index: 10;
  min-height: 100vh; display: flex; flex-direction: column; align-items: center;
  padding: 0 24px; overflow: hidden;
}
.hp-moon { position: absolute; top: 60px; right: 120px; width: 70px; height: 70px; z-index: 5; }
.hp-moon-outer { width: 70px; height: 70px; border-radius: 50%; background: #f0d080; box-shadow: 0 0 30px rgba(240,208,128,.25), 0 0 60px rgba(240,208,128,.1); }
.hp-moon-cutout { position: absolute; top: -6px; right: -8px; width: 62px; height: 62px; border-radius: 50%; background: #03020a; }

.hp-bismillah { margin-top: 40px; font-size: .75rem; letter-spacing: 2px; color: rgba(240,208,128,.35); text-align: center; font-style: italic; }
.hp-hero-copy { text-align: center; margin-top: 24px; position: relative; z-index: 10; }
.hp-hero-label { font-size: .62rem; letter-spacing: 4px; color: rgba(240,208,128,.5); text-transform: uppercase; margin-bottom: 14px; }
.hp-hero-h1 { font-size: clamp(2.4rem,5vw,4rem); font-weight: 900; line-height: 1.05; color: #fff; margin-bottom: 16px; }
.hp-hero-h1 em { color: #f0d080; font-style: normal; }
.hp-hero-sub { font-size: .9rem; color: rgba(255,255,255,.4); max-width: 400px; margin: 0 auto 28px; line-height: 1.6; }
.hp-hero-actions { display: flex; gap: 12px; justify-content: center; }
.hp-btn-primary { padding: 13px 32px; border-radius: 28px; font-size: .82rem; font-weight: 700; background: linear-gradient(135deg,#b8860b,#f0d080); color: #1a1208; letter-spacing: .5px; box-shadow: 0 4px 24px rgba(240,208,128,.2); cursor: pointer; border: none; }
.hp-btn-ghost { padding: 13px 28px; border-radius: 28px; font-size: .82rem; border: 1px solid rgba(240,208,128,.2); color: rgba(255,255,255,.5); letter-spacing: .5px; cursor: pointer; background: transparent; }

/* ── Lantern stage ── */
.hp-lantern-stage { position: relative; z-index: 10; width: 100%; max-width: 1100px; height: 480px; margin-top: 20px; }
.hp-lantern-wrap { position: absolute; top: 0; display: flex; flex-direction: column; align-items: center; cursor: pointer; }
.hp-string { width: 1px; background: linear-gradient(to bottom, rgba(240,208,128,.3), rgba(240,208,128,.08)); }
.hp-lantern-card {
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,.5), 0 0 0 1px rgba(240,208,128,.08);
  position: relative; transition: transform .3s ease;
}
.hp-lantern-card:hover { transform: translateY(-6px) scale(1.02); }
.hp-card-motif { position: absolute; top: 16px; left: 50%; transform: translateX(-50%); text-align: center; opacity: .25; }
.hp-card-inner { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end; padding: 16px; background: linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.2) 50%, transparent 100%); }
.hp-card-arabic { font-size: 1.1rem; color: rgba(240,208,128,.8); text-align: center; margin-bottom: 8px; text-shadow: 0 0 20px rgba(240,208,128,.3); font-family: 'Amiri', serif; }
.hp-card-occasion { font-size: .55rem; letter-spacing: 2px; color: rgba(255,255,255,.6); text-transform: uppercase; margin-bottom: 4px; }
.hp-card-name { font-size: .78rem; font-weight: 600; color: #fff; }
.hp-lantern-glow { width: 80%; height: 20px; border-radius: 50%; filter: blur(12px); margin-top: 6px; opacity: .5; }

@keyframes hpFloatA { 0%,100%{transform:translateY(0) rotate(-1.5deg)} 50%{transform:translateY(-18px) rotate(1deg)} }
@keyframes hpFloatB { 0%,100%{transform:translateY(0) rotate(1deg)} 50%{transform:translateY(-22px) rotate(-1.5deg)} }
@keyframes hpFloatC { 0%,100%{transform:translateY(0) rotate(-.5deg)} 50%{transform:translateY(-14px) rotate(.8deg)} }
@keyframes hpFloatD { 0%,100%{transform:translateY(0) rotate(2deg)} 50%{transform:translateY(-20px) rotate(-1deg)} }
@keyframes hpFloatE { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-16px) rotate(1.5deg)} }
@keyframes hpFloatF { 0%,100%{transform:translateY(0) rotate(.5deg)} 50%{transform:translateY(-12px) rotate(-1deg)} }

/* ── Divider ── */
.hp-divider { border: none; border-top: 1px solid rgba(240,208,128,.06); margin: 0 48px; }

/* ── Trending cards ── */
.hp-featured-section { padding: 0 48px 70px; }
.hp-feat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
.hp-feat-title { font-size: 1.1rem; font-weight: 700; color: #fff; }
.hp-feat-sub { font-size: .72rem; color: rgba(255,255,255,.35); margin-top: 4px; }
.hp-see-all { font-size: .72rem; color: rgba(240,208,128,.6); text-decoration: none; border-bottom: 1px solid rgba(240,208,128,.2); padding-bottom: 2px; }
.hp-cards-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
.hp-feat-card { border-radius: 14px; overflow: hidden; cursor: pointer; border: 1px solid rgba(255,255,255,.05); transition: transform .25s, box-shadow .25s; position: relative; }
.hp-feat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,.5); }
.hp-feat-card-img { height: 180px; display: flex; align-items: center; justify-content: center; font-size: 3rem; position: relative; overflow: hidden; }
.hp-feat-card-img::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top,rgba(0,0,0,.6) 0%,transparent 60%); }
.hp-feat-card-body { padding: 12px 14px; background: #0f0d18; }
.hp-feat-card-occasion { font-size: .55rem; letter-spacing: 2px; color: rgba(240,208,128,.5); text-transform: uppercase; margin-bottom: 3px; }
.hp-feat-card-name { font-size: .78rem; font-weight: 600; color: rgba(255,255,255,.85); }
.hp-feat-badge { position: absolute; top: 10px; right: 10px; z-index: 5; background: linear-gradient(135deg,#b8860b,#f0d080); color: #1a1208; font-size: .5rem; font-weight: 800; padding: 2px 8px; border-radius: 10px; letter-spacing: .5px; }

/* ── Countdown section ── */
.hp-countdown-section { padding: 70px 48px; }
.hp-section-label { font-size: .6rem; letter-spacing: 4px; color: rgba(240,208,128,.4); text-transform: uppercase; text-align: center; margin-bottom: 10px; display: block; }
.hp-section-title { font-size: 1.4rem; font-weight: 800; color: #fff; text-align: center; margin-bottom: 48px; }

.hp-hero-countdown {
  background: linear-gradient(135deg,#0a0818,#100d24,#0a0818);
  border: 1px solid rgba(240,208,128,.12); border-radius: 24px; padding: 40px 48px;
  display: flex; align-items: center; gap: 48px; margin-bottom: 20px;
  position: relative; overflow: hidden;
}
.hp-hero-countdown::before {
  content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: conic-gradient(from 0deg,transparent 0%,rgba(240,208,128,.03) 15%,transparent 30%);
  animation: hpSweep 8s linear infinite; pointer-events: none;
}
@keyframes hpSweep { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

.hp-hc-left { flex: 1; }
.hp-hc-urgency { display: inline-flex; align-items: center; gap: 6px; background: rgba(240,208,128,.08); border: 1px solid rgba(240,208,128,.2); padding: 4px 14px; border-radius: 20px; font-size: .6rem; font-weight: 700; color: #f0d080; letter-spacing: 1.5px; margin-bottom: 16px; }
.hp-urgency-dot { width: 6px; height: 6px; border-radius: 50%; background: #f0d080; animation: hpPulse 1.5s ease-in-out infinite; }
@keyframes hpPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.7)} }
.hp-hc-name { font-size: 2.4rem; font-weight: 900; color: #fff; line-height: 1; margin-bottom: 8px; }
.hp-hc-arabic { font-size: 1rem; color: rgba(240,208,128,.4); margin-bottom: 20px; letter-spacing: 1px; font-family: 'Amiri', serif; }
.hp-hc-desc { font-size: .78rem; color: rgba(255,255,255,.4); line-height: 1.6; margin-bottom: 28px; max-width: 340px; }
.hp-hc-cta { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg,#b8860b,#f0d080); color: #1a1208; padding: 11px 28px; border-radius: 24px; font-size: .78rem; font-weight: 700; cursor: pointer; border: none; }

.hp-hc-right { text-align: center; }
.hp-hc-icon { font-size: 4rem; display: block; margin-bottom: 24px; }
.hp-countdown-tiles { display: flex; gap: 12px; justify-content: center; align-items: center; }
.hp-tile { background: rgba(255,255,255,.04); border: 1px solid rgba(240,208,128,.1); border-radius: 14px; padding: 16px 18px; min-width: 72px; text-align: center; }
.hp-tile-num { font-size: 2rem; font-weight: 900; color: #f0d080; line-height: 1; display: block; margin-bottom: 4px; font-variant-numeric: tabular-nums; }
.hp-tile-label { font-size: .48rem; color: rgba(255,255,255,.35); letter-spacing: 2px; text-transform: uppercase; }
.hp-tile-sep { font-size: 1.6rem; color: rgba(240,208,128,.3); font-weight: 900; margin-top: -8px; }
.hp-hc-hijri { font-size: .6rem; color: rgba(255,255,255,.2); margin-top: 14px; letter-spacing: 1px; }

.hp-upcoming-strip { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 28px; }
.hp-upcoming-card { background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.06); border-radius: 16px; padding: 20px; cursor: pointer; transition: all .25s; position: relative; overflow: hidden; }
.hp-upcoming-card:hover { background: rgba(240,208,128,.04); border-color: rgba(240,208,128,.2); transform: translateY(-3px); }
.hp-upcoming-card.soon { border-color: rgba(240,208,128,.2); background: rgba(240,208,128,.03); }
.hp-upcoming-card.soon::before { content: 'SOON'; position: absolute; top: 12px; right: 12px; font-size: .45rem; font-weight: 800; color: #f0d080; letter-spacing: 2px; background: rgba(240,208,128,.1); padding: 2px 8px; border-radius: 8px; }
.hp-uc-icon { font-size: 1.6rem; margin-bottom: 10px; display: block; }
.hp-uc-name { font-size: .78rem; font-weight: 700; color: #fff; margin-bottom: 4px; }
.hp-uc-days { font-size: .65rem; color: rgba(255,255,255,.35); margin-bottom: 10px; }
.hp-uc-days strong { color: rgba(240,208,128,.7); }
.hp-uc-bar-wrap { height: 3px; background: rgba(255,255,255,.06); border-radius: 2px; overflow: hidden; }
.hp-uc-bar { height: 100%; border-radius: 2px; background: linear-gradient(90deg,#b8860b,#f0d080); }

.hp-daily-row { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; }
.hp-daily-card { background: linear-gradient(135deg,#0d0820,#12082a); border: 1px solid rgba(240,208,128,.1); border-radius: 20px; padding: 32px; position: relative; overflow: hidden; }
.hp-daily-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg,transparent,rgba(240,208,128,.3),transparent); }
.hp-daily-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(240,208,128,.08); border: 1px solid rgba(240,208,128,.15); padding: 4px 12px; border-radius: 20px; font-size: .55rem; font-weight: 700; color: #f0d080; letter-spacing: 1.5px; margin-bottom: 16px; }
.hp-daily-title { font-size: 1rem; font-weight: 800; color: #fff; margin-bottom: 6px; }
.hp-daily-sub { font-size: .72rem; color: rgba(255,255,255,.35); margin-bottom: 20px; line-height: 1.5; }
.hp-daily-preview { width: 100%; height: 140px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 3rem; border: 1px solid rgba(255,255,255,.05); position: relative; overflow: hidden; margin-bottom: 16px; }
.hp-daily-preview::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top,rgba(0,0,0,.4) 0%,transparent 60%); }
.hp-daily-actions { display: flex; gap: 8px; }
.hp-btn-sm-gold { padding: 8px 18px; border-radius: 18px; font-size: .7rem; font-weight: 700; background: linear-gradient(135deg,#b8860b,#f0d080); color: #1a1208; cursor: pointer; border: none; }
.hp-btn-sm-ghost { padding: 8px 18px; border-radius: 18px; font-size: .7rem; border: 1px solid rgba(255,255,255,.1); color: rgba(255,255,255,.4); cursor: pointer; background: transparent; }

.hp-reminder-card { background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.06); border-radius: 20px; padding: 28px; display: flex; flex-direction: column; justify-content: space-between; }
.hp-reminder-title { font-size: .88rem; font-weight: 700; color: #fff; margin-bottom: 6px; }
.hp-reminder-sub { font-size: .7rem; color: rgba(255,255,255,.35); line-height: 1.5; margin-bottom: 20px; }
.hp-reminder-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.hp-reminder-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.05); border-radius: 10px; font-size: .68rem; color: rgba(255,255,255,.5); cursor: pointer; transition: border-color .2s; }
.hp-reminder-item:hover { border-color: rgba(240,208,128,.2); color: rgba(255,255,255,.75); }
.hp-ri-icon { font-size: 1rem; }
.hp-ri-name { flex: 1; }
.hp-ri-days { font-size: .58rem; color: rgba(240,208,128,.5); white-space: nowrap; }
.hp-btn-reminder { padding: 10px 20px; border-radius: 18px; font-size: .7rem; font-weight: 600; border: 1px solid rgba(240,208,128,.2); color: rgba(240,208,128,.7); cursor: pointer; text-align: center; transition: all .2s; background: transparent; }
.hp-btn-reminder:hover { background: rgba(240,208,128,.06); color: #f0d080; }

/* ── How it works ── */
.hp-how-section { padding: 0 48px 70px; text-align: center; }
.hp-how-title { font-size: 1.4rem; font-weight: 800; color: #fff; margin-bottom: 8px; }
.hp-how-sub { font-size: .82rem; color: rgba(255,255,255,.35); margin-bottom: 48px; }
.hp-how-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
.hp-how-step { padding: 28px; border-radius: 16px; border: 1px solid rgba(240,208,128,.08); background: rgba(240,208,128,.02); text-align: left; position: relative; overflow: hidden; }
.hp-how-step::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg,transparent,rgba(240,208,128,.2),transparent); }
.hp-step-num { font-size: 2.5rem; font-weight: 900; color: rgba(240,208,128,.06); line-height: 1; margin-bottom: 12px; }
.hp-step-icon { font-size: 1.6rem; margin-bottom: 14px; }
.hp-step-title { font-size: .88rem; font-weight: 700; color: #fff; margin-bottom: 6px; }
.hp-step-desc { font-size: .73rem; color: rgba(255,255,255,.4); line-height: 1.6; }

/* ── Footer ── */
.hp-footer { position: relative; z-index: 10; padding: 40px 48px; border-top: 1px solid rgba(240,208,128,.06); display: flex; justify-content: space-between; align-items: center; }
.hp-footer-logo { display: flex; align-items: center; gap: 8px; }
.hp-footer-copy { font-size: .65rem; color: rgba(255,255,255,.2); }
.hp-footer-links { display: flex; gap: 20px; }
.hp-footer-link { font-size: .65rem; color: rgba(255,255,255,.25); text-decoration: none; }
.hp-footer-link:hover { color: rgba(255,255,255,.5); }

/* ── Responsive ── */
@media (max-width: 900px) {
  .hp-cards-grid { grid-template-columns: repeat(2,1fr); }
  .hp-how-steps, .hp-upcoming-strip { grid-template-columns: 1fr; }
  .hp-daily-row { grid-template-columns: 1fr; }
  .hp-hero-countdown { flex-direction: column; gap: 24px; padding: 28px 24px; }
  .hp-lantern-stage { display: none; }
  .hp-featured-section, .hp-countdown-section, .hp-how-section { padding-left: 20px; padding-right: 20px; }
  .hp-footer { flex-direction: column; gap: 16px; text-align: center; }
  .hp-divider { margin: 0 20px; }
}
`;
