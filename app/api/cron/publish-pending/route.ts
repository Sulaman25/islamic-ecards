// app/api/cron/publish-pending/route.ts
import { prisma } from '@/lib/db/prisma';

export async function POST() {
  const now = new Date();

  const updated = await prisma.cardTemplate.updateMany({
    where: {
      status:    'pending_review',
      publishAt: { lte: now },
      rejectedAt: null,
    },
    data: { status: 'published' },
  });

  return new Response(
    JSON.stringify({ published: updated.count }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
