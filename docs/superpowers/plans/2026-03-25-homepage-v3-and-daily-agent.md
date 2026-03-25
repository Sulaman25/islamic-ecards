# Noor Cards — Homepage v3 + Daily Card Generation Agent — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `homepage-v3.html` prototype with 8 visual enhancements, then implement a 5-agent AI pipeline that auto-generates 3 unique Islamic ecards daily with a 30-minute human override window.

**Architecture:** Phase 1 is a standalone HTML prototype (copy of v2 + 8 CSS/JS additions, no build step). Phases 2–5 are Next.js 16 API routes using the existing Prisma 7 / `@anthropic-ai/sdk` / Resend stack. Phase 6 ports the prototype into the real `app/[locale]/page.tsx`.

**Tech Stack:** Next.js 16 App Router, Prisma 7 + `@prisma/adapter-pg`, `@anthropic-ai/sdk ^0.80`, Resend v6, TypeScript 5, vanilla HTML/CSS/JS (prototype only)

---

## File Map

**Created:**
- `.superpowers/brainstorm/1169-1774467958/content/homepage-v3.html`
- `lib/agents/types.ts`
- `lib/agents/hijri-utils.ts`
- `lib/agents/brief-agent.ts`
- `lib/agents/designer-agent.ts`
- `lib/agents/motion-agent.ts`
- `lib/agents/qa-agent.ts`
- `lib/agents/publisher-agent.ts`
- `app/api/agents/daily-cards/route.ts`
- `app/api/agents/reject-card/route.ts`
- `app/api/cron/publish-pending/route.ts`
- `app/admin/cards/preview/[id]/page.tsx`
- `app/styles/card-templates.css` — 6 base template CSS classes
- `tests/agents/daily-cards.spec.ts`

**Modified:**
- `prisma/schema.prisma` — add AI card fields to `CardTemplate`
- `vercel.json` — add two cron entries

---

## Task 1 — Homepage v3 Prototype

**Files:**
- Copy: `.superpowers/brainstorm/1169-1774467958/content/homepage-v2.html`
- Create: `.superpowers/brainstorm/1169-1774467958/content/homepage-v3.html`

This task adds 8 visual enhancements onto v2. All v2 features (aurora, stars, shooting stars, custom cursor, ticker, counters, typewriter, Hijri date, 3D tilt) are preserved unchanged.

- [ ] **Step 1.1: Copy v2 to v3**

```bash
cp "islamic-ecards/.superpowers/brainstorm/1169-1774467958/content/homepage-v2.html" \
   "islamic-ecards/.superpowers/brainstorm/1169-1774467958/content/homepage-v3.html"
```

- [ ] **Step 1.2: Add V3 CSS — paste this block immediately before the closing `</style>` tag**

```css
/* ============================================================
   V3 ADDITIONS — paste before </style>
   ============================================================ */

/* ① Greeting pill */
.greeting-pill {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
  border-radius: 999px; padding: 6px 16px; font-size: 0.82rem;
  letter-spacing: 0.04em; margin-bottom: 18px;
}
.greeting-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #2dd4c0;
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.4); opacity: 0.6; }
}

/* ② Card reel */
.card-reel-wrapper {
  overflow: hidden; width: 460px; margin: 0 auto 28px;
  mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
}
.card-reel-strip {
  display: flex; gap: 12px;
  animation: reel-scroll 12.5s linear infinite;
}
.reel-card {
  flex-shrink: 0; width: 80px; height: 110px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; font-size: 2rem;
  transition: transform 0.3s;
}
.reel-card.reel-center { transform: scale(1.15); }
@keyframes reel-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(calc(-92px * 5)); }
}

/* ④ Nasheed toggle */
.nasheed-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 999px; padding: 6px 14px; font-size: 0.78rem;
  cursor: pointer; color: rgba(255,255,255,0.7); transition: background 0.2s; margin-top: 12px;
}
.nasheed-btn:hover   { background: rgba(255,255,255,0.12); }
.nasheed-btn.active  { border-color: #2dd4c0; color: #2dd4c0; }

/* ⑤ Occasion countdown */
.occasion-countdown {
  background: linear-gradient(135deg, rgba(13,13,43,0.9), rgba(64,64,192,0.3));
  border: 1px solid rgba(240,208,128,0.3); border-radius: 12px;
  padding: 14px 24px; text-align: center; margin: 0 auto 40px; max-width: 700px; cursor: pointer;
}
.occasion-countdown .occ-label { font-size: 1rem; color: rgba(255,255,255,0.88); }
.occasion-countdown .occ-timer {
  font-size: 1.25rem; font-weight: 700; color: #f0d080; margin-top: 4px;
  font-variant-numeric: tabular-nums;
}

/* ⑥ Mood filter tabs */
.mood-filter-row {
  display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px;
  margin-bottom: 24px; scrollbar-width: none;
}
.mood-filter-row::-webkit-scrollbar { display: none; }
.mood-pill {
  flex-shrink: 0; padding: 6px 16px; border-radius: 999px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
  font-size: 0.82rem; cursor: pointer; white-space: nowrap;
  transition: background 0.2s, border-color 0.2s; color: rgba(255,255,255,0.8);
}
.mood-pill:hover  { background: rgba(255,255,255,0.12); }
.mood-pill.active { background: rgba(240,208,128,0.15); border-color: #f0d080; color: #f0d080; }

/* ⑦ Masonry grid */
.masonry-grid { columns: 4; column-gap: 16px; margin-bottom: 60px; }
.masonry-card {
  break-inside: avoid; margin-bottom: 16px; border-radius: 12px;
  overflow: hidden; position: relative; cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}
.masonry-card:hover { transform: scale(1.03); box-shadow: 0 0 24px rgba(240,208,128,0.3); }
.masonry-card.m-short  { height: 80px; }
.masonry-card.m-medium { height: 110px; }
.masonry-card.m-tall   { height: 160px; }
.masonry-hover {
  position: absolute; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; color: rgba(255,255,255,0.85);
  opacity: 0; transition: opacity 0.2s;
}
.masonry-card:hover .masonry-hover { opacity: 1; }

/* ⑧ 3D flip modal */
.flip-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.75); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none; transition: opacity 0.3s;
}
.flip-overlay.open { opacity: 1; pointer-events: auto; }
.flip-container { width: 280px; perspective: 1200px; cursor: pointer; }
.flip-inner {
  width: 100%; height: 380px;
  transform-style: preserve-3d; transition: transform 0.6s ease; position: relative;
}
.flip-inner.flipped { transform: rotateY(180deg); }
.flip-face {
  position: absolute; inset: 0; border-radius: 16px;
  backface-visibility: hidden; -webkit-backface-visibility: hidden; overflow: hidden;
}
.flip-back {
  transform: rotateY(180deg);
  background: linear-gradient(135deg,#0d0d2b,#1a1a4a);
  border: 1px solid rgba(240,208,128,0.3);
  padding: 28px; display: flex; flex-direction: column; justify-content: space-between;
}
.flip-send-btn {
  background: #f0d080; color: #0d0d2b; border: none;
  border-radius: 8px; padding: 10px; font-weight: 700; cursor: pointer; width: 100%; margin-bottom: 8px;
}
.flip-custom-btn {
  background: transparent; color: rgba(255,255,255,0.7);
  border: 1px solid rgba(255,255,255,0.2); border-radius: 8px;
  padding: 8px; cursor: pointer; width: 100%;
}
.flip-hint {
  font-size: 0.72rem; color: rgba(255,255,255,0.35); text-align: center; margin-top: 8px;
}
```

- [ ] **Step 1.3: Replace the hero eyebrow with greeting pill + card reel**

Find the `<section class="hero">` (or equivalent hero section). Inside it, locate the existing static eyebrow text above the `<h1>` — it will look like:
```html
<p class="eyebrow">🌙 Noor Cards</p>
```
or similar. Replace just that element (keep the `<h1>` and everything below it) with:

```html
<!-- ① Time-of-day greeting pill -->
<div class="greeting-pill">
  <span class="greeting-dot"></span>
  <span id="v3-greeting">Assalamu Alaykum</span>
</div>

<!-- ② Looping card reel -->
<div class="card-reel-wrapper">
  <div class="card-reel-strip" id="reel-strip"></div>
</div>
```

Then, immediately after the hero subtitle / CTA buttons block, add the nasheed toggle:

```html
<!-- ④ Nasheed toggle -->
<button class="nasheed-btn" id="nasheed-btn" onclick="v3ToggleNasheed()">
  🎵 Ambient Nasheed · <span id="nasheed-label">Off</span>
</button>
```

