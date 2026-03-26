// components/cards/animations/EnvelopeCard.tsx
"use client"
import { motion, AnimatePresence } from "framer-motion"
import { ArtLayer } from "../ArtLayer"
import type { ECardData } from "@/types/card"

interface Props {
  card: ECardData
  isOpen: boolean
  onToggle: () => void
}

export function EnvelopeCard({ card, isOpen, onToggle }: Props) {
  const { palette } = card

  return (
    <div
      onClick={onToggle}
      style={{ width: "200px", cursor: "pointer", userSelect: "none" }}
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* ── Closed: envelope face ── */
          <motion.div
            key="closed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ rotateY: 12, rotateX: -3 }}
            style={{
              width: "200px", height: "140px",
              background: `linear-gradient(135deg, ${palette.background}, color-mix(in srgb, ${palette.background} 60%, #2a1848))`,
              border: `1px solid ${palette.primary}40`,
              borderRadius: "6px",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 8px 30px rgba(0,0,0,0.7)",
              perspectiveOrigin: "center",
            }}
          >
            {/* Diagonal grid pattern */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `repeating-linear-gradient(45deg, ${palette.primary}08 0, ${palette.primary}08 1px, transparent 0, transparent 50%)`,
              backgroundSize: "14px 14px",
            }} />
            {/* Flap triangle */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "65px",
              background: `linear-gradient(135deg, color-mix(in srgb, ${palette.background} 70%, #2a1848), color-mix(in srgb, ${palette.background} 50%, #3a2060))`,
              borderBottom: `1px solid ${palette.primary}30`,
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            }} />
            {/* Wax seal */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: "44px", height: "44px",
                background: "radial-gradient(circle, #c0200a, #800a04)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.2rem",
                boxShadow: "0 2px 12px #c0200a80",
                zIndex: 4,
              }}
            >
              ☪️
            </motion.div>
            {/* Hint */}
            <div style={{
              position: "absolute", bottom: "8px", width: "100%",
              textAlign: "center", fontSize: "0.45rem",
              color: `${palette.primary}60`, letterSpacing: "1px",
            }}>
              TAP TO OPEN
            </div>
          </motion.div>
        ) : (
          /* ── Open: card rises from envelope ── */
          <motion.div
            key="open"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ width: "200px", height: "140px", position: "relative" }}
          >
            {/* Envelope base (stays) */}
            <div style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(135deg, ${palette.background}, color-mix(in srgb, ${palette.background} 60%, #1a0f30))`,
              border: `1px solid ${palette.primary}30`,
              borderRadius: "6px",
            }} />
            {/* Flap opens up */}
            <motion.div
              initial={{ rotateX: 0 }}
              animate={{ rotateX: -160 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "65px",
                background: `linear-gradient(135deg, color-mix(in srgb, ${palette.background} 70%, #2a1848), color-mix(in srgb, ${palette.background} 50%, #3a2060))`,
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                transformOrigin: "top center",
                zIndex: 3,
              }}
            />
            {/* Card slides up out of envelope */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: -30, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }}
              style={{
                position: "absolute", left: "10px", right: "10px",
                height: "110px",
                background: `linear-gradient(135deg, color-mix(in srgb, ${palette.background} 80%, #12082a), color-mix(in srgb, ${palette.background} 60%, #1a0f35))`,
                border: `1px solid ${palette.primary}50`,
                borderRadius: "4px",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: "8px", padding: "12px 10px",
                zIndex: 4,
                boxShadow: `0 8px 24px rgba(0,0,0,0.6)`,
              }}
            >
              <div style={{ fontSize: "1rem", color: palette.primary, fontFamily: "serif", textAlign: "center" }}>
                {card.arabicVerse}
              </div>
              <div style={{ width: "36px", height: "1px", background: `${palette.primary}60` }} />
              <div style={{ height: "60px", width: "100%" }}>
                <ArtLayer art={card.art} palette={palette} isOpen />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
