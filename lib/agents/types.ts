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