- [ ] **Step 1.4: Add occasion countdown banner**

Find the `.ticker-bar` element (the social proof scroll bar). After its closing tag, insert:

```html
<!-- ⑤ Occasion countdown banner -->
<div class="occasion-countdown" id="occ-countdown" style="display:none" onclick="v3ScrollToCards()">
  <div class="occ-label" id="occ-label"></div>
  <div class="occ-timer" id="occ-timer"></div>
</div>
```

- [ ] **Step 1.5: Add mood filter tabs**

Find the heading of the first card section below the fold (e.g. "Popular Cards" `<h2>`). Immediately before that heading, insert:

```html
<!-- ⑥ Mood filter tabs -->
<div class="mood-filter-row">
  <button class="mood-pill active" data-mood="all"         onclick="v3FilterMood('all')">All</button>
  <button class="mood-pill"        data-mood="joyful"      onclick="v3FilterMood('joyful')">Joyful</button>
  <button class="mood-pill"        data-mood="peaceful"    onclick="v3FilterMood('peaceful')">Peaceful</button>
  <button class="mood-pill"        data-mood="reverent"    onclick="v3FilterMood('reverent')">Reverent</button>
  <button class="mood-pill"        data-mood="celebratory" onclick="v3FilterMood('celebratory')">Celebratory</button>
  <button class="mood-pill"        data-mood="ramadan"     onclick="v3FilterMood('ramadan')">Ramadan</button>
  <button class="mood-pill"        data-mood="eid"         onclick="v3FilterMood('eid')">Eid</button>
  <button class="mood-pill"        data-mood="nikah"       onclick="v3FilterMood('nikah')">Nikah</button>
</div>
```

- [ ] **Step 1.6: Replace the "New This Week" grid with masonry grid**

Find the "New This Week" section. It will have a `<div>` containing a uniform grid of cards. Replace that entire grid `<div>` (keep the section heading) with:

```html
<!-- ⑦ Masonry grid -->
<div class="masonry-grid" id="masonry-grid"></div>
```

- [ ] **Step 1.7: Add 3D flip modal — paste just before `</body>`**

```html
<!-- ⑧ 3D flip modal -->
<div class="flip-overlay" id="flip-overlay" onclick="v3FlipOverlayClick(event)">
  <div class="flip-container">
    <div class="flip-inner" id="flip-inner">
      <div class="flip-face flip-front" id="flip-front">
        <!-- card gradient + emoji populated by JS -->
      </div>
      <div class="flip-face flip-back" id="flip-back">
        <div>
          <div id="flip-card-title" style="font-size:1.1rem;font-weight:700;margin-bottom:6px;color:#fff"></div>
          <div id="flip-card-occ"   style="font-size:0.82rem;opacity:0.55;color:#fff;margin-bottom:18px"></div>
        </div>
        <div>
          <button class="flip-send-btn"   onclick="v3FlipSend()">Send Card</button>
          <button class="flip-custom-btn" onclick="v3FlipCustomise()">Customise</button>
        </div>
      </div>
    </div>
    <div class="flip-hint">Tap card to flip · Esc to close</div>
  </div>
</div>
```

- [ ] **Step 1.8: Add V3 JS block — paste just before the closing `</script>` of the main script block**

```javascript
/* ====================================================================
   V3 JS — paste before </script>
   ==================================================================== */

// ① Time-of-day Islamic greeting
(function v3InitGreeting() {
  const h = new Date().getHours();
  let label;
  if      (h >= 4  && h < 6)  label = 'Assalamu Alaykum · Good Fajr';
  else if (h >= 6  && h < 12) label = 'Assalamu Alaykum · Good Morning';
  else if (h >= 12 && h < 14) label = 'Assalamu Alaykum · Good Dhuhr';
  else if (h >= 14 && h < 17) label = 'Assalamu Alaykum · Good Asr';
  else if (h >= 17 && h < 20) label = 'Assalamu Alaykum · Good Maghrib';
  else                         label = 'Assalamu Alaykum · Good Isha';
  const el = document.getElementById('v3-greeting');
  if (el) el.textContent = label;
})();

// ② Card reel — uses featuredCards array (already defined in v2 script)
(function v3InitReel() {
  const strip = document.getElementById('reel-strip');
  if (!strip || typeof featuredCards === 'undefined') return;
  const items = [...featuredCards.slice(0,5), ...featuredCards.slice(0,5)]; // doubled for seamless loop
  items.forEach(function(card, i) {
    const d = document.createElement('div');
    d.className = 'reel-card' + (i % 5 === 2 ? ' reel-center' : '');
    d.style.background = card.gradient || 'linear-gradient(135deg,#1a3a5c,#0d1b2a)';
    d.textContent = card.emoji || '🌙';
    strip.appendChild(d);
  });
})();

// ③ Parallax depth layers
(function v3InitParallax() {
  var stars    = document.getElementById('stars');       // existing <canvas> id
  var aurora   = document.querySelector('.aurora');      // existing aurora container
  var heroInner = document.querySelector('.hero-content') || document.querySelector('.hero > div');
  window.addEventListener('scroll', function() {
    var y = window.scrollY;
    if (stars)     stars.style.transform     = 'translateY(' + (y * 0.2)  + 'px)';
    if (aurora)    aurora.style.transform    = 'translateY(' + (y * 0.35) + 'px)';
    if (heroInner) heroInner.style.transform = 'translateY(' + (y * 0.55) + 'px)';
  }, { passive: true });
})();

// ④ Ambient nasheed (Web Audio API oscillator)
var _nasheedCtx = null, _nasheedOscs = [];
function v3ToggleNasheed() {
  var btn   = document.getElementById('nasheed-btn');
  var label = document.getElementById('nasheed-label');
  if (_nasheedOscs.length) {
    _nasheedOscs.forEach(function(o) { try { o.stop(); } catch(e){} });
    _nasheedOscs = [];
    if (btn)   btn.classList.remove('active');
    if (label) label.textContent = 'Off';
    sessionStorage.removeItem('nasheedOn');
    return;
  }
  _nasheedCtx = _nasheedCtx || new (window.AudioContext || window.webkitAudioContext)();
  [[220, 0.05],[330, 0.025],[440, 0.012]].forEach(function(pair) {
    var osc  = _nasheedCtx.createOscillator();
    var gain = _nasheedCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = pair[0];
    gain.gain.value = pair[1];
    osc.connect(gain);
    gain.connect(_nasheedCtx.destination);
    osc.start();
    _nasheedOscs.push(osc);
  });
  if (btn)   btn.classList.add('active');
  if (label) label.textContent = 'On';
  sessionStorage.setItem('nasheedOn', '1');
}
// Restore state across page loads
if (sessionStorage.getItem('nasheedOn') === '1') {
  document.addEventListener('DOMContentLoaded', function() { v3ToggleNasheed(); });
}

// ⑤ Occasion countdown
(function v3InitCountdown() {
  // Kuwaiti Hijri algorithm — returns { month, day } for a Gregorian Date
  function toHijriParts(date) {
    var jd = Math.floor((14 + 11*(date.getFullYear() + Math.floor((date.getMonth()+10)/12)))/30)
           + Math.floor(275*(date.getMonth()+1)/9) - Math.floor(3*(Math.floor((date.getFullYear()
           + Math.floor((date.getMonth()+10)/12))/100)+1)/4) + date.getDate() + 1721028.5 - 1867216.25;
    // Simpler direct algorithm:
    var l = Math.floor(jd) - 1948440 + 10632;
    var n = Math.floor((l-1)/10631);
    l = l - 10631*n + 354;
    var j = Math.floor((10985-l)/5316)*Math.floor((50*l)/17719)
          + Math.floor(l/5670)*Math.floor((43*l)/15238);
    l = l - Math.floor((30-j)/15)*Math.floor((17719*j)/50)
        - Math.floor(j/16)*Math.floor((15238*j)/43) + 29;
    var month = Math.floor((24 + 29.5001*(j-1))/29.5);
    var day   = l - Math.floor(29.5001 * Math.floor((24+29.5001*(j-1))/29.5));
    if (day < 1) day += 29;
    return { month: month, day: day };
  }

  var OCCASIONS = [
    { name:'Ramadan',          month:9,  day:1  },
    { name:'Eid ul Fitr',      month:10, day:1  },
    { name:'Eid ul Adha',      month:12, day:10 },
    { name:'Laylatul Qadr',    month:9,  day:27 },
    { name:'Islamic New Year', month:1,  day:1  },
    { name:'Mawlid',           month:3,  day:12 },
  ];

  var now = new Date();
  var nearest = null;
  for (var offset = 0; offset <= 365; offset++) {
    var d = new Date(now.getTime() + offset * 86400000);
    try {
      var parts = toHijriParts(d);
      for (var i = 0; i < OCCASIONS.length; i++) {
        var occ = OCCASIONS[i];
        if (occ.month === parts.month && occ.day === parts.day) {
          var diff = d.getTime() - now.getTime();
          if (!nearest && diff < 90 * 86400000) {
            nearest = { name: occ.name, date: d };
          }
        }
      }
    } catch(e) {}
    if (nearest) break;
  }
  if (!nearest) return;

  var banner = document.getElementById('occ-countdown');
  var labelEl = document.getElementById('occ-label');
  var timerEl = document.getElementById('occ-timer');
  if (!banner) return;
  banner.style.display = 'block';
  if (labelEl) labelEl.textContent = '🌙 ' + nearest.name + ' begins in';

  function tick() {
    var ms = nearest.date.getTime() - Date.now();
    if (ms <= 0) { if (timerEl) timerEl.textContent = 'Today! 🎉'; return; }
    var dd = Math.floor(ms / 86400000);
    var hh = Math.floor((ms % 86400000) / 3600000);
    var mm = Math.floor((ms % 3600000)  / 60000);
    var ss = Math.floor((ms % 60000)    / 1000);
    var pad = function(n) { return String(n).padStart(2,'0'); };
    if (timerEl) timerEl.textContent = dd + 'd ' + pad(hh) + 'h ' + pad(mm) + 'm ' + pad(ss) + 's';
  }
  tick();
  setInterval(tick, 1000);
})();

function v3ScrollToCards() {
  var el = document.querySelector('[id*="cards"], .cards-section, .section-cards');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ⑥ Mood filter
function v3FilterMood(mood) {
  document.querySelectorAll('.mood-pill').forEach(function(p) {
    p.classList.toggle('active', p.getAttribute('data-mood') === mood);
  });
  document.querySelectorAll('.masonry-card[data-mood]').forEach(function(card) {
    card.style.display = (mood === 'all' || card.getAttribute('data-mood') === mood) ? '' : 'none';
  });
}

// ⑦ Masonry grid — uses popularCards or newCards array (defined in v2 script)
(function v3InitMasonry() {
  var grid = document.getElementById('masonry-grid');
  if (!grid) return;
  var source = (typeof popularCards !== 'undefined' && popularCards.length)
             ? popularCards
             : (typeof newCards !== 'undefined' ? newCards : []);
  var heights = ['m-short','m-medium','m-tall'];
  var moods   = ['joyful','peaceful','reverent','celebratory','ramadan','eid','nikah'];
  source.forEach(function(card, i) {
    var div = document.createElement('div');
    div.className = 'masonry-card ' + heights[i % 3];
    div.setAttribute('data-mood', moods[i % moods.length]);
    div.style.background = card.gradient || 'linear-gradient(135deg,#1a3a5c,#0d1b2a)';
    div.innerHTML =
      '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem">' +
        (card.emoji || '🌙') +
      '</div>' +
      '<div class="masonry-hover">Click to preview →</div>';
    div.addEventListener('click', function() { v3OpenFlip(card); });
    grid.appendChild(div);
  });
})();

// ⑧ 3D flip modal
var _flipCard = null;
function v3OpenFlip(card) {
  _flipCard = card;
  var front  = document.getElementById('flip-front');
  var titleEl = document.getElementById('flip-card-title');
  var occEl   = document.getElementById('flip-card-occ');
  if (front) {
    front.style.background = card.gradient || 'linear-gradient(135deg,#1a3a5c,#0d1b2a)';
    front.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:4rem">' + (card.emoji||'🌙') + '</div>';
  }
  if (titleEl) titleEl.textContent = card.title || card.name || 'Islamic Card';
  if (occEl)   occEl.textContent   = card.occasion || '';
  var inner = document.getElementById('flip-inner');
  if (inner) inner.classList.remove('flipped');
  var overlay = document.getElementById('flip-overlay');
  if (overlay) overlay.classList.add('open');
}
function v3FlipOverlayClick(e) {
  if (e.target === document.getElementById('flip-overlay')) {
    document.getElementById('flip-overlay').classList.remove('open');
  } else {
    var inner = document.getElementById('flip-inner');
    if (inner) inner.classList.toggle('flipped');
  }
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var overlay = document.getElementById('flip-overlay');
    if (overlay) overlay.classList.remove('open');
  }
});
function v3FlipSend()      { if (_flipCard) window.location.href = '/send?card=' + (_flipCard.id||''); }
function v3FlipCustomise() { if (_flipCard) window.location.href = '/en/customize/' + (_flipCard.id||''); }
```

