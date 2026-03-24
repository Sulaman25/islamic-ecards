import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const card = await prisma.sentCard.findUnique({
    where: { viewToken: token },
    include: { template: { include: { occasion: true } } },
  });

  if (!card) return { title: "Islamic Ecard" };

  return {
    title: `${card.senderName} sent you an Islamic card — ${card.template.occasion.nameEn}`,
    description: card.customMessage.slice(0, 150),
  };
}

export default async function ViewCardPage({ params }: Props) {
  const { token } = await params;

  const card = await prisma.sentCard.findUnique({
    where: { viewToken: token },
    include: { template: { include: { occasion: true } } },
  });

  if (!card) notFound();

  // Track view
  await prisma.sentCard.update({
    where: { viewToken: token },
    data: {
      viewCount: { increment: 1 },
      firstViewedAt: card.firstViewedAt ?? new Date(),
      status: card.status === "SENT" ? "VIEWED" : card.status,
    },
  });

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: card.template.bgColor }}
    >
      {/* Card */}
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: card.template.bgColor }}
      >
        <div className="p-8 text-center relative">
          {/* Geometric pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
            <svg viewBox="0 0 300 500" className="w-full h-full" fill="none">
              <polygon
                points="150,10 290,80 290,220 150,290 10,220 10,80"
                stroke="#c9a84c"
                strokeWidth="2"
                fill="none"
              />
              <polygon
                points="150,30 270,95 270,205 150,270 30,205 30,95"
                stroke="#c9a84c"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="150" cy="150" r="80" stroke="#c9a84c" strokeWidth="1.5" fill="none" />
              <circle cx="150" cy="150" r="50" stroke="#c9a84c" strokeWidth="1" fill="none" />
              <line x1="150" y1="10" x2="150" y2="490" stroke="#c9a84c" strokeWidth="0.5" />
              <line x1="10" y1="250" x2="290" y2="250" stroke="#c9a84c" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Bismillah */}
          <p className="font-arabic text-amber-300 text-xl mb-6 relative z-10">
            بسم الله الرحمن الرحيم
          </p>

          {/* Occasion */}
          <p className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-3 relative z-10">
            {card.template.occasion.nameEn}
          </p>

          {/* Arabic title */}
          <p className="font-arabic text-white text-3xl mb-6 relative z-10">
            {card.template.titleAr}
          </p>

          {/* To */}
          <p className="text-white/50 text-sm mb-1 relative z-10">To</p>
          <p className="text-white text-2xl font-semibold mb-6 relative z-10">
            {card.recipientName}
          </p>

          {/* Message */}
          <p
            className={`text-white/90 text-base leading-relaxed mb-6 relative z-10 ${
              card.fontStyle === "amiri" ? "font-arabic text-xl" : ""
            }`}
          >
            {card.customMessage}
          </p>

          {/* Verse */}
          {card.verseTextAr && (
            <div className="border-t border-amber-400/30 pt-4 mb-4 relative z-10">
              <p className="font-arabic text-amber-300 text-lg leading-relaxed">
                {card.verseTextAr}
              </p>
              {card.verseTextEn && (
                <p className="text-white/60 text-sm italic mt-2">
                  &ldquo;{card.verseTextEn}&rdquo;
                </p>
              )}
              {card.selectedVerse && (
                <p className="text-amber-500 text-xs mt-2">
                  — Quran {card.selectedVerse}
                </p>
              )}
            </div>
          )}

          {/* From */}
          <p className="text-white/40 text-sm relative z-10">
            With love from {card.senderName}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-white/40 text-xs">
          Sent via Islamic Ecards — Spreading Blessings
        </p>
        <a
          href="/"
          className="text-amber-400 text-sm font-medium hover:text-amber-300 transition-colors mt-2 block"
        >
          Send your own Islamic card →
        </a>
      </div>
    </div>
  );
}
