import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { generateWhatsAppShareUrl } from "@/lib/delivery/whatsapp";
import { canSendCard } from "@/lib/stripe/plans";
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
  fontStyle: z.string().default("amiri"),
  aiGenerated: z.boolean().default(false),
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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyCount = await prisma.sentCard.count({
    where: {
      senderId: session.user.id,
      createdAt: { gte: startOfMonth },
    },
  });

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

  const shareUrl = generateWhatsAppShareUrl({
    viewToken: sentCard.viewToken,
    senderName: data.senderName,
    recipientName: data.recipientName,
    occasionTitle: template.occasion.nameEn,
  });

  return NextResponse.json({
    success: true,
    viewToken: sentCard.viewToken,
    shareUrl,
  });
}
