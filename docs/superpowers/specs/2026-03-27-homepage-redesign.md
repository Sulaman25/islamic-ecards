# Homepage Redesign — Design Spec

**Date:** 2026-03-27
**Status:** Approved — pending implementation
**Mockup:** `.superpowers/brainstorm/2035-1774587689/content/homepage-full.html`

---

## Goal

Replace the existing homepage (`app/[locale]/page.tsx`) with a visually rich, culturally authentic Islamic ecard landing page that drives card browsing and creates repeat visits through live Hijri calendar integration.

## Architecture

Full server component page using existing `AuroraBackground` and `CustomCursor`. New client components for animated sections. Sections render in order: Nav → Hero → Trending Cards → What's Coming Up → How It Works → Footer.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS, v3 CSS variables (`--v3-bg: #03020a`, `--gold: #f0d080`), Prisma 7 for card queries, AlAdhan API for Hijri dates.

---

## Section 1 — Nav

Sticky top nav. Transparent background with blur on scroll.

- **Left:** ☽ logo + "NOOR CARDS" in gold letterspace
- **Centre:** Browse Cards · Occasions · Pricing links
- **Right:** "Get Started →" gold CTA button

---

## Section 2 — Hero (Lantern Night)

Full-viewport hero section with 6 floating lantern cards hanging from strings.

**Background layers (bottom to top):**
1. Fixed starfield (CSS radial-gradients, 20 stars)
2. Islamic geometric SVG tile pattern (opacity 0.025)
3. Aurora colour bands (deep green + purple radial gradients)
4. CSS crescent moon — top-right, gold circle with dark cutout overlay

**Copy (centred):**
- Bismillah in Arabic above headline (opacity 0.35)
- H1: "Send Blessings with **Noor**" — "Noor" in gold
- Subtext: "Beautiful animated Islamic ecards for every occasion"
- Two CTAs: "Browse Cards →" (gold gradient pill) + "See Pricing" (ghost)

**6 Lantern Cards — hanging from strings, floating animation:**

| # | Occasion | Arabic | Icon | BG Gradient | Float Duration |
|---|----------|--------|------|-------------|----------------|
| 1 | Eid al-Fitr | عيد مبارك | 🎁 | deep green | 6s |
| 2 | Ramadan | رمضان كريم | 📿 | deep purple | 7s |
| 3 | Nikah | مبروك | 💍 | deep amber | 8s (tallest, centre) |
| 4 | Hajj | — | 🕋 | deep navy | 6.5s |
| 5 | Eid al-Adha | عيد الأضحى | 🐑 | deep forest | 7.5s |
| 6 | New Born | — | 🕯️ | deep gold | 5.8s |

Each lantern: rounded card with string from top, icon watermark (opacity 0.2), Arabic text, occasion label, card name. Coloured glow underneath. CSS float animation with slight rotation per card. Hover lifts the card.

Clicking a lantern navigates to `/cards?occasion=[slug]`.

**New Born icon rationale:** 🕯️ — references Ayat al-Nur (24:35): "a lamp within a niche" — the newborn as a protected divine light. Most Quranically grounded symbol for new Islamic life.

---

## Section 3 — Trending This Season

4-card grid of featured card templates from database.

**Data source:** Hybrid query —
```typescript
// isFeatured cards first, fill remaining with most-sent
const featured = await prisma.cardTemplate.findMany({
  where: { isActive: true, isFeatured: true },
  take: 4,
  orderBy: { sentCards: { _count: 'desc' } }
});
const remaining = 4 - featured.length;
if (remaining > 0) {
  const popular = await prisma.cardTemplate.findMany({
    where: { isActive: true, isFeatured: false },
    take: remaining,
    orderBy: { sentCards: { _count: 'desc' } }
  });
  return [...featured, ...popular];
}
```

Each card: image preview area (180px), TRENDING/NEW badge (conditional), occasion label, card name. Hover lifts card. Click → `/customize/[cardId]`.

Header: "Trending This Season" + "View all cards →" link.

**Schema addition required:** Add `isFeatured Boolean @default(false)` to `CardTemplate` model.

---