- [ ] **Step 1.9: Open in browser and verify all 8 features**

```bash
# Windows
start "" "islamic-ecards/.superpowers/brainstorm/1169-1774467958/content/homepage-v3.html"
```

Checklist:
- [ ] Greeting pill shows prayer time label matching current hour
- [ ] Card reel: horizontal strip of ~5 thumbnails scrolls left continuously, loops seamlessly
- [ ] Parallax: scroll down 200px — stars barely move, aurora moves a little, hero content moves most
- [ ] Nasheed button toggles soft tone; button turns teal when on; state persists on refresh
- [ ] Countdown banner visible if any Islamic occasion is within 90 days
- [ ] Mood tabs: clicking "Ramadan" hides non-ramadan masonry cards; "All" restores them
- [ ] Masonry grid: cards have visibly different heights (short/medium/tall)
- [ ] Click a masonry card → flip modal opens; click modal interior → card flips to back face (card name + Send button); Esc closes

- [ ] **Step 1.10: Commit**

```bash
git -C "islamic-ecards" add ".superpowers/brainstorm/1169-1774467958/content/homepage-v3.html"
git -C "islamic-ecards" commit -m "feat: homepage-v3 prototype with 8 visual enhancements"
```

---

## Task 2 — Prisma Schema: Add AI Card Fields

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 2.1: Add fields to CardTemplate model**

In `prisma/schema.prisma`, find the `CardTemplate` model. Replace the entire model with:

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
  sortOrder     Int      @default(0)
  createdAt     DateTime @default(now())

  // AI generation fields (v3)
  status         String    @default("published")  // "pending_review" | "published" | "rejected"
  publishAt      DateTime?
  rejectedAt     DateTime?
  isAiGenerated  Boolean   @default(false)
  accentCss      String?   @db.Text
  accentJs       String?   @db.Text
  shapeSvg       String?   @db.Text
  mood           String?
  animationStyle String?
  generatedAt    DateTime?

  occasion  Occasion   @relation(fields: [occasionId], references: [id])
  sentCards SentCard[]
}
```

- [ ] **Step 2.2: Run migration**

```bash
cd islamic-ecards && npm run db:migrate
```

When prompted for a migration name, enter: `add_ai_card_fields`

Expected output ends with: `✔ Generated Prisma Client`

If `DATABASE_URL` is not set: `export DATABASE_URL="postgresql://..."` first, then rerun.

- [ ] **Step 2.3: Verify new fields exist**

```bash
npm run db:studio
```

Open `http://localhost:5555` → click `CardTemplate` → confirm the new columns (`status`, `publishAt`, `rejectedAt`, `isAiGenerated`, `accentCss`, `accentJs`, `shapeSvg`, `mood`, `animationStyle`, `generatedAt`) are present. Close Studio.

- [ ] **Step 2.4: Commit**

```bash
git -C "." add prisma/schema.prisma "prisma/migrations/"
git -C "." commit -m "feat: add AI card generation fields to CardTemplate schema"
```

---

## Task 3 — Agent Shared Types + Hijri Utils

**Files:**
- Create: `lib/agents/types.ts`
- Create: `lib/agents/hijri-utils.ts`

- [ ] **Step 3.1: Create `lib/agents/types.ts`**

