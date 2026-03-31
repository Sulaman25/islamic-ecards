# Card Renderer Makeover — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current static MasonryGrid/FlipModal card preview on the homepage with a cinematic ECard renderer that has 5 signature occasion-specific opening animations (Envelope, Mosaic, Lantern, Doors, Portal) backed by a 4-tier art system.

**Architecture:** `ECard` is a single client component driven by `ECardData`. `CardShell` routes to one of 5 animation components based on `ECardData.animation`. Each animation component renders `ArtLayer` inside its reveal zone. `HeroSpotlight` and `DiscoverGrid` are server components that fetch `CardTemplate` rows from Prisma, map them to `ECardData`, and pass to client wrappers.

**Tech Stack:** Next.js 16 App Router, React 19, framer-motion v12 (already installed), lottie-react (already installed), Prisma 7, TypeScript strict.

---

## File Map

### New files
| File | Responsibility |
|------|---------------|
| `types/card.ts` | `ECardData`, `AnimationStyle`, `ArtTier`, `ArtConfig`, `CardPalette` types + `toECardData()` helper |
| `lib/card-themes/palettes.ts` | Palette per occasion slug + `getPalette()` |
| `lib/card-themes/occasions.ts` | Default `AnimationStyle` per occasion slug + `getDefaultAnimation()` |
| `components/cards/ArtLayer.tsx` | Routes to CSS/Lottie/Image art based on `ArtConfig.tier` |
| `components/cards/ArtLayerCSS.tsx` | CSS art: animated emoji + arabesque shimmer |
| `components/cards/ArtLayerLottie.tsx` | Lottie player, falls back to CSS art if JSON 404s |
| `components/cards/ArtLayerImage.tsx` | AI-uploaded image with breakout transform |
| `components/cards/CardShell.tsx` | Routes to correct animation component |
| `components/cards/animations/EnvelopeCard.tsx` | Wax-seal envelope open animation |
| `components/cards/animations/MosaicCard.tsx` | Islamic tile shatter animation |
| `components/cards/animations/LanternCard.tsx` | Lantern light burst animation |
| `components/cards/animations/DoorsCard.tsx` | Sacred doors swing open animation |
| `components/cards/animations/PortalCard.tsx` | Starburst portal animation |
| `components/cards/ECard.tsx` | Top-level card component — composes CardShell |
| `components/home/HeroSpotlight.tsx` | Server component — fetches featured cards, renders ECard row |
| `components/home/DiscoverGrid.tsx` | Server component — fetches all published cards, renders tabbed grid |

### Modified files
| File | Change |
|------|--------|
| `app/[locale]/page.tsx` | Replace Featured Carousel + MasonryGrid sections with HeroSpotlight + DiscoverGrid |
| `prisma/seed.ts` | Add 5 seed cards (one per animation style) with correct `animationStyle` values |

---

## Task 1: Types & Helpers

**Files:**
- Create: `types/card.ts`
- Create: `lib/card-themes/palettes.ts`
- Create: `lib/card-themes/occasions.ts`

- [ ] **Step 1: Create `types/card.ts`**

```typescript
// types/card.ts

export type AnimationStyle = 'envelope' | 'mosaic' | 'lantern' | 'doors' | 'portal'

export type ArtTier = 'css' | 'lottie' | 'image'

export interface CardPalette {
  background: string
  primary: string
  accent: string
  text: string
}

export interface ArtConfig {
  tier: ArtTier
  src?: string      // lottie JSON path or image URL
  icon: string      // emoji shown in CSS tier and as fallback
  loop?: boolean    // Lottie: whether to loop after open
}

export interface ECardData {
  id: string
  animation: AnimationStyle
  arabicVerse: string
  arabicLabel: string
  englishMessage: string
  palette: CardPalette
  art: ArtConfig
  occasionSlug: string
  isPremium: boolean
}
```

- [ ] **Step 2: Create `lib/card-themes/palettes.ts`**

```typescript
// lib/card-themes/palettes.ts
import type { CardPalette } from '@/types/card'

const PALETTES: Record<string, CardPalette> = {
  eid:              { background: '#050210', primary: '#f0d080', accent: '#4ecdc4', text: '#c8b8d0' },
  'eid-al-fitr':    { background: '#050210', primary: '#f0d080', accent: '#4ecdc4', text: '#c8b8d0' },
  'eid-al-adha':    { background: '#0c0604', primary: '#e8a020', accent: '#c08010', text: '#d0b890' },
  ramadan:          { background: '#140820', primary: '#ff9040', accent: '#c060a0', text: '#d0b0c8' },
  hajj:             { background: '#080808', primary: '#d4a820', accent: '#c0a030', text: '#c8c0a0' },
  mawlid:           { background: '#040e08', primary: '#40d080', accent: '#20c060', text: '#a0d0b0' },
  jummah:           { background: '#040c10', primary: '#40c0e0', accent: '#20a0c0', text: '#a0c8d8' },
  jumuah:           { background: '#040c10', primary: '#40c0e0', accent: '#20a0c0', text: '#a0c8d8' },
  'islamic-new-year': { background: '#08060e', primary: '#c0a0f0', accent: '#9060e0', text: '#c8b8e8' },
  nikah:            { background: '#100608', primary: '#e080a0', accent: '#c06080', text: '#d0a8b8' },
  aqiqah:           { background: '#060c06', primary: '#80d080', accent: '#40b040', text: '#a8c8a8' },
  general:          { background: '#080418', primary: '#a880f0', accent: '#9060e0', text: '#c0a8e8' },
}

const DEFAULT_PALETTE: CardPalette = PALETTES.general

export function getPalette(occasionSlug: string): CardPalette {
  return PALETTES[occasionSlug] ?? DEFAULT_PALETTE
}
```

- [ ] **Step 3: Create `lib/card-themes/occasions.ts`**

```typescript
// lib/card-themes/occasions.ts
import type { AnimationStyle } from '@/types/card'

const ANIMATION_MAP: Record<string, AnimationStyle> = {
  'eid-al-fitr':      'portal',
  'eid-al-adha':      'doors',
  eid:                'portal',
  ramadan:            'lantern',
  hajj:               'doors',
  mawlid:             'portal',
  jummah:             'envelope',
  jumuah:             'envelope',
  'islamic-new-year': 'mosaic',
  nikah:              'envelope',
  aqiqah:             'envelope',
  general:            'envelope',
}

export function getDefaultAnimation(occasionSlug: string): AnimationStyle {
  return ANIMATION_MAP[occasionSlug] ?? 'envelope'
}
```

