/**
 * Card Delivery Worker
 *
 * Run alongside Next.js:   npm run worker
 * Or in production:        npx tsx workers/card-delivery.ts
 *
 * Requires env vars:
 *   DATABASE_URL  — PostgreSQL connection string
 *   REDIS_URL     — Redis / Upstash Redis URL (redis://...)
 *   RESEND_API_KEY, NEXT_PUBLIC_APP_URL, RESEND_DOMAIN (for email delivery)
 */
import "dotenv/config";
import { Worker, type Job } from "bullmq";
import { prisma } from "../lib/db/prisma";
import { sendCardEmail } from "../lib/delivery/email";
import { generateWhatsAppShareUrl } from "../lib/delivery/whatsapp";
import { QUEUE_NAME, createRedisConnection, type CardDeliveryJob } from "../lib/queue/card-queue";

async function processJob(job: Job<CardDeliveryJob>) {
  const { cardId, channel } = job.data;

  const card = await prisma.sentCard.findUnique({
    where: { id: cardId },
    include: {
      template: { include: { occasion: true } },
      // Include sender for WHATSAPP path — avoids a second query
      sender: { select: { email: true } },
    },
  });

  if (!card) throw new Error(`Card ${cardId} not found`);

  // Idempotency guard — skip if already delivered
  if (card.status === "SENT" || card.status === "DELIVERED" || card.status === "VIEWED") {
    return;
  }

  if (channel === "EMAIL") {
    if (!card.recipientEmail) throw new Error(`Card ${cardId} has no recipient email`);

    await sendCardEmail({
      to: card.recipientEmail,
      recipientName: card.recipientName,
      senderName: card.senderName,
      occasionTitle: card.template.occasion.nameEn,
      message: card.customMessage,
      verseTextEn: card.verseTextEn ?? undefined,
      viewToken: card.viewToken,
      cardBgColor: card.template.bgColor,
    });

    await prisma.sentCard.update({
      where: { id: cardId },
      data: { status: "SENT", sentAt: new Date() },
    });
  } else if (channel === "WHATSAPP") {
    const senderEmail = card.sender.email;
    if (!senderEmail) {
      // Sender has no email — cannot notify. Mark failed so it doesn't retry indefinitely.
      console.warn(`[worker] Card ${cardId}: sender has no email, cannot deliver WHATSAPP notification`);
      await prisma.sentCard.update({ where: { id: cardId }, data: { status: "FAILED" } });
      return;
    }

    const shareUrl = generateWhatsAppShareUrl({
      viewToken: card.viewToken,
      senderName: card.senderName,
      recipientName: card.recipientName,
      occasionTitle: card.template.occasion.nameEn,
    });

    await sendCardEmail({
      to: senderEmail,
      recipientName: card.senderName,
      senderName: "Islamic Ecards",
      occasionTitle: card.template.occasion.nameEn,
      message: `Your scheduled WhatsApp card for ${card.recipientName} is ready to send!\n\nShare it here: ${shareUrl}`,
      viewToken: card.viewToken,
      cardBgColor: card.template.bgColor,
    });

    await prisma.sentCard.update({
      where: { id: cardId },
      data: { status: "SENT", sentAt: new Date() },
    });
  }

  console.log(`[worker] Delivered card ${cardId} via ${channel}`);
}

const worker = new Worker<CardDeliveryJob>(QUEUE_NAME, processJob, {
  connection: createRedisConnection(),
  concurrency: 5,
});

worker.on("completed", (job) =>
  console.log(`[worker] Job ${job.id} completed`)
);

worker.on("failed", (job, err) =>
  console.error(`[worker] Job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message)
);

worker.on("error", (err) =>
  console.error("[worker] Worker error:", err)
);

console.log(`[worker] Card delivery worker started — queue: ${QUEUE_NAME}`);

async function shutdown() {
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