```typescript
// lib/agents/types.ts

export interface CardTarget {
  mood: 'reverent' | 'peaceful' | 'celebratory' | 'joyful';
  shape: 'circle' | 'hexagon' | 'diamond' | 'rectangle' | 'arch' | 'blob';
  animationGap: string;  // e.g. "particle-burst", "calligraphy-write-on", "liquid-warp"
}

export interface BriefOutput {
  occasion: string;       // e.g. "Ramadan"
  occasionSlug: string;   // e.g. "ramadan" — must match an Occasion.slug in DB
  daysUntil: number;
  targets: CardTarget[];  // always length 3
}

export interface VerseInfo {
  arabic: string;
  transliteration: string;
  reference: string;   // e.g. "Surah Al-Qadr 97:1" — must match QURAN_VERSES ref format "surah:ayah"
  translation: string;
}

export interface DesignerOutput {
  templateId: TemplateId;
  verse: VerseInfo;
  palette: string[];       // 2-3 hex values, e.g. ["#0d0d2b","#4040c0","#f0d080"]
  shape: string;
  accentDescription: string;  // one paragraph, plain English
}

export interface MotionOutput {
  accentCss: string;
  accentJs:  string | null;
  shapeSvg:  string | null;
}

export interface QAResult {
  pass: boolean;
  checks: {
    cssValid:           boolean;
    jsValid:            boolean;
    islamicAppropriate: boolean;
    noConflicts:        boolean;
  };
  failedCheck?: string;
  note?: string;
}

export interface CardSpec {
  target:   CardTarget;
  designer: DesignerOutput;
  motion:   MotionOutput;
}

// 6 base templates — the Designer Agent picks from these
export const TEMPLATE_LIBRARY = [
  { id: 'aurora-float',       name: 'Aurora Float',       shapes: ['circle','hexagon','diamond']    },
  { id: 'starfield-drift',    name: 'Starfield Drift',    shapes: ['circle','rectangle','diamond']  },
  { id: 'calligraphy-reveal', name: 'Calligraphy Reveal', shapes: ['rectangle','arch']              },
  { id: 'gradient-pulse',     name: 'Gradient Pulse',     shapes: ['circle','hexagon','blob']       },
  { id: 'glass-layer',        name: 'Glass Layer',        shapes: ['rectangle','arch']              },
  { id: 'ink-wash',           name: 'Ink Wash',           shapes: ['blob','circle']                 },
] as const;

export type TemplateId = typeof TEMPLATE_LIBRARY[number]['id'];
```

- [ ] **Step 3.2: Create `lib/agents/hijri-utils.ts`**

```typescript
// lib/agents/hijri-utils.ts
// Kuwaiti algorithm — converts a Gregorian Date to Hijri { year, month, day }

export interface HijriDate {
  year:  number;
  month: number;  // 1–12
  day:   number;  // 1–30
}

export function toHijri(date: Date): HijriDate {
  const jd = gregorianToJulianDay(date);
  return julianDayToHijri(jd);
}

function gregorianToJulianDay(d: Date): number {
  const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
  return Math.floor((14 + 11 * (y + Math.floor((m + 9) / 12))) / 30)
       + Math.floor(275 * m / 9)
       - Math.floor(3 * (Math.floor((y + Math.floor((m + 9) / 12)) / 100) + 1) / 4)
       + day + 1721028.5 - 1867216.25;
}

function julianDayToHijri(jd: number): HijriDate {
  let l = Math.floor(jd) - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719)
          + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
      - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const year  = 30 * n + j - 30;
  const month = Math.floor((24 + 29.5001 * (j - 1)) / 29.5);
  const day   = Math.max(1, l - Math.floor(29.5001 * Math.floor((24 + 29.5001 * (j - 1)) / 29.5)));
  return { year, month, day };
}

export interface UpcomingOccasion {
  name: string;
  daysUntil: number;
  gregorianDate: Date;
}

// Returns the next major Islamic occasion within maxDays, or null.
export function findUpcomingOccasion(maxDays = 14): UpcomingOccasion | null {
  const OCCASIONS: Array<{ name: string; month: number; day: number }> = [
    { name: 'Ramadan',          month: 9,  day: 1  },
    { name: 'Eid ul Fitr',      month: 10, day: 1  },
    { name: 'Eid ul Adha',      month: 12, day: 10 },
    { name: 'Laylatul Qadr',    month: 9,  day: 27 },
    { name: 'Islamic New Year', month: 1,  day: 1  },
    { name: 'Mawlid',           month: 3,  day: 12 },
  ];

  const now = new Date();
  for (let offset = 0; offset <= maxDays; offset++) {
    const d = new Date(now.getTime() + offset * 86_400_000);
    const { month, day } = toHijri(d);
    for (const occ of OCCASIONS) {
      if (occ.month === month && occ.day === day) {
        return { name: occ.name, daysUntil: offset, gregorianDate: d };
      }
    }
  }
  return null;
}

// Maps occasion name to the Occasion.slug used in the DB seed
export const OCCASION_NAME_TO_SLUG: Record<string, string> = {
  'Ramadan':          'ramadan',
  'Eid ul Fitr':      'eid-ul-fitr',
  'Eid ul Adha':      'eid-ul-adha',
  'Laylatul Qadr':    'laylatul-qadr',
  'Islamic New Year': 'islamic-new-year',
  'Mawlid':           'mawlid',
};
```

- [ ] **Step 3.3: Verify Hijri conversion with a quick script**

```bash
cd islamic-ecards && npx tsx -e "
const { toHijri, findUpcomingOccasion } = require('./lib/agents/hijri-utils');
const h = toHijri(new Date('2026-03-25'));
console.log('Hijri for 2026-03-25:', h);
// Expected: Rajab 1447 region (year ~1447, month ~7, day ~25)
const occ = findUpcomingOccasion(60);
console.log('Next occasion within 60 days:', occ);
"
```

Expected: `{ year: 1447, month: 9, day: ...}` — year should be 1447, month 9 is Ramadan (Ramadan 1447 falls around late March 2026).

- [ ] **Step 3.4: Create `app/styles/card-templates.css`**

These classes define the base look for each template. The Motion Agent's accent code (`.accent-*` selectors) layers on top. Import this file in the admin preview page and in the future Next.js port.

```css
/* app/styles/card-templates.css
   Base styles for the 6 AI card templates.
   All accent overrides must use .accent-* selectors (never modify these). */

/* 1. Aurora Float — drifting colour bands */
.tmpl-aurora-float {
  background: linear-gradient(135deg, #0d0d2b, #1a1a4a, #0d2b1a);
  position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.tmpl-aurora-float::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(45deg, rgba(0,120,255,0.15) 0%, rgba(100,0,255,0.1) 50%, rgba(0,200,120,0.1) 100%);
  animation: aurora-drift 8s ease-in-out infinite alternate;
}
@keyframes aurora-drift {
  from { transform: translateX(-10%) skewX(-5deg); }
  to   { transform: translateX(10%)  skewX(5deg);  }
}

/* 2. Starfield Drift — dark space, twinkling stars */
.tmpl-starfield-drift {
  background: radial-gradient(ellipse at 50% 20%, #0a0a1e 0%, #000010 100%);
  position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}

/* 3. Calligraphy Reveal — dark bg, gold text focus */
.tmpl-calligraphy-reveal {
  background: linear-gradient(160deg, #0d0d0d, #1a1000);
  position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.tmpl-calligraphy-reveal::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 50%, rgba(240,208,128,0.08), transparent 70%);
}

/* 4. Gradient Pulse — breathing gradient */
.tmpl-gradient-pulse {
  background: linear-gradient(135deg, #1a0a2e, #2d1b4a, #0d2a1a);
  position: relative; overflow: hidden;
  animation: gradient-breathe 6s ease-in-out infinite alternate;
  display: flex; align-items: center; justify-content: center;
}
@keyframes gradient-breathe {
  from { filter: brightness(0.9); }
  to   { filter: brightness(1.1); }
}

/* 5. Glass Layer — glassmorphism stack */
.tmpl-glass-layer {
  background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
  backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1);
  position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}

/* 6. Ink Wash — painterly, organic edges */
.tmpl-ink-wash {
  background: radial-gradient(ellipse at 30% 70%, #1a0a00, #0a0a1a 60%, #001a0a);
  position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
```

- [ ] **Step 3.5: Commit**

```bash
git -C "." add lib/agents/types.ts lib/agents/hijri-utils.ts app/styles/card-templates.css
git -C "." commit -m "feat: agent shared types, Hijri utils, and 6 base card template CSS classes"
```

---

## Task 4 — Brief Agent

**Files:**
- Create: `lib/agents/brief-agent.ts`

The Brief Agent queries the DB for underrepresented `(occasionSlug, mood, animationStyle)` combos and asks Claude to pick the 3 best targets for today.

- [ ] **Step 4.1: Create `lib/agents/brief-agent.ts`**

