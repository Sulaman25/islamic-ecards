// components/cards/ArtLayerImage.tsx
"use client"
import { motion } from "framer-motion"
import type { ArtConfig, CardPalette } from "@/types/card"

interface Props {
  art: ArtConfig
  palette: CardPalette
  isOpen: boolean
}

export function ArtLayerImage({ art, palette, isOpen }: Props) {
  return (
    <motion.div
      animate={isOpen
        ? { scale: 1.15, y: -6, boxShadow: `0 0 30px ${palette.primary}60, 0 12px 20px rgba(0,0,0,0.6)` }
        : { scale: 0.85, y: 0,  boxShadow: "none" }
      }
      transition={{ type: "spring", stiffness: 200, damping: 18, delay: isOpen ? 0.4 : 0 }}
      style={{
        borderRadius: "8px",
        overflow: "hidden",
        border: `1px solid ${palette.primary}40`,
        maxWidth: "90%",
        maxHeight: "90%",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={art.src as string} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
    </motion.div>
  )
}
