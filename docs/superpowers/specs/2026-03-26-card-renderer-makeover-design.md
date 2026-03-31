# Card Renderer Makeover — Design Spec

**Date:** 2026-03-26
**Sub-project:** #1 of 5 — Highest Impact
**Status:** Approved

---

## Goal

Replace the current static card display with a cinematic, data-driven card renderer where each occasion has its own signature opening animation — with animated Islamic art objects that reveal inside. All 4,000+ planned cards share one renderer component driven entirely by theme data.

## Architecture Overview

One React component — `<ECard>` — reads a `CardTheme` object and renders the full experience. No custom component per card. 4,000 cards = 4,000 data entries, one renderer.

```
<ECard theme={...}>
  └── <CardShell animation={theme.animation}>  — routes to correct animation component
      └── <ArtLayer tier={theme.art.tier}>      — Tier 1–4 art inside the reveal
```

`CardShell` is a router — it renders one of 5 animation components based on `theme.animation`. All share the same `ArtLayer` inside.

### Homepage Integration

- **Hero Spotlight** (top ~60vh): 3–4 large cards, calendar-curated, full open interaction on hover
- **Discover Grid** (bottom, scrollable): compact grid with occasion-category tabs, lightweight 2D CSS flip preview on hover only

---

## Card Opening Animations — 5 Signature Styles

Each occasion has its own opening animation. The `theme.animation` field selects which one renders.

### Animation → Occasion Mapping

| Animation | `theme.animation` | Default occasions | Feel |
|-----------|-------------------|-------------------|------|
| Wax Seal Envelope | `envelope` | `general`, `jumuah` | Intimate, personal |
| Mosaic Shatter | `mosaic` | `islamic-new-year` | Dramatic, uniquely Islamic |
| Lantern Light Burst | `lantern` | `ramadan` | Cinematic, warm |
| Sacred Doors | `doors` | `hajj`, `eid-al-adha` | Reverent, ornate |
| Starburst Portal | `portal` | `eid-al-fitr`, `mawlid` | Bold, celebratory |

Any card can override its default — `theme.animation` is just a field.

### Animation Descriptions

**① Wax Seal Envelope** (`envelope`)
Closed card looks like a sealed envelope with Islamic geometric pattern. Click breaks the wax seal (☪️), flap folds back, card slides up out of the envelope revealing content inside.

**② Mosaic Shatter** (`mosaic`)
Card face is covered in Islamic geometric tessellation tiles. On click, all 20 tiles scatter outward in different directions, revealing the art and verse beneath. Uniquely Islamic aesthetic.

**③ Lantern Light Burst** (`lantern`)
Card opens in darkness — only a glowing lantern is visible. Click and warm amber light bursts outward from the lantern filling the card, revealing the full scene. Perfect for Ramadan.

**④ Sacred Doors** (`doors`)
Two ornate doors with gold stripe decorations and knobs face the viewer. Click and they swing open (CSS 3D rotateY) revealing the art scene behind them. Reverent, shrine-like.

**⑤ Starburst Portal** (`portal`)
A rotating star ring orbits the card face. Click triggers a gold portal burst that expands and flashes, dissolving into the revealed card interior. Bold and modern.

### Shared Behaviour (all animations)
- Hover: subtle tilt/glow preview on closed face
- Click: triggers the opening sequence
- Close: clicking again reverses/closes
- All sequences: 0.6–1.0s total, GSAP timelines
- Discover Grid hover: CSS-only 2D flip preview regardless of animation type

---

## Art System — 4 Tiers

The `art.tier` field on `CardTheme` determines which art component renders. The CardShell and TextLayer never change between tiers. Upgrading a card from Lottie to R3F in Phase 2 = one field change in the database.

### Tier 1 — CSS (general / Jumu'ah cards)
- SVG arabesque pattern with CSS keyframe rotation
- Gold shimmer on Arabic text via `background-clip: text` gradient animation
- Zero dependencies, instant load
- Fallback for all cards on low-end devices

### Tier 2 — Lottie (primary art — most cards)
- Library: `@lottiefiles/react-lottie-player` (~14kb gzip)
- Plays on card open, loops or plays once per `theme.art.loop`
- Breakout effect: `transform: scale(1.15) translateZ(50px)` + drop-shadow
- Source: LottieFiles library (2,534+ Islamic animations available)
- `IntersectionObserver` — only initialised when card enters viewport