```typescript
// lib/agents/brief-agent.ts
import { anthropic } from '@/lib/ai/claude';
import { prisma } from '@/lib/db/prisma';
import { BriefOutput } from './types';
import { findUpcomingOccasion, OCCASION_NAME_TO_SLUG } from './hijri-utils';
import { QURAN_VERSES } from '@/lib/verses/quran-data';

// Returns today's brief: which 3 cards to generate.
export async function runBriefAgent(): Promise<BriefOutput> {
  // 1. Find upcoming occasion (or fall back to "general")
  const upcoming = findUpcomingOccasion(14);
  const occasionName = upcoming?.name ?? 'General';
  const occasionSlug = OCCASION_NAME_TO_SLUG[occasionName] ?? 'general';
  const daysUntil    = upcoming?.daysUntil ?? 0;

  // 2. Query DB for existing AI card distribution
  const existing = await prisma.cardTemplate.groupBy({
    by: ['mood', 'animationStyle'],
    where: { isAiGenerated: true },
    _count: { id: true },
  });

  const existingJson = JSON.stringify(existing.map(e => ({
    mood:          e.mood,
    animationStyle: e.animationStyle,
    count:         e._count.id,
  })));

  const availableMoods      = ['reverent','peaceful','celebratory','joyful'];
  const availableAnimations = [
    'particle-burst','calligraphy-write-on','liquid-warp',
    'starfall','aurora-drift','ink-bloom','light-rays',
  ];
  const availableShapes = ['circle','hexagon','diamond','rectangle','arch','blob'];

  const prompt = `You are the Brief Agent for an Islamic ecard platform.

Today's occasion: ${occasionName} (${daysUntil} days away)
Occasion slug: ${occasionSlug}

Existing AI-generated cards distribution (mood × animationStyle counts):
${existingJson || '(none yet)'}

Available moods: ${availableMoods.join(', ')}
Available animation styles: ${availableAnimations.join(', ')}
Available shapes: ${availableShapes.join(', ')}

Pick exactly 3 card targets that:
1. Are appropriate for the occasion
2. Prefer underrepresented mood × animationStyle combinations
3. Use visually distinct shapes from each other

Return ONLY a JSON object, no markdown, no commentary:
{
  "occasion": "${occasionName}",
  "occasionSlug": "${occasionSlug}",
  "daysUntil": ${daysUntil},
  "targets": [
    { "mood": "...", "shape": "...", "animationGap": "..." },
    { "mood": "...", "shape": "...", "animationGap": "..." },
    { "mood": "...", "shape": "...", "animationGap": "..." }
  ]
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const parsed: BriefOutput = JSON.parse(text.trim());

  if (!parsed.targets || parsed.targets.length !== 3) {
    throw new Error('Brief Agent returned unexpected target count: ' + parsed.targets?.length);
  }
  return parsed;
}
```

- [ ] **Step 4.2: Commit**

```bash
git -C "." add lib/agents/brief-agent.ts
git -C "." commit -m "feat: Brief Agent — selects 3 daily card targets"
```

---

## Task 5 — Designer Agent

**Files:**
- Create: `lib/agents/designer-agent.ts`

The Designer Agent takes one target spec and picks a template, verse, palette, and accent description.

- [ ] **Step 5.1: Create `lib/agents/designer-agent.ts`**

```typescript
// lib/agents/designer-agent.ts
import { anthropic } from '@/lib/ai/claude';
import { CardTarget, DesignerOutput, TEMPLATE_LIBRARY } from './types';
import { QURAN_VERSES } from '@/lib/verses/quran-data';