- [ ] **Step 4: Add `toECardData` to `types/card.ts`**

Add this import + function at the bottom of `types/card.ts`:

```typescript
import { getPalette } from '@/lib/card-themes/palettes'
import { getDefaultAnimation } from '@/lib/card-themes/occasions'

type CardTemplateRow = {
  id: string
  titleAr: string
  titleEn: string
  animationFile: string
  bgImageUrl: string
  bgColor: string
  isPremium: boolean
  animationStyle: string | null
  occasion: { slug: string; nameEn: string; nameAr: string }
}

export function toECardData(t: CardTemplateRow): ECardData {
  const slug = t.occasion.slug
  const palette = getPalette(slug)

  // override background from bgColor if it's not the schema default
  if (t.bgColor !== '#1a3a2a') palette.background = t.bgColor

  const animationStyle = (t.animationStyle as AnimationStyle | null) ?? getDefaultAnimation(slug)

  // Derive art tier: animationFile path → lottie, bgImageUrl that's not a gradient → image, else css
  const isLottie = t.animationFile.endsWith('.json')
  const isImage  = t.bgImageUrl.startsWith('/uploads/')
  const tier: ArtTier = isLottie ? 'lottie' : isImage ? 'image' : 'css'

  const ICONS: Record<string, string> = {
    'eid-al-fitr': '🌙', 'eid-al-adha': '🕋', eid: '🌙',
    ramadan: '🏮', hajj: '🕋', mawlid: '🕌',
    jummah: '☪️', jumuah: '☪️', 'islamic-new-year': '🌙',
    nikah: '💍', aqiqah: '⭐', general: '🤲',
  }

  return {
    id:             t.id,
    animation:      animationStyle,
    arabicVerse:    t.titleAr,
    arabicLabel:    t.titleAr,
    englishMessage: t.titleEn,
    palette,
    art: {
      tier,
      src:  isLottie ? t.animationFile : isImage ? t.bgImageUrl : undefined,
      icon: ICONS[slug] ?? '✨',
      loop: false,
    },
    occasionSlug: slug,
    isPremium:    t.isPremium,
  }
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd "C:\Users\INFOTECH\Documents\ClaudeCode Test\islamic-ecards"
npx tsc --noEmit
```

Expected: no errors in the new files (ignore pre-existing errors if any).

- [ ] **Step 6: Commit**

```bash
git add types/card.ts lib/card-themes/palettes.ts lib/card-themes/occasions.ts
git commit -m "feat: add ECardData types and occasion/palette helpers"
```

---

## Task 2: ArtLayer System

**Files:**
- Create: `components/cards/ArtLayerCSS.tsx`
- Create: `components/cards/ArtLayerLottie.tsx`
- Create: `components/cards/ArtLayerImage.tsx`
- Create: `components/cards/ArtLayer.tsx`

- [ ] **Step 1: Create `components/cards/ArtLayerCSS.tsx`**

```tsx
// components/cards/ArtLayerCSS.tsx
"use client"
import { motion } from "framer-motion"
import type { ArtConfig, CardPalette } from "@/types/card"

interface Props {
  art: ArtConfig
  palette: CardPalette
  isOpen: boolean
}

export function ArtLayerCSS({ art, palette, isOpen }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", position: "relative", width: "100%", height: "100%", justifyContent: "center" }}>
      {/* Floating stars */}
      {isOpen && (
        <>
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.8, y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            style={{ position: "absolute", top: "14px", left: "12px", fontSize: "0.6rem" }}>✨</motion.span>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.6, y: [0, -4, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: 0.6 }}
            style={{ position: "absolute", top: "22px", right: "10px", fontSize: "0.5rem" }}>⭐</motion.span>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.5, y: [0, -3, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.9 }}
            style={{ position: "absolute", bottom: "28px", left: "14px", fontSize: "0.45rem" }}>✦</motion.span>
        </>
      )}

      {/* Main art emoji */}
      <motion.div
        animate={isOpen
          ? { scale: 1.25, y: -8, filter: `drop-shadow(0 0 20px ${palette.primary}cc) drop-shadow(0 8px 8px rgba(0,0,0,0.6))` }
          : { scale: 0.8, y: 0,  filter: `drop-shadow(0 0 6px ${palette.primary}40)` }
        }
        transition={{ type: "spring", stiffness: 200, damping: 18, delay: isOpen ? 0.4 : 0 }}
        style={{ fontSize: "3rem", position: "relative", zIndex: 10 }}
      >
        {art.icon}
      </motion.div>

      {/* Glow backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            position: "absolute", inset: 0, zIndex: 0,
            background: `radial-gradient(circle at 50% 40%, ${palette.primary}18 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Label */}
      <motion.div
        animate={{ opacity: isOpen ? 0.7 : 0 }}
        transition={{ delay: isOpen ? 0.6 : 0 }}
        style={{ fontSize: "0.38rem", letterSpacing: "2px", textTransform: "uppercase", color: palette.primary }}
      >
        {/* populated by parent */}
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Create `components/cards/ArtLayerLottie.tsx`**

```tsx
// components/cards/ArtLayerLottie.tsx
"use client"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { ArtLayerCSS } from "./ArtLayerCSS"
import type { ArtConfig, CardPalette } from "@/types/card"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

interface Props {
  art: ArtConfig
  palette: CardPalette
  isOpen: boolean
}

export function ArtLayerLottie({ art, palette, isOpen }: Props) {
  const [data, setData]       = useState<object | null>(null)
  const [failed, setFailed]   = useState(false)
  const [loaded, setLoaded]   = useState(false)

  useEffect(() => {
    if (!art.src || !isOpen) return
    fetch(art.src)
      .then(r => { if (!r.ok) throw new Error("not found"); return r.json() })
      .then(d => { setData(d); setLoaded(true) })
      .catch(() => setFailed(true))
  }, [art.src, isOpen])

  // Fallback to CSS art if lottie file missing
  if (failed || !art.src) {
    return <ArtLayerCSS art={art} palette={palette} isOpen={isOpen} />
  }

  if (!loaded) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "2rem", opacity: 0.3 }}>
        {art.icon}
      </div>
    )
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Lottie
        animationData={data!}
        loop={art.loop ?? false}
        autoplay={isOpen}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  )
}
```

