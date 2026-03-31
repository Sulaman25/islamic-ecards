import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { Link } from "@/lib/i18n-navigation";
import { Navbar } from "@/components/layout/Navbar";
import { CardCanvas } from "@/components/cards/CardCanvas";
import { BookCanvas } from "@/components/cards/BookCanvas";
import { GoldenBookCanvas } from "@/components/cards/GoldenBookCanvas";
import { resolveTemplateAnimationStyle } from "@/lib/card-themes/animation-style";
import { applySpecialTemplateArtwork } from "@/lib/card-themes/special-template-artwork";

interface Props {
  searchParams: Promise<{ cardId?: string }>;
}

async function getTemplate(cardId?: string) {
  if (!cardId) return null;

  return prisma.cardTemplate.findUnique({
    where: { id: cardId },
    include: { occasion: true },
  });
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { cardId } = await searchParams;
  const template = await getTemplate(cardId);

  if (!template) {
    return { title: "Card Preview" };
  }

  return {
    title: `${template.titleEn} | Card Preview`,
    description: `Preview the ${template.occasion.nameEn} card "${template.titleEn}" before personalising it.`,
  };
}

export default async function PreviewPage({ searchParams }: Props) {
  const { cardId } = await searchParams;
  const template = await getTemplate(cardId);
  const tNav = await getTranslations("nav");

  if (!template) notFound();

  const animationStyle = resolveTemplateAnimationStyle({
    animationStyle: template.animationStyle,
    bgImageUrl: template.bgImageUrl,
    titleEn: template.titleEn,
    occasionSlug: template.occasion.slug,
  });
  const previewTemplate = applySpecialTemplateArtwork({
    bgColor: template.bgColor,
    bgImageUrl: template.bgImageUrl,
    titleAr: template.titleAr,
    titleEn: template.titleEn,
    animationFile: template.animationFile,
    animationStyle: template.animationStyle,
    occasion: {
      slug: template.occasion.slug,
      nameEn: template.occasion.nameEn,
    },
  });

  return (
    <div className="min-h-screen bg-[#05030d] text-white">
      <Navbar />

      <main className="px-4 py-8 md:py-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
          <section className="rounded-[32px] border border-white/8 bg-white/[0.03] p-4 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-6">
            {animationStyle === "pageflip" ? (
              <GoldenBookCanvas
                template={previewTemplate}
                mode="full"
                contentMode="template"
                autoOpen={false}
              />
            ) : animationStyle === "book" ? (
              <BookCanvas
                template={previewTemplate}
                mode="full"
                contentMode="template"
                autoOpen={false}
              />
            ) : (
              <CardCanvas
                template={previewTemplate}
                mode="full"
                contentMode="template"
              />
            )}
          </section>

          <aside className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-7">
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300/75">
              Card Preview
            </div>

            <h1 className="text-3xl font-semibold leading-tight text-white">
              {template.titleEn}
            </h1>

            <p className="mt-2 font-['Amiri'] text-2xl text-amber-200/85">
              {template.titleAr}
            </p>

            <div className="mt-6 grid gap-3 text-sm text-white/72">
              <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                  Occasion
                </div>
                <div className="mt-1 text-base text-white">
                  {template.occasion.nameEn}
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                  Access
                </div>
                <div className="mt-1 text-base text-white">
                  {template.isPremium ? "Premium" : "Free"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 leading-7 text-white/70">
                This is a read-only preview of the card artwork and composition. Personalise it to add names, your own message, and an optional Quran verse.
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={`/customize/${template.id}`}
                className="inline-flex items-center justify-center rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 transition-colors hover:bg-amber-400"
              >
                Customize &amp; Send →
              </Link>

              <Link
                href="/cards"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/82 transition-colors hover:bg-white/[0.07]"
              >
                {tNav("browseCards")}
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
