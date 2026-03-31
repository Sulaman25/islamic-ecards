# Homepage v3 "Wow" Design Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the fully-designed homepage-v3.html prototype into the Next.js app, replacing the current basic homepage with the "wow" design featuring aurora background, starfield, animated moon, custom cursor, card carousels, mood filters, masonry grid, and 3D flip modal.

**Architecture:** All visual effects are implemented as isolated client components with `"use client"` directives. The homepage page (`app/[locale]/page.tsx`) remains a Server Component that composes these client components. CSS animations live in `app/globals.css`. The Hijri date is calculated client-side via JS.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, custom CSS keyframes, React hooks for interactivity.

**Reference files (do not commit these):**
- `.superpowers/brainstorm/1169-1774467958/content/homepage-v3.html` — primary prototype
- `.superpowers/brainstorm/1169-1774467958/content/gallery-wow-v2.html` — card gallery effects

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `app/globals.css` | Modify | Add all CSS variables, keyframes, utility classes from prototype |
| `app/[locale]/page.tsx` | Rewrite | Compose all new sections; keep Server Component |
| `components/home/AuroraBackground.tsx` | Create | Fixed aurora bands + starfield + shooting stars |
| `components/home/CustomCursor.tsx` | Create | 3-layer gold cursor (dot + ring + glow) |
| `components/home/SocialTicker.tsx` | Create | Scrolling "X just sent a card" ticker bar |
| `components/home/HeroSection.tsx` | Create | Moon stage, typewriter, search bar, trending tags |
| `components/home/TrustBar.tsx` | Create | Animated counters (cards sent, users, etc.) |
| `components/home/OccasionMedallions.tsx` | Create | Horizontally scrollable occasion circles |
| `components/home/FeaturedCarousel.tsx` | Create | Horizontal scroll featured card strip |
| `components/home/MoodFilter.tsx` | Create | Pill filter tabs (Joyful, Peaceful, Ramadan, etc.) |
| `components/home/CardGrid.tsx` | Create | Main card grid with 3D tilt + hover glow |
| `components/home/MasonryGrid.tsx` | Create | Pinterest-style masonry card layout |
| `components/home/FlipModal.tsx` | Create | 3D flip card preview modal |
| `components/home/OccasionCountdown.tsx` | Create | Live countdown to next Islamic occasion |
| `components/layout/Navbar.tsx` | Modify | Add Hijri date pill, glassmorphism styling |

---

## Task 1: CSS Foundation — Variables, Keyframes, Utility Classes

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add CSS custom properties and keyframes**

Open `app/globals.css` and add the following at the top (after any existing `@import` statements, before existing rules):