- [ ] **Step 3: Create `components/cards/ArtLayerImage.tsx`**

```tsx
// components/cards/ArtLayerImage.tsx
"use client"
import { motion } from "framer-motion"
import type { ArtConfig, CardPalette } from "@/types/card"

interface Props {
  art: ArtConfig
  palette: CardPalette
  isOpen: boolean
}

export function ArtLayerImage({ art, palette, isOpen }: Props) {
  return (
    <motion.div
      animate={isOpen
        ? { scale: 1.15, y: -6, boxShadow: `0 0 30px ${palette.primary}60, 0 12px 20px rgba(0,0,0,0.6)` }
        : { scale: 0.85, y: 0,  boxShadow: "none" }
      }
      transition={{ type: "spring", stiffness: 200, damping: 18, delay: isOpen ? 0.4 : 0 }}
      style={{
        borderRadius: "8px",
        overflow: "hidden",
        border: `1px solid ${palette.primary}40`,
        maxWidth: "90%",
        maxHeight: "90%",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={art.src} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
    </motion.div>
  )
}
```

- [ ] **Step 4: Create `components/cards/ArtLayer.tsx`**

```tsx
// components/cards/ArtLayer.tsx
"use client"
import type { ArtConfig, CardPalette } from "@/types/card"
import { ArtLayerCSS }    from "./ArtLayerCSS"
import { ArtLayerLottie } from "./ArtLayerLottie"
import { ArtLayerImage }  from "./ArtLayerImage"

interface Props {
  art: ArtConfig
  palette: CardPalette
  isOpen: boolean
}

export function ArtLayer({ art, palette, isOpen }: Props) {
  if (art.tier === "lottie") return <ArtLayerLottie art={art} palette={palette} isOpen={isOpen} />
  if (art.tier === "image")  return <ArtLayerImage  art={art} palette={palette} isOpen={isOpen} />
  return <ArtLayerCSS art={art} palette={palette} isOpen={isOpen} />
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 6: Commit**

```bash
git add components/cards/ArtLayer.tsx components/cards/ArtLayerCSS.tsx components/cards/ArtLayerLottie.tsx components/cards/ArtLayerImage.tsx
git commit -m "feat: add 4-tier ArtLayer system (CSS/Lottie/Image/router)"
```

---

## Task 3: EnvelopeCard Animation

**Files:**
- Create: `components/cards/animations/EnvelopeCard.tsx`

- [ ] **Step 1: Create `components/cards/animations/EnvelopeCard.tsx`**

```tsx
// components/cards/animations/EnvelopeCard.tsx
"use client"
import { motion, AnimatePresence } from "framer-motion"
import { ArtLayer } from "../ArtLayer"
import type { ECardData } from "@/types/card"

interface Props {
  card: ECardData
  isOpen: boolean
  onToggle: () => void
}

export function EnvelopeCard({ card, isOpen, onToggle }: Props) {
  const { palette } = card

  return (
    <div
      onClick={onToggle}
      style={{ width: "200px", cursor: "pointer", userSelect: "none" }}
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* ── Closed: envelope face ── */
          <motion.div
            key="closed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ rotateY: 12, rotateX: -3 }}
            style={{
              width: "200px", height: "140px",
              background: `linear-gradient(135deg, ${palette.background}, color-mix(in srgb, ${palette.background} 60%, #2a1848))`,
              border: `1px solid ${palette.primary}40`,
              borderRadius: "6px",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 8px 30px rgba(0,0,0,0.7)",
              perspectiveOrigin: "center",
            }}
          >
            {/* Diagonal grid pattern */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `repeating-linear-gradient(45deg, ${palette.primary}08 0, ${palette.primary}08 1px, transparent 0, transparent 50%)`,
              backgroundSize: "14px 14px",
            }} />
            {/* Flap triangle */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "65px",
              background: `linear-gradient(135deg, color-mix(in srgb, ${palette.background} 70%, #2a1848), color-mix(in srgb, ${palette.background} 50%, #3a2060))`,
              borderBottom: `1px solid ${palette.primary}30`,
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            }} />
            {/* Wax seal */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: "44px", height: "44px",
                background: "radial-gradient(circle, #c0200a, #800a04)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.2rem",
                boxShadow: "0 2px 12px #c0200a80",
                zIndex: 4,
              }}
            >
              ☪️
            </motion.div>
            {/* Hint */}
            <div style={{
              position: "absolute", bottom: "8px", width: "100%",
              textAlign: "center", fontSize: "0.45rem",
              color: `${palette.primary}60`, letterSpacing: "1px",
            }}>
              TAP TO OPEN
            </div>
          </motion.div>
        ) : (
          /* ── Open: card rises from envelope ── */
          <motion.div
            key="open"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ width: "200px", height: "140px", position: "relative" }}
          >
            {/* Envelope base (stays) */}
            <div style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(135deg, ${palette.background}, color-mix(in srgb, ${palette.background} 60%, #1a0f30))`,
              border: `1px solid ${palette.primary}30`,
              borderRadius: "6px",
            }} />
            {/* Flap opens up */}
            <motion.div
              initial={{ rotateX: 0 }}
              animate={{ rotateX: -160 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "65px",
                background: `linear-gradient(135deg, color-mix(in srgb, ${palette.background} 70%, #2a1848), color-mix(in srgb, ${palette.background} 50%, #3a2060))`,
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                transformOrigin: "top center",
                zIndex: 3,
              }}
            />
            {/* Card slides up out of envelope */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: -30, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }}
              style={{
                position: "absolute", left: "10px", right: "10px",
                height: "110px",
                background: `linear-gradient(135deg, color-mix(in srgb, ${palette.background} 80%, #12082a), color-mix(in srgb, ${palette.background} 60%, #1a0f35))`,
                border: `1px solid ${palette.primary}50`,
                borderRadius: "4px",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: "8px", padding: "12px 10px",
                zIndex: 4,
                boxShadow: `0 8px 24px rgba(0,0,0,0.6)`,
              }}
            >
              <div style={{ fontSize: "1rem", color: palette.primary, fontFamily: "serif", textAlign: "center" }}>
                {card.arabicVerse}
              </div>
              <div style={{ width: "36px", height: "1px", background: `${palette.primary}60` }} />
              <div style={{ height: "60px", width: "100%" }}>
                <ArtLayer art={card.art} palette={palette} isOpen />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/cards/animations/EnvelopeCard.tsx
