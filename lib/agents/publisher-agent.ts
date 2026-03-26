// lib/agents/publisher-agent.ts
import { createHmac } from 'crypto';
import { Resend } from 'resend';
import { prisma } from '@/lib/db/prisma';
import { BriefOutput, CardSpec } from './types';

const resend = new Resend(process.env.RESEND_API_KEY);

// Signs a cardId for use in the one-click reject link
function signCardId(cardId: string): string {
  return createHmac('sha256', process.env.AUTH_SECRET!)
    .update(cardId)
    .digest('hex');
}

export async function runPublisherAgent(
  brief: BriefOutput,
  spec: CardSpec
): Promise<{ cardId: string }> {
  const publishAt = new Date(Date.now() + 30 * 60 * 1000); // +30 minutes

  // Resolve occasionId from slug
  const occasion = await prisma.occasion.findUnique({
    where: { slug: brief.occasionSlug },
  });
  if (!occasion) throw new Error(`Occasion not found for slug: ${brief.occasionSlug}`);

  // Build a unique slug for the generated card
  const slug = `ai-${brief.occasionSlug}-${spec.target.mood}-${Date.now()}`;

  const card = await prisma.cardTemplate.create({
    data: {
      slug,
      titleEn:       `${brief.occasion} — ${spec.target.mood} (AI)`,
      titleAr:       spec.designer.verse.arabic.slice(0, 40),
      occasionId:    occasion.id,
      animationFile: '',         // accent code replaces Lottie for AI cards
      bgImageUrl:    '',
      bgColor:       spec.designer.palette[0] ?? '#1a3a2a',
      isAiGenerated: true,
      status:        'pending_review',
      publishAt,
      accentCss:     spec.motion.accentCss,
      accentJs:      spec.motion.accentJs ?? null,
      shapeSvg:      spec.motion.shapeSvg ?? null,
      mood:          spec.target.mood,
      animationStyle: spec.target.animationGap,
      generatedAt:   new Date(),
    },
  });

  // Send override notification email
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const previewUrl = `${appUrl}/admin/cards/preview/${card.id}`;
  const rejectUrl  = `${appUrl}/api/agents/reject-card?id=${card.id}&token=${signCardId(card.id)}`;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    await resend.emails.send({
      from: `Noor Cards AI <noreply@${process.env.RESEND_DOMAIN ?? 'resend.dev'}>`,
      to:   adminEmail,
      subject: `New AI card ready: ${brief.occasion} / ${spec.target.mood}`,
      html: buildAdminEmail({ card, brief, spec, previewUrl, rejectUrl, publishAt }),
    });
  }

  return { cardId: card.id };
}

function buildAdminEmail(params: {
  card:       { id: string; titleEn: string };
  brief:      BriefOutput;
  spec:       CardSpec;
  previewUrl: string;
  rejectUrl:  string;
  publishAt:  Date;
}): string {
  const { card, brief, spec, previewUrl, rejectUrl, publishAt } = params;
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:32px;background:#f5f5f5">
  <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e0e0e0">
    <h2 style="margin:0 0 8px">🌙 New AI Card Ready for Review</h2>
    <p style="margin:0 0 20px;color:#666">Auto-publishes at <strong>${publishAt.toUTCString()}</strong> unless rejected.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr><td style="padding:4px 8px;color:#888;width:120px">Card</td><td><strong>${card.titleEn}</strong></td></tr>
      <tr><td style="padding:4px 8px;color:#888">Occasion</td><td>${brief.occasion}</td></tr>
      <tr><td style="padding:4px 8px;color:#888">Mood</td><td>${spec.target.mood}</td></tr>
      <tr><td style="padding:4px 8px;color:#888">Shape</td><td>${spec.target.shape}</td></tr>
      <tr><td style="padding:4px 8px;color:#888">Animation</td><td>${spec.target.animationGap}</td></tr>
      <tr><td style="padding:4px 8px;color:#888">Verse</td><td>${spec.designer.verse.reference}</td></tr>
    </table>
    <div style="display:flex;gap:12px">
      <a href="${previewUrl}" style="flex:1;text-align:center;display:block;background:#1a3a2a;color:#fff;padding:12px;border-radius:8px;text-decoration:none;font-weight:600">Preview Card</a>
      <a href="${rejectUrl}"  style="flex:1;text-align:center;display:block;background:#fee2e2;color:#b91c1c;padding:12px;border-radius:8px;text-decoration:none;font-weight:600">Reject</a>
    </div>
  </div>
</body></html>`;
}
