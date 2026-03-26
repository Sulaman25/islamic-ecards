// components/home/HeroSpotlight.tsx
import { prisma } from "@/lib/db/prisma"
import { toECardData } from "@/lib/card-themes/to-ecard-data"
import { HeroSpotlightClient } from "./HeroSpotlightClient"

export async function HeroSpotlight() {
  const templates = await prisma.cardTemplate.findMany({
    where:   { status: "published", isActive: true },
    include: { occasion: true },
    orderBy: { sortOrder: "asc" },
    take: 4,
  })

  const cards = templates.map(toECardData)

  if (cards.length === 0) return null

  return <HeroSpotlightClient cards={cards} />
}
