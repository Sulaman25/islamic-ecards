// components/cards/animations/DoorsCard.tsx
"use client"
import { motion } from "framer-motion"
import { ArtLayer } from "../ArtLayer"
import type { ECardData } from "@/types/card"

interface Props { card: ECardData; isOpen: boolean; onToggle: () => void }

export function DoorsCard({ card, isOpen, onToggle }: Props) {
  const { palette } = card

  return (
    <div
      onClick={onToggle}
      style={{
        width: "200px", height: "270px",
        position: "relative", cursor: "pointer",
        perspective: "900px", perspectiveOrigin: "50% 50%",
        userSelect: "none",
      }}
    >
      {/* Scene behind doors */}
      <motion.div
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.5, delay: isOpen ? 0.4 : 0 }}
        style={{
          position: "absolute", inset: 0,
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        {card.art.tier === "image" ? (
          /* Full-bleed image with text overlay */
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.art.src as string}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            {(card.arabicVerse || card.englishMessage) && (
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "20px 14px 12px",
                background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
              }}>
                {card.arabicVerse && (
                  <div style={{ fontSize: "0.9rem", color: palette.primary, fontFamily: "serif", textAlign: "center" }}>
                    {card.arabicVerse}
                  </div>
                )}
                {card.arabicVerse && card.englishMessage && (
                  <div style={{ width: "40px", height: "1px", background: `${palette.primary}60` }} />
                )}
                {card.englishMessage && (
                  <div style={{ fontSize: "0.55rem", color: "#fff", fontStyle: "italic", textAlign: "center", lineHeight: 1.7 }}>
                    {card.englishMessage}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Non-image: art + text layout */
          <div style={{
            width: "100%", height: "100%",
            background: `linear-gradient(160deg, ${palette.background}, color-mix(in srgb, ${palette.background} 60%, #120e04))`,
            border: `1px solid ${palette.primary}30`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: "10px", padding: "20px 14px",
          }}>
            <div style={{ height: "100px", width: "100%" }}>
              <ArtLayer art={card.art} palette={palette} isOpen={isOpen} />
            </div>
            <div style={{ fontSize: "0.9rem", color: palette.primary, fontFamily: "serif", textAlign: "center" }}>
              {card.arabicVerse}
            </div>
            <div style={{ width: "40px", height: "1px", background: `${palette.primary}60` }} />
            <div style={{ fontSize: "0.4rem", color: palette.text, fontStyle: "italic", textAlign: "center", lineHeight: 1.7 }}>
              {card.englishMessage}
            </div>
          </div>
        )}
      </motion.div>

      {/* Left door */}
      <motion.div
        animate={{ rotateY: isOpen ? -140 : 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: "absolute", top: 0, left: 0, width: "50%", height: "100%",
          background: `linear-gradient(160deg, color-mix(in srgb, ${palette.background} 30%, #0e0900), color-mix(in srgb, ${palette.background} 50%, #1c1200))`,
          borderRight: `2px solid ${palette.primary}60`,
          borderRadius: "3px 0 0 3px",
          transformOrigin: "left center",
          transformStyle: "preserve-3d",
          zIndex: 2, overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {/* Door decorations */}
        <div style={{ position: "absolute", right: "8px", top: 0, bottom: 0, width: "2px", background: `linear-gradient(180deg, transparent, ${palette.primary}, ${palette.primary}, transparent)` }} />
        <div style={{ fontSize: "0.7rem", color: `${palette.primary}50`, lineHeight: 2.2, textAlign: "center", letterSpacing: "2px" }}>❋<br/>◆<br/>❋<br/>◆<br/>❋</div>
        <div style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", width: "10px", height: "10px", background: `radial-gradient(circle, ${palette.primary}, color-mix(in srgb, ${palette.primary} 40%, #000))`, borderRadius: "50%", boxShadow: `0 0 6px ${palette.primary}80` }} />
      </motion.div>

      {/* Right door */}
      <motion.div
        animate={{ rotateY: isOpen ? 140 : 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: "absolute", top: 0, right: 0, width: "50%", height: "100%",
          background: `linear-gradient(160deg, color-mix(in srgb, ${palette.background} 30%, #0e0900), color-mix(in srgb, ${palette.background} 50%, #1c1200))`,
          borderLeft: `2px solid ${palette.primary}60`,
          borderRadius: "0 3px 3px 0",
          transformOrigin: "right center",
          transformStyle: "preserve-3d",
          zIndex: 2, overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <div style={{ position: "absolute", left: "8px", top: 0, bottom: 0, width: "2px", background: `linear-gradient(180deg, transparent, ${palette.primary}, ${palette.primary}, transparent)` }} />
        <div style={{ fontSize: "0.7rem", color: `${palette.primary}50`, lineHeight: 2.2, textAlign: "center", letterSpacing: "2px" }}>❋<br/>◆<br/>❋<br/>◆<br/>❋</div>
        <div style={{ position: "absolute", left: "6px", top: "50%", transform: "translateY(-50%)", width: "10px", height: "10px", background: `radial-gradient(circle, ${palette.primary}, color-mix(in srgb, ${palette.primary} 40%, #000))`, borderRadius: "50%", boxShadow: `0 0 6px ${palette.primary}80` }} />
      </motion.div>

      {/* Closed hint */}
      {!isOpen && (
        <div style={{
          position: "absolute", bottom: "10px", width: "100%",
          textAlign: "center", fontSize: "0.42rem",
          color: `${palette.primary}60`, letterSpacing: "1px", zIndex: 5,
        }}>
          TAP TO OPEN
        </div>
      )}
    </div>
  )
}
