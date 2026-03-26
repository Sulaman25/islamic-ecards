// lib/agents/brief-agent.ts
import { anthropic } from '@/lib/ai/claude';
import { prisma } from '@/lib/db/prisma';
import { BriefOutput } from './types';
import { findUpcomingOccasion, OCCASION_NAME_TO_SLUG } from './hijri-utils';

// Returns today's brief: which 3 cards to generate.
export async function runBriefAgent(): Promise<BriefOutput> {
  // 1. Find upcoming occasion (or fall back to "general")
  const upcoming = findUpcomingOccasion(14);
  const occasionName = upcoming?.name ?? 'General';
  const occasionSlug = OCCASION_NAME_TO_SLUG[occasionName] ?? 'general';
  const daysUntil    = upcoming?.daysUntil ?? 0;

  // 2. Query DB for existing AI card distribution
  const existing = await prisma.cardTemplate.groupBy({
    by: ['mood', 'animationStyle'],
    where: { isAiGenerated: true },
    _count: { id: true },
  });

  const existingJson = JSON.stringify(existing.map(e => ({
    mood:          e.mood,
    animationStyle: e.animationStyle,
    count:         e._count.id,
  })));

  const availableMoods      = ['reverent','peaceful','celebratory','joyful'];
  const availableAnimations = [
    'particle-burst','calligraphy-write-on','liquid-warp',
    'starfall','aurora-drift','ink-bloom','light-rays',
  ];
  const availableShapes = ['circle','hexagon','diamond','rectangle','arch','blob'];

  const prompt = `You are the Brief Agent for an Islamic ecard platform.

Today's occasion: ${occasionName} (${daysUntil} days away)
Occasion slug: ${occasionSlug}

Existing AI-generated cards distribution (mood × animationStyle counts):
${existingJson || '(none yet)'}

Available moods: ${availableMoods.join(', ')}
Available animation styles: ${availableAnimations.join(', ')}
Available shapes: ${availableShapes.join(', ')}

Pick exactly 3 card targets that:
1. Are appropriate for the occasion
2. Prefer underrepresented mood × animationStyle combinations
3. Use visually distinct shapes from each other

Return ONLY a JSON object, no markdown, no commentary:
{
  "occasion": "${occasionName}",
  "occasionSlug": "${occasionSlug}",
  "daysUntil": ${daysUntil},
  "targets": [
    { "mood": "...", "shape": "...", "animationGap": "..." },
    { "mood": "...", "shape": "...", "animationGap": "..." },
    { "mood": "...", "shape": "...", "animationGap": "..." }
  ]
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const parsed: BriefOutput = JSON.parse(text.trim());

  if (!parsed.targets || parsed.targets.length !== 3) {
    throw new Error('Brief Agent returned unexpected target count: ' + parsed.targets?.length);
  }
  return parsed;
}
