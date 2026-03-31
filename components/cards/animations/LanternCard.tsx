// components/cards/animations/LanternCard.tsx
"use client"
import { motion } from "framer-motion"
import { ArtLayer } from "../ArtLayer"
import type { ECardData } from "@/types/card"

interface Props { card: ECardData; isOpen: boolean; onToggle: () => void }

export function LanternCard({ card, isOpen, onToggle }: Props) {
  const { palette } = card
  const lanternGlowFrames: string[] = [
    `drop-shadow(0 0 8px ${palette.primary})`,
    `drop-shadow(0 0 20px ${palette.primary}) drop-shadow(0 0 40px ${palette.primary}40)`,
    `drop-shadow(0 0 8px ${palette.primary})`,
  ]

  return (
    <div
      onClick={onToggle}
      style={{
        width: "200px", height: "270px",
        position: "relative", cursor: "pointer",
        background: palette.background,
        borderRadius: "6px", overflow: "hidden",
        boxShadow: "0 8px 30px rgba(0,0,0,0.8)",
        userSelect: "none",
      }}
    >
      {/* Light burst layer */}
      <motion.div
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.4, delay: isOpen ? 0.1 : 0 }}
        style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: `radial-gradient(circle at 50% 50%, ${palette.primary}, color-mix(in srgb, ${palette.primary} 40%, #300800) 30%, ${palette.background} 80%)`,
          pointerEvents: "none",
        }}
      />

      {/* Revealed card content */}
      <motion.div
        animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.9 }}
        transition={{ duration: 0.6, delay: isOpen ? 0.45 : 0 }}
        style={{
          position: "absolute", inset: 0, zIndex: 3,
          background: `linear-gradient(160deg, color-mix(in srgb, ${palette.background} 60%, #200c08), color-mix(in srgb, ${palette.background} 40%, #300e08))`,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "10px", padding: "20px 14px",
        }}
      >
        <div style={{ fontSize: "0.5rem", color: `${palette.primary}80`, letterSpacing: "8px" }}>✦ ✦ ✦</div>
        <div style={{ height: "90px", width: "100%" }}>
          <ArtLayer art={card.art} palette={palette} isOpen={isOpen} />
        </div>
        <div style={{ fontSize: "1rem", color: palette.primary, fontFamily: "serif", textAlign: "center" }}>
          {card.arabicVerse}
        </div>
        <div style={{ width: "40px", height: "1px", background: `${palette.primary}60` }} />
        <div style={{ fontSize: "0.4rem", color: palette.text, fontStyle: "italic", textAlign: "center", lineHeight: 1.7 }}>
          {card.englishMessage}
        </div>
        <div style={{ fontSize: "0.5rem", color: `${palette.primary}80`, letterSpacing: "8px" }}>✦ ✦ ✦</div>
      </motion.div>

      {/* Dark closed face with glowing lantern */}
      <motion.div
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.3, delay: isOpen ? 0 : 0.2 }}
        style={{
          position: "absolute", inset: 0, zIndex: 2,
          background: palette.background,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "8px",
          pointerEvents: isOpen ? "none" : "auto",
        }}
      >
        <motion.div
          animate={{ filter: lanternGlowFrames }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ fontSize: "2.8rem" }}
        >
          {card.art.icon}
        </motion.div>
        <div style={{ fontSize: "0.5rem", color: `${palette.primary}60`, letterSpacing: "2px", textTransform: "uppercase" }}>
          Tap to illuminate
        </div>
      </motion.div>
    </div>
  )
}
