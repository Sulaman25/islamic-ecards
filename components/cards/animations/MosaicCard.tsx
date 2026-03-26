// components/cards/animations/MosaicCard.tsx
"use client"
import { motion } from "framer-motion"
import { ArtLayer } from "../ArtLayer"
import type { ECardData } from "@/types/card"

const TILE_EXITS = [
  { x: "-120%", y: "-120%", rotate: -30 }, { x: "-40%",  y: "-140%", rotate: 15  },
  { x: "40%",   y: "-140%", rotate: -15  }, { x: "120%",  y: "-120%", rotate: 25  },
  { x: "-150%", y: "-60%",  rotate: -20  }, { x: "-60%",  y: "-80%",  rotate: 30  },
  { x: "60%",   y: "-80%",  rotate: -30  }, { x: "150%",  y: "-60%",  rotate: 20  },
  { x: "-160%", y: "0%",    rotate: 15   }, { x: "-50%",  y: "40%",   rotate: -25 },
  { x: "50%",   y: "40%",   rotate: 25   }, { x: "160%",  y: "0%",    rotate: -15 },
  { x: "-140%", y: "60%",   rotate: -35  }, { x: "-40%",  y: "100%",  rotate: 20  },
  { x: "40%",   y: "100%",  rotate: -20  }, { x: "140%",  y: "60%",   rotate: 35  },
  { x: "-120%", y: "120%",  rotate: 10   }, { x: "-30%",  y: "150%",  rotate: -30 },
  { x: "30%",   y: "150%",  rotate: 30   }, { x: "120%",  y: "120%",  rotate: -10 },
]

interface Props { card: ECardData; isOpen: boolean; onToggle: () => void }

export function MosaicCard({ card, isOpen, onToggle }: Props) {
  const { palette } = card

  return (
    <div
      onClick={onToggle}
      style={{ width: "200px", height: "270px", position: "relative", cursor: "pointer", userSelect: "none" }}
    >
      {/* Revealed content (behind tiles) */}
      <motion.div
        animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.92 }}
        transition={{ duration: 0.5, delay: isOpen ? 0.5 : 0 }}
        style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(135deg, ${palette.background}, color-mix(in srgb, ${palette.background} 70%, #0a0430))`,
          border: `1px solid ${palette.primary}30`,
          borderRadius: "4px",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "12px", padding: "20px 14px",
          boxShadow: `0 0 40px ${palette.primary}15 inset`,
        }}
      >
        <div style={{ height: "100px", width: "100%" }}>
          <ArtLayer art={card.art} palette={palette} isOpen={isOpen} />
        </div>
        <div style={{ fontSize: "0.9rem", color: palette.primary, fontFamily: "serif", textAlign: "center" }}>
          {card.arabicVerse}
        </div>
        <div style={{ fontSize: "0.4rem", color: palette.text, fontStyle: "italic", textAlign: "center", lineHeight: 1.7 }}>
          {card.englishMessage}
        </div>
      </motion.div>

      {/* Mosaic tile overlay */}
      <div style={{
        position: "absolute", inset: 0,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridTemplateRows: "repeat(5, 1fr)",
        gap: "2px",
        pointerEvents: isOpen ? "none" : "auto",
      }}>
        {TILE_EXITS.map((exit, i) => (
          <motion.div
            key={i}
            animate={isOpen
              ? { x: exit.x, y: exit.y, rotate: exit.rotate, opacity: 0 }
              : { x: 0, y: 0, rotate: 0, opacity: 1 }
            }
            transition={{ duration: 0.5, delay: isOpen ? i * 0.015 : 0, ease: "easeIn" }}
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${palette.background} 30%, #2a1a4e), color-mix(in srgb, ${palette.background} 50%, #3d2060))`,
              border: `1px solid ${palette.primary}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.55rem", color: `${palette.primary}60`,
            }}
          >
            {i % 2 === 0 ? "✦" : "◆"}
          </motion.div>
        ))}
      </div>

      {/* Closed hint */}
      {!isOpen && (
        <div style={{
          position: "absolute", bottom: "8px", width: "100%",
          textAlign: "center", fontSize: "0.42rem",
          color: `${palette.primary}60`, letterSpacing: "1px", zIndex: 10,
        }}>
          TAP TO SHATTER
        </div>
      )}
    </div>
  )
}
