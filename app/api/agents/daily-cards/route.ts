// app/api/agents/daily-cards/route.ts
import { prisma } from '@/lib/db/prisma';
import { runBriefAgent }    from '@/lib/agents/brief-agent';
import { runDesignerAgent } from '@/lib/agents/designer-agent';
import { runMotionAgent }   from '@/lib/agents/motion-agent';
import { runQAAgent }       from '@/lib/agents/qa-agent';
import { runPublisherAgent } from '@/lib/agents/publisher-agent';

const MAX_RETRIES = 2;

// Rate-limit key stored in DB: a CardTemplate with slug "agent-run-lock"
async function getRateLimitRecord() {
  return prisma.cardTemplate.findUnique({ where: { slug: 'agent-run-lock' } });
}

async function setRateLimitRecord() {
  const now = new Date();
  await prisma.cardTemplate.upsert({
    where:  { slug: 'agent-run-lock' },
    create: {
      slug: 'agent-run-lock', titleEn: '__rate_limit__', titleAr: '',
      occasionId: (await prisma.occasion.findFirst({ select: { id: true } }))!.id,
      animationFile: '', bgImageUrl: '', generatedAt: now,
    },
    update: { generatedAt: now },
  });
}

export async function POST(request: Request) {
  // Verify cron secret (Vercel sets this automatically; we check for local dev too)
  const cronSecret = request.headers.get('x-cron-secret');
  if (cronSecret !== process.env.CRON_SECRET) {
    return new Response('Forbidden', { status: 403 });
  }

  // Rate limit: max 1 run per 23 hours
  const lockRecord = await getRateLimitRecord();
  if (lockRecord?.generatedAt) {
    const elapsed = Date.now() - lockRecord.generatedAt.getTime();
    if (elapsed < 23 * 60 * 60 * 1000) {
      return new Response(
        JSON.stringify({ error: 'Rate limited — run already completed within last 23 hours' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  const generated: string[] = [];
  const skipped:   string[] = [];

  try {
    // Agent 1: Brief
    const brief = await runBriefAgent();

    // Agents 2–5: per target
    for (const target of brief.targets) {
      let designer, motion, qaResult;

      try {
        // Agent 2: Designer
        designer = await runDesignerAgent(target);

        // Agent 3 + 4: Motion + QA with retry loop
        let retryNote: string | undefined;
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          motion   = await runMotionAgent(designer, retryNote);
          qaResult = await runQAAgent(designer, motion);

          if (qaResult.pass) break;

          if (attempt === MAX_RETRIES) {
            throw new Error(`QA failed after ${MAX_RETRIES + 1} attempts: ${qaResult.note}`);
          }
          retryNote = `${qaResult.failedCheck}: ${qaResult.note}`;
        }

        // Agent 5: Publisher
        const { cardId } = await runPublisherAgent(brief, { target, designer: designer!, motion: motion! });
        generated.push(cardId);

      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[daily-cards] Skipping target ${target.mood}/${target.shape}: ${msg}`);
        skipped.push(`${target.mood}/${target.shape}: ${msg}`);
      }
    }

    // Record the successful run for rate-limiting
    await setRateLimitRecord();

    return new Response(
      JSON.stringify({ generated, skipped }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[daily-cards] Pipeline error:', msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
