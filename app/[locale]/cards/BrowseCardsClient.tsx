"use client";

// app/[locale]/cards/page.tsx
// Cinematic browse — split-screen card stage + info panel + occasion strip
// Matches browse-cinematic-v2.html exactly, wired to real Prisma data via props.
// NOTE: Because this page needs rich client interactivity, it is a Client Component
// that receives its data from a thin server wrapper (see CardsPageServer below).

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AuroraBackground } from "@/components/home/AuroraBackground";
import { CustomCursor } from "@/components/home/CustomCursor";
import { TemplateCardPreview } from "@/components/cards/TemplateCardPreview";
import type { CardCanvasTemplate } from "@/components/cards/CardCanvas";
import { applySpecialTemplateArtwork } from "@/lib/card-themes/special-template-artwork";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BrowseCard {
  id: string;
  titleEn: string;
  titleAr: string;
  occasionNameEn: string;
  occasionSlug: string;
  description: string;
  bgColor: string;
  bgImageUrl?: string;
  animationFile?: string;
  animationStyle?: string | null;
  isPremium: boolean;
  tags: string[];
}

export interface BrowseOccasion {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  cardCount: number;
  cards: BrowseCard[];
  // Visual theming
  bg: string;
  aurora1: string;
  aurora2: string;
  glow: string;
  cutColor: string;
  accentAiColor: string;
}

// ─── Static theming map (slug → colours) ─────────────────────────────────────

const OCCASION_THEME: Record<string, Omit<BrowseOccasion, "id"|"slug"|"nameEn"|"nameAr"|"icon"|"cardCount"|"cards">> = {
  "eid-ul-fitr": {
    bg: "linear-gradient(160deg,#061a06,#0e2c0e)",
    aurora1: "radial-gradient(circle,rgba(74,222,128,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(16,185,129,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(74,222,128,.9),transparent 70%)",
    cutColor: "#061a06",
    accentAiColor: "rgba(74,222,128,.6)",
  },
  "eid-ul-adha": {
    bg: "linear-gradient(160deg,#081408,#122814)",
    aurora1: "radial-gradient(circle,rgba(52,211,153,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(16,185,129,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(52,211,153,.9),transparent 70%)",
    cutColor: "#081408",
    accentAiColor: "rgba(52,211,153,.6)",
  },
  "ramadan": {
    bg: "linear-gradient(160deg,#0e0a20,#1a1038)",
    aurora1: "radial-gradient(circle,rgba(167,139,250,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(139,92,246,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(167,139,250,.9),transparent 70%)",
    cutColor: "#0e0a20",
    accentAiColor: "rgba(167,139,250,.6)",
  },
  "laylatul-qadr": {
    bg: "linear-gradient(160deg,#050520,#0d0d40)",
    aurora1: "radial-gradient(circle,rgba(196,181,253,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(167,139,250,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(196,181,253,.9),transparent 70%)",
    cutColor: "#050520",
    accentAiColor: "rgba(196,181,253,.6)",
  },
  "nikah": {
    bg: "linear-gradient(160deg,#1a1005,#32190a)",
    aurora1: "radial-gradient(circle,rgba(251,191,36,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(245,158,11,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(251,191,36,.9),transparent 70%)",
    cutColor: "#1a1005",
    accentAiColor: "rgba(251,191,36,.6)",
  },
  "hajj": {
    bg: "linear-gradient(160deg,#030e1e,#081d38)",
    aurora1: "radial-gradient(circle,rgba(96,165,250,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(59,130,246,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(96,165,250,.9),transparent 70%)",
    cutColor: "#030e1e",
    accentAiColor: "rgba(96,165,250,.6)",
  },
  "jummah": {
    bg: "linear-gradient(160deg,#180810,#2c1022)",
    aurora1: "radial-gradient(circle,rgba(244,114,182,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(236,72,153,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(244,114,182,.9),transparent 70%)",
    cutColor: "#180810",
    accentAiColor: "rgba(244,114,182,.6)",
  },
  "aqiqah": {
    bg: "linear-gradient(160deg,#071407,#0e2810)",
    aurora1: "radial-gradient(circle,rgba(134,239,172,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(74,222,128,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(134,239,172,.9),transparent 70%)",
    cutColor: "#071407",
    accentAiColor: "rgba(134,239,172,.6)",
  },
  "mawlid": {
    bg: "linear-gradient(160deg,#1a0e00,#2e1a00)",
    aurora1: "radial-gradient(circle,rgba(251,146,60,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(245,124,11,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(251,146,60,.9),transparent 70%)",
    cutColor: "#1a0e00",
    accentAiColor: "rgba(251,146,60,.6)",
  },
  "general": {
    bg: "linear-gradient(160deg,#0d0b1e,#1a1635)",
    aurora1: "radial-gradient(circle,rgba(196,181,253,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(167,139,250,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(196,181,253,.9),transparent 70%)",
    cutColor: "#0d0b1e",
    accentAiColor: "rgba(196,181,253,.6)",
  },
};

