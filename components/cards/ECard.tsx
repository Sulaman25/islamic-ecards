// components/cards/ECard.tsx
"use client"
import { useState } from "react"
import { CardShell } from "./CardShell"
import type { ECardData } from "@/types/card"

interface Props {
  card: ECardData
  /** If provided, card is controlled externally */
  isOpen?: boolean
  onToggle?: () => void
  /** Show occasion label below card */
  showLabel?: boolean
}

export function ECard({ card, isOpen: isOpenProp, onToggle: onToggleProp, showLabel = false }: Props) {
  const [internalOpen, setInternalOpen] = useState(false)

  const isOpen    = isOpenProp  ?? internalOpen
  const onToggle  = onToggleProp ?? (() => setInternalOpen(o => !o))

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <CardShell card={card} isOpen={isOpen} onToggle={onToggle} />
      {showLabel && (
        <div style={{
          fontSize: "0.62rem", letterSpacing: "1.5px",
          textTransform: "uppercase", color: "rgba(255,255,255,0.4)",
          textAlign: "center",
        }}>
          {card.englishMessage}
        </div>
      )}
    </div>
  )
}