git commit -m "feat: add EnvelopeCard animation component"
```

---

## Task 4: MosaicCard Animation

**Files:**
- Create: `components/cards/animations/MosaicCard.tsx`

- [ ] **Step 1: Create `components/cards/animations/MosaicCard.tsx`**

```tsx
// components/cards/animations/MosaicCard.tsx
"use client"
import { motion } from "framer-motion"
import { ArtLayer } from "../ArtLayer"
import type { ECardData } from "@/types/card"

const TILE_EXITS = [
  { x: "-120%", y: "-120%", rotate: -30 }, { x: "-40%",  y: "-140%", rotate: 15  },
  { x: "40%",   y: "-140%", rotate: -15  }, { x: "120%",  y: "-120%", rotate: 25  },
  { x: "-150%", y: "-60%",  rotate: -20  }, { x: "-60%",  y: "-80%",  rotate: 30  },
  { x: "60%",   y: "-80%",  rotate: -30  }, { x: "150%",  y: "-60%",  rotate: 20  },
  { x: "-160%", y: "0%",    rotate: 15   }, { x: "-50%",  y: "40%",   rotate: -25 },
  { x: "50%",   y: "40%",   rotate: 25   }, { x: "160%",  y: "0%",    rotate: -15 },
  { x: "-140%", y: "60%",   rotate: -35  }, { x: "-40%",  y: "100%",  rotate: 20  },
  { x: "40%",   y: "100%",  rotate: -20  }, { x: "140%",  y: "60%",   rotate: 35  },
  { x: "-120%", y: "120%",  rotate: 10   }, { x: "-30%",  y: "150%",  rotate: -30 },
  { x: "30%",   y: "150%",  rotate: 30   }, { x: "120%",  y: "120%",  rotate: -10 },
]

interface Props { card: ECardData; isOpen: boolean; onToggle: () => void }

export function MosaicCard({ card, isOpen, onToggle }: Props) {
  const { palette } = card

  return (
    <div
      onClick={onToggle}
      style={{ width: "200px", height: "270px", position: "relative", cursor: "pointer", userSelect: "none" }}
    >
      {/* Revealed content (behind tiles) */}
      <motion.div
        animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.92 }}
        transition={{ duration: 0.5, delay: isOpen ? 0.5 : 0 }}
        style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(135deg, ${palette.background}, color-mix(in srgb, ${palette.background} 70%, #0a0430))`,
          border: `1px solid ${palette.primary}30`,
          borderRadius: "4px",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "12px", padding: "20px 14px",
          boxShadow: `0 0 40px ${palette.primary}15 inset`,
        }}
      >
        <div style={{ height: "100px", width: "100%" }}>
          <ArtLayer art={card.art} palette={palette} isOpen={isOpen} />
        </div>
        <div style={{ fontSize: "0.9rem", color: palette.primary, fontFamily: "serif", textAlign: "center" }}>
          {card.arabicVerse}
        </div>
        <div style={{ fontSize: "0.4rem", color: palette.text, fontStyle: "italic", textAlign: "center", lineHeight: 1.7 }}>
          {card.englishMessage}
        </div>
      </motion.div>

      {/* Mosaic tile overlay */}
      <div style={{
        position: "absolute", inset: 0,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridTemplateRows: "repeat(5, 1fr)",
        gap: "2px",
        pointerEvents: isOpen ? "none" : "auto",
      }}>
        {TILE_EXITS.map((exit, i) => (
          <motion.div
            key={i}
            animate={isOpen
              ? { x: exit.x, y: exit.y, rotate: exit.rotate, opacity: 0 }
              : { x: 0, y: 0, rotate: 0, opacity: 1 }
            }
            transition={{ duration: 0.5, delay: isOpen ? i * 0.015 : 0, ease: "easeIn" }}
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${palette.background} 30%, #2a1a4e), color-mix(in srgb, ${palette.background} 50%, #3d2060))`,
              border: `1px solid ${palette.primary}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.55rem", color: `${palette.primary}60`,
            }}
          >
            {i % 2 === 0 ? "✦" : "◆"}
          </motion.div>
        ))}
      </div>

      {/* Closed hint */}
      {!isOpen && (
        <div style={{
          position: "absolute", bottom: "8px", width: "100%",
          textAlign: "center", fontSize: "0.42rem",
          color: `${palette.primary}60`, letterSpacing: "1px", zIndex: 10,
        }}>
          TAP TO SHATTER
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/cards/animations/MosaicCard.tsx
git commit -m "feat: add MosaicCard Islamic tile shatter animation"
```

---

## Task 5: LanternCard Animation

**Files:**
- Create: `components/cards/animations/LanternCard.tsx`

- [ ] **Step 1: Create `components/cards/animations/LanternCard.tsx`**

```tsx
// components/cards/animations/LanternCard.tsx
"use client"
import { motion } from "framer-motion"
import { ArtLayer } from "../ArtLayer"
import type { ECardData } from "@/types/card"

interface Props { card: ECardData; isOpen: boolean; onToggle: () => void }

export function LanternCard({ card, isOpen, onToggle }: Props) {
  const { palette } = card

  return (
    <div
      onClick={onToggle}
      style={{
        width: "200px", height: "270px",
        position: "relative", cursor: "pointer",
        background: palette.background,
        borderRadius: "6px", overflow: "hidden",
        boxShadow: "0 8px 30px rgba(0,0,0,0.8)",
        userSelect: "none",
      }}
    >
      {/* Light burst layer */}
      <motion.div
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.4, delay: isOpen ? 0.1 : 0 }}
        style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: `radial-gradient(circle at 50% 50%, ${palette.primary}, color-mix(in srgb, ${palette.primary} 40%, #300800) 30%, ${palette.background} 80%)`,
          pointerEvents: "none",
        }}
      />

      {/* Revealed card content */}
      <motion.div
        animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.9 }}
        transition={{ duration: 0.6, delay: isOpen ? 0.45 : 0 }}
        style={{
          position: "absolute", inset: 0, zIndex: 3,
          background: `linear-gradient(160deg, color-mix(in srgb, ${palette.background} 60%, #200c08), color-mix(in srgb, ${palette.background} 40%, #300e08))`,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "10px", padding: "20px 14px",
        }}
      >
        <div style={{ fontSize: "0.5rem", color: `${palette.primary}80`, letterSpacing: "8px" }}>✦ ✦ ✦</div>
        <div style={{ height: "90px", width: "100%" }}>
          <ArtLayer art={card.art} palette={palette} isOpen={isOpen} />
        </div>
        <div style={{ fontSize: "1rem", color: palette.primary, fontFamily: "serif", textAlign: "center" }}>
          {card.arabicVerse}
        </div>
        <div style={{ width: "40px", height: "1px", background: `${palette.primary}60` }} />
        <div style={{ fontSize: "0.4rem", color: palette.text, fontStyle: "italic", textAlign: "center", lineHeight: 1.7 }}>
          {card.englishMessage}
        </div>
        <div style={{ fontSize: "0.5rem", color: `${palette.primary}80`, letterSpacing: "8px" }}>✦ ✦ ✦</div>
      </motion.div>

      {/* Dark closed face with glowing lantern */}
      <motion.div
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.3, delay: isOpen ? 0 : 0.2 }}
        style={{
          position: "absolute", inset: 0, zIndex: 2,
          background: palette.background,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "8px",
          pointerEvents: isOpen ? "none" : "auto",
        }}
      >
        <motion.div
          animate={{ filter: [`drop-shadow(0 0 8px ${palette.primary})`, `drop-shadow(0 0 20px ${palette.primary}) drop-shadow(0 0 40px ${palette.primary}40)`, `drop-shadow(0 0 8px ${palette.primary})`] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ fontSize: "2.8rem" }}
        >
          {card.art.icon}
        </motion.div>
        <div style={{ fontSize: "0.5rem", color: `${palette.primary}60`, letterSpacing: "2px", textTransform: "uppercase" }}>
          Tap to illuminate
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/cards/animations/LanternCard.tsx
git commit -m "feat: add LanternCard light burst animation"
```

---

## Task 6: DoorsCard Animation

**Files:**
- Create: `components/cards/animations/DoorsCard.tsx`

- [ ] **Step 1: Create `components/cards/animations/DoorsCard.tsx`**

```tsx
// components/cards/animations/DoorsCard.tsx
"use client"
import { motion } from "framer-motion"
import { ArtLayer } from "../ArtLayer"
import type { ECardData } from "@/types/card"

