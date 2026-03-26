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
