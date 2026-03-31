# Homepage Redesign — Lantern Night Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing homepage with the Lantern Night design: a hero section with 6 floating occasion cards hanging from strings, a Trending Cards grid, a What's Coming Up section (countdown to next Islamic occasion + upcoming strip + Card of the Day), a How It Works section, and a footer.

**Architecture:** `app/[locale]/page.tsx` is a server component that fetches trending cards, card of the day, and occasion card counts from Prisma, then passes data down to new client components. `CountdownTimer` is the only client component that needs browser timers. Islamic occasion dates are hardcoded in `lib/hijri/occasions.ts` (no external API calls — avoids network dependency at build time). `HeroSection` is a client component (needs router for lantern-card clicks). Schema adds `isFeatured Boolean @default(false)` to `CardTemplate`.

**Tech Stack:** Next.js 16 App Router, Prisma 7, hardcoded 2026-2027 Islamic occasion dates, React `useEffect` for countdown, CSS keyframes from globals.css

---

## File Map

| File | Action |
|------|--------|
| `prisma/schema.prisma` | Add `isFeatured Boolean @default(false)` to `CardTemplate` |
| `lib/hijri/occasions.ts` | **Create** — hardcoded 2026-2027 Islamic occasion dates + helper |
| `components/home/HeroSection.tsx` | **Rewrite** — Lantern Night hero with 6 floating occasion cards |
| `components/home/TrendingCards.tsx` | **Create** — 4-card trending grid |
| `components/home/CountdownTimer.tsx` | **Create** — client component, live ticking countdown |
| `components/home/WhatsComingUp.tsx` | **Create** — server wrapper that passes date data to CountdownTimer |
| `components/home/HowItWorks.tsx` | **Create** — 3-step static section |
| `app/[locale]/page.tsx` | **Rewrite** — new section structure, remove old components |
| `components/home/HeroSpotlight.tsx` | **Delete** |
| `components/home/HeroSpotlightClient.tsx` | **Delete** |
| `components/home/DiscoverGrid.tsx` | **Delete** |
| `components/home/DiscoverGridClient.tsx` | **Delete** |
| `components/home/OccasionMedallions.tsx` | **Delete** |
| `tests/navigation.spec.ts` | **Update** — update hero heading assertion |

---

### Task 1: Add isFeatured to Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add field to CardTemplate model**

In `prisma/schema.prisma`, find the `model CardTemplate` block. After the `isActive Boolean @default(true)` line, add:

```prisma
isFeatured  Boolean  @default(false)
```

The full block should look like:

```prisma
model CardTemplate {
  id            String   @id @default(cuid())
  slug          String   @unique
  titleEn       String
  titleAr       String
  occasionId    String
  animationFile String
  bgImageUrl    String
  bgColor       String   @default("#1a3a2a")
  isPremium     Boolean  @default(false)
  isActive      Boolean  @default(true)
  isFeatured    Boolean  @default(false)
  sortOrder     Int      @default(0)
  createdAt     DateTime @default(now())
  // ... rest of fields unchanged
```

- [ ] **Step 2: Generate Prisma client**

```bash
npm run db:generate
```

Expected: `✔ Generated Prisma Client`

- [ ] **Step 3: Run migration (if DATABASE_URL is available)**

```bash
npm run db:migrate
```

If `DATABASE_URL` is not set in this environment, skip migration and note it for deployment. The Prisma client still generates correctly without it.

Expected (if DB available): `✔ Applied 1 migration`

- [ ] **Step 4: Verify build still passes**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add isFeatured field to CardTemplate schema"
```

---

### Task 2: Create lib/hijri/occasions.ts

**Files:**
- Create: `lib/hijri/occasions.ts`

- [ ] **Step 1: Create the file**

Create `lib/hijri/occasions.ts` with this content:

```typescript
// Hardcoded 2026-2027 Islamic occasion dates (approximate — based on astronomical calculations)
// Dates may vary by 1-2 days depending on moon sighting.

export interface IslamicOccasion {
  slug: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  dates: string[];  // ISO date strings "YYYY-MM-DD", multiple years for cycle coverage
  description: string;
}

