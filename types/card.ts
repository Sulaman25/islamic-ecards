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