const FALLBACK_THEME = OCCASION_THEME["general"];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OCCASION_ICONS: Record<string, string> = {
  "eid-ul-fitr": "🎁",
  "eid-ul-adha": "🐑",
  "ramadan": "📿",
  "laylatul-qadr": "✨",
  "nikah": "💍",
  "hajj": "🕋",
  "jummah": "🌙",
  "aqiqah": "🕯️",
  "mawlid": "☪️",
  "general": "✨",
};

// ─── AI message samples (same as HTML) ───────────────────────────────────────

const AI_MESSAGES: Record<string, string[]> = {
  "eid-ul-fitr": [
    '"Taqabbal Allahu minna wa minkum — may Allah accept from us and from you. Wishing you and your family a blessed Eid filled with love, laughter and His mercy."',
    '"May the joy of Eid fill your home with warmth and your heart with gratitude. Eid Mubarak from our family to yours."',
    '"On this blessed day, may your duas be answered, your blessings multiplied and your heart be at peace. Eid Mubarak!"',
  ],
  "eid-ul-adha": [
    '"May the spirit of sacrifice, gratitude and devotion of Ibrahim AS inspire us all. Eid ul-Adha Mubarak!"',
    '"On this day of Eid ul-Adha, may your sacrifice be accepted, your family blessed and your hearts full of joy."',
  ],
  "ramadan": [
    '"Ramadan Kareem — may this blessed month bring you closer to Allah, fill your heart with peace, and your home with barakah."',
    '"May your fasts be accepted, your nights of prayer rewarded, and your heart illuminated by the light of this holy month."',
  ],
  "laylatul-qadr": [
    '"May the Night of Power descend its blessings upon you and your loved ones. Seek it in the last ten nights."',
  ],
  "nikah": [
    '"Barak Allahu lakuma wa baraka alaykuma wa jama\'a baynakuma fi khair — may Allah bless you both and unite you in goodness."',
    '"A blessed union under Allah\'s mercy. May your marriage be filled with love, patience and eternal barakah."',
  ],
  "hajj": [
    '"Hajj Mabroor wa Sa\'yun Mashkoor — may your Hajj be accepted and your efforts rewarded. You are in our duas."',
    '"May Allah grant you a Hajj Mabroor, forgive your sins, and return you safely to your loved ones."',
  ],
  "jummah": [
    '"Jumu\'ah Mubarak — may your Friday be filled with blessings, your duas answered and your heart at rest."',
  ],
  "aqiqah": [
    '"Welcome to the world, little one — may you be a source of noor and joy for your family. Mabrook!"',
    '"May Allah bless this new soul with health, iman and happiness. Congratulations to the whole family!"',
  ],
  "mawlid": [
    '"May the love of the Prophet ﷺ fill your heart with light and guide your every step. Mawlid Mubarak."',
  ],
  "general": [
    '"May Allah\'s blessings be upon you always, in every step, in every prayer, and in every breath."',
  ],
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function getTheme(slug: string) {
  return OCCASION_THEME[slug] ?? FALLBACK_THEME;
}

function getAiMessages(slug: string): string[] {
  return AI_MESSAGES[slug] ?? AI_MESSAGES["general"];
}

function toPreviewTemplate(card: BrowseCard): CardCanvasTemplate {
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function CardStage({
  occasion,
  card,
  animDir,
}: {
  occasion: BrowseOccasion;
  card: BrowseCard;
  animDir: "left" | "right" | null;
}) {
  const theme = getTheme(occasion.slug);
  const animClass = animDir === "right" ? "slide-in-right" : animDir === "left" ? "slide-in-left" : "";
  const template = toPreviewTemplate(card);
  const stagePreviewKey = `${occasion.slug}:${card.id}`;

  return (
    <div className="browse-stage">
      {/* Aurora blobs */}
      <div className="browse-aurora browse-aurora-1" style={{ background: theme.aurora1 }} />
      <div className="browse-aurora browse-aurora-2" style={{ background: theme.aurora2 }} />

      <div className="browse-card-wrap">
        <div className="browse-card-3d">
          <div className={`browse-card-face ${animClass}`}>
            <TemplateCardPreview
              key={stagePreviewKey}
              template={template}
              variant="stage"
            />
          </div>
        </div>
        <div className="browse-card-reflection" style={{ background: theme.glow }} />
      </div>
    </div>
  );
}

function InfoPanel({
  occasion,
  card,
  aiMsg,
  onRegenAi,
  onCustomise,
  onPreview,
  thumbCards,
  activeCardIdx,
  onThumbClick,
}: {
  occasion: BrowseOccasion;
  card: BrowseCard;
  aiMsg: string;
  onRegenAi: () => void;
  onCustomise: () => void;
  onPreview: () => void;
  thumbCards: BrowseCard[];
  activeCardIdx: number;
  onThumbClick: (i: number) => void;
}) {
  const theme = getTheme(occasion.slug);

  return (
    <div className="browse-panel">
      <div className="browse-panel-occasion">
        <div className="browse-occ-pip" />
        <span>{occasion.nameEn}</span>
      </div>

      <h1 className="browse-panel-title">{card.titleEn}</h1>
      <div className="browse-panel-arabic-sub">{card.titleAr}</div>
      <p className="browse-panel-desc">{card.description}</p>

      {/* Tags */}
      <div className="browse-panel-tags">
        {card.tags.map((tag) => (
          <span key={tag} className="browse-ptag">{tag}</span>
        ))}
        <span className={`browse-ptag ${card.isPremium ? "browse-ptag-purple" : "browse-ptag-gold"}`}>
          {card.isPremium ? "✦ Premium" : "Free"}
        </span>
      </div>

      {/* AI message preview */}
      <div className="browse-ai-preview" style={{ ["--ai-accent" as string]: theme.accentAiColor }}>
        <div className="browse-ai-label">AI-suggested message</div>
        <div className="browse-ai-text">{aiMsg}</div>
        <button className="browse-ai-regen" onClick={onRegenAi}>↺ Generate another</button>
      </div>

      {/* Actions */}
      <div className="browse-panel-actions">
        <button className="browse-btn-send" onClick={onCustomise}>Customise &amp; Send →</button>
        <button className="browse-btn-preview" onClick={onPreview}>Preview ↗</button>
        <button className="browse-btn-heart" aria-label="Save card">♡</button>
      </div>

      {/* Thumbnail strip */}
      <div className="browse-thumb-label">More in this occasion</div>
      <div className="browse-thumb-strip">
        {thumbCards.map((c, i) => {
          const thumbTemplate = toPreviewTemplate(c);
          return (
            <button
              key={c.id}
              className={`browse-thumb ${i === activeCardIdx ? "active" : ""}`}
              onClick={() => onThumbClick(i)}
              aria-label={c.titleEn}
            >
              <TemplateCardPreview template={thumbTemplate} variant="thumb" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OccasionStrip({
  occasions,
  activeIdx,
  onSelect,
}: {
  occasions: BrowseOccasion[];
  activeIdx: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="browse-occ-strip">
      {occasions.map((occ, i) => (
        <button
          key={occ.slug}
          className={`browse-occ-btn ${i === activeIdx ? "active" : ""}`}
          onClick={() => onSelect(i)}
        >
          <div className="browse-occ-btn-bg" />
          <span className="browse-ob-icon">{occ.icon}</span>
          <span className="browse-ob-label">{occ.nameEn}</span>
          <span className="browse-ob-count">{occ.cardCount} CARDS</span>
        </button>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface BrowseCardsClientProps {
  occasions: BrowseOccasion[];
  initialOccasionSlug?: string;
}

export function BrowseCardsClient({ occasions, initialOccasionSlug }: BrowseCardsClientProps) {
  const router = useRouter();

  const initialOccIdx = Math.max(0, occasions.findIndex((o) => o.slug === initialOccasionSlug));

  const [occIdx, setOccIdx] = useState(initialOccIdx);
  const [cardIdx, setCardIdx] = useState(0);
  const [aiMsgIdx, setAiMsgIdx] = useState(0);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);

  const occasion = occasions[occIdx];
  const card = occasion?.cards[cardIdx];

  const changeCard = useCallback((dir: number) => {
    if (!occasion) return;
    const next = cardIdx + dir;
    if (next < 0 || next >= occasion.cards.length) return;
    setAnimDir(dir > 0 ? "right" : "left");
    setCardIdx(next);
    setTimeout(() => setAnimDir(null), 400);
  }, [cardIdx, occasion]);

  const jumpCard = useCallback((i: number) => {
    if (i === cardIdx) return;
    setAnimDir(i > cardIdx ? "right" : "left");
    setCardIdx(i);
    setTimeout(() => setAnimDir(null), 400);
  }, [cardIdx]);

  const selectOcc = useCallback((i: number) => {
    setOccIdx(i);
    setCardIdx(0);
    setAiMsgIdx(0);
    setAnimDir(null);
  }, []);

  const regenAi = useCallback(() => {
    const msgs = getAiMessages(occasion?.slug ?? "general");
    setAiMsgIdx((prev) => (prev + 1) % msgs.length);
  }, [occasion?.slug]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") changeCard(1);
      if (e.key === "ArrowLeft")  changeCard(-1);
      if (e.key === "ArrowDown" && occIdx < occasions.length - 1) selectOcc(occIdx + 1);
      if (e.key === "ArrowUp"   && occIdx > 0)                    selectOcc(occIdx - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [changeCard, selectOcc, occIdx, occasions.length]);

  if (!occasion || !card) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.4)" }}>
        No cards found.
      </div>
    );
  }

  const aiMsgs = getAiMessages(occasion.slug);
  const aiMsg = aiMsgs[aiMsgIdx % aiMsgs.length];

  return (
    <>
      <style>{BROWSE_CSS}</style>

      <div className="browse-root">
        <AuroraBackground />
        <CustomCursor />
        <Navbar />

        <div className="browse-layout">
          {/* LEFT — card stage */}
          <CardStage occasion={occasion} card={card} animDir={animDir} />

          {/* Stage nav (arrows + dots) — positioned inside stage via CSS */}
          <div className="browse-stage-nav">
            <button className="browse-arrow-btn" onClick={() => changeCard(-1)} aria-label="Previous card">←</button>
            <div className="browse-prog-dots">
              {occasion.cards.map((_, i) => (
                <button
                  key={i}
                  className={`browse-prog-dot ${i === cardIdx ? "active" : ""}`}
                  onClick={() => jumpCard(i)}
                  aria-label={`Card ${i + 1}`}
                />
              ))}
            </div>
            <button className="browse-arrow-btn" onClick={() => changeCard(1)} aria-label="Next card">→</button>
          </div>

          {/* RIGHT — info panel */}
          <InfoPanel
            occasion={occasion}
            card={card}
            aiMsg={aiMsg}
            onRegenAi={regenAi}
            onCustomise={() => router.push(`/customize/${card.id}`)}
            onPreview={() => router.push(`/preview?cardId=${card.id}`)}
            thumbCards={occasion.cards}
            activeCardIdx={cardIdx}
            onThumbClick={jumpCard}
          />
        </div>

        {/* BOTTOM — occasion strip */}
        <OccasionStrip occasions={occasions} activeIdx={occIdx} onSelect={selectOcc} />
      </div>
    </>
  );
}

// ─── CSS (scoped with .browse- prefix to avoid conflicts) ────────────────────

const BROWSE_CSS = `
.browse-root {
  background: #03020a;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  min-height: 100vh;
  overflow: hidden;
}

/* Starfield */
.browse-root::before {
  content: '';
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(1px 1px at 7% 11%,  rgba(255,255,255,.6) 0%, transparent 100%),
    radial-gradient(1px 1px at 21% 38%, rgba(255,255,255,.4) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 36% 5%, rgba(255,255,255,.5) 0%, transparent 100%),
    radial-gradient(1px 1px at 54% 20%, rgba(255,255,255,.35) 0%, transparent 100%),
    radial-gradient(1px 1px at 68% 45%, rgba(255,255,255,.4) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 83% 9%, rgba(255,255,255,.55) 0%, transparent 100%),
    radial-gradient(1px 1px at 92% 62%, rgba(255,255,255,.3) 0%, transparent 100%),
    radial-gradient(1px 1px at 13% 70%, rgba(255,255,255,.35) 0%, transparent 100%),
    radial-gradient(1px 1px at 47% 82%, rgba(255,255,255,.25) 0%, transparent 100%),
    radial-gradient(1px 1px at 76% 72%, rgba(255,255,255,.3) 0%, transparent 100%);
}

/* ── LAYOUT ── */
.browse-layout {
  position: fixed;
  top: 64px; left: 0; right: 0; bottom: 76px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr auto;
  z-index: 1;
}

/* ══ LEFT STAGE ══ */
.browse-stage {
  position: relative; overflow: hidden;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 32px 40px 24px;
  border-right: 1px solid rgba(255,255,255,.04);
  grid-row: 1 / 2; grid-column: 1 / 2;
}

.browse-aurora {
  position: absolute; border-radius: 50%;
  filter: blur(80px); pointer-events: none;
  transition: background 1s ease;
}
.browse-aurora-1 { width: 500px; height: 500px; top: -120px; right: -100px; opacity: .22; }
.browse-aurora-2 { width: 380px; height: 380px; bottom: -100px; left: -80px; opacity: .14; }

/* Card */
.browse-card-wrap {
  position: relative; z-index: 3;
  perspective: 1200px;
  width: 240px; height: 320px;
  pointer-events: none;
}
.browse-card-3d {
  width: 100%; height: 100%;
  transform-style: preserve-3d;
  animation: browseCardFloat 5s ease-in-out infinite;
  pointer-events: none;
}
@keyframes browseCardFloat {
  0%,100% { transform: translateY(0) rotateX(2deg) rotateY(-2deg); }
  50%      { transform: translateY(-14px) rotateX(-1deg) rotateY(2deg); }
}
.browse-card-face {
  width: 100%; height: 100%; border-radius: 20px; overflow: visible;
  position: relative;
  pointer-events: none;
}
.browse-card-face > * { pointer-events: auto; }
.browse-card-face.slide-in-right { animation: browseSlideInRight .35s cubic-bezier(.34,1.2,.64,1) forwards; }
.browse-card-face.slide-in-left  { animation: browseSlideInLeft  .35s cubic-bezier(.34,1.2,.64,1) forwards; }
@keyframes browseSlideInRight { from { transform: translateX(80px) scale(.92); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes browseSlideInLeft  { from { transform: translateX(-80px) scale(.92); opacity: 0; } to { transform: none; opacity: 1; } }

/* Reflection */
.browse-card-reflection {
  position: absolute; bottom: -60px; left: 50%; transform: translateX(-50%);
  width: 200px; height: 40px;
  filter: blur(38px);
  opacity: .16;
  animation: browseCardFloat 5s ease-in-out infinite;
}

/* Stage nav — overlaid on bottom of left column */
.browse-stage-nav {
  grid-row: 2 / 3; grid-column: 1 / 2;
  display: flex; align-items: center; justify-content: center; gap: 16px;
  padding: 12px 0;
  position: relative; z-index: 4;
  border-right: 1px solid rgba(255,255,255,.04);
}
.browse-arrow-btn {
  width: 38px; height: 38px; border-radius: 12px;
  border: 1px solid rgba(240,208,128,.12); background: rgba(255,255,255,.03);
  color: rgba(255,255,255,.4); cursor: pointer; font-size: .9rem;
  display: flex; align-items: center; justify-content: center; transition: all .2s;
}
.browse-arrow-btn:hover { border-color: rgba(240,208,128,.35); color: #f0d080; background: rgba(240,208,128,.06); }
.browse-prog-dots { display: flex; gap: 5px; align-items: center; }
.browse-prog-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: rgba(255,255,255,.15); cursor: pointer;
  border: none; padding: 0; transition: all .2s;
}
.browse-prog-dot.active { background: #f0d080; width: 16px; border-radius: 3px; }

/* ══ RIGHT PANEL ══ */
.browse-panel {
  display: flex; flex-direction: column; justify-content: center;
  padding: 40px 48px 32px;
  overflow-y: auto; scrollbar-width: none;
  grid-row: 1 / 3; grid-column: 2 / 3;
}
.browse-panel::-webkit-scrollbar { display: none; }

.browse-panel-occasion {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: .56rem; letter-spacing: 2.5px; text-transform: uppercase;
  color: rgba(240,208,128,.45); margin-bottom: 14px;
}
.browse-occ-pip { width: 4px; height: 4px; border-radius: 50%; background: rgba(240,208,128,.5); }

.browse-panel-title {
  font-size: 1.9rem; font-weight: 700; line-height: 1.2; margin-bottom: 10px;
  background: linear-gradient(135deg,#fff 55%,rgba(255,255,255,.55));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.browse-panel-arabic-sub {
  font-family: 'Amiri',serif; font-size: 1.1rem;
  color: rgba(240,208,128,.45); margin-bottom: 14px;
}
.browse-panel-desc {
  font-size: .75rem; color: rgba(255,255,255,.42);
  line-height: 1.75; margin-bottom: 20px; max-width: 380px;
}

/* Tags */
.browse-panel-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 24px; }
.browse-ptag {
  font-size: .58rem; padding: 4px 11px; border-radius: 8px;
  background: rgba(255,255,255,.04); color: rgba(255,255,255,.32);
  border: 1px solid rgba(255,255,255,.07); letter-spacing: .3px;
}
.browse-ptag-gold   { background: rgba(240,208,128,.07); color: rgba(240,208,128,.6); border-color: rgba(240,208,128,.14); }
.browse-ptag-purple { background: rgba(168,85,247,.1);   color: #d8b4fe;              border-color: rgba(168,85,247,.2); }

/* AI preview */
.browse-ai-preview {
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
  border-radius: 14px; padding: 14px 16px; margin-bottom: 22px;
  position: relative; overflow: hidden;
}
.browse-ai-preview::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg,transparent,rgba(168,85,247,.3),transparent);
}
.browse-ai-label {
  font-size: .55rem; letter-spacing: 1.5px; text-transform: uppercase;
  color: rgba(168,85,247,.6); margin-bottom: 8px;
  display: flex; align-items: center; gap: 6px;
}
.browse-ai-label::before { content: '✦'; font-size: .6rem; }
.browse-ai-text { font-size: .72rem; color: rgba(255,255,255,.5); line-height: 1.65; font-style: italic; }
.browse-ai-regen {
  font-size: .58rem; color: rgba(168,85,247,.5); cursor: pointer;
  margin-top: 8px; display: inline-flex; align-items: center; gap: 4px;
  background: none; border: none; padding: 0;
}
.browse-ai-regen:hover { color: rgba(168,85,247,.8); }

/* Actions */
.browse-panel-actions { display: flex; gap: 10px; align-items: center; margin-bottom: 28px; }
.browse-btn-send {
  background: linear-gradient(135deg,#b8860b,#f0d080); color: #1a1208;
  font-size: .7rem; font-weight: 700; padding: 12px 26px; border-radius: 13px;
  border: none; cursor: pointer; letter-spacing: .5px;
  transition: transform .2s, box-shadow .2s; flex: 1;
}
.browse-btn-send:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(184,134,11,.4); }
.browse-btn-preview {
  background: rgba(255,255,255,.05); color: rgba(255,255,255,.5);
  font-size: .7rem; padding: 12px 18px; border-radius: 13px;
  border: 1px solid rgba(255,255,255,.09); cursor: pointer; transition: all .2s;
}
.browse-btn-preview:hover { background: rgba(255,255,255,.08); color: #fff; }
.browse-btn-heart {
  width: 42px; height: 42px; border-radius: 11px;
  border: 1px solid rgba(240,208,128,.12);
  background: transparent; color: rgba(255,255,255,.35); cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: .95rem; transition: all .2s;
}
.browse-btn-heart:hover { border-color: rgba(240,208,128,.3); color: #f0d080; }

/* Thumbs */
.browse-thumb-label {
  font-size: .56rem; letter-spacing: 2px; text-transform: uppercase;
  color: rgba(255,255,255,.2); margin-bottom: 10px;
}
.browse-thumb-strip { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
.browse-thumb-strip::-webkit-scrollbar { display: none; }
.browse-thumb {
  flex-shrink: 0; width: 56px; height: 76px; border-radius: 10px;
  cursor: pointer; border: 1px solid rgba(255,255,255,.07);
  padding: 0;
  transition: all .2s; position: relative; overflow: hidden;
}
.browse-thumb:hover, .browse-thumb.active { border-color: rgba(240,208,128,.35); transform: translateY(-3px); }
.browse-thumb.active::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0;
  height: 2px; background: #f0d080;
}

/* ══ BOTTOM OCCASION STRIP ══ */
.browse-occ-strip {
  position: fixed; bottom: 0; left: 0; right: 0; height: 76px; z-index: 200;
  background: rgba(3,2,10,.93); backdrop-filter: blur(24px);
  border-top: 1px solid rgba(255,255,255,.06);
  display: flex; overflow-x: auto; scrollbar-width: none;
}
.browse-occ-strip::-webkit-scrollbar { display: none; }
.browse-occ-btn {
  flex: 1; min-width: 90px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  cursor: pointer; border: none; border-top: 2px solid transparent;
  background: transparent; color: #fff;
  transition: all .2s; padding: 0 6px; position: relative;
}
.browse-occ-btn.active { border-top-color: rgba(240,208,128,.65); }
.browse-occ-btn.active .browse-occ-btn-bg { opacity: 1; }
.browse-occ-btn-bg { position: absolute; inset: 0; background: rgba(240,208,128,.03); opacity: 0; transition: opacity .2s; }
.browse-occ-btn:hover .browse-occ-btn-bg { opacity: 1; }
.browse-ob-icon  { font-size: 1.2rem; position: relative; z-index: 1; }
.browse-ob-label { font-size: .5rem; letter-spacing: .5px; color: rgba(255,255,255,.28); position: relative; z-index: 1; transition: color .2s; white-space: nowrap; }
.browse-occ-btn.active .browse-ob-label { color: rgba(240,208,128,.7); }
.browse-ob-count { font-size: .46rem; color: rgba(255,255,255,.15); position: relative; z-index: 1; }

/* Responsive */
@media (max-width: 768px) {
  .browse-layout { grid-template-columns: 1fr; grid-template-rows: auto auto auto; }
  .browse-stage { padding: 20px 20px 12px; }
  .browse-stage-nav { grid-row: 2/3; grid-column: 1/2; border-right: none; }
  .browse-panel { grid-row: 3/4; grid-column: 1/2; padding: 24px 20px; }
  .browse-card-wrap { width: 160px; height: 214px; }
}
`;