### Tier 3 — React Three Fiber GLB (Phase 2 — flagship occasions)
- Libraries: `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- Bloom on emissive materials (mosque windows, crescent)
- God rays from minaret (Hajj / Eid al-Adha)
- Lazy loaded — canvas only mounts when card is opened
- Free GLB sources: Sketchfab (Kaaba), CGTrader, TurboSquid

### Tier 4 — AI Image (custom uploaded cards)
- `<img>` with identical breakout transform as Tier 2
- Subtle CSS glow border
- Same GSAP open sequence, different art source
- Supports AI-generated images from Midjourney, DALL-E, Firefly, etc.

---

## Card Data Model

```typescript
type OccasionKey =
  | 'eid-al-fitr'
  | 'eid-al-adha'
  | 'ramadan'
  | 'hajj'
  | 'mawlid'
  | 'jumuah'
  | 'islamic-new-year'
  | 'general'
  | 'custom'

interface CardPalette {
  background: string   // e.g. "#050210"
  primary: string      // e.g. "#f0d080" (gold)
  accent: string       // e.g. "#4ecdc4"
  text: string         // e.g. "#c8b8d0"
}

interface CardArt {
  tier: 'css' | 'lottie' | 'r3f' | 'image'
  src: string          // path to .json | .glb | image file
  loop?: boolean       // Lottie: loop after open (default: false)
  effect?: 'breakout' | 'float' | 'glow'  // breakout = scale+translateZ
}

type AnimationStyle =
  | 'envelope'   // Wax seal envelope — general, jumuah
  | 'mosaic'     // Islamic tile shatter — islamic-new-year
  | 'lantern'    // Lantern light burst — ramadan
  | 'doors'      // Sacred doors open — hajj, eid-al-adha
  | 'portal'     // Starburst portal — eid-al-fitr, mawlid

