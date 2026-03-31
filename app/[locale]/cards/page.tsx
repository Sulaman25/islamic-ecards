import { prisma } from "@/lib/db/prisma";
import { BrowseCardsClient } from "./BrowseCardsClient";
import type { BrowseCard, BrowseOccasion } from "./BrowseCardsClient";

const OCCASION_ICONS: Record<string, string> = {
  "eid-ul-fitr": "🎁",
  "eid-ul-adha": "🐑",
  ramadan: "🕌",
  "laylatul-qadr": "✨",
  nikah: "💍",
  hajj: "🕋",
  jummah: "🌙",
  aqiqah: "🕯️",
  mawlid: "☪️",
  "islamic-new-year": "🌙",
  general: "✨",
};

const OCCASION_ORDER = [
  "eid-ul-fitr",
  "ramadan",
  "nikah",
  "hajj",
  "eid-ul-adha",
  "aqiqah",
  "jummah",
  "laylatul-qadr",
  "mawlid",
  "islamic-new-year",
  "general",
];

function deriveTags(card: { isPremium: boolean; titleEn: string; bgImageUrl: string }): string[] {
  const tags: string[] = ["Animated"];
  const source = `${card.titleEn} ${card.bgImageUrl}`.toLowerCase();

  if (source.includes("geometric")) tags.push("Geometric");
  if (source.includes("crescent")) tags.push("Crescent");
  if (source.includes("arabesque")) tags.push("Arabesque");
  if (source.includes("floral")) tags.push("Floral");
  if (source.includes("lantern")) tags.push("Lantern");
  if (source.includes("mosque")) tags.push("Mosque");
  if (source.includes("kaaba") || source.includes("hajj")) tags.push("Sacred");
  if (source.includes("pattern")) tags.push("Pattern");
  if (card.isPremium) tags.push("Premium");

  return Array.from(new Set(tags)).slice(0, 3);
}

function buildDescription(card: { titleEn: string; bgImageUrl: string }, occasionName: string): string {
  const source = `${card.titleEn} ${card.bgImageUrl}`.toLowerCase();

  if (source.includes("floral")) {
    return `${occasionName} card with floral ornament, layered motion, and room for a personal message.`;
  }

  if (source.includes("geometric") || source.includes("pattern")) {
    return `${occasionName} card with geometric detail, luminous motion, and a clean message space.`;
  }

  if (source.includes("lantern") || source.includes("crescent") || source.includes("night")) {
    return `${occasionName} card built around a night-sky scene with soft motion and warm lighting.`;
  }

  if (source.includes("mosque") || source.includes("kaaba")) {
    return `${occasionName} card with a sacred focal point and room for a thoughtful greeting.`;
  }

  return `${occasionName} card with layered illustration, subtle animation, and space for a personal note.`;
}

interface Props {
  searchParams: Promise<{ occasion?: string }>;
}

export default async function CardsPage({ searchParams }: Props) {
  const { occasion: initialOccasionSlug } = await searchParams;

  const dbOccasions = await prisma.occasion.findMany({
    where: { isActive: true },
    include: {
      templates: {
        where: { isActive: true },
        orderBy: [{ isPremium: "asc" }, { sortOrder: "asc" }],
      },
    },
  });

  const sortedOccasions = [...dbOccasions].sort((a, b) => {
    const ai = OCCASION_ORDER.indexOf(a.slug);
    const bi = OCCASION_ORDER.indexOf(b.slug);
    if (ai === -1 && bi === -1) return a.nameEn.localeCompare(b.nameEn);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const occasions: BrowseOccasion[] = sortedOccasions
    .filter((occasion) => occasion.templates.length > 0)
    .map((occasion) => {
      const cards: BrowseCard[] = occasion.templates.map((template) => ({
        id: template.id,
        titleEn: template.titleEn,
        titleAr: template.titleAr,
        occasionNameEn: occasion.nameEn,
        occasionSlug: occasion.slug,
        description: buildDescription(template, occasion.nameEn),
        bgColor: template.bgColor ?? "#0a1a0a",
        bgImageUrl: template.bgImageUrl,
        animationFile: template.animationFile,
        animationStyle: template.animationStyle,
        isPremium: template.isPremium,
        tags: deriveTags(template),
      }));

      return {
        id: occasion.id,
        slug: occasion.slug,
        nameEn: occasion.nameEn,
        nameAr: occasion.nameAr,
        icon: OCCASION_ICONS[occasion.slug] ?? "✨",
        cardCount: occasion.templates.length,
        cards,
        bg: "",
        aurora1: "",
        aurora2: "",
        glow: "",
        cutColor: "",
        accentAiColor: "",
      } satisfies BrowseOccasion;
    });

  return (
    <BrowseCardsClient
      occasions={occasions}
      initialOccasionSlug={initialOccasionSlug}
    />
  );
}