export const ISLAMIC_OCCASIONS: IslamicOccasion[] = [
  {
    slug: "ramadan",
    nameEn: "Ramadan",
    nameAr: "رمضان",
    icon: "🌙",
    dates: ["2026-02-17", "2027-02-06"],
    description: "The holy month of fasting, prayer and reflection",
  },
  {
    slug: "eid-ul-fitr",
    nameEn: "Eid al-Fitr",
    nameAr: "عيد الفطر",
    icon: "🎁",
    dates: ["2026-03-20", "2027-03-09"],
    description: "The festival of breaking the fast at the end of Ramadan",
  },
  {
    slug: "eid-ul-adha",
    nameEn: "Eid al-Adha",
    nameAr: "عيد الأضحى",
    icon: "🐑",
    dates: ["2026-05-27", "2027-05-16"],
    description: "The festival of sacrifice commemorating Ibrahim AS",
  },
  {
    slug: "hajj",
    nameEn: "Hajj",
    nameAr: "الحج",
    icon: "🕋",
    dates: ["2026-05-22", "2027-05-11"],
    description: "The annual pilgrimage to Makkah — fifth pillar of Islam",
  },
  {
    slug: "islamic-new-year",
    nameEn: "Islamic New Year",
    nameAr: "رأس السنة الهجرية",
    icon: "🌙",
    dates: ["2026-06-16", "2027-06-06"],
    description: "First day of Muharram — the Islamic new year",
  },
  {
    slug: "mawlid",
    nameEn: "Mawlid al-Nabi",
    nameAr: "المولد النبوي",
    icon: "☪️",
    dates: ["2026-09-04", "2027-08-24"],
    description: "Commemoration of the birth of Prophet Muhammad ﷺ",
  },
  {
    slug: "laylatul-qadr",
    nameEn: "Laylatul Qadr",
    nameAr: "ليلة القدر",
    icon: "✨",
    dates: ["2026-03-14", "2027-03-03"],
    description: "The Night of Power in the last ten nights of Ramadan",
  },
];

export interface UpcomingOccasion extends IslamicOccasion {
  nextDate: Date;
  daysAway: number;
}

/** Returns all occasions sorted by their next upcoming date, relative to `now`. */
export function getUpcomingOccasions(now: Date = new Date()): UpcomingOccasion[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return ISLAMIC_OCCASIONS
    .map((occ) => {
      // Find the nearest future date across all listed dates
      const future = occ.dates
        .map((d) => new Date(d))
        .filter((d) => d >= today)
        .sort((a, b) => a.getTime() - b.getTime())[0];

      if (!future) return null;

      const daysAway = Math.round((future.getTime() - today.getTime()) / 86_400_000);
      return { ...occ, nextDate: future, daysAway } as UpcomingOccasion;
    })
    .filter((o): o is UpcomingOccasion => o !== null)
    .sort((a, b) => a.daysAway - b.daysAway);
}

/** Returns the single next Islamic occasion from today. */
export function getNextOccasion(now: Date = new Date()): UpcomingOccasion | null {
  return getUpcomingOccasions(now)[0] ?? null;
}
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit 2>&1 | grep "hijri" | head -10
```

Expected: No errors for `lib/hijri/occasions.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/hijri/occasions.ts
git commit -m "feat: add Islamic occasion dates helper with 2026-2027 data"
```

---

### Task 3: Rewrite HeroSection — Lantern Night

**Files:**
- Modify: `components/home/HeroSection.tsx`

This component is the full-viewport hero with 6 floating occasion cards hanging from strings and centred headline copy.

- [ ] **Step 1: Write the Playwright test assertion**

Open `tests/navigation.spec.ts`. Update the existing hero heading test:

```typescript
test("home page loads with navbar and hero", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("nav")).toBeVisible();
  // New hero: "Noor" is part of the h1
  await expect(page.getByRole("heading", { name: /noor/i }).first()).toBeVisible({ timeout: 10000 });
  // Lantern cards visible
  await expect(page.locator('[data-testid="lantern-card"]').first()).toBeVisible();
});
```

- [ ] **Step 2: Replace the file content**

Replace the entire content of `components/home/HeroSection.tsx` with:

```typescript
"use client";

import { useRouter } from "@/lib/i18n-navigation";

