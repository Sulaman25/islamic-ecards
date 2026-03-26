# Noor Cards — Homepage v3 + Daily Card Generation Agent

**Date:** 2026-03-25
**Status:** Approved — ready for implementation

---

## Overview

Two sequenced workstreams:

1. **Homepage v3 prototype** — enhanced HTML prototype (`homepage-v3.html`) with all v2 features preserved and 8 new enhancements added. Ported to Next.js once the design is locked.
2. **Daily Card Generation Agent** — 5-agent pipeline built directly in the Next.js app. Generates 3 unique cards per day using the Hybrid output format (template + agent-written accent code), stores them in Prisma DB, and auto-publishes after a 30-minute override window.

**Build order:** Homepage v3 prototype first → Agent pipeline second → Visual port to Next.js last.

---

## Part 1 — Homepage v3 Prototype

### What's Preserved from v2

All of the following carry over unchanged:
- Aurora bands (CSS `auroradrift` keyframes, 5 bands)
- Starfield (160 twinkling stars via JS)
- Shooting stars (8 animated elements)
- Custom cursor glow (dot + ring + radial glow, `cursor: none`)
- Social proof ticker (doubled array, `ticker-scroll` keyframe)
- Animated counters (IntersectionObserver + ease-out quart via rAF)
- Typewriter hero subtitle (7 phrases, 48ms type / 28ms delete)
- Hijri date pill in nav (Kuwaiti algorithm, wrapped in try/catch)
- 3D card tilt on hover (mousemove `rotateX/Y` via perspective)
- Sticky glassmorphism nav (`backdrop-filter: blur(24px)`)
- Occasion medallion carousel
- Featured card row
- Popular cards grid with rank badges
- New This Week grid
- Tag cloud + CTA banner + footer

### New Enhancements

#### Above the Fold

**① Time-of-Day Islamic Greeting**
- Replaces the static eyebrow text in the hero
- Maps current hour to Islamic prayer period: Fajr (4–6am), morning (6–12pm), Dhuhr (12–2pm), Asr (2–5pm), Maghrib (5–8pm), Isha (8pm–4am)
- Displays: `"Assalamu Alaykum · Good Fajr"` as a pill badge with a pulsing teal dot
- Subtle background colour temperature shifts with time of day (warm gold at Fajr/Maghrib, cool blue at night)

**② Looping Card Reel (Video-Style Hero)**
- Replaces the static moon SVG above the hero title
- A horizontal strip of 5 card thumbnails (80×110px each) with the centre card slightly larger
- Animates via CSS: strip translates left by one card width every 2.5s, wraps seamlessly
- Each thumbnail shows a gradient + emoji — same data as the existing `featuredCards` array
- No video files — pure CSS/JS

**③ Parallax Depth Layers**
- `scroll` event listener (passive) updates CSS custom properties `--scroll-y`
- Three depth layers on scroll:
  - Stars canvas: `translateY(scrollY * 0.2)` — barely moves
  - Aurora bands: `translateY(scrollY * 0.35)` — slow drift
  - Hero content: `translateY(scrollY * 0.55)` — standard speed
- Gives a sense of depth without any extra DOM elements

**④ Ambient Nasheed Toggle**
- A small pill button in the hero: `🎵 Ambient Nasheed · Off`
- On click: uses Web Audio API to play a looping soft tone (generated via oscillator — no audio file needed for the prototype)
- In production: loops a short nasheed MP3 from `/public/audio/`
- Respects `prefers-reduced-motion` — button hidden if user has motion disabled
- State persists in `sessionStorage`

#### Bridge Element

**⑤ Live Occasion Countdown Banner**
- Sits between the ticker bar and the first card section
- Uses the existing `toHijri()` function to determine the next major Islamic occasion within 90 days
- Occasions checked in order: Ramadan, Eid ul Fitr, Eid ul Adha, Laylatul Qadr, Islamic New Year, Mawlid
- Displays: `"🌙 Ramadan begins in 23d 14h 07m"` with live seconds tick
- Tapping/clicking the banner scrolls to the relevant filtered cards

#### Below the Fold

**⑥ Mood Filter Tabs**
- Horizontal scrollable pill row above the card grids
- Moods: `All · Joyful · Peaceful · Reverent · Celebratory · Ramadan · Eid · Nikah`
- Each card in the data arrays gets a `mood` property
- Clicking a mood filters the masonry grid in real time (CSS `display: none` toggle, no re-render)
- Active pill highlighted in gold

**⑦ Masonry Grid**
- Replaces the existing "New This Week" uniform grid
- CSS `columns: 4` layout — browser handles varying heights naturally
- Cards get a randomised height class: `short` (80px visual), `medium` (110px), `tall` (160px) — set from data
- Hover: `transform: scale(1.03)` + gold glow box-shadow
- Hover also shows a subtle "Click to preview →" overlay

