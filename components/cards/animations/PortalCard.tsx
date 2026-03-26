// components/cards/animations/PortalCard.tsx
"use client"
import { motion } from "framer-motion"
import { ArtLayer } from "../ArtLayer"
import type { ECardData } from "@/types/card"

interface Props { card: ECardData; isOpen: boolean; onToggle: () => void }

export function PortalCard({ card, isOpen, onToggle }: Props) {
  const { palette } = card

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
      {/* Starfield background */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at 30% 30%, ${palette.accent}20 0%, transparent 50%), radial-gradient(circle at 70% 70%, ${palette.primary}10 0%, transparent 50%)`,
        pointerEvents: "none",
      }} />

      {/* Rotating star ring */}
      <motion.div
        animate={{ rotate: isOpen ? 360 : 0, scale: isOpen ? 6 : 1, opacity: isOpen ? 0 : 1 }}
        transition={{ rotate: { duration: 20, repeat: isOpen ? 0 : Infinity, ease: "linear" }, scale: { duration: 0.6 }, opacity: { duration: 0.4, delay: 0.4 } }}
        style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "180px", height: "180px",
          borderRadius: "50%",
          border: `1px solid ${palette.primary}20`,
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          fontSize: "0.45rem", color: `${palette.primary}60`,
          letterSpacing: "20px", paddingTop: "0px",
          zIndex: 2,
        }}
      >
        ✦ ✦ ✦ ✦ ✦ ✦
      </motion.div>

      {/* Portal burst */}
      <motion.div
        animate={isOpen
          ? { scale: [0, 10], opacity: [1, 0] }
          : { scale: 0, opacity: 0 }
        }
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60px", height: "60px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${palette.primary}, color-mix(in srgb, ${palette.primary} 60%, #000) 40%, transparent 70%)`,
          boxShadow: `0 0 30px ${palette.primary}`,
          zIndex: 3,
          pointerEvents: "none",
        }}
      />

      {/* Closed face */}
      <motion.div
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.3, delay: isOpen ? 0 : 0.3 }}
        style={{
          position: "absolute", inset: 0, zIndex: 4,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "8px",
          pointerEvents: isOpen ? "none" : "auto",
        }}
      >
        <div style={{ fontSize: "1.1rem", color: palette.primary, fontFamily: "serif" }}>{card.arabicVerse}</div>
        <div style={{ fontSize: "2.4rem", filter: `drop-shadow(0 0 10px ${palette.primary})` }}>{card.art.icon}</div>
        <div style={{ fontSize: "0.45rem", color: `${palette.primary}50`, letterSpacing: "2px", textTransform: "uppercase" }}>Tap to enter</div>
      </motion.div>

      {/* Open: revealed content */}
      <motion.div
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.6, delay: isOpen ? 0.55 : 0 }}
        style={{
          position: "absolute", inset: 0, zIndex: 5,
          background: `linear-gradient(160deg, color-mix(in srgb, ${palette.background} 60%, #050220), color-mix(in srgb, ${palette.background} 40%, #0c0435))`,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "10px", padding: "20px 14px",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        <div style={{ fontSize: "0.5rem", color: `${palette.primary}60`, letterSpacing: "8px" }}>✦ ✦ ✦</div>
        <div style={{ height: "90px", width: "100%" }}>
          <ArtLayer art={card.art} palette={palette} isOpen={isOpen} />
        </div>
        <div style={{ fontSize: "0.9rem", color: palette.primary, fontFamily: "serif", textAlign: "center" }}>{card.arabicVerse}</div>
        <div style={{ width: "40px", height: "1px", background: `${palette.primary}60` }} />
        <div style={{ fontSize: "0.4rem", color: palette.text, fontStyle: "italic", textAlign: "center", lineHeight: 1.7 }}>{card.englishMessage}</div>
        <div style={{ fontSize: "0.5rem", color: `${palette.primary}60`, letterSpacing: "8px" }}>✦ ✦ ✦</div>
      </motion.div>
    </div>
  )
}