export async function runDesignerAgent(target: CardTarget): Promise<DesignerOutput> {
  // Filter templates that accept the target's shape
  const compatibleTemplates = TEMPLATE_LIBRARY.filter(t =>
    (t.shapes as readonly string[]).includes(target.shape)
  );
  if (compatibleTemplates.length === 0) {
    throw new Error(`No template compatible with shape: ${target.shape}`);
  }

  // Get relevant verses for the mood
  const moodToOccasions: Record<string, string[]> = {
    reverent:    ['ramadan','laylatul-qadr','general','hajj'],
    peaceful:    ['general','ramadan','jummah'],
    celebratory: ['eid-ul-fitr','eid-ul-adha','nikah','aqiqah'],
    joyful:      ['eid-ul-fitr','nikah','graduation','aqiqah'],
  };
  const relevantOccasions = moodToOccasions[target.mood] ?? ['general'];
  const relevantVerses = QURAN_VERSES.filter(v =>
    v.occasions.some(o => relevantOccasions.includes(o))
  );
  const versesSummary = relevantVerses.slice(0, 10).map(v =>
    `ref:${v.ref} | "${v.textEn.slice(0,60)}..." | occasions:${v.occasions.join(',')}`
  ).join('\n');

  const templateList = compatibleTemplates.map(t =>
    `id:${t.id} name:"${t.name}" shapes:${t.shapes.join(',')}`
  ).join('\n');

  const prompt = `You are the Designer Agent for an Islamic ecard platform.

Card target:
- Mood: ${target.mood}
- Shape: ${target.shape}
- Animation concept: ${target.animationGap}

Compatible base templates:
${templateList}

Relevant Quranic verses (ref | text preview | occasions):
${versesSummary}

Design a card by selecting:
1. A templateId from the list above
2. A Quranic verse from the list above (use the exact ref format like "2:255")
3. A colour palette of 2-3 hex values matching the mood (dark bg + accent colours)
4. A one-paragraph plain-English description of the accent animation that implements the "${target.animationGap}" concept

Return ONLY a JSON object, no markdown:
{
  "templateId": "...",
  "verse": {
    "arabic": "...",
    "transliteration": "...",
    "reference": "Surah [Name] [surah]:[ayah]",
    "translation": "..."
  },
  "palette": ["#xxxxxx","#xxxxxx","#xxxxxx"],
  "shape": "${target.shape}",
  "accentDescription": "..."
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const parsed: DesignerOutput = JSON.parse(text.trim());
  return parsed;
}
```

- [ ] **Step 5.2: Commit**

```bash
git -C "." add lib/agents/designer-agent.ts
git -C "." commit -m "feat: Designer Agent — selects template, verse, palette per card target"
```

---

## Task 6 — Motion Agent

**Files:**
- Create: `lib/agents/motion-agent.ts`

The Motion Agent writes accent CSS + JS that implements the `accentDescription`. All selectors must be prefixed `.accent-` to avoid conflicts.

- [ ] **Step 6.1: Create `lib/agents/motion-agent.ts`**

```typescript
// lib/agents/motion-agent.ts
import { anthropic } from '@/lib/ai/claude';
import { DesignerOutput, MotionOutput } from './types';

export async function runMotionAgent(
  designer: DesignerOutput,
  retryNote?: string
): Promise<MotionOutput> {
  const retrySection = retryNote
    ? `\n\nPrevious attempt failed with this note — fix it:\n${retryNote}\n`
    : '';

  const prompt = `You are the Motion Agent for an Islamic ecard platform. Write the CSS and JS for a card's accent animation.${retrySection}

Card spec:
- Template: ${designer.templateId}
- Shape: ${designer.shape}
- Colour palette: ${designer.palette.join(', ')}
- Accent animation to implement: "${designer.accentDescription}"

Rules:
1. ALL CSS selectors must be prefixed with ".accent-" (e.g. .accent-particle, .accent-clip)
2. Use only pure CSS keyframes and/or vanilla JS — no external libraries
3. If you need a clip path for the shape, provide it as an SVG <clipPath> element
4. Keep the total output compact — accent CSS under 80 lines, accent JS under 60 lines
5. The accent JS (if any) must be a self-contained IIFE: (function(){ ... })();

Return ONLY a JSON object, no markdown:
{
  "accentCss":  "/* pure CSS string */",
  "accentJs":   "/* IIFE JS string or null */",
  "shapeSvg":   "/* SVG string with a <clipPath id=\\"accent-clip\\"> or null */"
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const parsed: MotionOutput = JSON.parse(text.trim());
  return parsed;
}
```

- [ ] **Step 6.2: Commit**

```bash
git -C "." add lib/agents/motion-agent.ts
git -C "." commit -m "feat: Motion Agent — writes accent CSS/JS for card animations"
```

---

## Task 7 — QA Agent

**Files:**
- Create: `lib/agents/qa-agent.ts`

The QA Agent validates the accent code before publishing. It checks CSS validity, JS validity, Islamic appropriateness, and selector isolation.

- [ ] **Step 7.1: Create `lib/agents/qa-agent.ts`**

```typescript
// lib/agents/qa-agent.ts
import { anthropic } from '@/lib/ai/claude';
import { DesignerOutput, MotionOutput, QAResult } from './types';
import { QURAN_VERSES } from '@/lib/verses/quran-data';

// Local checks that don't need a Claude call
function localCssValid(css: string): boolean {
  const opens  = (css.match(/{/g) || []).length;
  const closes = (css.match(/}/g) || []).length;
  return opens === closes && opens > 0;
}

function localJsValid(js: string | null): boolean {
  if (!js) return true;
  const opens  = (js.match(/[{([]/g) || []).length;
  const closes = (js.match(/[})\]]/g) || []).length;
  return opens === closes;
}

function localNoConflicts(css: string): boolean {
  // All selectors that contain a class must start with .accent-
  const classSelectors = css.match(/\.[a-z][a-z0-9-]*/gi) || [];
  return classSelectors.every(s => s.startsWith('.accent-'));
}

function localVerseValid(reference: string): boolean {
  // Extract "surah:ayah" pattern from reference like "Surah Al-Baqarah 2:255"
  const match = reference.match(/(\d+):(\d+)/);
  if (!match) return false;
  const ref = `${match[1]}:${match[2]}`;
  return QURAN_VERSES.some(v => v.ref === ref);
}

export async function runQAAgent(
  designer: DesignerOutput,
  motion: MotionOutput
): Promise<QAResult> {
  // Run local checks first (fast, no API cost)
  const cssValid    = localCssValid(motion.accentCss);
  const jsValid     = localJsValid(motion.accentJs);
  const noConflicts = localNoConflicts(motion.accentCss);
  const verseKnown  = localVerseValid(designer.verse.reference);

  if (!cssValid) {
    return { pass: false, checks: { cssValid, jsValid: true, islamicAppropriate: true, noConflicts: true }, failedCheck: 'cssValid', note: 'Unmatched braces in accentCss' };
  }
  if (!jsValid) {
    return { pass: false, checks: { cssValid: true, jsValid, islamicAppropriate: true, noConflicts: true }, failedCheck: 'jsValid', note: 'Unmatched brackets in accentJs' };
  }
  if (!noConflicts) {
    return { pass: false, checks: { cssValid: true, jsValid: true, islamicAppropriate: true, noConflicts }, failedCheck: 'noConflicts', note: 'CSS selectors must all be prefixed .accent-' };
  }

  // Ask Claude to check Islamic appropriateness
  const prompt = `You are a QA agent reviewing an Islamic ecard for content appropriateness.

Verse reference: "${designer.verse.reference}"
Verse text: "${designer.verse.arabic}" — "${designer.verse.translation}"
Verse is in known database: ${verseKnown ? 'YES' : 'NO — FLAG THIS'}
Accent description: "${designer.accentDescription}"

Check: Does this card contain anything that conflicts with Islamic values?
- No human/animal figurative imagery in the animation description
- No musical instruments described
- No content that contradicts Islamic principles
- Verse reference should exist in a known Quran database

Return ONLY JSON:
{ "islamicAppropriate": true/false, "note": "reason if false, empty string if true" }`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '{"islamicAppropriate":true,"note":""}';
  const { islamicAppropriate, note } = JSON.parse(text.trim()) as { islamicAppropriate: boolean; note: string };

  if (!islamicAppropriate) {
    return {
      pass: false,
      checks: { cssValid: true, jsValid: true, islamicAppropriate: false, noConflicts: true },
      failedCheck: 'islamicAppropriate',
      note,
    };
  }

  return {
    pass: true,
    checks: { cssValid: true, jsValid: true, islamicAppropriate: true, noConflicts: true },
  };
}
```

- [ ] **Step 7.2: Commit**

```bash
git -C "." add lib/agents/qa-agent.ts
git -C "." commit -m "feat: QA Agent — validates CSS, JS, Islamic appropriateness, selector isolation"
```

---

## Task 8 — Publisher Agent

**Files:**
- Create: `lib/agents/publisher-agent.ts`

The Publisher Agent writes the approved card to the DB with `status: "pending_review"` and sends an admin notification email.

- [ ] **Step 8.1: Create `lib/agents/publisher-agent.ts`**

```typescript
// lib/agents/publisher-agent.ts
import { createHmac } from 'crypto';
import { Resend } from 'resend';
import { prisma } from '@/lib/db/prisma';
import { BriefOutput, CardSpec } from './types';

const resend = new Resend(process.env.RESEND_API_KEY);

// Signs a cardId for use in the one-click reject link
function signCardId(cardId: string): string {
  return createHmac('sha256', process.env.AUTH_SECRET!)
    .update(cardId)
    .digest('hex');
}

export async function runPublisherAgent(
  brief: BriefOutput,
  spec: CardSpec
): Promise<{ cardId: string }> {
  const publishAt = new Date(Date.now() + 30 * 60 * 1000); // +30 minutes

  // Resolve occasionId from slug
  const occasion = await prisma.occasion.findUnique({
    where: { slug: brief.occasionSlug },
  });
  if (!occasion) throw new Error(`Occasion not found for slug: ${brief.occasionSlug}`);

  // Build a unique slug for the generated card
  const slug = `ai-${brief.occasionSlug}-${spec.target.mood}-${Date.now()}`;

  const card = await prisma.cardTemplate.create({
    data: {
      slug,
      titleEn:       `${brief.occasion} — ${spec.target.mood} (AI)`,
      titleAr:       spec.designer.verse.arabic.slice(0, 40),
      occasionId:    occasion.id,
      animationFile: '',         // accent code replaces Lottie for AI cards
      bgImageUrl:    '',
      bgColor:       spec.designer.palette[0] ?? '#1a3a2a',
      isAiGenerated: true,
      status:        'pending_review',
      publishAt,
      accentCss:     spec.motion.accentCss,
      accentJs:      spec.motion.accentJs ?? null,
      shapeSvg:      spec.motion.shapeSvg ?? null,
      mood:          spec.target.mood,
      animationStyle: spec.target.animationGap,
      generatedAt:   new Date(),
    },
  });

  // Send override notification email
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const previewUrl = `${appUrl}/admin/cards/preview/${card.id}`;
  const rejectUrl  = `${appUrl}/api/agents/reject-card?id=${card.id}&token=${signCardId(card.id)}`;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    await resend.emails.send({
      from: `Noor Cards AI <noreply@${process.env.RESEND_DOMAIN ?? 'resend.dev'}>`,
      to:   adminEmail,
      subject: `New AI card ready: ${brief.occasion} / ${spec.target.mood}`,
      html: buildAdminEmail({ card, brief, spec, previewUrl, rejectUrl, publishAt }),
    });
  }

  return { cardId: card.id };
}

