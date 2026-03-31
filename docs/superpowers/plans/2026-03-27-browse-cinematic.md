# Browse Cards — Cinematic Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the browse cards page with an immersive cinematic one-card-at-a-time viewer — a floating animated portrait card on the left, rich info panel on the right, and an occasion strip along the bottom.

**Architecture:** `app/[locale]/cards/page.tsx` (server component) fetches all active card templates from DB, groups them by occasion slug, and passes `OccasionGroup[]` to `CinematicBrowser` (client component). All animation and navigation state lives in the client component. `OCCASION_META` in the client provides per-slug visual config (gradients, aurora colours, crescent cut colour, AI sample messages).

**Tech Stack:** Next.js 16 App Router, React hooks, Prisma 7, CSS keyframes (globals.css), `@/lib/i18n-navigation` for client-side navigation, `next-intl` `useLocale`

---

## File Map

| File | Action |
|------|--------|
| `app/globals.css` | Add 9 new keyframes |
| `components/cards/CinematicBrowser.tsx` | **Create** — full cinematic UI (client component) |
| `app/[locale]/cards/page.tsx` | **Rewrite** — server component: fetch + group, render CinematicBrowser |
| `tests/cards.spec.ts` | **Update** — add cinematic layout assertions |

---

### Task 1: Add cinematic keyframes to globals.css

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Read globals.css to find where to append**

Open `app/globals.css`. Locate the last `@keyframes` block (currently `card-in`). We will append the new keyframes after it.

- [ ] **Step 2: Append keyframes**

At the end of the `/* ── Keyframes ── */` section, after `@keyframes card-in { ... }`, add:

```css
@keyframes cardFloat {
  0%,100% { transform: translateY(0) rotateX(2deg) rotateY(-2deg); }
  50%     { transform: translateY(-14px) rotateX(-1deg) rotateY(2deg); }
}
@keyframes arabicGlow {
  0%,100% { text-shadow: 0 0 16px rgba(240,208,128,.3); opacity: .82; }
  50%     { text-shadow: 0 0 40px rgba(240,208,128,.7); opacity: 1; }
}
@keyframes iconDrift {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-6px); }
}
@keyframes glowPulse {
  0%,100% { transform: scale(.85); opacity: .2; }
  50%     { transform: scale(1.1); opacity: .4; }
}
@keyframes twinkle {
  0%,100% { opacity: .3; transform: scale(.8); }
  50%     { opacity: 1;  transform: scale(1.2); }
}
@keyframes slideOutLeft  { to { transform: translateX(-80px) scale(.9); opacity: 0; } }
@keyframes slideOutRight { to { transform: translateX(80px)  scale(.9); opacity: 0; } }
@keyframes slideInRight  { from { transform: translateX(80px)  scale(.92); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes slideInLeft   { from { transform: translateX(-80px) scale(.92); opacity: 0; } to { transform: none; opacity: 1; } }
```

Also add these CSS classes to the `/* ── Utility classes ── */` section:

```css
.slide-out-left  { animation: slideOutLeft  .25s ease forwards; }
.slide-out-right { animation: slideOutRight .25s ease forwards; }
.slide-in-right  { animation: slideInRight  .35s cubic-bezier(.34,1.2,.64,1) forwards; }
.slide-in-left   { animation: slideInLeft   .35s cubic-bezier(.34,1.2,.64,1) forwards; }
```

- [ ] **Step 3: Verify no syntax errors**

```bash
npm run build 2>&1 | grep -i "error\|warn" | head -20
```

Expected: No CSS parse errors. (Build may fail for other reasons — CSS errors specifically are what we check here.)

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "style: add cinematic browser keyframes and slide classes"
```

---

### Task 2: Create CinematicBrowser client component

**Files:**
- Create: `components/cards/CinematicBrowser.tsx`

- [ ] **Step 1: Write the Playwright test first (TDD)**

Open `tests/cards.spec.ts`. Add at the end:

```typescript
test("cinematic browser renders card stage and occasion strip", async ({ page }) => {
  await page.goto("/en/cards");
  // Card stage exists
  await expect(page.locator('[data-testid="card-stage"]')).toBeVisible({ timeout: 10000 });
  // Occasion strip exists
  await expect(page.locator('[data-testid="occasion-strip"]')).toBeVisible();
  // At least one occasion button
  await expect(page.locator('[data-testid="occasion-btn"]').first()).toBeVisible();
  // Right panel title exists
  await expect(page.locator('[data-testid="card-title"]')).toBeVisible();
  // Customise button exists
  await expect(page.locator('[data-testid="btn-customise"]')).toBeVisible();
});

