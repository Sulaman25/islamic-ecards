// lib/card-themes/to-ecard-data.ts
import type { AnimationStyle, ArtTier, ECardData } from '@/types/card'
import { getPalette } from './palettes'
import { getDefaultAnimation } from './occasions'

export type CardTemplateRow = {
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

const ICONS: Record<string, string> = {
  'eid-al-fitr': '🌙', 'eid-al-adha': '🕋', eid: '🌙',
  ramadan: '🏮', hajj: '🕋', mawlid: '🕌',
  jummah: '☪️', jumuah: '☪️', 'islamic-new-year': '🌙',
  nikah: '💍', aqiqah: '⭐', general: '🤲',
}

const VALID_ANIMATIONS = new Set<string>(['envelope', 'mosaic', 'lantern', 'doors', 'portal'])

export function toECardData(t: CardTemplateRow): ECardData {
  const slug = t.occasion.slug
  const palette = { ...getPalette(slug) }   // spread to avoid mutating shared object

  if (t.bgColor !== '#1a3a2a') palette.background = t.bgColor

  const raw = t.animationStyle
  const animationStyle: AnimationStyle = (raw && VALID_ANIMATIONS.has(raw))
    ? (raw as AnimationStyle)
    : getDefaultAnimation(slug)

  const isLottie = t.animationFile.endsWith('.json')
  const isImage  = t.bgImageUrl.startsWith('/uploads/')
  const tier: ArtTier = isLottie ? 'lottie' : isImage ? 'image' : 'css'

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