function buildAdminEmail(params: {
  card:       { id: string; titleEn: string };
  brief:      BriefOutput;
  spec:       CardSpec;
  previewUrl: string;
  rejectUrl:  string;
  publishAt:  Date;
}): string {
  const { card, brief, spec, previewUrl, rejectUrl, publishAt } = params;
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:32px;background:#f5f5f5">
  <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e0e0e0">
    <h2 style="margin:0 0 8px">🌙 New AI Card Ready for Review</h2>
    <p style="margin:0 0 20px;color:#666">Auto-publishes at <strong>${publishAt.toUTCString()}</strong> unless rejected.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr><td style="padding:4px 8px;color:#888;width:120px">Card</td><td><strong>${card.titleEn}</strong></td></tr>
      <tr><td style="padding:4px 8px;color:#888">Occasion</td><td>${brief.occasion}</td></tr>
      <tr><td style="padding:4px 8px;color:#888">Mood</td><td>${spec.target.mood}</td></tr>
      <tr><td style="padding:4px 8px;color:#888">Shape</td><td>${spec.target.shape}</td></tr>
      <tr><td style="padding:4px 8px;color:#888">Animation</td><td>${spec.target.animationGap}</td></tr>
      <tr><td style="padding:4px 8px;color:#888">Verse</td><td>${spec.designer.verse.reference}</td></tr>
    </table>
    <div style="display:flex;gap:12px">
      <a href="${previewUrl}" style="flex:1;text-align:center;display:block;background:#1a3a2a;color:#fff;padding:12px;border-radius:8px;text-decoration:none;font-weight:600">Preview Card</a>
      <a href="${rejectUrl}"  style="flex:1;text-align:center;display:block;background:#fee2e2;color:#b91c1c;padding:12px;border-radius:8px;text-decoration:none;font-weight:600">Reject</a>
    </div>
  </div>
</body></html>`;
}
```

- [ ] **Step 8.2: Add `ADMIN_EMAIL` to `.env.local`**

Open `.env.local` and add:
```
ADMIN_EMAIL=your-email@example.com
```

- [ ] **Step 8.3: Commit**

```bash
git -C "." add lib/agents/publisher-agent.ts
git -C "." commit -m "feat: Publisher Agent — writes pending_review card, sends admin notification"
```

---

## Task 9 — Orchestrator API Route

**Files:**
- Create: `app/api/agents/daily-cards/route.ts`

This route runs the full 5-agent pipeline. It is called by the Vercel cron at 04:00 UTC daily, and by `npm run agents:run` locally.

- [ ] **Step 9.1: Write a Playwright test for the route**

Create `tests/agents/daily-cards.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

// Requires a running dev server and real DB + API keys
test('POST /api/agents/daily-cards returns 200 with generated card IDs', async ({ request }) => {
  const response = await request.post('/api/agents/daily-cards', {
    headers: { 'x-cron-secret': process.env.CRON_SECRET ?? '' },
  });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body).toHaveProperty('generated');
  expect(Array.isArray(body.generated)).toBe(true);
});

test('POST /api/agents/daily-cards returns 429 on second call within 23 hours', async ({ request }) => {
  // First call should succeed (or already ran today — 429 is acceptable on first too)
  await request.post('/api/agents/daily-cards', {
    headers: { 'x-cron-secret': process.env.CRON_SECRET ?? '' },
  });
  // Second call within the same test run should be rate-limited
  const second = await request.post('/api/agents/daily-cards', {
    headers: { 'x-cron-secret': process.env.CRON_SECRET ?? '' },
  });
  expect(second.status()).toBe(429);
});
```

- [ ] **Step 9.2: Run the test to confirm it fails (no route yet)**

```bash
cd islamic-ecards && npx playwright test tests/agents/daily-cards.spec.ts --reporter=line
```

Expected: both tests fail with connection error or 404.

- [ ] **Step 9.3: Create `app/api/agents/daily-cards/route.ts`**

```typescript
// app/api/agents/daily-cards/route.ts
import { prisma } from '@/lib/db/prisma';
import { runBriefAgent }    from '@/lib/agents/brief-agent';
import { runDesignerAgent } from '@/lib/agents/designer-agent';
import { runMotionAgent }   from '@/lib/agents/motion-agent';
import { runQAAgent }       from '@/lib/agents/qa-agent';
import { runPublisherAgent } from '@/lib/agents/publisher-agent';

const MAX_RETRIES = 2;

// Rate-limit key stored in DB: a CardTemplate with slug "agent-run-lock"
async function getRateLimitRecord() {
  return prisma.cardTemplate.findUnique({ where: { slug: 'agent-run-lock' } });
}

async function setRateLimitRecord() {
  const now = new Date();
  await prisma.cardTemplate.upsert({
    where:  { slug: 'agent-run-lock' },
    create: {
      slug: 'agent-run-lock', titleEn: '__rate_limit__', titleAr: '',
      occasionId: (await prisma.occasion.findFirst({ select: { id: true } }))!.id,
      animationFile: '', bgImageUrl: '', generatedAt: now,
    },
    update: { generatedAt: now },
  });
}

export async function POST(request: Request) {
  // Verify cron secret (Vercel sets this automatically; we check for local dev too)
  const cronSecret = request.headers.get('x-cron-secret');
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return new Response('Forbidden', { status: 403 });
  }

  // Rate limit: max 1 run per 23 hours
  const lockRecord = await getRateLimitRecord();
  if (lockRecord?.generatedAt) {
    const elapsed = Date.now() - lockRecord.generatedAt.getTime();
    if (elapsed < 23 * 60 * 60 * 1000) {
      return new Response(
        JSON.stringify({ error: 'Rate limited — run already completed within last 23 hours' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  const generated: string[] = [];
  const skipped:   string[] = [];

  try {
    // Agent 1: Brief
    const brief = await runBriefAgent();

    // Agents 2–5: per target
    for (const target of brief.targets) {
      let designer, motion, qaResult;

      try {
        // Agent 2: Designer
        designer = await runDesignerAgent(target);

        // Agent 3 + 4: Motion + QA with retry loop
        let retryNote: string | undefined;
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          motion   = await runMotionAgent(designer, retryNote);
          qaResult = await runQAAgent(designer, motion);

          if (qaResult.pass) break;

          if (attempt === MAX_RETRIES) {
            throw new Error(`QA failed after ${MAX_RETRIES + 1} attempts: ${qaResult.note}`);
          }
          retryNote = `${qaResult.failedCheck}: ${qaResult.note}`;
        }

        // Agent 5: Publisher
        const { cardId } = await runPublisherAgent(brief, { target, designer: designer!, motion: motion! });
        generated.push(cardId);

      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[daily-cards] Skipping target ${target.mood}/${target.shape}: ${msg}`);
        skipped.push(`${target.mood}/${target.shape}: ${msg}`);
      }
    }

    // Record the successful run for rate-limiting
    await setRateLimitRecord();

    return new Response(
      JSON.stringify({ generated, skipped }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[daily-cards] Pipeline error:', msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

- [ ] **Step 9.4: Add `agents:run` script to `package.json`**

In `package.json`, add to the `"scripts"` object:

```json
"agents:run": "curl -s -X POST http://localhost:3000/api/agents/daily-cards -H 'Content-Type: application/json' | jq ."
```

- [ ] **Step 9.5: Add `CRON_SECRET` to `.env.local`**

```
CRON_SECRET=some-random-secret-string
```

- [ ] **Step 9.6: Run the Playwright tests**

```bash
# Start dev server in another terminal first: npm run dev
npx playwright test tests/agents/daily-cards.spec.ts --reporter=line
```

Expected: both tests pass. (The first call runs the full pipeline and returns 200; the second call immediately returns 429.)

- [ ] **Step 9.7: Commit**

```bash
git -C "." add app/api/agents/daily-cards/ package.json
git -C "." commit -m "feat: daily-cards orchestrator route with rate limiting + retry loop"
```

---

## Task 10 — Reject Endpoint + Publish-Pending Cron

**Files:**
- Create: `app/api/agents/reject-card/route.ts`
- Create: `app/api/cron/publish-pending/route.ts`

- [ ] **Step 10.1: Create `app/api/agents/reject-card/route.ts`**

This route is called by the one-click reject link in the admin email. It uses an HMAC token so no login is required.

```typescript
// app/api/agents/reject-card/route.ts
import { createHmac } from 'crypto';
import { prisma } from '@/lib/db/prisma';

function verifyToken(cardId: string, token: string): boolean {
  const expected = createHmac('sha256', process.env.AUTH_SECRET!)
    .update(cardId)
    .digest('hex');
  return expected === token;
}

export async function GET(request: Request) {
  const url      = new URL(request.url);
  const cardId   = url.searchParams.get('id')    ?? '';
  const token    = url.searchParams.get('token') ?? '';

  if (!cardId || !token) {
    return new Response('Missing id or token', { status: 400 });
  }

  if (!verifyToken(cardId, token)) {
    return new Response('Invalid token', { status: 403 });
  }

  const card = await prisma.cardTemplate.findUnique({ where: { id: cardId } });
  if (!card) {
    return new Response('Card not found', { status: 404 });
  }
  if (card.status !== 'pending_review') {
    return new Response(`Card already ${card.status}`, { status: 409 });
  }

  await prisma.cardTemplate.update({
    where:  { id: cardId },
    data:   { status: 'rejected', rejectedAt: new Date() },
  });

  return new Response(
    `<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:60px">
      <h2>Card rejected ✓</h2>
      <p style="color:#666">"${card.titleEn}" will not be published.</p>
    </body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  );
}
```

- [ ] **Step 10.2: Create `app/api/cron/publish-pending/route.ts`**

This cron runs every 5 minutes. It finds `pending_review` cards whose `publishAt` has passed and flips them to `published`. Safe to run multiple times (idempotent).

```typescript
// app/api/cron/publish-pending/route.ts
import { prisma } from '@/lib/db/prisma';

