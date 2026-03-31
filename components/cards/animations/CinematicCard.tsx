"use client"
import { useEffect, useState } from "react"
import { motion, useAnimation } from "framer-motion"
import type { ECardData } from "@/types/card"

const W = 480
const H = 480

// Pre-computed rising particles
const PX = Array.from({ length: 12 }, (_, i) => ({
  id:  i,
  x:   (i * 71 + 19) % 86 + 7,
  bot: (i * 43 + 11) % 50 + 10,
  s:   0.5 + (i % 3) * 0.4,
  dur: 4 + (i % 5) * 0.65,
  del: (i * 0.52) % 5.2,
}))

const KF = `
@keyframes cc-rise {
  0%   { transform: translateY(0);     opacity: 0    }
  12%  { opacity: 0.55 }
  88%  { opacity: 0.32 }
  100% { transform: translateY(-52px); opacity: 0    }
}
@keyframes cc-glow {
  0%,100% { opacity: 0.22; filter: blur(18px) }
  50%     { opacity: 0.38; filter: blur(24px)  }
}
@keyframes cc-shimmer {
  0%,100% { opacity: 0.7 }
  50%     { opacity: 1   }
}
`

type Phase = "idle" | "opening" | "open"

interface Props {
  card:      ECardData
  autoPlay?: boolean
  delay?:    number
}

