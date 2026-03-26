import { prisma } from "@/lib/db/prisma";
import { sendCardEmail } from "@/lib/delivery/email";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Pick up PENDING cards (cron-only path) and SCHEDULED cards whose BullMQ job was lost
  const pendingCards = await prisma.sentCard.findMany({
    where: {
      scheduledAt: { lte: now },
      status: { in: ["PENDING", "SCHEDULED"] },
      channel: "EMAIL",
    },
    take: 50,
  });

  const templateIds = [...new Set(pendingCards.map((c: { templateId: string }) => c.templateId))];
  const templates = await prisma.cardTemplate.findMany({
    where: { id: { in: templateIds } },
    select: { id: true, bgColor: true, occasion: { select: { nameEn: true } } },
  });
  const templateMap = Object.fromEntries(templates.map((t) => [t.id, t]));

  let succeeded = 0;
  let failed = 0;

  await Promise.allSettled(
    pendingCards.map(async (card) => {
      try {
        const template = templateMap[card.templateId];

        if (!template) {
          throw new Error(`Template not found for card ${card.id}`);
        }

        await sendCardEmail({
          to: card.recipientEmail ?? "",
          recipientName: card.recipientName,
          senderName: card.senderName,
          occasionTitle: template.occasion.nameEn,
          message: card.customMessage,
          verseTextEn: card.verseTextEn ?? undefined,
          viewToken: card.viewToken,
          cardBgColor: template.bgColor,
        });

        await prisma.sentCard.update({
          where: { id: card.id },
          data: { status: "SENT", sentAt: new Date() },
        });

        succeeded++;
      } catch (err) {
        await prisma.sentCard.update({
          where: { id: card.id },
          data: { status: "FAILED" },
        });
        console.error(`Failed to send scheduled card ${card.id}:`, err);
        failed++;
      }
    })
  );

  return NextResponse.json({
    processed: pendingCards.length,
    succeeded,
    failed,
  });
}
