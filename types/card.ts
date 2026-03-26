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
  src?: string
  icon: string
  loop?: boolean
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
