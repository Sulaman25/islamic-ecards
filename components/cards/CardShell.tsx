// components/cards/CardShell.tsx
"use client"
import type { ECardData } from "@/types/card"
import { EnvelopeCard } from "./animations/EnvelopeCard"
import { MosaicCard }   from "./animations/MosaicCard"
import { LanternCard }  from "./animations/LanternCard"
import { DoorsCard }    from "./animations/DoorsCard"
import { PortalCard }   from "./animations/PortalCard"
import { BookCard }     from "./animations/BookCard"

interface Props {
  card: ECardData
  isOpen: boolean
  onToggle: () => void
}

export function CardShell({ card, isOpen, onToggle }: Props) {
  switch (card.animation) {
    case "mosaic":   return <MosaicCard  card={card} isOpen={isOpen} onToggle={onToggle} />
    case "lantern":  return <LanternCard card={card} isOpen={isOpen} onToggle={onToggle} />
    case "doors":    return <DoorsCard   card={card} isOpen={isOpen} onToggle={onToggle} />
    case "portal":   return <PortalCard  card={card} isOpen={isOpen} onToggle={onToggle} />
    case "book":     return <BookCard    card={card} isOpen={isOpen} onToggle={onToggle} />
    case "pageflip": return <BookCard    card={card} isOpen={isOpen} onToggle={onToggle} />
    default:         return <EnvelopeCard card={card} isOpen={isOpen} onToggle={onToggle} />
  }
}
