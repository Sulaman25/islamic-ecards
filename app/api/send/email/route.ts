import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { sendCardEmail } from "@/lib/delivery/email";
import { scheduleCardDelivery } from "@/lib/queue/card-queue";
import { canSendCard, canSchedule } from "@/lib/stripe/plans";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const sendSchema = z.object({
  templateId: z.string(),
  senderName: z.string().min(1),
  recipientName: z.string().min(1),
  recipientEmail: z.string().email().transform(v => v.toLowerCase()),
  customMessage: z.string().min(1),
  selectedVerse: z.string().optional(),
  verseTextEn: z.string().optional(),
  verseTextAr: z.string().optional(),
  fontStyle: z.enum(["amiri", "noto-naskh", "serif"]).default("amiri"),
  aiGenerated: z.boolean().default(false),
  scheduledAt: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [user, monthlyCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { plan: true } }),
    prisma.sentCard.count({ where: { senderId: session.user.id, createdAt: { gte: startOfMonth }, status: { in: ["SENT", "VIEWED"] } } }),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!canSendCard(user.plan, monthlyCount)) {
    return NextResponse.json(
      {
        error: "Free plan limit reached. Upgrade to send more cards.",
        upgradeRequired: true,
      },
      { status: 403 }
    );
  }

  const template = await prisma.cardTemplate.findUnique({
    where: { id: data.templateId },
    include: { occasion: true },
  });

  if (!template) {
    return NextResponse.json({ error: "Card template not found" }, { status: 404 });
  }

  if (data.scheduledAt) {
    const scheduledDate = new Date(data.scheduledAt);
    if (scheduledDate > new Date()) {
      if (!canSchedule(user.plan)) {
        return NextResponse.json({ error: "Scheduled delivery requires a paid plan.", upgradeRequired: true }, { status: 403 });
      }
      const viewToken = await scheduleCardDelivery({
        senderId: session.user.id,
        templateId: data.templateId,
        senderName: data.senderName,
        recipientName: data.recipientName,
        recipientEmail: data.recipientEmail,
        customMessage: data.customMessage,
        selectedVerse: data.selectedVerse,
        verseTextEn: data.verseTextEn,
        verseTextAr: data.verseTextAr,
        fontStyle: data.fontStyle,
        aiGenerated: data.aiGenerated,
        channel: "EMAIL",
      }, scheduledDate);
      return NextResponse.json({ scheduled: true, scheduledAt: data.scheduledAt, viewToken });
    }
  }

  const sentCard = await prisma.sentCard.create({
    data: {
      senderId: session.user.id,
      templateId: data.templateId,
      senderName: data.senderName,
      recipientName: data.recipientName,
      recipientEmail: data.recipientEmail,
      customMessage: data.customMessage,
      selectedVerse: data.selectedVerse,
      verseTextEn: data.verseTextEn,
      verseTextAr: data.verseTextAr,
      fontStyle: data.fontStyle,
      aiGenerated: data.aiGenerated,
      channel: "EMAIL",
      status: "PENDING",
    },
  });

  try {
    await sendCardEmail({
      to: data.recipientEmail,
      recipientName: data.recipientName,
      senderName: data.senderName,
      occasionTitle: template.occasion.nameEn,
      message: data.customMessage,
      verseTextEn: data.verseTextEn,
      viewToken: sentCard.viewToken,
      cardBgColor: template.bgColor,
    });

    await prisma.sentCard.update({
      where: { id: sentCard.id },
      data: { status: "SENT", sentAt: new Date() },
    });

    return NextResponse.json({ success: true, viewToken: sentCard.viewToken });
  } catch (err) {
    await prisma.sentCard.update({
      where: { id: sentCard.id },
      data: { status: "FAILED" },
    });
    console.error("Email send error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
