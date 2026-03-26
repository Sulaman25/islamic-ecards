// components/home/DiscoverGrid.tsx
import { prisma } from "@/lib/db/prisma"
import { toECardData } from "@/lib/card-themes/to-ecard-data"
import { DiscoverGridClient } from "./DiscoverGridClient"

export async function DiscoverGrid() {
  const templates = await prisma.cardTemplate.findMany({
    where:   { status: "published", isActive: true },
    include: { occasion: true },
    orderBy: { sortOrder: "asc" },
    take: 24,
  })

  const cards = templates.map(toECardData)

  return <DiscoverGridClient cards={cards} />
}