interface Props { card: ECardData; isOpen: boolean; onToggle: () => void }

export function DoorsCard({ card, isOpen, onToggle }: Props) {
  const { palette } = card

  return (
    <div
      onClick={onToggle}
      style={{
        width: "200px", height: "270px",
        position: "relative", cursor: "pointer",
        perspective: "900px", perspectiveOrigin: "50% 50%",
        userSelect: "none",
      }}
    >
      {/* Scene behind doors */}
      <motion.div
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.5, delay: isOpen ? 0.4 : 0 }}
        style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(160deg, ${palette.background}, color-mix(in srgb, ${palette.background} 60%, #120e04))`,
          border: `1px solid ${palette.primary}30`,
          borderRadius: "4px",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "10px", padding: "20px 14px",
        }}
      >
        <div style={{ height: "100px", width: "100%" }}>
          <ArtLayer art={card.art} palette={palette} isOpen={isOpen} />
        </div>
        <div style={{ fontSize: "0.9rem", color: palette.primary, fontFamily: "serif", textAlign: "center" }}>
          {card.arabicVerse}
        </div>
        <div style={{ width: "40px", height: "1px", background: `${palette.primary}60` }} />
        <div style={{ fontSize: "0.4rem", color: palette.text, fontStyle: "italic", textAlign: "center", lineHeight: 1.7 }}>
          {card.englishMessage}
        </div>
      </motion.div>

      {/* Left door */}
      <motion.div
        animate={{ rotateY: isOpen ? -140 : 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: "absolute", top: 0, left: 0, width: "50%", height: "100%",
          background: `linear-gradient(160deg, color-mix(in srgb, ${palette.background} 30%, #0e0900), color-mix(in srgb, ${palette.background} 50%, #1c1200))`,
          borderRight: `2px solid ${palette.primary}60`,
          borderRadius: "3px 0 0 3px",
          transformOrigin: "left center",
          transformStyle: "preserve-3d",
          zIndex: 2, overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {/* Door decorations */}
        <div style={{ position: "absolute", right: "8px", top: 0, bottom: 0, width: "2px", background: `linear-gradient(180deg, transparent, ${palette.primary}, ${palette.primary}, transparent)` }} />
        <div style={{ fontSize: "0.7rem", color: `${palette.primary}50`, lineHeight: 2.2, textAlign: "center", letterSpacing: "2px" }}>❋<br/>◆<br/>❋<br/>◆<br/>❋</div>
        <div style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", width: "10px", height: "10px", background: `radial-gradient(circle, ${palette.primary}, color-mix(in srgb, ${palette.primary} 40%, #000))`, borderRadius: "50%", boxShadow: `0 0 6px ${palette.primary}80` }} />
      </motion.div>

      {/* Right door */}
      <motion.div
        animate={{ rotateY: isOpen ? 140 : 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: "absolute", top: 0, right: 0, width: "50%", height: "100%",
          background: `linear-gradient(160deg, color-mix(in srgb, ${palette.background} 30%, #0e0900), color-mix(in srgb, ${palette.background} 50%, #1c1200))`,
          borderLeft: `2px solid ${palette.primary}60`,
          borderRadius: "0 3px 3px 0",
          transformOrigin: "right center",
          transformStyle: "preserve-3d",
          zIndex: 2, overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <div style={{ position: "absolute", left: "8px", top: 0, bottom: 0, width: "2px", background: `linear-gradient(180deg, transparent, ${palette.primary}, ${palette.primary}, transparent)` }} />
        <div style={{ fontSize: "0.7rem", color: `${palette.primary}50`, lineHeight: 2.2, textAlign: "center", letterSpacing: "2px" }}>❋<br/>◆<br/>❋<br/>◆<br/>❋</div>
        <div style={{ position: "absolute", left: "6px", top: "50%", transform: "translateY(-50%)", width: "10px", height: "10px", background: `radial-gradient(circle, ${palette.primary}, color-mix(in srgb, ${palette.primary} 40%, #000))`, borderRadius: "50%", boxShadow: `0 0 6px ${palette.primary}80` }} />
      </motion.div>

      {/* Closed hint */}
      {!isOpen && (
        <div style={{
          position: "absolute", bottom: "10px", width: "100%",
          textAlign: "center", fontSize: "0.42rem",
          color: `${palette.primary}60`, letterSpacing: "1px", zIndex: 5,
        }}>
          TAP TO OPEN
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/cards/animations/DoorsCard.tsx
git commit -m "feat: add DoorsCard sacred doors animation"
```

---

## Task 7: PortalCard Animation

**Files:**
- Create: `components/cards/animations/PortalCard.tsx`

- [ ] **Step 1: Create `components/cards/animations/PortalCard.tsx`**

```tsx
// components/cards/animations/PortalCard.tsx
"use client"
import { motion } from "framer-motion"
import { ArtLayer } from "../ArtLayer"
import type { ECardData } from "@/types/card"

interface Props { card: ECardData; isOpen: boolean; onToggle: () => void }

export function PortalCard({ card, isOpen, onToggle }: Props) {
  const { palette } = card

  return (
    <div
      onClick={onToggle}
      style={{
        width: "200px", height: "270px",
        position: "relative", cursor: "pointer",
        background: palette.background,
        borderRadius: "6px", overflow: "hidden",
        boxShadow: "0 8px 30px rgba(0,0,0,0.8)",
        userSelect: "none",
      }}
    >
      {/* Starfield background */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at 30% 30%, ${palette.accent}20 0%, transparent 50%), radial-gradient(circle at 70% 70%, ${palette.primary}10 0%, transparent 50%)`,
        pointerEvents: "none",
      }} />

      {/* Rotating star ring */}
      <motion.div
        animate={{ rotate: isOpen ? 360 : 0, scale: isOpen ? 6 : 1, opacity: isOpen ? 0 : 1 }}
        transition={{ rotate: { duration: 20, repeat: isOpen ? 0 : Infinity, ease: "linear" }, scale: { duration: 0.6 }, opacity: { duration: 0.4, delay: 0.4 } }}
        style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "180px", height: "180px",
          borderRadius: "50%",
          border: `1px solid ${palette.primary}20`,
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          fontSize: "0.45rem", color: `${palette.primary}60`,
          letterSpacing: "20px", paddingTop: "0px",
          zIndex: 2,
        }}
      >
        ✦ ✦ ✦ ✦ ✦ ✦
      </motion.div>

      {/* Portal burst */}
      <motion.div
        animate={isOpen
          ? { scale: [0, 10], opacity: [1, 0] }
          : { scale: 0, opacity: 0 }
        }
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60px", height: "60px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${palette.primary}, color-mix(in srgb, ${palette.primary} 60%, #000) 40%, transparent 70%)`,
          boxShadow: `0 0 30px ${palette.primary}`,
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* Closed face */}
      <motion.div
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.3, delay: isOpen ? 0 : 0.3 }}
        style={{
          position: "absolute", inset: 0, zIndex: 4,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "8px",
          pointerEvents: isOpen ? "none" : "auto",
        }}
      >
        <div style={{ fontSize: "1.1rem", color: palette.primary, fontFamily: "serif" }}>{card.arabicVerse}</div>
        <div style={{ fontSize: "2.4rem", filter: `drop-shadow(0 0 10px ${palette.primary})` }}>{card.art.icon}</div>
        <div style={{ fontSize: "0.45rem", color: `${palette.primary}50`, letterSpacing: "2px", textTransform: "uppercase" }}>Tap to enter</div>
      </motion.div>

      {/* Open: revealed content */}
      <motion.div
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.6, delay: isOpen ? 0.55 : 0 }}
        style={{
          position: "absolute", inset: 0, zIndex: 5,
          background: `linear-gradient(160deg, color-mix(in srgb, ${palette.background} 60%, #050220), color-mix(in srgb, ${palette.background} 40%, #0c0435))`,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "10px", padding: "20px 14px",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        <div style={{ fontSize: "0.5rem", color: `${palette.primary}60`, letterSpacing: "8px" }}>✦ ✦ ✦</div>
        <div style={{ height: "90px", width: "100%" }}>
          <ArtLayer art={card.art} palette={palette} isOpen={isOpen} />
        </div>
        <div style={{ fontSize: "0.9rem", color: palette.primary, fontFamily: "serif", textAlign: "center" }}>{card.arabicVerse}</div>
        <div style={{ width: "40px", height: "1px", background: `${palette.primary}60` }} />
        <div style={{ fontSize: "0.4rem", color: palette.text, fontStyle: "italic", textAlign: "center", lineHeight: 1.7 }}>{card.englishMessage}</div>
        <div style={{ fontSize: "0.5rem", color: `${palette.primary}60`, letterSpacing: "8px" }}>✦ ✦ ✦</div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/cards/animations/PortalCard.tsx
git commit -m "feat: add PortalCard starburst animation"
```

---

## Task 8: CardShell Router + ECard

**Files:**
- Create: `components/cards/CardShell.tsx`
- Create: `components/cards/ECard.tsx`

- [ ] **Step 1: Create `components/cards/CardShell.tsx`**

```tsx
// components/cards/CardShell.tsx
"use client"
import type { ECardData } from "@/types/card"
import { EnvelopeCard } from "./animations/EnvelopeCard"
import { MosaicCard }   from "./animations/MosaicCard"
import { LanternCard }  from "./animations/LanternCard"
import { DoorsCard }    from "./animations/DoorsCard"
import { PortalCard }   from "./animations/PortalCard"

interface Props {
  card: ECardData
  isOpen: boolean
  onToggle: () => void
}

export function CardShell({ card, isOpen, onToggle }: Props) {
  switch (card.animation) {
    case "mosaic":   return <MosaicCard  card={card} isOpen={isOpen} onToggle={onToggle} />
    case "lantern":  return <LanternCard card={card} isOpen={isOpen} onToggle={onToggle} />
    case "doors":    return <DoorsCard   card={card} isOpen={isOpen} onToggle={onToggle} />
    case "portal":   return <PortalCard  card={card} isOpen={isOpen} onToggle={onToggle} />
    default:         return <EnvelopeCard card={card} isOpen={isOpen} onToggle={onToggle} />
  }
}
```

- [ ] **Step 2: Create `components/cards/ECard.tsx`**

```tsx
// components/cards/ECard.tsx
"use client"
import { useState } from "react"
import { CardShell } from "./CardShell"
import type { ECardData } from "@/types/card"

interface Props {
  card: ECardData
  /** If provided, card is controlled externally */
  isOpen?: boolean
  onToggle?: () => void
  /** Show occasion label below card */
  showLabel?: boolean
}

export function ECard({ card, isOpen: isOpenProp, onToggle: onToggleProp, showLabel = false }: Props) {
  const [internalOpen, setInternalOpen] = useState(false)

  const isOpen    = isOpenProp  ?? internalOpen
  const onToggle  = onToggleProp ?? (() => setInternalOpen(o => !o))

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <CardShell card={card} isOpen={isOpen} onToggle={onToggle} />
      {showLabel && (
        <div style={{
          fontSize: "0.62rem", letterSpacing: "1.5px",
          textTransform: "uppercase", color: "rgba(255,255,255,0.4)",
          textAlign: "center",
        }}>
          {card.englishMessage}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/cards/CardShell.tsx components/cards/ECard.tsx
git commit -m "feat: add CardShell router and ECard wrapper component"
```

---

## Task 9: HeroSpotlight Component

**Files:**
- Create: `components/home/HeroSpotlight.tsx`

- [ ] **Step 1: Create `components/home/HeroSpotlight.tsx`**

```tsx
// components/home/HeroSpotlight.tsx
import { prisma } from "@/lib/db/prisma"
import { toECardData } from "@/types/card"
import { HeroSpotlightClient } from "./HeroSpotlightClient"

export async function HeroSpotlight() {
  const templates = await prisma.cardTemplate.findMany({
    where:   { status: "published", isActive: true },
    include: { occasion: true },
    orderBy: { sortOrder: "asc" },
    take: 4,
  })

  const cards = templates.map(toECardData)

  if (cards.length === 0) return null

  return <HeroSpotlightClient cards={cards} />
}
```

- [ ] **Step 2: Create `components/home/HeroSpotlightClient.tsx`**

```tsx
// components/home/HeroSpotlightClient.tsx
"use client"
import { ECard } from "@/components/cards/ECard"
import type { ECardData } from "@/types/card"

interface Props { cards: ECardData[] }

export function HeroSpotlightClient({ cards }: Props) {
  return (
    <div style={{
      display: "flex", gap: "28px",
      overflowX: "auto", paddingBottom: "8px",
      scrollbarWidth: "none", alignItems: "flex-start",
      justifyContent: cards.length < 4 ? "center" : "flex-start",
    }}>
      {cards.map(card => (
        <ECard key={card.id} card={card} showLabel />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add components/home/HeroSpotlight.tsx components/home/HeroSpotlightClient.tsx
git commit -m "feat: add HeroSpotlight server component"
```

---

## Task 10: DiscoverGrid Component

**Files:**
- Create: `components/home/DiscoverGrid.tsx`
- Create: `components/home/DiscoverGridClient.tsx`

- [ ] **Step 1: Create `components/home/DiscoverGrid.tsx`**

```tsx
// components/home/DiscoverGrid.tsx
import { prisma } from "@/lib/db/prisma"
import { toECardData } from "@/types/card"
import { DiscoverGridClient } from "./DiscoverGridClient"

export async function DiscoverGrid() {
  const templates = await prisma.cardTemplate.findMany({
    where:   { status: "published", isActive: true },
    include: { occasion: true },
    orderBy: { sortOrder: "asc" },
    take: 24,
  })

  const cards = templates.map(toECardData)

  return <DiscoverGridClient cards={cards} />
}
```

- [ ] **Step 2: Create `components/home/DiscoverGridClient.tsx`**

```tsx
// components/home/DiscoverGridClient.tsx
"use client"
import { useState } from "react"
import { ECard } from "@/components/cards/ECard"
import type { ECardData } from "@/types/card"

const TABS = [
  { label: "All",     filter: (_: ECardData) => true },
  { label: "Eid",     filter: (c: ECardData) => c.occasionSlug.includes("eid") },
  { label: "Ramadan", filter: (c: ECardData) => c.occasionSlug.includes("ramadan") },
  { label: "Hajj",    filter: (c: ECardData) => c.occasionSlug.includes("hajj") },
  { label: "Mawlid",  filter: (c: ECardData) => c.occasionSlug.includes("mawlid") },
]

interface Props { cards: ECardData[] }

export function DiscoverGridClient({ cards }: Props) {
  const [activeTab, setActiveTab] = useState(0)

  const visible = cards.filter(TABS[activeTab].filter)

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap" }}>
        {TABS.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            style={{
              padding: "6px 16px",
              borderRadius: "20px",
              border: "1px solid",
              borderColor: activeTab === i ? "var(--gold, #f0d080)" : "rgba(255,255,255,0.15)",
              background: activeTab === i ? "rgba(240,208,128,0.12)" : "transparent",
              color: activeTab === i ? "var(--gold, #f0d080)" : "rgba(255,255,255,0.5)",
              fontSize: "0.78rem",
              letterSpacing: "0.5px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>No cards in this category yet.</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "32px 20px",
        }}>
          {visible.map(card => (
            <ECard key={card.id} card={card} showLabel />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add components/home/DiscoverGrid.tsx components/home/DiscoverGridClient.tsx
git commit -m "feat: add DiscoverGrid tabbed card browser"
```

---

## Task 11: Update Homepage

**Files:**
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Read current homepage**

```bash
cat "app/[locale]/page.tsx"
```

- [ ] **Step 2: Replace Featured Carousel + MasonryGrid sections**

In `app/[locale]/page.tsx`, replace the two sections:

1. The `{/* ── Featured Carousel ────────────────────────────── */}` section (lines 61–87)
2. The `{/* ── Discovery: Mood Filter + Masonry ─────────────── */}` section (lines 89–96)

With:

```tsx
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
```

- [ ] **Step 3: Update imports at top of `app/[locale]/page.tsx`**

Remove:
```tsx
import { MoodFilter } from "@/components/home/MoodFilter";
import { MasonryGrid } from "@/components/home/MasonryGrid";
```

Add:
```tsx
import { HeroSpotlight } from "@/components/home/HeroSpotlight";
import { DiscoverGrid }  from "@/components/home/DiscoverGrid";
```

Also remove the `FEATURED_CARDS`, `BADGE_COLORS`, `BADGE_TEXT` constants — they are no longer needed.

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Run dev server and visually verify**

```bash
npm run dev
```

Open http://localhost:3000. Expected: homepage renders Featured Cards section and Discover Cards section. Cards may show empty until seed data is added in Task 12.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/page.tsx
git commit -m "feat: wire HeroSpotlight and DiscoverGrid into homepage"
```

---

## Task 12: Seed Data — One Card Per Animation Style

**Files:**
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Read current seed file**

```bash
cat prisma/seed.ts
```

- [ ] **Step 2: Add 5 card templates (one per animation style)**

Find the section in `prisma/seed.ts` where `CardTemplate` records are created (look for `cardTemplate.upsert` or `cardTemplate.create`). Add these 5 upserts, making sure the `occasionId` values match the occasions created earlier in the same seed file:

```typescript
// In prisma/seed.ts — add after existing CardTemplate seeds

const animationCards = [
  {
    slug:          'eid-portal-demo',
    titleEn:       'Eid al-Fitr Mubarak',
    titleAr:       'عِيدٌ مُبَارَك',
    occasionSlug:  'eid-al-fitr',
    animationStyle: 'portal',
    bgColor:       '#050210',
    animationFile: '',
    bgImageUrl:    '',
    isPremium:     false,
    sortOrder:     1,
  },
  {
    slug:          'ramadan-lantern-demo',
    titleEn:       'Ramadan Kareem — may this blessed month bring you peace and light',
    titleAr:       'رَمَضَان كَرِيم',
    occasionSlug:  'ramadan',
    animationStyle: 'lantern',
    bgColor:       '#140820',
    animationFile: '',
    bgImageUrl:    '',
    isPremium:     false,
    sortOrder:     2,
  },
  {
    slug:          'hajj-doors-demo',
    titleEn:       'May Allah accept your pilgrimage and grant you Jannatul Firdaus',
    titleAr:       'حَجٌّ مَبْرُور',
    occasionSlug:  'hajj',
    animationStyle: 'doors',
    bgColor:       '#080808',
    animationFile: '',
    bgImageUrl:    '',
    isPremium:     false,
    sortOrder:     3,
  },
  {
    slug:          'mawlid-portal-demo',
    titleEn:       'Blessings upon the Prophet ﷺ on this most blessed day',
    titleAr:       'مَوْلِدٌ مُبَارَك',
    occasionSlug:  'mawlid',
    animationStyle: 'portal',
    bgColor:       '#040e08',
    animationFile: '',
    bgImageUrl:    '',
    isPremium:     false,
    sortOrder:     4,
  },
  {
    slug:          'jumuah-envelope-demo',
    titleEn:       'May your Friday be filled with blessings, peace and answered duaas',
    titleAr:       'جُمُعَةٌ مُبَارَكَة',
    occasionSlug:  'jummah',
    animationStyle: 'envelope',
    bgColor:       '#040c10',
    animationFile: '',
    bgImageUrl:    '',
    isPremium:     false,
    sortOrder:     5,
  },
]

for (const card of animationCards) {
  const occasion = await prisma.occasion.findUnique({ where: { slug: card.occasionSlug } })
  if (!occasion) { console.warn(`Occasion not found: ${card.occasionSlug}`); continue }

  await prisma.cardTemplate.upsert({
    where:  { slug: card.slug },
    update: { animationStyle: card.animationStyle, status: 'published', isActive: true },
    create: {
      slug:          card.slug,
      titleEn:       card.titleEn,
      titleAr:       card.titleAr,
      occasionId:    occasion.id,
      animationFile: card.animationFile,
      bgImageUrl:    card.bgImageUrl,
      bgColor:       card.bgColor,
      isPremium:     card.isPremium,
      isActive:      true,
      status:        'published',
      sortOrder:     card.sortOrder,
      animationStyle: card.animationStyle,
    },
  })
  console.log(`✓ Seeded card: ${card.slug}`)
}
```

- [ ] **Step 3: Run seed**

```bash
npm run db:seed
```

Expected output includes 5 lines like:
```
✓ Seeded card: eid-portal-demo
✓ Seeded card: ramadan-lantern-demo
✓ Seeded card: hajj-doors-demo
✓ Seeded card: mawlid-portal-demo
✓ Seeded card: jumuah-envelope-demo
```

- [ ] **Step 4: Verify cards appear on homepage**

```bash
npm run dev
```

Open http://localhost:3000. Expected: HeroSpotlight shows up to 4 cards with animation-specific opening styles. DiscoverGrid shows all 5 cards in the "All" tab.

- [ ] **Step 5: Run build to confirm no TypeScript/build errors**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat: seed 5 demo cards covering all 5 animation styles"
```

---

## Done

All 12 tasks complete. The homepage now shows:
- **HeroSpotlight**: server-fetched cards with full animation-specific open interactions
- **DiscoverGrid**: tabbed card browser backed by real DB data

Each of the 5 animation styles is live: Envelope (Jumu'ah), Lantern (Ramadan), Doors (Hajj), Portal (Eid, Mawlid), Mosaic (Islamic New Year).

**Next sub-projects** (separate specs/plans):
1. Sub-project #2: Dark/Light Mode
2. Sub-project #3: Homepage v3.1 (audio player, language fix)
3. Sub-project #4: Auto Islamic Calendar Feed
4. Sub-project #5: Site-Wide Page Polish
