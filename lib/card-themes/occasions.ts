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
