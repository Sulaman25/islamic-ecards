import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { Link } from "@/lib/i18n-navigation";
import type { Metadata } from "next";
import { CardCanvas } from "@/components/cards/CardCanvas";
import { BookCanvas } from "@/components/cards/BookCanvas";
import { GoldenBookCanvas } from "@/components/cards/GoldenBookCanvas";
import { resolveTemplateAnimationStyle } from "@/lib/card-themes/animation-style";
import { applySpecialTemplateArtwork } from "@/lib/card-themes/special-template-artwork";

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
  const t = await getTranslations("view");

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

  const animationStyle = resolveTemplateAnimationStyle({
    animationStyle: card.template.animationStyle,
    bgImageUrl: card.template.bgImageUrl,
    titleEn: card.template.titleEn,
    occasionSlug: card.template.occasion.slug,
  });
  const previewTemplate = applySpecialTemplateArtwork({
    bgColor: card.template.bgColor,
    bgImageUrl: card.template.bgImageUrl,
    titleAr: card.template.titleAr,
    titleEn: card.template.titleEn,
    animationFile: card.template.animationFile,
    animationStyle: card.template.animationStyle,
    occasion: { slug: card.template.occasion.slug, nameEn: card.template.occasion.nameEn },
  });

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: card.template.bgColor }}
    >
      {/* Card */}
      <div className="w-full max-w-sm">
        {animationStyle === "pageflip" ? (
          <GoldenBookCanvas
            template={previewTemplate}
            recipientName={card.recipientName}
            senderName={card.senderName}
            message={card.customMessage}
            selectedVerse={card.verseTextAr ? { textAr: card.verseTextAr, textEn: card.verseTextEn ?? undefined, ref: card.selectedVerse ?? "" } : null}
            fontStyle={card.fontStyle}
            mode="full"
            autoOpen={false}
          />
        ) : animationStyle === "book" ? (
          <BookCanvas
            template={previewTemplate}
            recipientName={card.recipientName}
            senderName={card.senderName}
            message={card.customMessage}
            selectedVerse={card.verseTextAr ? { textAr: card.verseTextAr, textEn: card.verseTextEn ?? undefined, ref: card.selectedVerse ?? "" } : null}
            fontStyle={card.fontStyle}
            mode="full"
            autoOpen={false}
          />
        ) : (
          <CardCanvas
            template={previewTemplate}
            recipientName={card.recipientName}
            senderName={card.senderName}
            message={card.customMessage}
            selectedVerse={card.verseTextAr ? { textAr: card.verseTextAr, textEn: card.verseTextEn ?? undefined, ref: card.selectedVerse ?? "" } : null}
            fontStyle={card.fontStyle}
            mode="full"
          />
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-white/40 text-xs">
          {t("footer")}
        </p>
        <Link
          href="/"
          className="text-amber-400 text-sm font-medium hover:text-amber-300 transition-colors mt-2 block"
        >
          {t("sendOwn")}
        </Link>
      </div>
    </div>
  );
}
