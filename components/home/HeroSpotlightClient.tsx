// components/home/HeroSpotlightClient.tsx
"use client"
import { ECard } from "@/components/cards/ECard"
import type { ECardData } from "@/types/card"

interface Props { cards: ECardData[] }

export function HeroSpotlightClient({ cards }: Props) {
  return (
    <div style={{
      display: "flex", gap: "28px",
      overflowX: "auto", paddingBottom: "8px",
      scrollbarWidth: "none", alignItems: "flex-start",
      justifyContent: cards.length < 4 ? "center" : "flex-start",
    }}>
      {cards.map(card => (
        <ECard key={card.id} card={card} showLabel />
      ))}
    </div>
  )
}
