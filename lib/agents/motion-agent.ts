// lib/agents/motion-agent.ts
import { anthropic } from '@/lib/ai/claude';
import { DesignerOutput, MotionOutput } from './types';

export async function runMotionAgent(
  designer: DesignerOutput,
  retryNote?: string
): Promise<MotionOutput> {
  const retrySection = retryNote
    ? `\n\nPrevious attempt failed with this note — fix it:\n${retryNote}\n`
    : '';

  const prompt = `You are the Motion Agent for an Islamic ecard platform. Write the CSS and JS for a card's accent animation.${retrySection}

Card spec:
- Template: ${designer.templateId}
- Shape: ${designer.shape}
- Colour palette: ${designer.palette.join(', ')}
- Accent animation to implement: "${designer.accentDescription}"

Rules:
1. ALL CSS selectors must be prefixed with ".accent-" (e.g. .accent-particle, .accent-clip)
2. Use only pure CSS keyframes and/or vanilla JS — no external libraries
3. If you need a clip path for the shape, provide it as an SVG <clipPath> element
4. Keep the total output compact — accent CSS under 80 lines, accent JS under 60 lines
5. The accent JS (if any) must be a self-contained IIFE: (function(){ ... })();

Return ONLY a JSON object, no markdown:
{
  "accentCss":  "/* pure CSS string */",
  "accentJs":   "/* IIFE JS string or null */",
  "shapeSvg":   "/* SVG string with a <clipPath id=\\"accent-clip\\"> or null */"
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const parsed: MotionOutput = JSON.parse(text.trim());
  return parsed;
}