const LANTERNS = [
  {
    slug: "eid-ul-fitr",
    label: "Eid al-Fitr",
    arabic: "عيد مبارك",
    icon: "🎁",
    bg: "linear-gradient(160deg,#061a06,#0e2c0e)",
    glow: "rgba(74,222,128,0.35)",
    strH: 60,
    dur: "6s",
    rot: "-2deg",
    delay: "0s",
  },
  {
    slug: "ramadan",
    label: "Ramadan",
    arabic: "رمضان كريم",
    icon: "📿",
    bg: "linear-gradient(160deg,#0e0a20,#1a1038)",
    glow: "rgba(167,139,250,0.35)",
    strH: 80,
    dur: "7s",
    rot: "1.5deg",
    delay: "0.4s",
  },
  {
    slug: "nikah",
    label: "Nikah",
    arabic: "مبروك",
    icon: "💍",
    bg: "linear-gradient(160deg,#1a1005,#32190a)",
    glow: "rgba(251,191,36,0.35)",
    strH: 40,
    dur: "8s",
    rot: "-1deg",
    delay: "0.2s",
  },
  {
    slug: "hajj",
    label: "Hajj",
    arabic: "حج مبرور",
    icon: "🕋",
    bg: "linear-gradient(160deg,#030e1e,#081d38)",
    glow: "rgba(96,165,250,0.35)",
    strH: 70,
    dur: "6.5s",
    rot: "2deg",
    delay: "0.6s",
  },
  {
    slug: "eid-ul-adha",
    label: "Eid al-Adha",
    arabic: "عيد الأضحى",
    icon: "🐑",
    bg: "linear-gradient(160deg,#081408,#122814)",
    glow: "rgba(52,211,153,0.35)",
    strH: 55,
    dur: "7.5s",
    rot: "-1.5deg",
    delay: "0.8s",
  },
  {
    slug: "aqiqah",
    label: "New Born",
    arabic: "نور",
    icon: "🕯️",
    bg: "linear-gradient(160deg,#071407,#0e2810)",
    glow: "rgba(134,239,172,0.35)",
    strH: 65,
    dur: "5.8s",
    rot: "1deg",
    delay: "1s",
  },
];