export function CinematicCard({ card, autoPlay = true, delay = 1700 }: Props) {
  const [phase, setPhase] = useState<Phase>("idle")

  const cameraCtrl   = useAnimation()
  const rightCtrl    = useAnimation()
  const leftFadeCtrl = useAnimation()

  const gold = card.palette.primary
  const src  = card.art.src as string

  useEffect(() => {
    if (document.getElementById("cc-kf")) return
    const s = document.createElement("style")
    s.id = "cc-kf"
    s.textContent = KF
    document.head.appendChild(s)
  }, [])

  useEffect(() => {
    if (!autoPlay) return
    const t = setTimeout(async () => {
      setPhase("opening")

      void cameraCtrl.start({
        scale: 1.04,
        transition: { duration: 1.45, ease: [0.65, 0, 0.35, 1] },
      })

      void rightCtrl.start({
        rotateY: [0, -170, -165],
        transition: {
          duration: 1.45,
          times:    [0, 0.86, 1],
          ease:     [[0.65, 0, 0.35, 1] as never, "easeOut"],
        },
      })

      void leftFadeCtrl.start({
        opacity: 0,
        transition: { duration: 0.85, delay: 0.75, ease: "easeInOut" },
      })

      await new Promise<void>(r => setTimeout(r, 1700))
      setPhase("open")
    }, delay)
    return () => clearTimeout(t)
  }, [autoPlay, delay, cameraCtrl, rightCtrl, leftFadeCtrl])

  const isOpen    = phase === "open"
  const revealing = phase === "opening" || isOpen
  const isClosed  = phase === "idle"

  return (
    <div style={{
      width:             `${W}px`,
      height:            `${H}px`,
      perspective:       "1100px",
      perspectiveOrigin: "50% 48%",
    }}>
      <motion.div
        initial={{ scale: 1 }}
        animate={cameraCtrl}
        style={{ width: "100%", height: "100%", position: "relative" }}
      >

        {/* Dark background */}
        <div style={{
          position:     "absolute",
          inset:        0,
          background:   "#020b18",
          borderRadius: "6px",
          zIndex:       0,
        }} />

        {/* ── INTERIOR IMAGE ──────────────────────────────────────── */}
        <motion.div
          style={{
            position:     "absolute",
            inset:        0,
            borderRadius: "6px",
            overflow:     "hidden",
            zIndex:       1,
          }}
          initial={{ filter: "brightness(0.8)" }}
          animate={isOpen ? { filter: "brightness(1.05)" } : {}}
          transition={{ duration: 1.1, delay: 0.3 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            style={{
              width:      "100%",
              height:     "100%",
              objectFit:  "cover",
              display:    "block",
              userSelect: "none",
            }}
          />

          {revealing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.55 }}
              style={{
                position:      "absolute",
                inset:         0,
                pointerEvents: "none",
                background:    `radial-gradient(ellipse 70% 50% at 50% 42%,
                                 ${gold}1a 0%, transparent 65%)`,
                animation:     isOpen ? "cc-glow 2.6s ease-in-out infinite" : "none",
              }}
            />
          )}
        </motion.div>

        {/* ── LEFT COVER (back of card) ────────────────────────────
            Fades to transparent as the card opens.                */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={leftFadeCtrl}
          style={{
            position:      "absolute",
            top: 0, left: 0,
            width:         "50%",
            height:        "100%",
            background:    "#020b18",
            borderRadius:  "6px 0 0 6px",
            zIndex:        2,
            pointerEvents: "none",
            overflow:      "hidden",
          }}
        >
          <div style={{
            position:        "absolute",
            inset:           0,
            backgroundImage: `
              repeating-linear-gradient(45deg,  ${gold}07 0px, ${gold}07 1px, transparent 1px, transparent 16px),
              repeating-linear-gradient(-45deg, ${gold}07 0px, ${gold}07 1px, transparent 1px, transparent 16px)
            `,
          }} />
          <div style={{
            position:     "absolute",
            top:          "10px",
            left:         "10px",
            bottom:       "10px",
            right:        0,
            border:       `1px solid ${gold}30`,
            borderRight:  "none",
            borderRadius: "3px 0 0 3px",
          }} />
          <div style={{ position: "absolute", top: "18px",    left: "18px", width: "13px", height: "13px", borderTop:    `1.5px solid ${gold}55`, borderLeft: `1.5px solid ${gold}55` }} />
          <div style={{ position: "absolute", bottom: "18px", left: "18px", width: "13px", height: "13px", borderBottom: `1.5px solid ${gold}55`, borderLeft: `1.5px solid ${gold}55` }} />
          <div style={{
            position:      "absolute",
            left:          "50%",
            top:           "50%",
            transform:     "translate(-50%, -50%)",
            color:         `${gold}22`,
            fontSize:      "0.85rem",
            lineHeight:    2.2,
            textAlign:     "center",
            letterSpacing: "3px",
            userSelect:    "none",
          }}>
            ❖<br />◈<br />❖<br />◈<br />❖
          </div>
        </motion.div>

        {/* ── RIGHT COVER (front of card) ──────────────────────────
            Decorated front cover. Rotates outward to open.
            backfaceVisibility:hidden — vanishes past 90°.        */}
        <motion.div
          initial={{ rotateY: 0 }}
          animate={rightCtrl}
          style={{
            position:           "absolute",
            top: 0, right: 0,
            width:              "50%",
            height:             "100%",
            background:         "#020b18",
            transformOrigin:    "0% 50%",
            borderRadius:       "0 6px 6px 0",
            zIndex:             3,
            backfaceVisibility: "hidden",
            overflow:           "hidden",
          }}
        >
          {/* Background pattern */}
          <div style={{
            position:        "absolute",
            inset:           0,
            backgroundImage: `
              repeating-linear-gradient(45deg,  ${gold}09 0px, ${gold}09 1px, transparent 1px, transparent 16px),
              repeating-linear-gradient(-45deg, ${gold}09 0px, ${gold}09 1px, transparent 1px, transparent 16px)
            `,
          }} />

          {/* Warm radial vignette */}
          <div style={{
            position:   "absolute",
            inset:      0,
            background: `radial-gradient(ellipse 90% 80% at 50% 45%, ${gold}0e 0%, transparent 62%)`,
          }} />

          {/* Outer border */}
          <div style={{
            position:     "absolute",
            top:          "10px",
            left:         0,
            bottom:       "10px",
            right:        "10px",
            border:       `1px solid ${gold}45`,
            borderLeft:   "none",
            borderRadius: "0 4px 4px 0",
          }} />
          <div style={{
            position:     "absolute",
            top:          "17px",
            left:         0,
            bottom:       "17px",
            right:        "17px",
            border:       `1px solid ${gold}25`,
            borderLeft:   "none",
            borderRadius: "0 2px 2px 0",
          }} />

          {/* Corner ornaments */}
          <div style={{ position: "absolute", top: "20px",    right: "20px", width: "14px", height: "14px", borderTop:    `1.5px solid ${gold}65`, borderRight: `1.5px solid ${gold}65` }} />
          <div style={{ position: "absolute", bottom: "20px", right: "20px", width: "14px", height: "14px", borderBottom: `1.5px solid ${gold}65`, borderRight: `1.5px solid ${gold}65` }} />

          {/* Small crescent above arch */}
          <div style={{
            position:     "absolute",
            top:          "28px",
            left:         "50%",
            transform:    "translateX(-50%)",
            width:        "20px",
            height:       "20px",
            borderRadius: "50%",
            background:   gold,
            boxShadow:    `0 0 0 7px #020b18, 0 0 0 9px ${gold}cc, 0 0 14px ${gold}`,
          }} />

          {/* Arch frame */}
          <div style={{
            position:  "absolute",
            top:       "46px",
            left:      "50%",
            transform: "translateX(-50%)",
            width:     "158px",
            height:    "240px",
          }}>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "130px", border: `1.5px solid ${gold}80`, borderTop: "none" }} />
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "125px", border: `1.5px solid ${gold}80`, borderRadius: "79px 79px 0 0", borderBottom: "none" }} />
            <div style={{ position: "absolute", bottom: "7px", left: "9px", right: "9px", height: "110px", border: `1px solid ${gold}40`, borderTop: "none" }} />
            <div style={{ position: "absolute", top: "7px", left: "9px", right: "9px", height: "112px", border: `1px solid ${gold}40`, borderRadius: "62px 62px 0 0", borderBottom: "none" }} />

            {/* Warm inner glow */}
            <div style={{
              position:     "absolute",
              bottom:       0,
              left:         "9px",
              right:        "9px",
              height:       "78%",
              background:   `radial-gradient(ellipse 80% 60% at 50% 80%, ${gold}1e 0%, transparent 65%)`,
              borderRadius: "55px 55px 0 0",
              animation:    isClosed ? "cc-glow 3s ease-in-out infinite" : "none",
            }} />

            {/* Arabic calligraphy */}
            <div style={{
              position:      "absolute",
              top:           "52px",
              left:          0,
              right:         0,
              textAlign:     "center",
              fontSize:      "1.8rem",
              color:         gold,
              fontFamily:    "Georgia, 'Times New Roman', serif",
              lineHeight:    1.25,
              filter:        `drop-shadow(0 0 12px ${gold}cc)`,
              animation:     isClosed ? "cc-shimmer 3.2s ease-in-out infinite" : "none",
              userSelect:    "none",
            }}>
              عيد<br />مبارك
            </div>
          </div>

          {/* Bottom stars row */}
          <div style={{
            position:      "absolute",
            bottom:        "28px",
            left:          0,
            right:         "10px",
            textAlign:     "center",
            fontSize:      "0.6rem",
            color:         `${gold}55`,
            letterSpacing: "7px",
            userSelect:    "none",
          }}>
            ✦ ✦ ✦
          </div>
        </motion.div>

        {/* Centre spine — emanates from the minaret (~35% from top) downward */}
        {/* Wide glow bloom at the minaret origin point */}
        <div style={{
          position:      "absolute",
          top:           "30%",
          left:          "calc(50% - 14px)",
          transform:     "translateX(-50%)",
          width:         "32px",
          height:        "32px",
          borderRadius:  "50%",
          background:    `radial-gradient(circle, ${gold}66 0%, transparent 70%)`,
          zIndex:        4,
          pointerEvents: "none",
          filter:        "blur(4px)",
        }} />
        {/* The spine line itself */}
        <div style={{
          position:      "absolute",
          top:           0,
          bottom:        0,
          left:          "calc(50% - 14px)",
          width:         "2px",
          zIndex:        4,
          pointerEvents: "none",
          background:    `linear-gradient(180deg,
                           transparent  0%,
                           ${gold}10   25%,
                           ${gold}cc   34%,
                           ${gold}ff   38%,
                           ${gold}cc   42%,
                           ${gold}99   58%,
                           ${gold}66   76%,
                           ${gold}33   90%,
                           transparent  100%)`,
        }} />

        {/* Rising particles — after open */}
        {isOpen && PX.map(p => (
          <div key={p.id} style={{
            position:      "absolute",
            left:          `${p.x}%`,
            bottom:        `${p.bot}%`,
            width:         `${p.s}px`,
            height:        `${p.s}px`,
            borderRadius:  "50%",
            background:    gold,
            opacity:       0,
            zIndex:        5,
            pointerEvents: "none",
            animation:     `cc-rise ${p.dur}s ease-in-out ${p.del}s infinite`,
          }} />
        ))}

      </motion.div>
    </div>
  )
}
