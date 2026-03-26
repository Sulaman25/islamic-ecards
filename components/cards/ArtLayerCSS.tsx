// components/cards/ArtLayerCSS.tsx
"use client"
import { motion } from "framer-motion"
import type { ArtConfig, CardPalette } from "@/types/card"

interface Props {
  art: ArtConfig
  palette: CardPalette
  isOpen: boolean
}

export function ArtLayerCSS({ art, palette, isOpen }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", position: "relative", width: "100%", height: "100%", justifyContent: "center" }}>
      {/* Floating stars */}
      {isOpen && (
        <>
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.8, y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            style={{ position: "absolute", top: "14px", left: "12px", fontSize: "0.6rem" }}>✨</motion.span>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.6, y: [0, -4, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: 0.6 }}
            style={{ position: "absolute", top: "22px", right: "10px", fontSize: "0.5rem" }}>⭐</motion.span>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.5, y: [0, -3, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.9 }}
            style={{ position: "absolute", bottom: "28px", left: "14px", fontSize: "0.45rem" }}>✦</motion.span>
        </>
      )}

      {/* Main art emoji */}
      <motion.div
        animate={isOpen
          ? { scale: 1.25, y: -8, filter: `drop-shadow(0 0 20px ${palette.primary}cc) drop-shadow(0 8px 8px rgba(0,0,0,0.6))` }
          : { scale: 0.8, y: 0,  filter: `drop-shadow(0 0 6px ${palette.primary}40)` }
        }
        transition={{ type: "spring", stiffness: 200, damping: 18, delay: isOpen ? 0.4 : 0 }}
        style={{ fontSize: "3rem", position: "relative", zIndex: 10 }}
      >
        {art.icon}
      </motion.div>

      {/* Glow backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            position: "absolute", inset: 0, zIndex: 0,
            background: `radial-gradient(circle at 50% 40%, ${palette.primary}18 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Label */}
      <motion.div
        animate={{ opacity: isOpen ? 0.7 : 0 }}
        transition={{ delay: isOpen ? 0.6 : 0 }}
        style={{ fontSize: "0.38rem", letterSpacing: "2px", textTransform: "uppercase", color: palette.primary }}
      >
        {/* populated by parent */}
      </motion.div>
    </div>
  )
}