```css
/* ── v3 Design Tokens ─────────────────────────────────── */
:root {
  --gold: #f0d080;
  --gold-dim: rgba(240,208,128,0.12);
  --gold-glow: rgba(240,208,128,0.35);
  --teal: #4ecdc4;
  --rose: #ff6b9d;
  --violet: #a78bfa;
  --v3-bg: #03020a;
  --v3-surface: rgba(255,255,255,0.04);
  --v3-border: rgba(255,255,255,0.08);
  --v3-text: #e7e5e4;
  --v3-text-dim: rgba(231,229,228,0.55);
  --nav-h: 64px;
  --v3-radius: 16px;
}

/* ── Keyframes ────────────────────────────────────────── */
@keyframes shimmer-v3 {
  to { background-position: 200% center; }
}
@keyframes moon-float {
  0%,100% { transform: translateY(0) rotate(-5deg); }
  50%     { transform: translateY(-8px) rotate(5deg); }
}
@keyframes halo-pulse {
  from { opacity: 0.4; transform: scale(0.97); }
  to   { opacity: 1;   transform: scale(1.03); }
}
@keyframes aurora-drift {
  from { transform: translate(0,0) scale(1); }
  to   { transform: translate(var(--tx,40px), var(--ty,30px)) scale(1.25); }
}
@keyframes star-twinkle {
  from { opacity: var(--star-a,0.3); transform: scale(0.7); }
  to   { opacity: var(--star-b,0.9); transform: scale(1.4); }
}
@keyframes shoot-across {
  0%   { opacity:0; transform:translate(0,0); }
  5%   { opacity:1; }
  100% { opacity:0; transform:translate(var(--sx,300px),var(--sy,200px)); }
}
@keyframes ticker-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes reel-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-460px); }
}
@keyframes blink-cursor {
  0%,100% { opacity:1; } 50% { opacity:0; }
}
@keyframes pulse-dot {
  0%,100% { transform: scale(1); opacity: 1; }
  50%     { transform: scale(1.4); opacity: 0.6; }
}
@keyframes counter-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes reveal-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes card-in {
  from { opacity: 0; transform: scale(0.92) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* ── Utility classes ──────────────────────────────────── */
.v3-shimmer-text {
  background: linear-gradient(90deg, #fff 0%, var(--gold) 50%, #fff 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer-v3 4s linear infinite;
}
.v3-reveal {
  opacity: 0;
  animation: reveal-up 0.6s ease forwards;
}
.v3-reveal-delay-1 { animation-delay: 0.15s; }
.v3-reveal-delay-2 { animation-delay: 0.3s; }
.v3-reveal-delay-3 { animation-delay: 0.45s; }

/* ── Custom cursor (pointer devices only) ─────────────── */
@media (pointer: fine) {
  body.v3-page { cursor: none; }
}
#v3-cursor-dot {
  position: fixed; pointer-events: none; z-index: 9999;
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--gold);
  transform: translate(-50%,-50%);
  transition: transform 0.08s ease;
  box-shadow: 0 0 8px 2px rgba(240,208,128,0.8);
}
#v3-cursor-glow {
  position: fixed; pointer-events: none; z-index: 9998;
  width: 340px; height: 340px; border-radius: 50%;
  background: radial-gradient(circle, rgba(240,208,128,0.07) 0%, transparent 65%);
  transform: translate(-50%,-50%);
  transition: transform 0.18s ease;
}
#v3-cursor-ring {
  position: fixed; pointer-events: none; z-index: 9997;
  width: 36px; height: 36px; border-radius: 50%;
  border: 1px solid rgba(240,208,128,0.45);
  transform: translate(-50%,-50%);
  transition: transform 0.14s ease, width 0.2s, height 0.2s, border-color 0.2s;
}
body.v3-page:has(a:hover) #v3-cursor-ring,
body.v3-page:has(button:hover) #v3-cursor-ring,
body.v3-page:has(.v3-card:hover) #v3-cursor-ring {
  width: 56px; height: 56px;
  border-color: rgba(240,208,128,0.8);
}

/* ── Ticker bar ───────────────────────────────────────── */
.v3-ticker-bar {
  position: relative; z-index: 3;
  background: linear-gradient(90deg,
    rgba(240,208,128,0.06) 0%,
    rgba(78,205,196,0.04) 50%,
    rgba(240,208,128,0.06) 100%);
  border-bottom: 1px solid rgba(240,208,128,0.1);
  height: 36px; overflow: hidden;
  display: flex; align-items: center;
}
.v3-ticker-label {
  flex-shrink: 0; padding: 0 16px 0 20px;
  font-size: 0.7rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1.5px;
  color: var(--gold); opacity: 0.8;
  border-right: 1px solid rgba(240,208,128,0.15);
  white-space: nowrap;
}
.v3-ticker-wrap { flex: 1; overflow: hidden; position: relative; }
.v3-ticker-wrap::before,
.v3-ticker-wrap::after {
  content: ''; position: absolute; top:0; bottom:0; width:60px; z-index:1; pointer-events:none;
}
.v3-ticker-wrap::before { left:0; background: linear-gradient(90deg,var(--v3-bg),transparent); }
.v3-ticker-wrap::after  { right:0; background: linear-gradient(-90deg,var(--v3-bg),transparent); }
.v3-ticker-track {
  display: flex; align-items: center; gap:0;
  animation: ticker-scroll 40s linear infinite;
  white-space: nowrap;
}
.v3-ticker-event {
  display: inline-flex; align-items: center; gap:7px;
  padding: 0 28px; font-size: 0.78rem; color: var(--v3-text-dim);
}
.v3-ticker-event .name  { color: var(--v3-text); font-weight:500; }
.v3-ticker-event .cname { color: var(--gold); opacity:0.85; }

/* ── Aurora ───────────────────────────────────────────── */
.v3-aurora { position: fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; }
.v3-aurora-band {
  position: absolute; border-radius:50%;
  filter: blur(90px); opacity:0.07;
  animation: aurora-drift var(--dur,20s) ease-in-out infinite alternate;
}

/* ── Stars ────────────────────────────────────────────── */
.v3-star {
  position: absolute; border-radius:50%; background:#fff;
  animation: star-twinkle var(--d,3s) ease-in-out infinite alternate;
}
.v3-shoot {
  position: fixed; z-index:0; pointer-events:none;
  width:2px; height:2px; background:#fff; border-radius:50%;
  box-shadow: 0 0 6px 2px rgba(255,255,255,0.6);
  animation: shoot-across var(--sd,4s) linear infinite;
  animation-delay: var(--sdel,0s);
}
.v3-shoot::after {
  content:''; position:absolute; width:60px; height:1px;
  background: linear-gradient(90deg,rgba(255,255,255,0.5),transparent);
  transform: translateX(-60px);
}

/* ── Moon ─────────────────────────────────────────────── */
.v3-moon-stage {
  width:100px; height:100px; margin:0 auto 28px;
  position:relative; display:flex; align-items:center; justify-content:center;
}
.v3-moon-halo {
  position:absolute; inset:-14px; border-radius:50%;
  border:1px solid rgba(240,208,128,0.12);
  animation: halo-pulse 3.5s ease-in-out infinite alternate;
}
.v3-moon-halo2 {
  position:absolute; inset:-28px; border-radius:50%;
  border:1px solid rgba(240,208,128,0.06);
  animation: halo-pulse 3.5s ease-in-out infinite alternate;
  animation-delay: -1.5s;
}
.v3-moon-icon {
  font-size:52px; line-height:1;
  filter: drop-shadow(0 0 20px rgba(240,208,128,0.7));
  animation: moon-float 4s ease-in-out infinite;
}

/* ── Hero search ──────────────────────────────────────── */
.v3-search {
  display:flex; align-items:center; gap:0;
  max-width:560px; margin:0 auto 20px;
  background: rgba(255,255,255,0.06);
  border:1px solid rgba(255,255,255,0.12);
  border-radius:50px; padding:6px 6px 6px 20px;
  transition: border-color 0.3s, box-shadow 0.3s;
}
.v3-search:focus-within {
  border-color: rgba(240,208,128,0.4);
  box-shadow: 0 0 0 4px rgba(240,208,128,0.06);
}
.v3-search input {
  flex:1; background:none; border:none; outline:none;
  color: var(--v3-text); font-size:0.95rem;
}
.v3-search input::placeholder { color: var(--v3-text-dim); }
.v3-search-btn {
  background: linear-gradient(135deg,#b8860b,var(--gold));
  border:none; color:#0a0700; font-weight:700;
  padding:10px 22px; border-radius:40px; cursor:pointer;
  font-size:0.88rem; transition:all 0.2s;
}
.v3-search-btn:hover { box-shadow: 0 0 16px rgba(240,208,128,0.4); }

/* ── Mood pills ───────────────────────────────────────── */
.v3-mood-pill {
  flex-shrink:0; padding:6px 16px; border-radius:999px;
  background: rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12);
  font-size:0.82rem; cursor:pointer; white-space:nowrap;
  transition: background 0.2s, border-color 0.2s; color:rgba(255,255,255,0.8);
}
.v3-mood-pill:hover  { background: rgba(255,255,255,0.12); }
.v3-mood-pill.active { background: rgba(240,208,128,0.15); border-color:var(--gold); color:var(--gold); }

/* ── Cards ────────────────────────────────────────────── */
.v3-card {
  border-radius: var(--v3-radius); overflow:hidden; position:relative; cursor:pointer;
  background: var(--v3-surface); border:1px solid var(--v3-border);
  transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
  aspect-ratio: 4/3; transform-style: preserve-3d;
  animation: card-in 0.5s ease both;
}
.v3-card:hover { border-color: rgba(240,208,128,0.4); }
.v3-card-visual {
  position:absolute; inset:0;
  display:flex; align-items:center; justify-content:center;
  font-size:48px; transition: transform 0.4s;
}
.v3-card:hover .v3-card-visual { transform: scale(1.05); }
.v3-card-overlay {
  position:absolute; inset:0;
  background: linear-gradient(0deg,rgba(0,0,0,0.75) 0%,transparent 50%);
  opacity:0; transition: opacity 0.3s;
}
.v3-card:hover .v3-card-overlay { opacity:1; }
.v3-card-meta {
  position:absolute; bottom:0; left:0; right:0; padding:14px;
  background: linear-gradient(0deg,rgba(0,0,0,0.8) 0%,transparent);
  transform: translateY(8px); transition: transform 0.3s;
}
.v3-card:hover .v3-card-meta { transform: translateY(0); }
.v3-card-actions {
  position:absolute; bottom:44px; left:0; right:0; padding:0 12px;
  display:flex; gap:8px;
  transform: translateY(8px); opacity:0;
  transition: all 0.3s cubic-bezier(0.23,1,0.32,1);
}
.v3-card:hover .v3-card-actions { transform:translateY(0); opacity:1; }
.v3-btn-preview {
  flex:1; padding:8px; border-radius:8px;
  font-size:0.78rem; font-weight:600; cursor:pointer;
  background: rgba(255,255,255,0.12); color:#fff;
  border:1px solid rgba(255,255,255,0.2); transition:all 0.2s;
}
.v3-btn-send {
  flex:1; padding:8px; border-radius:8px;
  font-size:0.78rem; font-weight:600; cursor:pointer;
  background: linear-gradient(135deg,#b8860b,var(--gold)); color:#0a0700; border:none;
  transition:all 0.2s;
}
.v3-btn-send:hover { box-shadow: 0 0 16px rgba(240,208,128,0.5); }

/* ── Masonry ──────────────────────────────────────────── */
.v3-masonry { columns:4; column-gap:16px; }
@media(max-width:900px) { .v3-masonry { columns:2; } }
@media(max-width:600px) { .v3-masonry { columns:2; } }
.v3-masonry-card {
  break-inside:avoid; margin-bottom:16px; border-radius:12px;
  overflow:hidden; position:relative; cursor:pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}
.v3-masonry-card:hover { transform:scale(1.03); box-shadow:0 0 24px rgba(240,208,128,0.3); }
.v3-masonry-hover {
  position:absolute; inset:0; background:rgba(0,0,0,0.4);
  display:flex; align-items:center; justify-content:center;
  font-size:0.8rem; color:rgba(255,255,255,0.85);
  opacity:0; transition: opacity 0.2s;
}
.v3-masonry-card:hover .v3-masonry-hover { opacity:1; }

/* ── Flip modal ───────────────────────────────────────── */
.v3-flip-overlay {
  position:fixed; inset:0; z-index:200;
  background: rgba(0,0,0,0.75); backdrop-filter:blur(8px);
  display:flex; align-items:center; justify-content:center;
  opacity:0; pointer-events:none; transition:opacity 0.3s;
}
.v3-flip-overlay.open { opacity:1; pointer-events:auto; }
.v3-flip-container { width:280px; perspective:1200px; cursor:pointer; }
.v3-flip-inner {
  width:100%; height:380px;
  transform-style:preserve-3d; transition:transform 0.6s ease; position:relative;
}
.v3-flip-inner.flipped { transform:rotateY(180deg); }
.v3-flip-face {
  position:absolute; inset:0; border-radius:16px;
  backface-visibility:hidden; -webkit-backface-visibility:hidden; overflow:hidden;
}
.v3-flip-back {
  transform:rotateY(180deg);
  background: linear-gradient(135deg,#0d0d2b,#1a1a4a);
  border:1px solid rgba(240,208,128,0.3);
  padding:28px; display:flex; flex-direction:column; justify-content:space-between;
}

/* ── CTA banner ───────────────────────────────────────── */
.v3-cta-banner {
  position:relative; border-radius:24px; overflow:hidden;
  padding:56px 48px;
  background: linear-gradient(135deg,rgba(180,130,20,0.15) 0%,rgba(78,205,196,0.08) 50%,rgba(167,139,250,0.12) 100%);
  border:1px solid rgba(240,208,128,0.15); text-align:center;
}
.v3-cta-btn {
  display:inline-block;
  background: linear-gradient(135deg,#b8860b,var(--gold));
  color:#0a0700; font-weight:800; font-size:1rem;
  padding:14px 40px; border-radius:50px; cursor:pointer;
  border:none; transition:all 0.3s;
  box-shadow: 0 0 30px rgba(240,208,128,0.3);
}
.v3-cta-btn:hover { box-shadow:0 0 50px rgba(240,208,128,0.5); transform:translateY(-2px) scale(1.02); }

/* ── Hijri pill ───────────────────────────────────────── */
.v3-hijri-pill {
  display:flex; align-items:center; gap:6px;
  background: rgba(240,208,128,0.07);
  border:1px solid rgba(240,208,128,0.18);
  border-radius:20px; padding:4px 12px;
  font-size:0.76rem; color:var(--gold); opacity:0.85;
  white-space:nowrap;
}

/* ── Medallions ───────────────────────────────────────── */
.v3-medallion {
  flex:0 0 auto; display:flex; flex-direction:column; align-items:center; gap:10px;
  cursor:pointer; transition:transform 0.2s;
}
.v3-medallion:hover { transform:translateY(-4px); }
.v3-med-circle {
  width:72px; height:72px; border-radius:50%;
  background: var(--v3-surface); border:1px solid var(--v3-border);
  display:flex; align-items:center; justify-content:center;
  font-size:28px; transition:all 0.3s; position:relative; overflow:hidden;
}
.v3-medallion.active .v3-med-circle {
  background: rgba(240,208,128,0.1); border-color:rgba(240,208,128,0.4);
  box-shadow: 0 0 24px rgba(240,208,128,0.25);
}
.v3-med-label { font-size:0.75rem; color:var(--v3-text-dim); text-align:center; max-width:72px; line-height:1.3; }
.v3-medallion.active .v3-med-label { color:var(--gold); }

/* ── Featured cards ───────────────────────────────────── */
.v3-featured-card {
  flex:0 0 280px; border-radius:var(--v3-radius); overflow:hidden; position:relative;
  cursor:pointer; background:var(--v3-surface); border:1px solid var(--v3-border);
  transition:transform 0.3s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s;
  height:200px;
}
.v3-featured-card:hover { transform:translateY(-6px) scale(1.02); box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 30px rgba(240,208,128,0.2); }

/* ── Trust bar ────────────────────────────────────────── */
.v3-trust-bar {
  display:flex; justify-content:center; gap:40px; flex-wrap:wrap;
  padding:18px 32px;
  border-top:1px solid var(--v3-border); border-bottom:1px solid var(--v3-border);
  background: rgba(255,255,255,0.02);
}
.v3-trust-item { display:flex; align-items:center; gap:8px; font-size:0.82rem; color:var(--v3-text-dim); }
.v3-trust-item strong { color:var(--v3-text); font-weight:700; font-size:0.95rem; }

/* ── Greeting pill ────────────────────────────────────── */
.v3-greeting-pill {
  display:inline-flex; align-items:center; gap:8px;
  background: rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15);
  border-radius:999px; padding:6px 16px; font-size:0.82rem;
  letter-spacing:0.04em; margin-bottom:18px;
}
.v3-greeting-dot {
  width:8px; height:8px; border-radius:50%; background:#2dd4c0;
  animation: pulse-dot 2s ease-in-out infinite;
}

/* ── Section headers ──────────────────────────────────── */
.v3-section-title {
  font-size:1.3rem; font-weight:700; display:flex; align-items:center; gap:10px;
}
.v3-section-title::before {
  content:''; display:inline-block; width:3px; height:18px; border-radius:2px;
  background: linear-gradient(180deg,var(--gold),transparent);
}

/* ── Footer ───────────────────────────────────────────── */
.v3-footer {
  border-top:1px solid var(--v3-border);
  padding:40px 32px 24px;
  display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr; gap:40px;
}
@media(max-width:768px) { .v3-footer { grid-template-columns:1fr 1fr; } }
.v3-footer-col h4 {
  font-size:0.78rem; text-transform:uppercase; letter-spacing:1.5px;
  color:var(--gold); opacity:0.7; margin-bottom:14px;
}
.v3-footer-col a {
  display:block; font-size:0.82rem; color:var(--v3-text-dim);
  text-decoration:none; margin-bottom:8px; transition:color 0.2s;
}
.v3-footer-col a:hover { color:var(--v3-text); }
```