export async function POST() {
  const now = new Date();

  const updated = await prisma.cardTemplate.updateMany({
    where: {
      status:    'pending_review',
      publishAt: { lte: now },
      rejectedAt: null,
    },
    data: { status: 'published' },
  });

  return new Response(
    JSON.stringify({ published: updated.count }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
```

- [ ] **Step 10.3: Update `vercel.json` to add cron jobs**

Open `vercel.json`. Current content:
```json
{
  "crons": [
    { "path": "/api/cron/send-scheduled", "schedule": "* * * * *" }
  ]
}
```

Replace with:
```json
{
  "crons": [
    { "path": "/api/cron/send-scheduled",    "schedule": "* * * * *"  },
    { "path": "/api/agents/daily-cards",     "schedule": "0 4 * * *"  },
    { "path": "/api/cron/publish-pending",   "schedule": "*/5 * * * *" }
  ]
}
```

- [ ] **Step 10.4: Verify reject endpoint manually**

With dev server running, generate a card via `npm run agents:run`. Get the `cardId` from the output. Then:

```bash
# Get HMAC token (same algorithm as publisher-agent.ts)
node -e "
const { createHmac } = require('crypto');
const id = 'REPLACE_WITH_CARD_ID';
const token = createHmac('sha256', process.env.AUTH_SECRET).update(id).digest('hex');
console.log('http://localhost:3000/api/agents/reject-card?id=' + id + '&token=' + token);
"
```

Open the URL in a browser. Expected: "Card rejected ✓" page. Verify in `npm run db:studio` that `status = "rejected"`.

- [ ] **Step 10.5: Verify publish-pending endpoint**

```bash
curl -s -X POST http://localhost:3000/api/cron/publish-pending | jq .
```

Expected: `{ "published": 0 }` (or a positive number if there are pending cards whose `publishAt` has passed).

- [ ] **Step 10.6: Commit**

```bash
git -C "." add app/api/agents/reject-card/ app/api/cron/publish-pending/ vercel.json
git -C "." commit -m "feat: reject-card endpoint (HMAC), publish-pending cron, vercel.json cron schedule"
```

---

## Task 11 — Admin Preview Page

**Files:**
- Create: `app/admin/cards/preview/[id]/page.tsx`

This server-side page lets the admin preview a pending AI card before it auto-publishes.

- [ ] **Step 11.1: Create `app/admin/cards/preview/[id]/page.tsx`**

```typescript
// app/admin/cards/preview/[id]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCardPreview({ params }: PageProps) {
  const { id } = await params;

  const card = await prisma.cardTemplate.findUnique({
    where:   { id },
    include: { occasion: true },
  });

  if (!card) notFound();

  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const rejectHref = `/api/agents/reject-card?id=${card.id}&token=__SIGN_IN_REQUIRED__`;

  const statusColour =
    card.status === 'published'      ? '#16a34a' :
    card.status === 'pending_review' ? '#d97706' : '#dc2626';

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '4px' }}>Card Preview</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>{card.titleEn}</p>

      {/* Status badge */}
      <div style={{ marginBottom: '20px' }}>
        <span style={{ background: statusColour, color: '#fff', borderRadius: '999px', padding: '4px 12px', fontSize: '0.82rem' }}>
          {card.status}
        </span>
        {card.publishAt && card.status === 'pending_review' && (
          <span style={{ marginLeft: '12px', color: '#888', fontSize: '0.85rem' }}>
            Auto-publishes at {card.publishAt.toUTCString()}
          </span>
        )}
      </div>

      {/* Card preview — accent code runs in an iframe for sandboxing */}
      <iframe
        srcDoc={buildCardPreviewDoc(card)}
        style={{ width: '320px', height: '440px', border: 'none', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
        sandbox="allow-scripts"
        title="Card preview"
      />

      {/* Card details */}
      <table style={{ marginTop: '24px', borderCollapse: 'collapse', width: '100%' }}>
        {[
          ['Occasion',   card.occasion?.nameEn ?? '—'],
          ['Mood',       card.mood ?? '—'],
          ['Animation',  card.animationStyle ?? '—'],
          ['Shape',      card.shapeSvg ? 'custom SVG' : '—'],
          ['AI card',    card.isAiGenerated ? 'Yes' : 'No'],
          ['Created',    card.createdAt.toUTCString()],
        ].map(([label, value]) => (
          <tr key={label} style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px', color: '#888', width: '140px' }}>{label}</td>
            <td style={{ padding: '8px' }}>{value}</td>
          </tr>
        ))}
      </table>

      {/* Reject button — only shown for pending cards */}
      {card.status === 'pending_review' && (
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <a
            href={`/api/agents/reject-card?id=${card.id}&token=SIGN_IN_TO_REJECT`}
            style={{ padding: '10px 24px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}
          >
            Reject Card
          </a>
          <span style={{ color: '#888', fontSize: '0.82rem', alignSelf: 'center' }}>
            (Use the reject link from the notification email — it includes the auth token)
          </span>
        </div>
      )}
    </div>
  );
}

function buildCardPreviewDoc(card: {
  bgColor:       string;
  accentCss:     string | null;
  accentJs:      string | null;
  shapeSvg:      string | null;
  animationStyle?: string | null;
}): string {
  // Map animationStyle back to a template class — stored on the card as animationStyle
  // The Designer Agent sets templateId; we stored it in animationStyle field as a fallback.
  // For preview, use bgColor as the background regardless.
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { margin: 0; width: 320px; height: 440px; overflow: hidden; }
  .card-root {
    width: 100%; height: 100%;
    background: ${card.bgColor};
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  ${card.accentCss ?? ''}
</style>
</head>
<body>
  ${card.shapeSvg ?? ''}
  <div class="card-root">
    <div class="accent-container"></div>
  </div>
  ${card.accentJs ? `<script>${card.accentJs}</script>` : ''}
</body>
</html>`;
}
```

- [ ] **Step 11.2: Verify the admin preview page loads**

With dev server running:

```bash
# First generate a card if you haven't already
npm run agents:run
# Get a pending card ID
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.cardTemplate.findFirst({ where: { status: 'pending_review' } }).then(c => {
  console.log('Preview URL: http://localhost:3000/admin/cards/preview/' + c.id);
  p.\$disconnect();
});
"
```

Open the URL. Expected: card title, status badge showing "pending_review", iframe with the card's `bgColor`, details table with mood/animation/occasion.

- [ ] **Step 11.3: Commit**

```bash
git -C "." add app/admin/cards/preview/
git -C "." commit -m "feat: admin preview page for pending AI-generated cards"
```

---

## Task 12 — End-to-End Pipeline Smoke Test

**Files:**
- No new files — verifies the full pipeline works together

- [ ] **Step 12.1: Run the full pipeline end-to-end**

```bash
cd islamic-ecards && npm run dev &
sleep 3
npm run agents:run
```

Expected output (example):
```json
{
  "generated": ["cuid1", "cuid2", "cuid3"],
  "skipped": []
}
```

- [ ] **Step 12.2: Verify pending cards in DB**

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.cardTemplate.findMany({ where: { isAiGenerated: true } }).then(cards => {
  cards.forEach(c => console.log(c.id, c.status, c.mood, c.animationStyle));
  p.\$disconnect();
});
"
```

Expected: 3 rows with `status = "pending_review"`, each with a different `mood`.

- [ ] **Step 12.3: Trigger publish-pending manually**

```bash
curl -s -X POST http://localhost:3000/api/cron/publish-pending | jq .
```

Expected: `{ "published": 0 }` (cards aren't due yet — they have `publishAt = now + 30m`).

Wait 2 minutes, then set `publishAt` to the past manually via Studio, then re-run:

```bash
npm run db:studio
# In Studio: find the pending cards, set publishAt to 2 minutes ago, save
curl -s -X POST http://localhost:3000/api/cron/publish-pending | jq .
# Expected: { "published": 3 }
```

- [ ] **Step 12.4: Final commit**

```bash
git -C "." add -A
git -C "." commit -m "feat: complete homepage-v3 + daily card agent pipeline"
```

---

## Environment Variables Checklist

Before deploying to Vercel, confirm all of these are set in project settings:

| Variable            | Purpose                                      |
|---------------------|----------------------------------------------|
| `ANTHROPIC_API_KEY` | Claude API (already set)                     |
| `DATABASE_URL`      | PostgreSQL (already set)                     |
| `AUTH_SECRET`       | Signs HMAC reject tokens (already set)       |
| `RESEND_API_KEY`    | Notification emails (already set)            |
| `RESEND_DOMAIN`     | Email from domain (already set)              |
| `ADMIN_EMAIL`       | Where override notifications are sent (new)  |
| `NEXT_PUBLIC_APP_URL` | Preview + reject link base URL (already set) |
| `CRON_SECRET`       | Optional — protects cron endpoints (new)     |

---

## Phase 6 (Future) — Visual Port to Next.js

After the prototype is approved and the agent pipeline is deployed, port the v3 homepage visuals into the real app:

- Move the V3 CSS additions into `app/globals.css`
- Convert the V3 JS additions into a `use client` component `components/homepage/V3Effects.tsx`
- Replace `app/[locale]/page.tsx` hero section with the new greeting pill + card reel
- Wire the masonry grid to the live `CardTemplate` DB query (filter by `status: "published"`, sorted by `createdAt` desc)
- Wire the flip modal's "Send Card" button to the real `/en/customize/[cardId]` route

This phase is left for a separate plan once the agent pipeline is confirmed working in production.
