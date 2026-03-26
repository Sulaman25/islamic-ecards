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

const DEFAULT_PALETTE: CardPalette = { ...PALETTES.general }

export function getPalette(occasionSlug: string): CardPalette {
  return { ...(PALETTES[occasionSlug] ?? DEFAULT_PALETTE) }
}