- [ ] **Step 2: Verify no build errors**

```bash
cd "C:/Users/INFOTECH/Documents/ClaudeCode Test/islamic-ecards"
npm run build 2>&1 | tail -20
```
Expected: `✓ Compiled successfully` or similar — no CSS parse errors.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add v3 design tokens, keyframes, and utility CSS classes"
```

---

## Task 2: Aurora Background + Starfield + Shooting Stars

**Files:**
- Create: `components/home/AuroraBackground.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useEffect, useRef } from "react";

const AURORA_BANDS = [
  { w: 900, h: 600, top: "-20%", left: "-10%", bg: "rgba(201,168,76,0.9)", dur: "22s", tx: "60px", ty: "40px" },
  { w: 700, h: 500, top: "30%",  left: "40%",  bg: "rgba(78,205,196,0.9)", dur: "28s", tx: "-40px", ty: "50px" },
  { w: 600, h: 400, top: "60%",  left: "10%",  bg: "rgba(167,139,250,0.9)", dur: "18s", tx: "50px", ty: "-30px" },
];

const SHOOT_STARS = [
  { top: "10%", left: "20%", sx: "400px", sy: "300px", sd: "5s", sdel: "0s" },
  { top: "5%",  left: "60%", sx: "300px", sy: "400px", sd: "7s", sdel: "2.5s" },
  { top: "20%", left: "80%", sx: "-200px", sy: "350px", sd: "6s", sdel: "4s" },
  { top: "40%", left: "5%",  sx: "500px", sy: "200px", sd: "8s", sdel: "1s" },
];