test("cinematic browser arrow navigation changes card", async ({ page }) => {
  await page.goto("/en/cards");
  await page.waitForSelector('[data-testid="card-title"]');
  const titleBefore = await page.locator('[data-testid="card-title"]').textContent();
  // Only navigate if there are multiple progress dots (multiple cards in occasion)
  const dots = page.locator('[data-testid="prog-dot"]');
  const dotCount = await dots.count();
  if (dotCount > 1) {
    await page.locator('[data-testid="arrow-next"]').click();
    await page.waitForTimeout(500);
    const titleAfter = await page.locator('[data-testid="card-title"]').textContent();
    expect(titleAfter).not.toBe(titleBefore);
  }
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run dev &
npx wait-on http://localhost:3000 --timeout 30000
npx playwright test tests/cards.spec.ts --grep "cinematic" 2>&1 | tail -20
```

Expected: `FAIL` — element `[data-testid="card-stage"]` not found.

- [ ] **Step 3: Create the component file**

Create `components/cards/CinematicBrowser.tsx` with this complete content:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/lib/i18n-navigation";

// ── Types ───────────────────────────────────────────────────────────────────
export interface CardItem {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  isPremium: boolean;
}

export interface OccasionGroup {
  slug: string;
  nameEn: string;
  nameAr: string;
  cards: CardItem[];
}

// ── Per-occasion visual config ───────────────────────────────────────────────
interface OccMeta {
  icon: string;
  short: string;
  bg: string;
  aurora1: string;
  aurora2: string;
  glow: string;
  cutColor: string;
  aiMessages: string[];
}

const OCCASION_META: Record<string, OccMeta> = {
  "eid-ul-fitr": {
    icon: "🎁", short: "Eid",
    bg: "linear-gradient(160deg,#061a06,#0e2c0e)",
    aurora1: "radial-gradient(circle,rgba(74,222,128,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(16,185,129,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(74,222,128,.9),transparent 70%)",
    cutColor: "#061a06",
    aiMessages: [
      '"Taqabbal Allahu minna wa minkum — may Allah accept from us and from you. Wishing you and your family a blessed Eid."',
      '"May the joy of Eid fill your home with warmth and your heart with gratitude. Eid Mubarak!"',
    ],
  },
  "eid-ul-adha": {
    icon: "🐑", short: "Adha",
    bg: "linear-gradient(160deg,#081408,#122814)",
    aurora1: "radial-gradient(circle,rgba(52,211,153,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(16,185,129,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(52,211,153,.9),transparent 70%)",
    cutColor: "#081408",
    aiMessages: [
      '"May the spirit of sacrifice of Ibrahim AS inspire us all. Eid ul-Adha Mubarak!"',
      '"May your sacrifice be accepted, your family blessed and your hearts full of joy."',
    ],
  },
  "ramadan": {
    icon: "📿", short: "Ramadan",
    bg: "linear-gradient(160deg,#0e0a20,#1a1038)",
    aurora1: "radial-gradient(circle,rgba(167,139,250,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(139,92,246,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(167,139,250,.9),transparent 70%)",
    cutColor: "#0e0a20",
    aiMessages: [
      '"Ramadan Kareem — may this blessed month bring you closer to Allah and fill your heart with peace."',
      '"May your fasts be accepted, your nights of prayer rewarded, and your heart illuminated."',
    ],
  },
  "laylatul-qadr": {
    icon: "✨", short: "Qadr",
    bg: "linear-gradient(160deg,#0e0a20,#1a1038)",
    aurora1: "radial-gradient(circle,rgba(196,181,253,.8),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(167,139,250,.6),transparent 70%)",
    glow: "radial-gradient(circle,rgba(196,181,253,.9),transparent 70%)",
    cutColor: "#0e0a20",
    aiMessages: [
      '"The Night of Power — may Allah accept your prayers and grant you peace. Ameen."',
    ],
  },
  "nikah": {
    icon: "💍", short: "Nikah",
    bg: "linear-gradient(160deg,#1a1005,#32190a)",
    aurora1: "radial-gradient(circle,rgba(251,191,36,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(245,158,11,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(251,191,36,.9),transparent 70%)",
    cutColor: "#1a1005",
    aiMessages: [
      '"Barak Allahu lakuma wa baraka alaykuma — may Allah bless you both and unite you in goodness."',
      '"A blessed union under Allah\'s mercy. May your marriage be filled with love and eternal barakah."',
    ],
  },
  "hajj": {
    icon: "🕋", short: "Hajj",
    bg: "linear-gradient(160deg,#030e1e,#081d38)",
    aurora1: "radial-gradient(circle,rgba(96,165,250,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(59,130,246,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(96,165,250,.9),transparent 70%)",
    cutColor: "#030e1e",
    aiMessages: [
      '"Hajj Mabroor wa Sa\'yun Mashkoor — may your Hajj be accepted and your efforts rewarded."',
      '"May Allah grant you a Hajj Mabroor and return you safely to your loved ones."',
    ],
  },
  "jummah": {
    icon: "🌙", short: "Jummah",
    bg: "linear-gradient(160deg,#180810,#2c1022)",
    aurora1: "radial-gradient(circle,rgba(244,114,182,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(236,72,153,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(244,114,182,.9),transparent 70%)",
    cutColor: "#180810",
    aiMessages: [
      '"Jumu\'ah Mubarak — may your Friday be filled with blessings, your duas answered and your heart at rest."',
    ],
  },
  "aqiqah": {
    icon: "🕯️", short: "New Born",
    bg: "linear-gradient(160deg,#071407,#0e2810)",
    aurora1: "radial-gradient(circle,rgba(134,239,172,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(74,222,128,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(134,239,172,.9),transparent 70%)",
    cutColor: "#071407",
    aiMessages: [
      '"Welcome to the world — may you be a source of noor and joy for your family. Mabrook!"',
      '"May Allah bless this new soul with health, iman and happiness."',
    ],
  },
  "graduation": {
    icon: "🎓", short: "Graduation",
    bg: "linear-gradient(160deg,#101820,#1a2c3a)",
    aurora1: "radial-gradient(circle,rgba(56,189,248,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(14,165,233,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(56,189,248,.9),transparent 70%)",
    cutColor: "#101820",
    aiMessages: [
      '"Congratulations on this milestone — may Allah bless your knowledge and make it a means of goodness."',
    ],
  },
  "islamic-new-year": {
    icon: "🌙", short: "New Year",
    bg: "linear-gradient(160deg,#0d0b1e,#1a1635)",
    aurora1: "radial-gradient(circle,rgba(196,181,253,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(167,139,250,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(196,181,253,.9),transparent 70%)",
    cutColor: "#0d0b1e",
    aiMessages: [
      '"May the new Hijri year bring you closer to Allah and fill your days with barakah."',
    ],
  },
  "mawlid": {
    icon: "☪️", short: "Mawlid",
    bg: "linear-gradient(160deg,#1a0d05,#2c1a08)",
    aurora1: "radial-gradient(circle,rgba(251,191,36,.5),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(245,158,11,.4),transparent 70%)",
    glow: "radial-gradient(circle,rgba(251,191,36,.8),transparent 70%)",
    cutColor: "#1a0d05",
    aiMessages: [
      '"May the love of the Prophet ﷺ fill your heart on this blessed occasion. Ameen."',
    ],
  },
  "general": {
    icon: "🤲", short: "Du'a",
    bg: "linear-gradient(160deg,#0d0b1e,#1a1635)",
    aurora1: "radial-gradient(circle,rgba(196,181,253,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(167,139,250,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(196,181,253,.9),transparent 70%)",
    cutColor: "#0d0b1e",
    aiMessages: [
      '"May Allah\'s blessings be upon you always, in every step, in every prayer, and in every breath."',
    ],
  },
};

function getOccMeta(slug: string): OccMeta {
  return OCCASION_META[slug] ?? {
    icon: "🌙", short: slug,
    bg: "linear-gradient(160deg,#0d0b1e,#1a1635)",
    aurora1: "radial-gradient(circle,rgba(196,181,253,.6),transparent 70%)",
    aurora2: "radial-gradient(circle,rgba(167,139,250,.5),transparent 70%)",
    glow: "radial-gradient(circle,rgba(196,181,253,.9),transparent 70%)",
    cutColor: "#0d0b1e",
    aiMessages: ['"May Allah\'s blessings be upon you. Ameen."'],
  };
}

// ── Component ────────────────────────────────────────────────────────────────
export function CinematicBrowser({ occasions }: { occasions: OccasionGroup[] }) {
  const router = useRouter();
  const [occIdx, setOccIdx] = useState(0);
  const [cardIdx, setCardIdx] = useState(0);
  const [slideClass, setSlideClass] = useState("");
  const [aiMsgIdx, setAiMsgIdx] = useState(0);

  const occ = occasions[occIdx];
  const card = occ?.cards[cardIdx];
  const meta = occ ? getOccMeta(occ.slug) : null;

  const changeCard = useCallback((dir: 1 | -1) => {
    if (!occ || occ.cards.length <= 1) return;
    const total = occ.cards.length;
    const newIdx = (cardIdx + dir + total) % total;
    const outClass = dir > 0 ? "slide-out-left" : "slide-out-right";
    const inClass  = dir > 0 ? "slide-in-right"  : "slide-in-left";
    setSlideClass(outClass);
    setTimeout(() => {
      setCardIdx(newIdx);
      setSlideClass(inClass);
      setTimeout(() => setSlideClass(""), 400);
    }, 250);
  }, [occ, cardIdx]);

  const changeOccasion = useCallback((newOccIdx: number) => {
    setOccIdx(newOccIdx);
    setCardIdx(0);
    setAiMsgIdx(0);
    setSlideClass("");
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft")  changeCard(-1);
      if (e.key === "ArrowRight") changeCard(1);
      if (e.key === "ArrowUp")   changeOccasion((occIdx - 1 + occasions.length) % occasions.length);
      if (e.key === "ArrowDown")  changeOccasion((occIdx + 1) % occasions.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [changeCard, changeOccasion, occIdx, occasions.length]);

  if (!occ || !card || !meta) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh", color: "rgba(255,255,255,0.4)", paddingTop: 64 }}>
        <p style={{ fontSize: "1rem" }}>No cards available yet. Check back soon! 🌙</p>
      </div>
    );
  }

  const aiMsg = meta.aiMessages[aiMsgIdx % meta.aiMessages.length];

  // Shared button styles
  const arrowStyle: React.CSSProperties = {
    width: 38, height: 38, borderRadius: 12,
    border: "1px solid rgba(240,208,128,.12)",
    background: "rgba(255,255,255,.03)",
    color: "rgba(255,255,255,.4)", cursor: "pointer",
    fontSize: ".9rem", display: "flex", alignItems: "center", justifyContent: "center",
  };

  return (
    <>
      {/* ── LEFT STAGE ────────────────────────────────────────────────────── */}
      <div
        data-testid="card-stage"
        style={{
          position: "fixed", top: 64, left: 0, right: "50%", bottom: 76,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "32px 40px 24px",
          borderRight: "1px solid rgba(255,255,255,.04)",
          overflow: "hidden",
        }}
      >
        {/* Ambient aurora */}
        <div style={{ position: "absolute", width: 500, height: 500, top: -120, right: -100, borderRadius: "50%", filter: "blur(80px)", background: meta.aurora1, opacity: 0.22, pointerEvents: "none", transition: "background 1s ease" }} />
        <div style={{ position: "absolute", width: 380, height: 380, bottom: -100, left: -80, borderRadius: "50%", filter: "blur(80px)", background: meta.aurora2, opacity: 0.14, pointerEvents: "none", transition: "background 1s ease" }} />

        {/* Floating card */}
        <div style={{ position: "relative", zIndex: 3, perspective: 1200, width: 240, height: 320 }}>
          <div style={{ width: "100%", height: "100%", transformStyle: "preserve-3d", animation: "cardFloat 5s ease-in-out infinite" }}>
            <div
              className={slideClass}
              style={{
                width: "100%", height: "100%", borderRadius: 20, overflow: "hidden",
                position: "relative",
                border: "1px solid rgba(240,208,128,.15)",
                boxShadow: "0 40px 100px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.04), inset 0 1px 0 rgba(255,255,255,.08)",
                background: meta.bg, transition: "background 0.9s ease",
              }}
            >
              {/* Geometric tile pattern */}
              <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f0d080'%3E%3Cpath d='M25 0L50 25 25 50 0 25Z' fill-opacity='.5'/%3E%3Cpath d='M25 8L42 25 25 42 8 25Z' fill='none' stroke='%23f0d080' stroke-width='.5'/%3E%3C/g%3E%3C/svg%3E\")" }} />
              {/* Inner aurora glow */}
              <div style={{ position: "absolute", inset: -30, borderRadius: "50%", filter: "blur(40px)", background: meta.glow, opacity: 0.3, animation: "glowPulse 4s ease-in-out infinite" }} />
              {/* CSS crescent moon */}
              <div style={{ position: "absolute", top: 18, right: 22, width: 36, height: 36 }}>
                <div style={{ width: 36, height: 36, background: "rgba(240,208,128,.7)", borderRadius: "50%", position: "absolute" }} />
                <div style={{ width: 30, height: 30, background: meta.cutColor, borderRadius: "50%", position: "absolute", top: 2, right: -6, transition: "background 0.9s ease" }} />
              </div>
              {/* Twinkling stars */}
              {[
                { w: 3, t: "14%", l: "18%", d: "2.5s", delay: "0s" },
                { w: 2, t: "22%", l: "55%", d: "3.2s", delay: ".8s" },
                { w: 2, t: "35%", l: "28%", d: "4s",   delay: "1.5s" },
                { w: 3, t: "18%", l: "78%", d: "2.8s", delay: ".4s" },
                { w: 2, t: "60%", l: "14%", d: "3.5s", delay: "2s" },
              ].map((s, i) => (
                <div key={i} style={{ position: "absolute", width: s.w, height: s.w, top: s.t, left: s.l, borderRadius: "50%", background: "rgba(240,208,128,.7)", animation: `twinkle ${s.d} ease-in-out infinite ${s.delay}` }} />
              ))}
              {/* Card content */}
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, zIndex: 2 }}>
                <div style={{ fontSize: "3rem", filter: "drop-shadow(0 0 16px rgba(255,255,255,.2))", animation: "iconDrift 5s ease-in-out infinite" }}>
                  {meta.icon}
                </div>
                <div style={{ fontFamily: "var(--font-arabic, serif)", fontSize: "2rem", color: "rgba(240,208,128,.88)", textShadow: "0 0 30px rgba(240,208,128,.5)", animation: "arabicGlow 3s ease-in-out infinite", lineHeight: 1.2, textAlign: "center", padding: "0 12px" }}>
                  {card.titleAr}
                </div>
                <div style={{ width: 48, height: 1, background: "linear-gradient(90deg,transparent,rgba(240,208,128,.4),transparent)" }} />
                <div style={{ fontSize: ".6rem", letterSpacing: "2px", color: "rgba(255,255,255,.3)", textTransform: "uppercase" }}>
                  {occ.nameEn}
                </div>
              </div>
            </div>
          </div>
          {/* Floor reflection */}
          <div style={{ position: "absolute", bottom: -60, left: "50%", transform: "translateX(-50%)", width: 200, height: 40, background: "radial-gradient(ellipse,rgba(240,208,128,.08) 0%,transparent 70%)", filter: "blur(8px)", animation: "cardFloat 5s ease-in-out infinite" }} />
        </div>

        {/* Arrow navigation + progress dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 32, position: "relative", zIndex: 4 }}>
          <button data-testid="arrow-prev" onClick={() => changeCard(-1)} style={arrowStyle}>←</button>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {occ.cards.map((_, i) => (
              <div
                key={i}
                data-testid="prog-dot"
                onClick={() => setCardIdx(i)}
                style={{
                  width: i === cardIdx ? 16 : 5, height: 5,
                  borderRadius: i === cardIdx ? 3 : "50%",
                  background: i === cardIdx ? "var(--gold)" : "rgba(255,255,255,.15)",
                  cursor: "pointer", transition: "all .2s",
                }}
              />
            ))}
          </div>
          <button data-testid="arrow-next" onClick={() => changeCard(1)} style={arrowStyle}>→</button>
        </div>
      </div>

      {/* ── RIGHT PANEL ───────────────────────────────────────────────────── */}
      <div style={{
        position: "fixed", top: 64, left: "50%", right: 0, bottom: 76,
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "40px 48px 32px", overflowY: "auto",
      }}>
        {/* Occasion label */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: ".56rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(240,208,128,.45)", marginBottom: 14 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(240,208,128,.5)" }} />
          {occ.nameEn}
        </div>

        {/* Card title */}
        <div
          data-testid="card-title"
          style={{ fontSize: "1.9rem", fontWeight: 700, lineHeight: 1.2, marginBottom: 10, background: "linear-gradient(135deg,#fff 55%,rgba(255,255,255,.55))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          {card.titleEn}
        </div>
        <div style={{ fontFamily: "var(--font-arabic, serif)", fontSize: "1.1rem", color: "rgba(240,208,128,.45)", marginBottom: 14 }}>
          {card.titleAr}
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
          {card.isPremium && (
            <span style={{ fontSize: ".58rem", padding: "4px 11px", borderRadius: 8, background: "rgba(240,208,128,.07)", color: "rgba(240,208,128,.6)", border: "1px solid rgba(240,208,128,.14)" }}>✦ Premium</span>
          )}
          <span style={{ fontSize: ".58rem", padding: "4px 11px", borderRadius: 8, background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.32)", border: "1px solid rgba(255,255,255,.07)" }}>{occ.nameEn}</span>
          <span style={{ fontSize: ".58rem", padding: "4px 11px", borderRadius: 8, background: "rgba(168,85,247,.1)", color: "#d8b4fe", border: "1px solid rgba(168,85,247,.2)" }}>Animated</span>
        </div>

        {/* AI message preview */}
        <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "14px 16px", marginBottom: 22, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(168,85,247,.3),transparent)" }} />
          <div style={{ fontSize: ".55rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(168,85,247,.6)", marginBottom: 8 }}>✦ AI-suggested message</div>
          <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.5)", lineHeight: 1.65, fontStyle: "italic" }}>{aiMsg}</div>
          <div onClick={() => setAiMsgIdx(i => i + 1)} style={{ fontSize: ".58rem", color: "rgba(168,85,247,.5)", cursor: "pointer", marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4 }}>
            ↺ Generate another
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 28 }}>
          <button
            data-testid="btn-customise"
            onClick={() => router.push(`/customize/${card.id}` as never)}
            style={{ flex: 1, background: "linear-gradient(135deg,#b8860b,#f0d080)", color: "#1a1208", fontSize: ".7rem", fontWeight: 700, padding: "12px 26px", borderRadius: 13, border: "none", cursor: "pointer", letterSpacing: ".5px" }}
          >
            Customise & Send →
          </button>
          <button style={{ background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.5)", fontSize: ".7rem", padding: "12px 18px", borderRadius: 13, border: "1px solid rgba(255,255,255,.09)", cursor: "pointer" }}>
            Preview ↗
          </button>
          <button style={{ width: 42, height: 42, borderRadius: 11, border: "1px solid rgba(240,208,128,.12)", background: "transparent", color: "rgba(255,255,255,.35)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".95rem" }}>
            ♡
          </button>
        </div>

        {/* Thumbnail strip */}
        <div style={{ fontSize: ".56rem", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,.2)", marginBottom: 10 }}>
          More in this occasion
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {occ.cards.map((c, i) => (
            <div
              key={c.id}
              onClick={() => setCardIdx(i)}
              style={{
                flexShrink: 0, width: 56, height: 76, borderRadius: 10,
                cursor: "pointer",
                border: `1px solid ${i === cardIdx ? "rgba(240,208,128,.35)" : "rgba(255,255,255,.07)"}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                background: meta.bg, transition: "all .2s",
                transform: i === cardIdx ? "translateY(-3px)" : "none",
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{ fontSize: "1.2rem" }}>{meta.icon}</div>
              <div style={{ fontFamily: "var(--font-arabic, serif)", fontSize: ".65rem", color: "rgba(240,208,128,.6)", textAlign: "center", padding: "0 4px" }}>{c.titleAr}</div>
              {i === cardIdx && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "var(--gold)" }} />}
            </div>
          ))}
        </div>
      </div>

      {/* ── OCCASION STRIP ────────────────────────────────────────────────── */}
      <div
        data-testid="occasion-strip"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, height: 76, zIndex: 200,
          background: "rgba(3,2,10,.93)", backdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(255,255,255,.06)",
          display: "flex", overflowX: "auto",
        }}
      >
        {occasions.map((o, i) => {
          const m = getOccMeta(o.slug);
          const active = i === occIdx;
          return (
            <div
              key={o.slug}
              data-testid="occasion-btn"
              onClick={() => changeOccasion(i)}
              style={{
                flex: 1, minWidth: 90,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                cursor: "pointer",
                borderTop: `2px solid ${active ? "rgba(240,208,128,.65)" : "transparent"}`,
                background: active ? "rgba(240,208,128,.03)" : "transparent",
                padding: "0 6px", transition: "all .2s",
              }}
            >
              <div style={{ fontSize: "1.2rem" }}>{m.icon}</div>
              <div style={{ fontSize: ".5rem", letterSpacing: ".5px", color: active ? "rgba(240,208,128,.7)" : "rgba(255,255,255,.28)", whiteSpace: "nowrap" }}>
                {m.short || o.nameEn}
              </div>
              <div style={{ fontSize: ".46rem", color: "rgba(255,255,255,.15)" }}>{o.cards.length} cards</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No errors in `components/cards/CinematicBrowser.tsx`.

- [ ] **Step 5: Commit**

```bash
git add components/cards/CinematicBrowser.tsx
git commit -m "feat: add CinematicBrowser client component"
```

---

### Task 3: Rewrite CardsPage server component

**Files:**
- Modify: `app/[locale]/cards/page.tsx`

- [ ] **Step 1: Replace file content**

Replace the entire content of `app/[locale]/cards/page.tsx` with:

```typescript
import { Navbar } from "@/components/layout/Navbar";
import { AuroraBackground } from "@/components/home/AuroraBackground";
import { CustomCursor } from "@/components/home/CustomCursor";
import { CinematicBrowser, type OccasionGroup } from "@/components/cards/CinematicBrowser";
import { prisma } from "@/lib/db/prisma";

export default async function CardsPage() {
  // Fetch all active templates with their occasion, ordered for consistent grouping
  const templates = await prisma.cardTemplate.findMany({
    where: { isActive: true },
    include: { occasion: true },
    orderBy: [{ occasion: { sortOrder: "asc" } }, { isPremium: "asc" }, { sortOrder: "asc" }],
  });

  // Group cards by occasion slug, preserving occasion sort order
  const occMap = new Map<string, OccasionGroup>();
  for (const t of templates) {
    const slug = t.occasion.slug;
    if (!occMap.has(slug)) {
      occMap.set(slug, {
        slug,
        nameEn: t.occasion.nameEn,
        nameAr: t.occasion.nameAr,
        cards: [],
      });
    }
    occMap.get(slug)!.cards.push({
      id: t.id,
      slug: t.slug,
      titleEn: t.titleEn,
      titleAr: t.titleAr,
      isPremium: t.isPremium,
    });
  }

  const occasions: OccasionGroup[] = Array.from(occMap.values()).filter(o => o.cards.length > 0);

  return (
    <div style={{ background: "var(--v3-bg)", color: "var(--v3-text)", height: "100dvh", overflow: "hidden" }}>
      <AuroraBackground />
      <CustomCursor />
      <Navbar />
      <CinematicBrowser occasions={occasions} />
    </div>
  );
}
```

- [ ] **Step 2: Build to verify no type errors**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build succeeds. If it fails with "cannot find module", check the import path for `CinematicBrowser`.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/cards/page.tsx
git commit -m "feat: rewrite cards page as cinematic viewer"
```

---

### Task 4: Run E2E tests

**Files:**
- Test: `tests/cards.spec.ts`

- [ ] **Step 1: Start dev server**

```bash
npm run dev &
npx wait-on http://localhost:3000 --timeout 60000
```

- [ ] **Step 2: Run the cinematic tests**

```bash
npx playwright test tests/cards.spec.ts 2>&1 | tail -30
```

Expected:
```
✓  cinematic browser renders card stage and occasion strip
✓  cinematic browser arrow navigation changes card
```

If the DB has no card templates yet, both tests will pass with the "no cards" empty state — the stage still renders with the `data-testid="card-stage"` attribute. That is acceptable behaviour.

- [ ] **Step 3: Fix any failures**

If `[data-testid="card-stage"]` is not found: check that `CinematicBrowser` is being rendered (not returning early due to empty occasions). Verify the DB seed has been run (`npm run db:seed`).

If TypeScript errors: check `router.push(`/customize/${card.id}` as never)` — if the as-never cast causes issues, change to `router.push({ pathname: "/customize/[id]", params: { id: card.id } })`.

- [ ] **Step 4: Commit test updates**

```bash
git add tests/cards.spec.ts
git commit -m "test: add cinematic browser e2e assertions"
```
