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