**⑧ 3D Flip Preview Modal**
- Triggered by clicking any card in the masonry grid or popular grid
- Modal overlay (`position: fixed, inset: 0, z-index: 200`)
- Inner container: `transform-style: preserve-3d`, `perspective: 1200px`
- **Front face:** the card's full animation plays (the gradient + emoji + any CSS animation from that card's data)
- **Back face:** card name, occasion tag, Send button (gold CTA), Customise button (ghost)
- Flip triggered by: clicking the card face, or a "Flip ↩" text hint at the bottom
- Close: click the backdrop or press Escape
- Flip animation: `rotateY(180deg)` over 0.6s, `transform-style: preserve-3d`

### File Output

`islamic-ecards/.superpowers/brainstorm/[session]/content/homepage-v3.html`

Single self-contained HTML file. No external dependencies. All JS inline. All CSS inline.

---

## Part 2 — Daily Card Generation Agent

### Architecture: 5-Agent Pipeline

Built inside the Next.js app. All agents are Claude API calls (`claude-sonnet-4-6`). Pipeline is orchestrated by a single Next.js API route: `POST /api/agents/daily-cards`.

#### Agent 1 — Brief Agent

**Input:** Current date, Prisma DB query results
**Process:**
1. Converts today's date to Hijri, finds all major Islamic occasions within the next 14 days
2. Queries `CardTemplate` table: counts cards per `occasion`, `mood`, and `animationStyle`
3. Identifies the 3 most underrepresented combinations (occasion × mood × animationStyle)
4. Picks a target count for today (always 3 cards)

**Output (JSON):**
```json
{
  "occasion": "Ramadan",
  "daysUntil": 18,
  "targets": [
    { "mood": "reverent", "shape": "hexagonal", "animationGap": "particle-burst" },
    { "mood": "peaceful", "shape": "circular", "animationGap": "calligraphy-write-on" },
    { "mood": "celebratory", "shape": "diamond", "animationGap": "liquid-warp" }
  ]
}
```

#### Agent 2 — Designer Agent

**Input:** One target spec from Brief Agent output
**Process:** Single Claude API call with a structured prompt. Given the occasion, mood, shape, and animation gap, the Designer picks:
- A template ID from the registered template library
- A Quran verse or Islamic phrase (with reference)
- A colour palette (2–3 hex values)
- A one-paragraph plain-language description of the accent animation

**Output (JSON):**
```json
{
  "templateId": "aurora-float",
  "verse": { "arabic": "إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ", "transliteration": "Inna anzalnahu fi laylat il-qadr", "reference": "Surah Al-Qadr 97:1", "translation": "Indeed, We sent it down on the Night of Decree." },
  "palette": ["#0d0d2b", "#4040c0", "#f0d080"],
  "shape": "hexagonal",
  "accentDescription": "Gold particle stars drift upward from the bottom, each fading out at different heights. A soft hexagonal clip path masks the card. The Arabic text traces in over 1.5s using SVG stroke-dashoffset animation."
}
```

#### Agent 3 — Motion Agent

**Input:** Designer output
**Process:** Claude API call instructed to write CSS + JS implementing the `accentDescription` exactly. Constrained to:
- Pure CSS keyframe animations and/or vanilla JS (no external libraries)
- A single `<style>` block (accent CSS)
- A single `<script>` block (accent JS, if needed)
- Must not conflict with base template CSS (all accent selectors prefixed `.accent-`)
- SVG elements for shape clip paths and calligraphy paths

**Output:**
```json
{
  "accentCss": "/* CSS string */",
  "accentJs": "/* JS string or null */",
  "shapeSvg": "/* SVG clip path string or null */"
}
```

#### Agent 4 — QA Agent

**Input:** Full card spec (Designer output + Motion output)
**Process:** Claude API call that evaluates 4 checks:
1. `cssValid` — attempts to parse the CSS string (checks for unmatched braces, invalid property names)
2. `jsValid` — checks JS for syntax errors (runs through a simple regex + bracket balance check)
3. `islamicAppropriate` — verifies verse reference is real, no imagery or text that conflicts with Islamic values
4. `noConflicts` — checks that all accent CSS selectors are prefixed `.accent-` and no base template selectors are overridden

**Output:**
```json
{ "pass": true, "checks": { "cssValid": true, "jsValid": true, "islamicAppropriate": true, "noConflicts": true } }
```

**On failure:** Returns `{ "pass": false, "failedCheck": "cssValid", "note": "Unmatched brace on line 14" }`. Orchestrator retries Motion Agent with the note appended (max 2 retries per card). After 2 failures, card is skipped and logged.