interface CardTheme {
  id: string
  occasion: OccasionKey
  animation: AnimationStyle   // which opening animation to use
  arabicVerse: string
  arabicLabel: string
  englishMessage: string
  sender?: string
  palette: CardPalette
  art: CardArt
  featured?: boolean    // true = appears in Hero Spotlight
  status: 'draft' | 'review' | 'published' | 'archived'
  createdAt: string
  publishedAt?: string
}
```

### Occasion → Default Art Mapping

| Occasion | Default tier | Default art |
|----------|-------------|-------------|
| `eid-al-fitr` | lottie | crescent + fireworks |
| `eid-al-adha` | lottie | kaaba + geometric rays |
| `ramadan` | lottie | hanging lanterns |
| `hajj` | lottie | tawaf scene |
| `mawlid` | lottie | green dome + flowers |
| `jumuah` | css | minaret + light rays |
| `islamic-new-year` | lottie | crescent + hijri stars |
| `general` | css | arabesque mandala |
| `custom` | image | `art.src` = AI upload URL |

---

## Homepage Layout

### Hero Spotlight (top zone)
- Displays 3–4 `CardTheme` entries with `featured: true`
- Phase 1: manually curated via admin panel
- Phase 4 (sub-project #4): auto-populated by Islamic calendar subagent
- Full Mix 3 hover interaction (tilt peek on hover, full open on click)
- Occasion label displayed: e.g. "Eid al-Fitr is in 12 days"
- Horizontal arrangement, large card size

### Discover Grid (bottom zone)
- Occasion-category tabs: `[Eid] [Ramadan] [Hajj] [Mawlid] [All]`
- Default tab = current or soonest upcoming Islamic occasion
- Pagination (not infinite scroll — better for SEO and performance)
- Each card: occasion label + Arabic text snippet + thumbnail art
- Hover: CSS-only 2D flip preview (no GSAP, no Lottie loading)
- Click: opens full card experience with complete animation sequence
- Lottie and R3F only initialise on card open — not on grid render

---

## Admin & Import Pipeline

### Card States
```
draft → review → published → archived
```
Only `published` cards appear on the homepage and card pages.

### Admin Panel Additions (to existing /admin)

**Card Creator form fields:**
- Occasion selector (auto-fills default palette, verse, art)
- Arabic verse (override)
- Arabic label (override)
- English message
- Sender name (optional)
- Palette colour pickers (override defaults)
- Art tier selector + file upload (for image tier)
- Featured toggle
- Full animation preview before publishing

### AI Image Import Flow
1. Generate image externally (Midjourney, DALL-E, Firefly, etc.)
2. Upload via admin panel → stored to `/public/uploads/cards/`
3. System sets `art.tier = "image"`, `art.src = "/uploads/cards/filename.png"`
4. Set occasion, verse, message → preview → publish
5. Card appears in Discover Grid immediately

### AI Draft Pipeline (Phase 1: form pre-fill)
- AI generates: occasion suggestion, English message, Arabic verse pairing
- Human reviews in admin — edit or approve
- One-click publish
- Full AI pipeline deferred to sub-project #4

---

## Performance Strategy

### Device Tiering (auto-detected)
| Tier | Detection | Effects |
|------|-----------|---------|
| Cinematic (Phase 2+) | Desktop, `hardwareConcurrency >= 8` | R3F + bloom + god rays |
| Premium | Mid-range, `hardwareConcurrency >= 4` | Lottie + CSS 3D + breakout |
| Standard | `hardwareConcurrency < 4` or `saveData` | CSS only, no Lottie |

### Lazy Loading
- Lottie JSON: loaded on `IntersectionObserver` trigger (card enters viewport)
- R3F canvas: mounted only on card open click
- GLB models (Phase 2): lazy import via `useGLTF` with Suspense

---

## Upgrade Path (Phase 2 & 3)

The architecture is explicitly designed for future upgrades with zero breaking changes:

- **Phase 2 upgrade**: Add `ArtLayerR3F` component, set `art.tier = "r3f"` on flagship cards. CardShell, TextLayer, admin panel unchanged.
- **Phase 3 upgrade**: Add `ArtLayerParticles` component (GPU particles, GLSL shaders), set `art.tier = "particles"`. Everything else unchanged.
- **Individual card upgrades**: Any card can be upgraded from Lottie → R3F → Particles independently by changing one field in the database.
- **No migrations required** between phases — additive only.

### Phase 3 Effects (Future)
When budget and audience are established:
- Calligraphy particle reveal (Arabic text assembles from gold particles)
- Volumetric god rays from minaret
- Tawaf simulation (Hajj) — animated pilgrims circling Kaaba
- Physics lanterns (Ramadan) — real physics swing on card open
- Shattering scroll reveal — surface shatters to gold particles on open

---

## Files Affected

### New Files
- `components/cards/ECard.tsx` — main card renderer component
- `components/cards/CardShell.tsx` — animation router (delegates to one of 5 below)
- `components/cards/animations/EnvelopeCard.tsx` — wax seal envelope animation
- `components/cards/animations/MosaicCard.tsx` — Islamic tile shatter animation
- `components/cards/animations/LanternCard.tsx` — lantern light burst animation
- `components/cards/animations/DoorsCard.tsx` — sacred doors open animation
- `components/cards/animations/PortalCard.tsx` — starburst portal animation
- `components/cards/ArtLayer.tsx` — tier router (css/lottie/image)
- `components/cards/ArtLayerCSS.tsx` — Tier 1 CSS art
- `components/cards/ArtLayerLottie.tsx` — Tier 2 Lottie player
- `components/cards/ArtLayerImage.tsx` — Tier 4 AI image
- `components/home/HeroSpotlight.tsx` — homepage top zone
- `components/home/DiscoverGrid.tsx` — homepage bottom zone
- `lib/card-themes/occasions.ts` — OccasionKey + AnimationStyle types + default mappings
- `lib/card-themes/palettes.ts` — default palette per occasion
- `types/card.ts` — CardTheme, CardArt, CardPalette, AnimationStyle interfaces
- `public/lottie/` — Lottie JSON files per occasion

### Modified Files
- `app/page.tsx` — replace current card display with HeroSpotlight + DiscoverGrid
- `app/admin/cards/` — add card creator + import flow
- `prisma/schema.prisma` — add Card model with CardTheme fields

---

## Out of Scope (This Sub-Project)

- R3F GLB models and postprocessing (Phase 2)
- GPU particle effects (Phase 3)
- Auto Islamic calendar feed (sub-project #4)
- Language switching bug fix (sub-project #3 — Homepage v3.1)
- Dark/light mode (sub-project #2)
- All other pages (sub-project #5)
