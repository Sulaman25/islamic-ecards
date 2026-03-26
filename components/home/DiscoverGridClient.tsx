// components/home/DiscoverGridClient.tsx
"use client"
import { useState } from "react"
import { ECard } from "@/components/cards/ECard"
import type { ECardData } from "@/types/card"

const TABS = [
  { label: "All",     filter: (_: ECardData) => true },
  { label: "Eid",     filter: (c: ECardData) => c.occasionSlug.includes("eid") },
  { label: "Ramadan", filter: (c: ECardData) => c.occasionSlug.includes("ramadan") },
  { label: "Hajj",    filter: (c: ECardData) => c.occasionSlug.includes("hajj") },
  { label: "Mawlid",  filter: (c: ECardData) => c.occasionSlug.includes("mawlid") },
]

interface Props { cards: ECardData[] }

export function DiscoverGridClient({ cards }: Props) {
  const [activeTab, setActiveTab] = useState(0)

  const visible = cards.filter(TABS[activeTab].filter)

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap" }}>
        {TABS.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            style={{
              padding: "6px 16px",
              borderRadius: "20px",
              border: "1px solid",
              borderColor: activeTab === i ? "var(--gold, #f0d080)" : "rgba(255,255,255,0.15)",
              background: activeTab === i ? "rgba(240,208,128,0.12)" : "transparent",
              color: activeTab === i ? "var(--gold, #f0d080)" : "rgba(255,255,255,0.5)",
              fontSize: "0.78rem",
              letterSpacing: "0.5px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>No cards in this category yet.</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "32px 20px",
        }}>
          {visible.map(card => (
            <ECard key={card.id} card={card} showLabel />
          ))}
        </div>
      )}
    </div>
  )
}