#### Agent 5 — Publisher Agent

**Input:** Approved card spec (all outputs combined)
**Process:**
1. Writes a new `CardTemplate` record to Prisma DB with `status: "pending_review"`
2. Records `publishAt: now + 30 minutes`
3. Sends an override notification (see Notification System below)
4. A separate cron job (`/api/cron/publish-pending`) runs every 5 minutes, finds all `pending_review` cards where `publishAt <= now` and `rejectedAt IS NULL`, and flips them to `status: "published"`

**New Prisma fields required:**
```prisma
model CardTemplate {
  // existing fields...
  status          String   @default("published")  // "pending_review" | "published" | "rejected"
  publishAt       DateTime?
  rejectedAt      DateTime?
  isAiGenerated   Boolean  @default(false)
  accentCss       String?
  accentJs        String?
  shapeSvg        String?
  mood            String?
  animationStyle  String?
  generatedAt     DateTime?
}
```

### Notification System

A simple email notification via Resend (already installed). When Publisher Agent creates a `pending_review` card:
- Sends an email to the admin address (from `process.env.ADMIN_EMAIL`) with:
  - Card name, occasion, mood
  - A preview link: `/admin/cards/preview/[cardId]`
  - A one-click reject link: `/api/agents/reject-card?id=[cardId]&token=[hmac]`
- The reject link uses an HMAC token (signed with `AUTH_SECRET`) so it works without being logged in

### Cron Scheduling

Uses Vercel Cron Jobs (defined in `vercel.json`):

```json
{
  "crons": [
    { "path": "/api/agents/daily-cards", "schedule": "0 4 * * *" },
    { "path": "/api/cron/publish-pending", "schedule": "*/5 * * * *" }
  ]
}
```

The `daily-cards` route runs at 04:00 UTC (configurable per timezone). The `publish-pending` route runs every 5 minutes.

For local development: a `npm run agents:run` script calls `POST /api/agents/daily-cards` directly.

### Template Library

The initial template library consists of 6 base templates. Each template defines:
- A base CSS class (`.tmpl-aurora-float`, etc.)
- Default gradient and layout
- Accepted shapes (not all shapes work with all templates)
- A `slot` for accent CSS/JS to attach to

| ID | Name | Base Style | Accepted Shapes |
|---|---|---|---|
| `aurora-float` | Aurora Float | Drifting colour bands | circle, hexagon, diamond |
| `starfield-drift` | Starfield Drift | Dark space, twinkling stars | circle, rectangle, diamond |
| `calligraphy-reveal` | Calligraphy Reveal | Dark bg, gold text focus | rectangle, arch |
| `gradient-pulse` | Gradient Pulse | Breathing gradient | circle, hexagon, blob |
| `glass-layer` | Glass Layer | Glassmorphism stack | rectangle, arch |
| `ink-wash` | Ink Wash | Painterly, organic edges | blob, circle |

### API Routes Required

| Route | Method | Purpose |
|---|---|---|
| `/api/agents/daily-cards` | POST | Orchestrates full 5-agent pipeline |
| `/api/agents/reject-card` | GET | HMAC-authenticated reject from email link |
| `/api/cron/publish-pending` | POST | Flips pending cards to published |
| `/admin/cards/preview/[id]` | GET | Admin preview page for pending cards |

---

## Implementation Sequence

### Phase 1 — Homepage v3 Prototype
Build `homepage-v3.html` starting from `homepage-v2.html`. Add all 8 enhancements.

### Phase 2 — Prisma Schema Update
Add new fields to `CardTemplate`. Run migration.

### Phase 3 — Template Library
Create the 6 base CSS templates as reusable classes in the Next.js app.

### Phase 4 — Agent Pipeline
Build `/api/agents/daily-cards` with all 5 agents in sequence. Build reject endpoint and publish-pending cron.

### Phase 5 — Notification + Admin Preview
Wire up Resend notification email and `/admin/cards/preview/[id]` page.

### Phase 6 — Visual Port
Port homepage-v3 visual code into the real Next.js `app/page.tsx` and component files.

---

## Key Constraints

- All Claude API calls use `claude-sonnet-4-6` (already configured in `lib/ai/claude.ts`)
- Motion Agent output must be sandboxed — accent code runs inside an iframe or scoped container when previewed, not injected raw into the admin page DOM
- The `publish-pending` cron must be idempotent — safe to run multiple times
- Rate limiting on `/api/agents/daily-cards` — max 1 run per 23 hours (prevents double-runs)
- Verse references must be validated against a static list of Surah numbers/ayah counts before QA passes them