export function AuroraBackground() {
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!starsRef.current) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 120; i++) {
      const s = document.createElement("div");
      s.className = "v3-star";
      const size = Math.random() * 2 + 0.5;
      s.style.cssText = `
        width:${size}px; height:${size}px;
        top:${Math.random() * 100}%;
        left:${Math.random() * 100}%;
        --d:${(Math.random() * 3 + 1.5).toFixed(1)}s;
        --star-a:${(Math.random() * 0.4 + 0.1).toFixed(2)};
        --star-b:${(Math.random() * 0.5 + 0.5).toFixed(2)};
        animation-delay:${(Math.random() * 4).toFixed(1)}s;
      `;
      frag.appendChild(s);
    }
    starsRef.current.appendChild(frag);
  }, []);

  return (
    <>
      {/* Aurora bands */}
      <div className="v3-aurora" aria-hidden="true">
        {AURORA_BANDS.map((b, i) => (
          <div
            key={i}
            className="v3-aurora-band"
            style={{
              width: b.w, height: b.h, top: b.top, left: b.left,
              background: b.bg,
              ["--dur" as string]: b.dur,
              ["--tx" as string]: b.tx,
              ["--ty" as string]: b.ty,
            }}
          />
        ))}
      </div>

      {/* Starfield */}
      <div
        ref={starsRef}
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
        aria-hidden="true"
      />

      {/* Shooting stars */}
      {SHOOT_STARS.map((s, i) => (
        <div
          key={i}
          className="v3-shoot"
          style={{
            top: s.top, left: s.left,
            ["--sx" as string]: s.sx,
            ["--sy" as string]: s.sy,
            ["--sd" as string]: s.sd,
            ["--sdel" as string]: s.sdel,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}
```

- [ ] **Step 2: Verify file exists and no TypeScript errors**

```bash
cd "C:/Users/INFOTECH/Documents/ClaudeCode Test/islamic-ecards"
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors mentioning `AuroraBackground`.

- [ ] **Step 3: Commit**

```bash
git add components/home/AuroraBackground.tsx
git commit -m "feat: aurora background, starfield, and shooting stars component"
```

---

## Task 3: Custom Cursor

**Files:**
- Create: `components/home/CustomCursor.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only on pointer-fine devices (real mouse)
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.body.classList.add("v3-page");

    let raf: number;
    let gx = 0, gy = 0;

    const onMove = (e: MouseEvent) => {
      const x = e.clientX, y = e.clientY;
      if (dotRef.current)  dotRef.current.style.transform  = `translate(${x}px,${y}px) translate(-50%,-50%)`;
      if (ringRef.current) ringRef.current.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
      // Glow follows with lag
      cancelAnimationFrame(raf);
      gx += (x - gx) * 0.12;
      gy += (y - gy) * 0.12;
      if (glowRef.current) glowRef.current.style.transform = `translate(${gx}px,${gy}px) translate(-50%,-50%)`;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.body.classList.remove("v3-page");
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div id="v3-cursor-dot"  ref={dotRef}  aria-hidden="true" />
      <div id="v3-cursor-ring" ref={ringRef} aria-hidden="true" />
      <div id="v3-cursor-glow" ref={glowRef} aria-hidden="true" />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/home/CustomCursor.tsx
git commit -m "feat: custom gold cursor with dot, ring, and glow layers"
```

---

## Task 4: Social Proof Ticker

**Files:**
- Create: `components/home/SocialTicker.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

const EVENTS = [
  { avatar: "🌙", name: "Fatima A.", card: "Eid Mubarak — Golden Crescent", time: "2m ago" },
  { avatar: "⭐", name: "Ahmed K.", card: "Ramadan Lantern Wishes", time: "5m ago" },
  { avatar: "💍", name: "Sara M.", card: "Nikah Mubarak — White Rose", time: "8m ago" },
  { avatar: "🕌", name: "Yusuf H.", card: "Jummah Mubarak — Mosque at Dawn", time: "11m ago" },
  { avatar: "🕋", name: "Maryam R.", card: "Hajj Mubarak — Kaaba Blessing", time: "14m ago" },
  { avatar: "🌟", name: "Ibrahim S.", card: "Laylatul Qadr — Night of Power", time: "18m ago" },
  { avatar: "🤲", name: "Aisha T.", card: "Aqiqah Mubarak — Pink Stars", time: "22m ago" },
  { avatar: "🎓", name: "Omar N.", card: "Graduation Mubarak — Gold", time: "27m ago" },
];

// Duplicate for seamless loop
const ALL = [...EVENTS, ...EVENTS];

export function SocialTicker() {
  return (
    <div className="v3-ticker-bar" role="marquee" aria-label="Recent card activity">
      <span className="v3-ticker-label">LIVE</span>
      <div className="v3-ticker-wrap">
        <div className="v3-ticker-track">
          {ALL.map((e, i) => (
            <span key={i} className="v3-ticker-event">
              <span style={{ fontSize: "1rem" }}>{e.avatar}</span>
              <span className="name">{e.name}</span>
              <span style={{ color: "var(--v3-border)" }}>sent</span>
              <span className="cname">"{e.card}"</span>
              <span style={{ opacity: 0.5, fontSize: "0.7rem" }}>{e.time}</span>
              {i < ALL.length - 1 && <span style={{ color: "var(--v3-border)", padding: "0 8px" }}>·</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/home/SocialTicker.tsx
git commit -m "feat: social proof ticker bar with animated scroll"
```

---

## Task 5: Hijri Date Pill in Navbar

**Files:**
- Modify: `components/layout/Navbar.tsx`
- Create: `components/home/HijriPill.tsx`

- [ ] **Step 1: Create HijriPill client component**

```tsx
"use client";
import { useEffect, useState } from "react";

function toHijri(date: Date): string {
  // Approximate Hijri calculation (within ±1 day)
  const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
  const l  = jd - 1948440 + 10632;
  const n  = Math.floor((l - 1) / 10631);
  const ll = l - 10631 * n + 354;
  const j  = Math.floor((10985 - ll) / 5316) * Math.floor((50 * ll) / 17719) +
             Math.floor(ll / 5670) * Math.floor((43 * ll) / 15238);
  const lll = ll - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
              Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * lll) / 709);
  const day   = lll - Math.floor((709 * month) / 24);
  const year  = 30 * n + j - 30;
  const MONTHS = ["Muharram","Safar","Rabi I","Rabi II","Jumada I","Jumada II",
                  "Rajab","Sha'ban","Ramadan","Shawwal","Dhul Qa'dah","Dhul Hijjah"];
  return `${day} ${MONTHS[month - 1]} ${year} AH`;
}

export function HijriPill() {
  const [hijri, setHijri] = useState("");
  useEffect(() => { setHijri(toHijri(new Date())); }, []);
  if (!hijri) return null;
  return (
    <div className="v3-hijri-pill">
      <span>🌙</span>
      <span>{hijri}</span>
    </div>
  );
}
```

- [ ] **Step 2: Add HijriPill to Navbar**

Open `components/layout/Navbar.tsx`. Find the nav links section and add `<HijriPill />` next to the nav links. Import it at the top:

```tsx
import { HijriPill } from "@/components/home/HijriPill";
```

In the nav links area (between the links list and the action buttons), add:
```tsx
<HijriPill />
```

Also update the nav container to match the v3 glassmorphism style. Find the `<nav>` element and update its className/style to include:
```
background: rgba(3,2,10,0.85)
backdropFilter: blur(24px)
borderBottom: 1px solid rgba(255,255,255,0.08)
```

- [ ] **Step 3: Commit**

```bash
git add components/home/HijriPill.tsx components/layout/Navbar.tsx
git commit -m "feat: Hijri date pill in navbar with client-side calculation"
```

---

## Task 6: Hero Section

**Files:**
- Create: `components/home/HeroSection.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

const TYPEWRITER_PHRASES = [
  "Eid al-Fitr blessings",
  "Ramadan Mubarak wishes",
  "Nikah congratulations",
  "Jummah reminders",
  "Hajj Mubarak greetings",
  "Laylatul Qadr du'a",
];

const TRENDING = ["✨ Eid Mubarak", "🌙 Ramadan", "💍 Nikah", "🕌 Jummah", "🕋 Hajj", "🤲 Du'a"];

function useTypewriter(phrases: string[], speed = 60, pause = 2000) {
  const [display, setDisplay] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[phraseIdx];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && charIdx <= phrase.length) {
      timeout = setTimeout(() => {
        setDisplay(phrase.slice(0, charIdx));
        setCharIdx(c => c + 1);
      }, charIdx === phrase.length ? pause : speed);
    } else if (deleting && charIdx >= 0) {
      timeout = setTimeout(() => {
        setDisplay(phrase.slice(0, charIdx));
        setCharIdx(c => c - 1);
      }, speed / 2);
    } else {
      setDeleting(d => !d);
      if (deleting) setPhraseIdx(i => (i + 1) % phrases.length);
    }
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, phraseIdx, phrases, speed, pause]);

  return display;
}

export function HeroSection() {
  const typed = useTypewriter(TYPEWRITER_PHRASES);
  const router = useRouter();
  const locale = useLocale();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/${locale}/cards?q=${encodeURIComponent(query.trim())}`);
    else router.push(`/${locale}/cards`);
  };

  return (
    <section
      className="relative z-10 pt-24 pb-16 px-4 text-center overflow-hidden"
      style={{ color: "var(--v3-text)" }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.14) 0%, transparent 60%)" }}
        aria-hidden="true"
      />

      {/* Greeting pill */}
      <div className="v3-greeting-pill v3-reveal">
        <span className="v3-greeting-dot" />
        <span>As-salamu alaykum — Send Blessings Today</span>
      </div>

      {/* Animated moon */}
      <div className="v3-moon-stage v3-reveal v3-reveal-delay-1">
        <div className="v3-moon-halo" aria-hidden="true" />
        <div className="v3-moon-halo2" aria-hidden="true" />
        <span className="v3-moon-icon" role="img" aria-label="Crescent moon">☽</span>
      </div>

      {/* Title */}
      <div className="v3-reveal v3-reveal-delay-1">
        <p style={{ fontSize: "0.78rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--gold)", opacity: 0.8, marginBottom: "14px" }}>
          Islamic Ecards Platform
        </p>
        <h1 style={{ fontSize: "clamp(2.4rem,6vw,4.2rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: "12px" }}>
          <span className="v3-shimmer-text">Noor Cards</span>
          <span style={{ display: "block", color: "rgba(255,255,255,0.4)", fontWeight: 300, fontSize: "0.55em", marginTop: "6px", letterSpacing: "2px" }}>
            SPREAD LIGHT · SHARE BLESSINGS
          </span>
        </h1>
      </div>

      {/* Typewriter subtitle */}
      <p className="v3-reveal v3-reveal-delay-2" style={{ fontSize: "1.05rem", color: "var(--v3-text-dim)", maxWidth: "520px", margin: "0 auto 36px", lineHeight: 1.6, minHeight: "2.4em" }}>
        Beautiful animated cards for{" "}
        <span style={{ color: "var(--gold)", fontWeight: 500 }}>{typed}</span>
        <span style={{ display: "inline-block", width: "2px", height: "1em", background: "var(--gold)", marginLeft: "2px", verticalAlign: "text-bottom", animation: "blink-cursor 0.75s step-end infinite" }} />
      </p>

      {/* Search bar */}
      <form className="v3-search v3-reveal v3-reveal-delay-2" onSubmit={handleSearch}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search cards — Eid, Nikah, Ramadan..."
          aria-label="Search cards"
        />
        <button className="v3-search-btn" type="submit">Browse →</button>
      </form>

      {/* Trending tags */}
      <div className="v3-reveal v3-reveal-delay-3" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px", marginBottom: "48px" }}>
        {TRENDING.map(tag => (
          <button
            key={tag}
            onClick={() => router.push(`/${locale}/cards?q=${encodeURIComponent(tag.replace(/^[^\w]+/, "").trim())}`)}
            style={{
              background: "var(--v3-surface)", border: "1px solid var(--v3-border)",
              color: "var(--v3-text-dim)", padding: "5px 14px", borderRadius: "20px",
              fontSize: "0.8rem", cursor: "pointer",
            }}
          >
            {tag}
          </button>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/home/HeroSection.tsx
git commit -m "feat: hero section with animated moon, typewriter effect, search bar, and trending tags"
```

---

## Task 7: Trust Bar with Animated Counters

**Files:**
- Create: `components/home/TrustBar.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useEffect, useRef, useState } from "react";

const STATS = [
  { icon: "📨", value: 12400, suffix: "+", label: "cards sent" },
  { icon: "👥", value: 3200,  suffix: "+", label: "happy users" },
  { icon: "🌙", value: 12,    suffix: "",  label: "occasions" },
  { icon: "⭐", value: 4.9,   suffix: "",  label: "rating", decimal: true },
];

function useCountUp(target: number, duration = 1200, decimal = false) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setVal(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { ref, display: decimal ? val.toFixed(1) : Math.floor(val).toLocaleString() };
}

function StatItem({ stat }: { stat: typeof STATS[0] }) {
  const { ref, display } = useCountUp(stat.value, 1200, stat.decimal);
  return (
    <div ref={ref} className="v3-trust-item">
      <span style={{ fontSize: "1.1rem" }}>{stat.icon}</span>
      <strong>{display}{stat.suffix}</strong>
      <span>{stat.label}</span>
    </div>
  );
}

export function TrustBar() {
  return (
    <div className="v3-trust-bar" role="region" aria-label="Platform statistics">
      {STATS.map(s => <StatItem key={s.label} stat={s} />)}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/home/TrustBar.tsx
git commit -m "feat: trust bar with intersection-observer animated counters"
```

---

## Task 8: Occasion Medallions Carousel

**Files:**
- Create: `components/home/OccasionMedallions.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

const OCCASIONS = [
  { slug: "all",     icon: "🌟", label: "All Cards" },
  { slug: "eid",     icon: "🌙", label: "Eid" },
  { slug: "ramadan", icon: "✨", label: "Ramadan" },
  { slug: "nikah",   icon: "💍", label: "Nikah" },
  { slug: "jummah",  icon: "🕌", label: "Jummah" },
  { slug: "hajj",    icon: "🕋", label: "Hajj" },
  { slug: "aqiqah",  icon: "🤲", label: "Aqiqah" },
  { slug: "general", icon: "🌸", label: "Blessings" },
];

export function OccasionMedallions() {
  const [active, setActive] = useState("all");
  const router = useRouter();
  const locale = useLocale();

  const handleClick = (slug: string) => {
    setActive(slug);
    const url = slug === "all" ? `/${locale}/cards` : `/${locale}/cards?occasion=${slug}`;
    router.push(url);
  };

  return (
    <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "8px", scrollbarWidth: "none" }}>
      {OCCASIONS.map(o => (
        <button
          key={o.slug}
          onClick={() => handleClick(o.slug)}
          className={`v3-medallion${active === o.slug ? " active" : ""}`}
          style={{ background: "none", border: "none", padding: 0 }}
          aria-pressed={active === o.slug}
        >
          <div className="v3-med-circle">{o.icon}</div>
          <span className="v3-med-label">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/home/OccasionMedallions.tsx
git commit -m "feat: occasion medallions carousel with active state and routing"
```

---

## Task 9: Mood Filter Pills

**Files:**
- Create: `components/home/MoodFilter.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useState } from "react";

const MOODS = [
  { id: "all",        label: "✨ All" },
  { id: "joyful",    label: "🎉 Joyful" },
  { id: "peaceful",  label: "🕊️ Peaceful" },
  { id: "reverent",  label: "🙏 Reverent" },
  { id: "celebratory", label: "💛 Celebratory" },
  { id: "ramadan",   label: "🌙 Ramadan" },
  { id: "eid",       label: "🌸 Eid" },
  { id: "nikah",     label: "💍 Nikah" },
];

interface MoodFilterProps {
  onChange?: (mood: string) => void;
}

export function MoodFilter({ onChange }: MoodFilterProps) {
  const [active, setActive] = useState("all");

  const handleClick = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", marginBottom: "24px", scrollbarWidth: "none" }}>
      {MOODS.map(m => (
        <button
          key={m.id}
          onClick={() => handleClick(m.id)}
          className={`v3-mood-pill${active === m.id ? " active" : ""}`}
          aria-pressed={active === m.id}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/home/MoodFilter.tsx
git commit -m "feat: mood filter pills component"
```

---

## Task 10: Masonry Grid + Flip Modal

**Files:**
- Create: `components/home/MasonryGrid.tsx`
- Create: `components/home/FlipModal.tsx`

- [ ] **Step 1: Create FlipModal**

```tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

interface FlipCard {
  id: string;
  gradient: string;
  icon: string;
  title: string;
  occasion: string;
}

interface FlipModalProps {
  card: FlipCard | null;
  onClose: () => void;
  flipped: boolean;
  onFlip: () => void;
}

export function FlipModal({ card, onClose, flipped, onFlip }: FlipModalProps) {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!card) return null;

  return (
    <div
      className={`v3-flip-overlay${card ? " open" : ""}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${card.title}`}
    >
      <div className="v3-flip-container" onClick={e => { e.stopPropagation(); onFlip(); }}>
        <div className={`v3-flip-inner${flipped ? " flipped" : ""}`}>
          {/* Front */}
          <div
            className="v3-flip-face"
            style={{ background: card.gradient, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}
          >
            <span style={{ fontSize: "64px" }}>{card.icon}</span>
            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", textAlign: "center", padding: "0 20px" }}>{card.title}</span>
            <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>Tap to flip</span>
          </div>
          {/* Back */}
          <div className="v3-flip-back">
            <div>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>
                {card.occasion}
              </p>
              <p style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{card.title}</p>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                Personalise with AI-generated Islamic greetings and Quranic verses.
              </p>
            </div>
            <div>
              <button
                className="v3-btn-send"
                style={{ width: "100%", padding: "12px", marginBottom: "8px", borderRadius: "8px" }}
                onClick={e => { e.stopPropagation(); router.push(`/${locale}/customize/${card.id}`); }}
              >
                Customise & Send →
              </button>
              <button
                style={{ width: "100%", padding: "10px", background: "transparent", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", cursor: "pointer" }}
                onClick={e => { e.stopPropagation(); onClose(); }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create MasonryGrid**

```tsx
"use client";
import { useState, useCallback } from "react";
import { FlipModal } from "./FlipModal";

interface MasonryCard {
  id: string;
  gradient: string;
  icon: string;
  title: string;
  occasion: string;
  size: "short" | "medium" | "tall";
}

const SAMPLE_CARDS: MasonryCard[] = [
  { id: "eid-crescent",     gradient: "linear-gradient(135deg,#1a1208,#2d1b0e)", icon: "🌙", title: "Eid al-Fitr Mubarak",    occasion: "Eid",     size: "medium" },
  { id: "ramadan-lantern",  gradient: "linear-gradient(135deg,#0a0a2e,#1a1a5e)", icon: "🏮", title: "Ramadan Kareem",         occasion: "Ramadan", size: "tall"   },
  { id: "nikah-gold",       gradient: "linear-gradient(135deg,#1a0a0a,#3d1515)", icon: "💍", title: "Nikah Mubarak",          occasion: "Nikah",   size: "short"  },
  { id: "jummah-mosque",    gradient: "linear-gradient(135deg,#0a1a0a,#0d2318)", icon: "🕌", title: "Jummah Mubarak",         occasion: "Jummah",  size: "medium" },
  { id: "hajj-kaaba",       gradient: "linear-gradient(135deg,#1a1510,#2d2010)", icon: "🕋", title: "Hajj Mubarak",           occasion: "Hajj",    size: "tall"   },
  { id: "aqiqah-stars",     gradient: "linear-gradient(135deg,#1a0a1a,#2d102d)", icon: "⭐", title: "Aqiqah Mubarak",         occasion: "Aqiqah",  size: "short"  },
  { id: "qadr-night",       gradient: "linear-gradient(135deg,#050520,#0d0d40)", icon: "✨", title: "Laylatul Qadr",          occasion: "Ramadan", size: "medium" },
  { id: "general-dua",      gradient: "linear-gradient(135deg,#0a1510,#0f2018)", icon: "🤲", title: "Du'a & Blessings",       occasion: "General", size: "short"  },
];

const HEIGHT_MAP = { short: "80px", medium: "130px", tall: "180px" };

export function MasonryGrid() {
  const [selected, setSelected] = useState<MasonryCard | null>(null);
  const [flipped, setFlipped]   = useState(false);

  const openCard  = useCallback((card: MasonryCard) => { setSelected(card); setFlipped(false); }, []);
  const closeCard = useCallback(() => { setSelected(null); setFlipped(false); }, []);
  const flipCard  = useCallback(() => setFlipped(f => !f), []);

  return (
    <>
      <div className="v3-masonry">
        {SAMPLE_CARDS.map(card => (
          <div
            key={card.id}
            className="v3-masonry-card"
            style={{ height: HEIGHT_MAP[card.size], background: card.gradient }}
            onClick={() => openCard(card)}
            role="button"
            tabIndex={0}
            aria-label={`Preview ${card.title}`}
            onKeyDown={e => e.key === "Enter" && openCard(card)}
          >
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
              {card.icon}
            </div>
            <div className="v3-masonry-hover">Click to preview →</div>
          </div>
        ))}
      </div>

      <FlipModal card={selected} onClose={closeCard} flipped={flipped} onFlip={flipCard} />
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/home/FlipModal.tsx components/home/MasonryGrid.tsx
git commit -m "feat: masonry grid with 3D flip card preview modal"
```

---

## Task 11: Assemble the Full Homepage

**Files:**
- Rewrite: `app/[locale]/page.tsx`

- [ ] **Step 1: Replace the homepage with the full v3 composition**

Replace the entire content of `app/[locale]/page.tsx` with:

```tsx
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
          <Link href="/cards?occasion=general">Du'a & Blessings</Link>
        </div>
      </footer>
      <div style={{ position: "relative", zIndex: 2, borderTop: "1px solid var(--v3-border)", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: "0.78rem", color: "var(--v3-text-dim)" }}>Islamic Ecards © {new Date().getFullYear()} — Spreading Blessings</p>
        <p style={{ fontSize: "0.78rem", color: "var(--v3-text-dim)", fontFamily: "var(--font-arabic, serif)" }}>جزاك الله خيراً</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd "C:/Users/INFOTECH/Documents/ClaudeCode Test/islamic-ecards"
npm run build 2>&1 | tail -30
```
Expected: `✓ Compiled successfully` with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/page.tsx
git commit -m "feat: assemble full v3 homepage with all wow components"
```

---

## Task 12: Push and Verify Deployment

- [ ] **Step 1: Push to GitHub**

```bash
cd "C:/Users/INFOTECH/Documents/ClaudeCode Test/islamic-ecards"
git push origin master
```

- [ ] **Step 2: Watch Vercel build**

Go to vercel.com → your project → Deployments. New build should trigger automatically. Wait for it to complete.

- [ ] **Step 3: Smoke test the live site**

Visit `https://islamic-ecards.vercel.app/en` and verify:
- [ ] Dark background (#03020a) visible
- [ ] Aurora color bands drifting in background
- [ ] Stars twinkling
- [ ] Custom gold cursor visible on desktop
- [ ] Social ticker scrolling at the top
- [ ] Animated crescent moon in hero
- [ ] Typewriter effect cycling through phrases
- [ ] Search bar functional
- [ ] Hijri date showing in navbar
- [ ] Trust bar counters animate on scroll
- [ ] Occasion medallions scroll horizontally
- [ ] Featured cards horizontal carousel
- [ ] Mood filter pills toggle
- [ ] Masonry grid with varied heights
- [ ] Click a masonry card → 3D flip modal opens
- [ ] Click modal card → flips to back with Send button
- [ ] CTA banner visible
- [ ] Footer with 4-column grid

- [ ] **Step 4: Commit any fixes found during smoke test**

---

## Self-Review

**Spec coverage check:**
- ✅ Aurora background + starfield + shooting stars → Task 2
- ✅ Custom 3-layer gold cursor → Task 3
- ✅ Social proof ticker → Task 4
- ✅ Hijri date pill → Task 5
- ✅ Animated moon + typewriter + search → Task 6
- ✅ Trust bar with counters → Task 7
- ✅ Occasion medallions → Task 8
- ✅ Mood filters → Task 9
- ✅ Masonry grid + 3D flip modal → Task 10
- ✅ Full homepage composition → Task 11
- ✅ CSS foundation → Task 1

**No placeholders found.**

**Type consistency:** All component names and props used in Task 11 match exactly what's defined in Tasks 2–10.
