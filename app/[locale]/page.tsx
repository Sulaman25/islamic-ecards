// app/[locale]/page.tsx — SERVER COMPONENT
// Drop-in replacement for the existing homepage.
// Safe: isFeatured query has a try/catch fallback so it works
// before AND after the schema migration.

import { getNextOccasion, getUpcomingOccasions } from "@/lib/hijri/occasions";
import { prisma } from "@/lib/db/prisma";
import { HomePageClient } from "@/components/home/HomePageClient";

async function getTrendingCards() {
  try {
    // Try with isFeatured (works after Task 1 migration)
    const featured = await prisma.cardTemplate.findMany({
      where: { isActive: true, isFeatured: true },
      include: { occasion: true },
      take: 4,
      orderBy: { sortOrder: "asc" },
    });
    const remaining = 4 - featured.length;
    const popular =
      remaining > 0
        ? await prisma.cardTemplate.findMany({
            where: { isActive: true, isFeatured: false },
            include: { occasion: true },
            take: remaining,
            orderBy: { sortOrder: "asc" },
          })
        : [];
    return [...featured, ...popular];
  } catch {
    // Fallback before migration: just grab 4 by sortOrder
    return prisma.cardTemplate.findMany({
      where: { isActive: true },
      include: { occasion: true },
      take: 4,
      orderBy: { sortOrder: "asc" },
    });
  }
}

async function getCardOfTheDay() {
  const all = await prisma.cardTemplate.findMany({
    where: { isActive: true },
    include: { occasion: true },
    orderBy: { sortOrder: "asc" },
  });
  if (all.length === 0) return null;
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  return all[dayOfYear % all.length];
}

export default async function HomePage() {
  const [trendingCards, cardOfTheDay] = await Promise.all([
    getTrendingCards(),
    getCardOfTheDay(),
  ]);

  const nextOccasion = getNextOccasion();
  const upcomingOccasions = getUpcomingOccasions().slice(0, 5);

  return (
    <HomePageClient
      trendingCards={trendingCards.map((c) => ({
        id: c.id,
        titleEn: c.titleEn,
        titleAr: c.titleAr,
        bgColor: c.bgColor ?? "#0a1a0a",
        bgImageUrl: c.bgImageUrl,
        animationFile: c.animationFile,
        animationStyle: c.animationStyle,
        isPremium: c.isPremium,
        occasionSlug: c.occasion.slug,
        occasionNameEn: c.occasion.nameEn,
      }))}
      cardOfTheDay={
        cardOfTheDay
          ? {
              id: cardOfTheDay.id,
              titleEn: cardOfTheDay.titleEn,
              titleAr: cardOfTheDay.titleAr,
              bgColor: cardOfTheDay.bgColor ?? "#0a1a0a",
              bgImageUrl: cardOfTheDay.bgImageUrl,
              animationFile: cardOfTheDay.animationFile,
              animationStyle: cardOfTheDay.animationStyle,
              occasionNameEn: cardOfTheDay.occasion.nameEn,
              occasionSlug: cardOfTheDay.occasion.slug,
            }
          : null
      }
      nextOccasion={nextOccasion}
      upcomingOccasions={upcomingOccasions}
    />
  );
}
