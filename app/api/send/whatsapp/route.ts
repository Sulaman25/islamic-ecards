import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { generateWhatsAppShareUrl } from "@/lib/delivery/whatsapp";
import { scheduleCardDelivery } from "@/lib/queue/card-queue";
import { canSendCard, canSchedule } from "@/lib/stripe/plans";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const sendSchema = z.object({
  templateId: z.string(),
  senderName: z.string().min(1),
  recipientName: z.string().min(1),
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
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
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
      { error: "Free plan limit reached.", upgradeRequired: true },
      { status: 403 }
    );
  }

  const template = await prisma.cardTemplate.findUnique({
    where: { id: data.templateId },
    include: { occasion: true },
  });

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
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
        customMessage: data.customMessage,
        selectedVerse: data.selectedVerse,
        verseTextEn: data.verseTextEn,
        verseTextAr: data.verseTextAr,
        fontStyle: data.fontStyle,
        aiGenerated: data.aiGenerated,
        channel: "WHATSAPP",
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
      customMessage: data.customMessage,
      selectedVerse: data.selectedVerse,
      verseTextEn: data.verseTextEn,
      verseTextAr: data.verseTextAr,
      fontStyle: data.fontStyle,
      aiGenerated: data.aiGenerated,
      channel: "WHATSAPP",
      status: "SENT",
      sentAt: new Date(),
    },
  });

  let shareUrl: string | undefined;
  try {
    shareUrl = generateWhatsAppShareUrl({
      viewToken: sentCard.viewToken,
      senderName: data.senderName,
      recipientName: data.recipientName,
      occasionTitle: template.occasion.nameEn,
    });
  } catch {
    // URL generation failed; card is saved but WhatsApp link unavailable
  }

  return NextResponse.json({
    success: true,
    viewToken: sentCard.viewToken,
    shareUrl,
  });
}
