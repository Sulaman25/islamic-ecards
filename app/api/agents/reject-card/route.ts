// app/api/agents/reject-card/route.ts
import { createHmac } from 'crypto';
import { prisma } from '@/lib/db/prisma';

function verifyToken(cardId: string, token: string): boolean {
  const expected = createHmac('sha256', process.env.AUTH_SECRET!)
    .update(cardId)
    .digest('hex');
  return expected === token;
}

export async function GET(request: Request) {
  const url      = new URL(request.url);
  const cardId   = url.searchParams.get('id')    ?? '';
  const token    = url.searchParams.get('token') ?? '';

  if (!cardId || !token) {
    return new Response('Missing id or token', { status: 400 });
  }

  if (!verifyToken(cardId, token)) {
    return new Response('Invalid token', { status: 403 });
  }

  const card = await prisma.cardTemplate.findUnique({ where: { id: cardId } });
  if (!card) {
    return new Response('Card not found', { status: 404 });
  }
  if (card.status !== 'pending_review') {
    return new Response(`Card already ${card.status}`, { status: 409 });
  }

  await prisma.cardTemplate.update({
    where:  { id: cardId },
    data:   { status: 'rejected', rejectedAt: new Date() },
  });

  return new Response(
    `<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:60px">
      <h2>Card rejected ✓</h2>
      <p style="color:#666">"${card.titleEn}" will not be published.</p>
    </body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  );
}