## Section 4 — What's Coming Up

Three sub-components that drive repeat visits.

### 4a — Hero Countdown (Next Islamic Occasion)

Full-width card with live ticking countdown (days : hours : mins : secs) to the next upcoming Islamic occasion.

**Data:** Occasion dates fetched from **AlAdhan API** at build time (ISR, revalidate every 24 hours):
```
GET https://api.aladhan.com/v1/islamicCalendar/[year]/[month]
```

Displays: occasion name (EN + Arabic), description, icon, Hijri date string, "Browse [Occasion] Cards →" CTA. Countdown auto-picks the nearest future occasion.

**Fallback:** Hardcoded 2026–2027 dates if API unavailable.

### 4b — Upcoming Strip (next 3 occasions)

3-column grid showing the 3 closest upcoming occasions after the hero one.

Each tile: icon, name, "in X days", progress bar (proximity to occasion within 180-day window), card count. "SOON" badge if ≤ 14 days away. Click → `/cards?occasion=[slug]`.

### 4c — Card of the Day + Reminder Setter (side by side)

**Card of the Day (left):** One card template surfaced daily. Rotates at midnight UTC. Seeded by `(dayOfYear % totalCards)` so it's deterministic and consistent for all users. Shows preview, "Send This Card →" + "Save for Later" actions.

**Remind Me (right):** Lists upcoming 4 occasions with days remaining. "Set Occasion Reminders →" button — opens email capture modal, sends reminder email 7 days before each selected occasion via Resend.

---

## Section 5 — How It Works

3-step horizontal layout:

1. **Pick a Card** — "Browse 200+ animated Islamic ecards across 12 occasions"
2. **Personalise It** — "Type your message or let our AI craft a beautiful Islamic greeting"
3. **Send with Love** — "Send via email or WhatsApp. Schedule for the perfect moment"

Numbered (01/02/03), gold top border accent per card.

---

## Section 6 — Footer

3-column: logo left, copyright centre, Privacy · Terms · Contact links right.

---

## Data Requirements

| Need | Source | Notes |
|------|--------|-------|
| 4 featured cards | Prisma `CardTemplate` | Hybrid: `isFeatured` first, then most-sent |
| Upcoming occasion dates | AlAdhan API | ISR 24h, fallback to hardcoded dates |
| Card of the Day | Prisma `CardTemplate` | `dayOfYear % count` — no DB change needed |
| Card counts per occasion | Prisma `CardTemplate` grouped by occasion | Used in upcoming strip |

## Schema Changes Required

```prisma
model CardTemplate {
  // ... existing fields ...
  isFeatured  Boolean  @default(false)   // ADD THIS
}
```

Run `npm run db:generate` + `npm run db:migrate` after adding.

## Existing Bugs to Fix

- `HeroSpotlight` and `DiscoverGrid` use `status: "published"` — field missing from Prisma client. Both components are **removed** in this redesign so the bug is resolved by deletion.

## Files to Create / Modify

| File | Action |
|------|--------|
| `app/[locale]/page.tsx` | **Rewrite** — new section structure |
| `components/home/HeroSection.tsx` | **Rewrite** — Lantern Night hero |
| `components/home/TrendingCards.tsx` | **New** — replaces HeroSpotlight |
| `components/home/WhatsComingUp.tsx` | **New** — countdown + strip + daily |
| `components/home/CountdownTimer.tsx` | **New** — client component, live tick |
| `components/home/OccasionStrip.tsx` | **New** — 3-column upcoming strip |
| `components/home/CardOfTheDay.tsx` | **New** — daily card selector |
| `components/home/HowItWorks.tsx` | **Keep / minor tweak** |
| `lib/hijri/occasions.ts` | **New** — AlAdhan API fetch + fallback dates |
| `prisma/schema.prisma` | **Add** `isFeatured` to CardTemplate |
| `components/home/HeroSpotlight.tsx` | **Delete** |
| `components/home/DiscoverGrid.tsx` | **Delete** |
| `components/home/DiscoverGridClient.tsx` | **Delete** |
| `components/home/OccasionMedallions.tsx` | **Delete** |
