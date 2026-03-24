import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { sendCardEmail } from "@/lib/delivery/email";
import { canSendCard } from "@/lib/stripe/plans";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const sendSchema = z.object({
  templateId: z.string(),
  senderName: z.string().min(1),
  recipientName: z.string().min(1),
  recipientEmail: z.string().email(),
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

  // Check monthly send count for free users
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

  // Create sent card record
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

  // Send email
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