export function HeroSection() {
  const router = useRouter();

  return (
    <section
      style={{
        position: "relative", zIndex: 2,
        minHeight: "100vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        overflow: "hidden", paddingBottom: 60,
      }}
    >
      {/* Starfield */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: [
            "radial-gradient(1px 1px at 7% 11%,rgba(255,255,255,.6) 0%,transparent 100%)",
            "radial-gradient(1px 1px at 21% 38%,rgba(255,255,255,.4) 0%,transparent 100%)",
            "radial-gradient(1.5px 1.5px at 36% 5%,rgba(255,255,255,.5) 0%,transparent 100%)",
            "radial-gradient(1px 1px at 54% 20%,rgba(255,255,255,.35) 0%,transparent 100%)",
            "radial-gradient(1px 1px at 68% 45%,rgba(255,255,255,.4) 0%,transparent 100%)",
            "radial-gradient(1.5px 1.5px at 83% 9%,rgba(255,255,255,.55) 0%,transparent 100%)",
            "radial-gradient(1px 1px at 92% 62%,rgba(255,255,255,.3) 0%,transparent 100%)",
            "radial-gradient(1px 1px at 15% 75%,rgba(255,255,255,.35) 0%,transparent 100%)",
            "radial-gradient(1px 1px at 47% 85%,rgba(255,255,255,.25) 0%,transparent 100%)",
          ].join(","),
        }}
      />

      {/* CSS crescent moon — top right */}
      <div aria-hidden="true" style={{ position: "absolute", top: 40, right: 60, width: 56, height: 56 }}>
        <div style={{ width: 56, height: 56, background: "rgba(240,208,128,.55)", borderRadius: "50%", position: "absolute" }} />
        <div style={{ width: 46, height: 46, background: "var(--v3-bg)", borderRadius: "50%", position: "absolute", top: 4, right: -10 }} />
      </div>

      {/* Islamic geometric SVG tile — very subtle */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, opacity: 0.025, pointerEvents: "none",
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f0d080'%3E%3Cpath d='M30 0L60 30 30 60 0 30Z' fill-opacity='.5'/%3E%3Cpath d='M30 10L50 30 30 50 10 30Z' fill='none' stroke='%23f0d080' stroke-width='.8'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Headline copy */}
      <div style={{ textAlign: "center", zIndex: 3, marginBottom: 48, padding: "0 24px" }}>
        <p style={{ fontFamily: "var(--font-arabic, serif)", fontSize: "1.4rem", color: "rgba(240,208,128,.35)", marginBottom: 12, letterSpacing: 2 }}>
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
        </p>
        <h1 style={{ fontSize: "clamp(2.8rem,6vw,4.6rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px", color: "#fff", marginBottom: 16 }}>
          Send Blessings with{" "}
          <span style={{ background: "linear-gradient(135deg,#f0d080,#b8860b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Noor
          </span>
        </h1>
        <p style={{ fontSize: "1.05rem", color: "var(--v3-text-dim)", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.6 }}>
          Beautiful animated Islamic ecards for every occasion
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => router.push("/cards")}
            style={{ background: "linear-gradient(135deg,#b8860b,#f0d080)", color: "#1a1208", fontWeight: 700, fontSize: ".9rem", padding: "13px 32px", borderRadius: 40, border: "none", cursor: "pointer", letterSpacing: ".3px" }}
          >
            Browse Cards →
          </button>
          <button
            onClick={() => router.push("/pricing")}
            style={{ background: "transparent", color: "rgba(255,255,255,.6)", fontWeight: 600, fontSize: ".9rem", padding: "13px 28px", borderRadius: 40, border: "1px solid rgba(255,255,255,.15)", cursor: "pointer" }}
          >
            See Pricing
          </button>
        </div>
      </div>

      {/* ── Lantern Cards ──────────────────────────────────────── */}
      <div
        style={{
          display: "flex", justifyContent: "center", alignItems: "flex-start",
          gap: "clamp(12px,2vw,28px)", zIndex: 3, padding: "0 16px",
          maxWidth: "min(100vw, 900px)", flexWrap: "nowrap",
        }}
      >
        {LANTERNS.map((l) => (
          <div
            key={l.slug}
            data-testid="lantern-card"
            onClick={() => router.push(`/cards?occasion=${l.slug}` as never)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
          >
            {/* String */}
            <div style={{ width: 1, height: l.strH, background: "linear-gradient(180deg,transparent,rgba(240,208,128,.3),rgba(240,208,128,.5))" }} />
            {/* Card */}
            <div
              style={{
                width: "clamp(90px,10vw,130px)",
                height: "clamp(120px,13vw,172px)",
                borderRadius: 14,
                background: l.bg,
                border: "1px solid rgba(240,208,128,.18)",
                boxShadow: `0 20px 60px rgba(0,0,0,.5), 0 0 30px ${l.glow}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "12px 8px", position: "relative", overflow: "hidden",
                transform: `rotate(${l.rot})`,
                animation: `cardFloat ${l.dur} ease-in-out infinite ${l.delay}`,
                transition: "transform .3s, box-shadow .3s",
              }}
            >
              <div style={{ fontSize: "clamp(1.4rem,2.5vw,2rem)" }}>{l.icon}</div>
              <div style={{ fontFamily: "var(--font-arabic, serif)", fontSize: "clamp(.75rem,1.2vw,1rem)", color: "rgba(240,208,128,.85)", textAlign: "center", lineHeight: 1.2, animation: "arabicGlow 3s ease-in-out infinite" }}>
                {l.arabic}
              </div>
              <div style={{ fontSize: "clamp(.45rem,.7vw,.6rem)", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,.28)", textAlign: "center" }}>
                {l.label}
              </div>
              {/* Glow at base */}
              <div style={{ position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)", width: "80%", height: 20, background: `radial-gradient(ellipse,${l.glow} 0%,transparent 70%)`, filter: "blur(6px)" }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Build to verify no errors**

```bash
npx tsc --noEmit 2>&1 | grep "HeroSection" | head -10
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add components/home/HeroSection.tsx
git commit -m "feat: rewrite HeroSection as Lantern Night hero"
```

---

### Task 4: Create TrendingCards component

**Files:**
- Create: `components/home/TrendingCards.tsx`

- [ ] **Step 1: Create the file**

Create `components/home/TrendingCards.tsx` with this content:

```typescript
import { Link } from "@/lib/i18n-navigation";

interface CardTemplate {
  id: string;
  titleEn: string;
  titleAr: string;
  bgColor: string;
  isPremium: boolean;
  isAiGenerated: boolean;
  occasion: { nameEn: string; slug: string };
}

interface Props {
  cards: CardTemplate[];
}

function getAccentColor(slug: string): string {
  if (slug.includes("eid"))     return "rgba(74,222,128,0.4)";
  if (slug.includes("ramadan")) return "rgba(167,139,250,0.4)";
  if (slug.includes("nikah"))   return "rgba(251,191,36,0.4)";
  if (slug.includes("hajj"))    return "rgba(96,165,250,0.4)";
  if (slug.includes("jummah"))  return "rgba(244,114,182,0.4)";
  return "rgba(240,208,128,0.3)";
}

export function TrendingCards({ cards }: Props) {
  if (cards.length === 0) return null;

  return (
    <section style={{ position: "relative", zIndex: 2, padding: "64px 32px 0", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 28 }}>
        <h2 style={{ fontSize: "clamp(1.3rem,2.5vw,1.8rem)", fontWeight: 700, color: "#fff" }}>
          Trending This Season
        </h2>
        <Link href="/cards" style={{ fontSize: ".82rem", color: "var(--gold)", opacity: 0.7, textDecoration: "none" }}>
          View all cards →
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 20 }}>
        {cards.map((card, i) => {
          const accent = getAccentColor(card.occasion.slug);
          const badge = i === 0 ? "TRENDING" : card.isAiGenerated ? "NEW" : null;
          return (
            <Link key={card.id} href={`/customize/${card.id}`} style={{ textDecoration: "none" }}>
              <div
                style={{
                  borderRadius: 16, overflow: "hidden",
                  border: "1px solid rgba(255,255,255,.07)",
                  background: "rgba(255,255,255,.03)",
                  cursor: "pointer", transition: "transform .2s, box-shadow .2s",
                }}
              >
                {/* Card preview */}
                <div
                  style={{
                    height: 180, position: "relative", overflow: "hidden",
                    background: card.bgColor || "linear-gradient(160deg,#0a1a0a,#1a2a1a)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {/* Ambient glow */}
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 30%,${accent} 0%,transparent 70%)` }} />
                  {/* Badge */}
                  {badge && (
                    <span style={{
                      position: "absolute", top: 10, left: 10,
                      background: badge === "TRENDING" ? "linear-gradient(135deg,#b8860b,#f0d080)" : "rgba(167,139,250,.9)",
                      color: badge === "TRENDING" ? "#1a1208" : "#fff",
                      fontSize: ".55rem", fontWeight: 700, padding: "3px 9px", borderRadius: 6, letterSpacing: "1px",
                    }}>
                      {badge}
                    </span>
                  )}
                  {card.isPremium && (
                    <span style={{ position: "absolute", top: 10, right: 10, background: "rgba(240,208,128,.9)", color: "#1a1208", fontSize: ".55rem", fontWeight: 700, padding: "3px 9px", borderRadius: 6 }}>
                      ✦ PRO
                    </span>
                  )}
                  {/* Arabic title as preview */}
                  <div style={{ fontFamily: "var(--font-arabic, serif)", fontSize: "2rem", color: "rgba(240,208,128,.7)", textAlign: "center", padding: "0 16px", lineHeight: 1.2 }}>
                    {card.titleAr}
                  </div>
                </div>

                {/* Card label */}
                <div style={{ padding: "12px 14px" }}>
                  <p style={{ fontSize: ".78rem", fontWeight: 600, color: "rgba(255,255,255,.85)", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {card.titleEn}
                  </p>
                  <p style={{ fontSize: ".65rem", color: "rgba(255,255,255,.35)" }}>{card.occasion.nameEn}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Build check**

```bash
npx tsc --noEmit 2>&1 | grep "TrendingCards" | head -5
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/home/TrendingCards.tsx
git commit -m "feat: add TrendingCards component"
```

---

### Task 5: Create CountdownTimer and WhatsComingUp

**Files:**
- Create: `components/home/CountdownTimer.tsx`
- Create: `components/home/WhatsComingUp.tsx`

- [ ] **Step 1: Create CountdownTimer (client component)**

Create `components/home/CountdownTimer.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";

interface Props {
  targetDate: string;  // ISO date string "YYYY-MM-DD"
  occasionName: string;
  occasionNameAr: string;
  occasionIcon: string;
  slug: string;
}

function getTimeLeft(targetDate: string) {
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);

  const days    = Math.floor(diff / 86_400_000);
  const hours   = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000)  / 60_000);
  const seconds = Math.floor((diff % 60_000)     / 1_000);

  return { days, hours, minutes, seconds, diff };
}

export function CountdownTimer({ targetDate, occasionName, occasionNameAr, occasionIcon, slug }: Props) {
  const [time, setTime] = useState(() => getTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const unitStyle: React.CSSProperties = {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    minWidth: 64,
  };
  const numStyle: React.CSSProperties = {
    fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 800,
    background: "linear-gradient(135deg,#fff,rgba(240,208,128,.9))",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    lineHeight: 1, fontVariantNumeric: "tabular-nums",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: ".55rem", letterSpacing: "2px", textTransform: "uppercase",
    color: "rgba(255,255,255,.3)",
  };

  if (time.diff === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <div style={{ fontSize: "2rem", marginBottom: 8 }}>{occasionIcon}</div>
        <p style={{ color: "var(--gold)", fontWeight: 700 }}>{occasionName} is today! 🎉</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,.03)",
        border: "1px solid rgba(240,208,128,.1)",
        borderRadius: 20, padding: "32px 40px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Gold top accent */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,var(--gold),transparent)" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: "1.6rem" }}>{occasionIcon}</span>
        <div>
          <p style={{ fontSize: ".6rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(240,208,128,.5)", marginBottom: 2 }}>Next Occasion</p>
          <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>{occasionName}</p>
          <p style={{ fontFamily: "var(--font-arabic, serif)", fontSize: ".95rem", color: "rgba(240,208,128,.4)", lineHeight: 1 }}>{occasionNameAr}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={unitStyle}>
          <span style={numStyle}>{String(time.days).padStart(2, "0")}</span>
          <span style={labelStyle}>days</span>
        </div>
        <span style={{ fontSize: "1.5rem", color: "rgba(255,255,255,.2)", marginBottom: 16 }}>:</span>
        <div style={unitStyle}>
          <span style={numStyle}>{String(time.hours).padStart(2, "0")}</span>
          <span style={labelStyle}>hours</span>
        </div>
        <span style={{ fontSize: "1.5rem", color: "rgba(255,255,255,.2)", marginBottom: 16 }}>:</span>
        <div style={unitStyle}>
          <span style={numStyle}>{String(time.minutes).padStart(2, "0")}</span>
          <span style={labelStyle}>mins</span>
        </div>
        <span style={{ fontSize: "1.5rem", color: "rgba(255,255,255,.2)", marginBottom: 16 }}>:</span>
        <div style={unitStyle}>
          <span style={numStyle}>{String(time.seconds).padStart(2, "0")}</span>
          <span style={labelStyle}>secs</span>
        </div>
      </div>

      <a
        href={`/cards?occasion=${slug}`}
        style={{
          background: "linear-gradient(135deg,#b8860b,#f0d080)", color: "#1a1208",
          fontWeight: 700, fontSize: ".78rem", padding: "10px 28px", borderRadius: 30,
          textDecoration: "none", letterSpacing: ".3px",
        }}
      >
        Browse {occasionName} Cards →
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Create WhatsComingUp (server component)**

Create `components/home/WhatsComingUp.tsx`:

```typescript
import { getUpcomingOccasions } from "@/lib/hijri/occasions";
import { CountdownTimer } from "./CountdownTimer";
import { Link } from "@/lib/i18n-navigation";

interface CardOfTheDayProps {
  card: {
    id: string;
    titleEn: string;
    titleAr: string;
    bgColor: string;
    occasion: { nameEn: string; slug: string };
  } | null;
}

export function WhatsComingUp({ cardOfTheDay }: CardOfTheDayProps) {
  const upcoming = getUpcomingOccasions();
  const next = upcoming[0];
  const nextThree = upcoming.slice(1, 4);

  if (!next) return null;

  return (
    <section style={{ position: "relative", zIndex: 2, padding: "64px 32px 0", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "clamp(1.3rem,2.5vw,1.8rem)", fontWeight: 700, color: "#fff", marginBottom: 28 }}>
        What&apos;s Coming Up
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Left: countdown */}
        <CountdownTimer
          targetDate={next.nextDate.toISOString().split("T")[0]}
          occasionName={next.nameEn}
          occasionNameAr={next.nameAr}
          occasionIcon={next.icon}
          slug={next.slug}
        />

        {/* Right: upcoming strip */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {nextThree.map((occ) => (
            <Link
              key={occ.slug}
              href={`/cards?occasion=${occ.slug}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 14, padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 14,
                  flex: 1, transition: "border-color .2s",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>{occ.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: ".82rem", fontWeight: 600, color: "#fff", marginBottom: 2 }}>{occ.nameEn}</p>
                  <p style={{ fontSize: ".68rem", color: "rgba(255,255,255,.35)" }}>
                    {occ.daysAway <= 14
                      ? <span style={{ color: "rgba(240,208,128,.8)", fontWeight: 600 }}>SOON — in {occ.daysAway} days</span>
                      : `in ${occ.daysAway} days`}
                  </p>
                </div>
                <span style={{ fontSize: ".7rem", color: "rgba(255,255,255,.2)" }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Card of the Day */}
      {cardOfTheDay && (
        <div style={{ marginTop: 8 }}>
          <p style={{ fontSize: ".7rem", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,.25)", marginBottom: 14 }}>Card of the Day</p>
          <div
            style={{
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 16, padding: "20px 24px",
              display: "flex", alignItems: "center", gap: 20,
            }}
          >
            <div
              style={{
                width: 80, height: 108, borderRadius: 10,
                background: cardOfTheDay.bgColor || "#0a1a0a",
                border: "1px solid rgba(240,208,128,.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <div style={{ fontFamily: "var(--font-arabic, serif)", fontSize: "1.1rem", color: "rgba(240,208,128,.7)", textAlign: "center", padding: "0 6px" }}>
                {cardOfTheDay.titleAr}
              </div>
            </div>
            <div>
              <p style={{ fontSize: ".88rem", fontWeight: 700, color: "#fff", marginBottom: 4 }}>{cardOfTheDay.titleEn}</p>
              <p style={{ fontSize: ".7rem", color: "rgba(255,255,255,.35)", marginBottom: 14 }}>{cardOfTheDay.occasion.nameEn}</p>
              <Link
                href={`/customize/${cardOfTheDay.id}`}
                style={{
                  background: "linear-gradient(135deg,#b8860b,#f0d080)", color: "#1a1208",
                  fontWeight: 700, fontSize: ".72rem", padding: "8px 20px", borderRadius: 20,
                  textDecoration: "none",
                }}
              >
                Send This Card →
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Build check**

```bash
npx tsc --noEmit 2>&1 | grep -E "CountdownTimer|WhatsComingUp" | head -10
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add components/home/CountdownTimer.tsx components/home/WhatsComingUp.tsx
git commit -m "feat: add CountdownTimer and WhatsComingUp components"
```

---

### Task 6: Create HowItWorks component

**Files:**
- Create: `components/home/HowItWorks.tsx`

- [ ] **Step 1: Create the file**

Create `components/home/HowItWorks.tsx`:

```typescript
const STEPS = [
  {
    num: "01",
    title: "Pick a Card",
    desc: "Browse 200+ animated Islamic ecards across 12 occasions. Free and Premium designs.",
  },
  {
    num: "02",
    title: "Personalise It",
    desc: "Type your message or let our AI craft a beautiful Islamic greeting for any occasion.",
  },
  {
    num: "03",
    title: "Send with Love",
    desc: "Send via email or WhatsApp instantly. Schedule delivery for the perfect moment.",
  },
];

export function HowItWorks() {
  return (
    <section style={{ position: "relative", zIndex: 2, padding: "64px 32px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "clamp(1.3rem,2.5vw,1.8rem)", fontWeight: 700, color: "#fff", marginBottom: 36 }}>
        How It Works
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 24 }}>
        {STEPS.map((step) => (
          <div
            key={step.num}
            style={{
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.07)",
              borderTop: "2px solid rgba(240,208,128,.4)",
              borderRadius: 16, padding: "28px 24px",
            }}
          >
            <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "rgba(240,208,128,.18)", marginBottom: 12, fontVariantNumeric: "tabular-nums" }}>
              {step.num}
            </div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginBottom: 10 }}>{step.title}</h3>
            <p style={{ fontSize: ".82rem", color: "rgba(255,255,255,.42)", lineHeight: 1.7 }}>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Build check**

```bash
npx tsc --noEmit 2>&1 | grep "HowItWorks" | head -5
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/home/HowItWorks.tsx
git commit -m "feat: add HowItWorks component"
```

---

### Task 7: Rewrite homepage page.tsx

**Files:**
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Read the file to confirm current content**

Confirm `app/[locale]/page.tsx` imports `HeroSpotlight`, `DiscoverGrid`, `OccasionMedallions`. These are the components we will remove.

- [ ] **Step 2: Fetch data in the server component**

Replace the entire content of `app/[locale]/page.tsx` with:

```typescript
import { Navbar } from "@/components/layout/Navbar";
import { AuroraBackground } from "@/components/home/AuroraBackground";
import { CustomCursor } from "@/components/home/CustomCursor";
import { HeroSection } from "@/components/home/HeroSection";
import { TrendingCards } from "@/components/home/TrendingCards";
import { WhatsComingUp } from "@/components/home/WhatsComingUp";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Link } from "@/lib/i18n-navigation";
import { prisma } from "@/lib/db/prisma";

async function getTrendingCards() {
  // isFeatured cards first (up to 4), fill remaining with most-sent
  const featured = await prisma.cardTemplate.findMany({
    where: { isActive: true, isFeatured: true },
    include: { occasion: true },
    take: 4,
    orderBy: { sortOrder: "asc" },
  });

  const remaining = 4 - featured.length;
  const popular = remaining > 0
    ? await prisma.cardTemplate.findMany({
        where: { isActive: true, isFeatured: false },
        include: { occasion: true },
        take: remaining,
        orderBy: { sortOrder: "asc" },
      })
    : [];

  return [...featured, ...popular];
}

async function getCardOfTheDay() {
  const all = await prisma.cardTemplate.findMany({
    where: { isActive: true },
    include: { occasion: true },
    orderBy: { sortOrder: "asc" },
  });
  if (all.length === 0) return null;
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  return all[dayOfYear % all.length];
}

export default async function HomePage() {
  const [trendingCards, cardOfTheDay] = await Promise.all([
    getTrendingCards(),
    getCardOfTheDay(),
  ]);

  return (
    <div style={{ background: "var(--v3-bg)", color: "var(--v3-text)", minHeight: "100vh", overflowX: "hidden" }}>
      <AuroraBackground />
      <CustomCursor />
      <Navbar />

      <HeroSection />

      <TrendingCards cards={trendingCards} />

      <WhatsComingUp cardOfTheDay={cardOfTheDay} />

      <HowItWorks />

      {/* CTA Banner */}
      <section style={{ position: "relative", zIndex: 2, padding: "0 32px 56px", maxWidth: "1200px", margin: "0 auto" }}>
        <div className="v3-cta-banner">
          <p style={{ fontSize: ".75rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--gold)", marginBottom: "12px", opacity: 0.8 }}>
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

      {/* Footer */}
      <footer className="v3-footer" style={{ position: "relative", zIndex: 2 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--gold)", marginBottom: "8px" }}>☽ Noor Cards</p>
          <p style={{ fontSize: ".82rem", color: "var(--v3-text-dim)", lineHeight: 1.6, maxWidth: "220px" }}>
            Beautiful animated Islamic ecards with AI-generated greetings and Quranic wisdom.
          </p>
        </div>
        <div className="v3-footer-col">
          <h4>Cards</h4>
          <Link href="/cards">Browse All</Link>
          <Link href="/cards?occasion=eid-ul-fitr">Eid Cards</Link>
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
          <Link href="/cards?occasion=hajj">Hajj &amp; Umrah</Link>
          <Link href="/cards?occasion=aqiqah">New Born</Link>
          <Link href="/cards?occasion=general">Du&apos;a &amp; Blessings</Link>
        </div>
      </footer>
      <div style={{ position: "relative", zIndex: 2, borderTop: "1px solid var(--v3-border)", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: ".78rem", color: "var(--v3-text-dim)" }}>Islamic Ecards © {new Date().getFullYear()} — Spreading Blessings</p>
        <p style={{ fontSize: ".78rem", color: "var(--v3-text-dim)", fontFamily: "var(--font-arabic, serif)" }}>جزاك الله خيراً</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run full build**

```bash
npm run build 2>&1 | tail -30
```

Expected: Build succeeds. If it fails because `HeroSpotlight` or `DiscoverGrid` are still imported somewhere, check other files that import them and remove those imports.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/page.tsx
git commit -m "feat: rewrite homepage with Lantern Night hero and new sections"
```

---

### Task 8: Delete old home components

**Files:**
- Delete: `components/home/HeroSpotlight.tsx`
- Delete: `components/home/HeroSpotlightClient.tsx`
- Delete: `components/home/DiscoverGrid.tsx`
- Delete: `components/home/DiscoverGridClient.tsx`
- Delete: `components/home/OccasionMedallions.tsx`

- [ ] **Step 1: Verify nothing still imports these files**

```bash
grep -r "HeroSpotlight\|DiscoverGrid\|OccasionMedallions" app/ components/ --include="*.tsx" --include="*.ts" -l
```

Expected: No files listed. If any files are listed, open them and remove the imports before deleting.

- [ ] **Step 2: Delete the files**

```bash
rm "components/home/HeroSpotlight.tsx" \
   "components/home/HeroSpotlightClient.tsx" \
   "components/home/DiscoverGrid.tsx" \
   "components/home/DiscoverGridClient.tsx" \
   "components/home/OccasionMedallions.tsx"
```

- [ ] **Step 3: Final build**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build succeeds with no errors about deleted files.

- [ ] **Step 4: Run E2E tests**

```bash
npm run dev &
npx wait-on http://localhost:3000 --timeout 60000
npx playwright test tests/navigation.spec.ts 2>&1 | tail -20
```

Expected:
```
✓  home page loads with navbar and hero
✓  lantern card is visible
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove obsolete home components (HeroSpotlight, DiscoverGrid, OccasionMedallions)"
```
