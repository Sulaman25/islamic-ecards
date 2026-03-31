"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { AnimationStyle } from "@/types/card";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

function LottieLayer({ src }: { src: string }) {
  const [data, setData] = useState<object | null>(null);
  useEffect(() => {
    fetch(src).then(r => r.json()).then(setData).catch(() => {});
  }, [src]);
  if (!data) return null;
  return (
    <div className="absolute inset-0" style={{ opacity: 0.14 }}>
      <Lottie animationData={data} loop autoplay style={{ width: "100%", height: "100%" }} rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }} />
    </div>
  );
}

export interface CardCanvasTemplate {
  bgColor: string;
  bgImageUrl?: string;
  insideMediaUrl?: string;
  insideMediaType?: "image" | "video";
  titleAr: string;
  titleEn: string;
  animationFile?: string;
  animationStyle?: AnimationStyle | string | null;
  occasion: { slug: string; nameEn: string };
}

export interface CardCanvasProps {
  template: CardCanvasTemplate;
  recipientName?: string;
  senderName?: string;
  message?: string;
  selectedVerse?: { textAr: string; textEn?: string; ref: string } | null;
  fontStyle?: string;
  /** "preview" = compact studio panel | "full" = recipient view page */
  mode?: "preview" | "full";
  contentMode?: "personalized" | "template";
  showAnimation?: boolean;
}

type Theme = "eid" | "ramadan" | "laylatul" | "nikah" | "jummah" | "hajj" | "aqiqah" | "mawlid" | "islamicnewyear" | "graduation" | "general";

function getTheme(slug: string): Theme {
  if (slug.includes("eid")) return "eid";
  if (slug.includes("laylatul")) return "laylatul";
  if (slug.includes("ramadan")) return "ramadan";
  if (slug.includes("nikah")) return "nikah";
  if (slug.includes("jummah")) return "jummah";
  if (slug.includes("hajj")) return "hajj";
  if (slug.includes("aqiqah")) return "aqiqah";
  if (slug.includes("mawlid")) return "mawlid";
  if (slug.includes("islamic-new-year")) return "islamicnewyear";
  if (slug.includes("graduation")) return "graduation";
  return "general";
}

// Gradient overlays per theme
const GRADIENTS: Record<Theme, string> = {
  eid:           "radial-gradient(ellipse at 50% 30%, rgba(201,168,76,0.25) 0%, transparent 70%)",
  ramadan:       "radial-gradient(ellipse at 50% 20%, rgba(180,100,20,0.3) 0%, transparent 65%)",
  laylatul:      "radial-gradient(ellipse at 50% 30%, rgba(124,111,205,0.3) 0%, transparent 70%)",
  nikah:         "radial-gradient(ellipse at 50% 40%, rgba(220,160,100,0.2) 0%, transparent 70%)",
  jummah:        "radial-gradient(ellipse at 50% 30%, rgba(40,160,80,0.2)  0%, transparent 70%)",
  hajj:          "radial-gradient(ellipse at 50% 50%, rgba(180,150,60,0.2)  0%, transparent 65%)",
  aqiqah:        "radial-gradient(ellipse at 50% 30%, rgba(140,80,220,0.25) 0%, transparent 70%)",
  mawlid:        "radial-gradient(ellipse at 50% 40%, rgba(52,211,153,0.2)  0%, transparent 65%)",
  islamicnewyear:"radial-gradient(ellipse at 50% 40%, rgba(14,165,233,0.2)  0%, transparent 65%)",
  graduation:    "radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.2)  0%, transparent 65%)",
  general:       "radial-gradient(ellipse at 50% 30%, rgba(201,168,76,0.2)  0%, transparent 70%)",
};

// Particle colours per theme
const PARTICLE_COLOR: Record<Theme, string> = {
  eid:           "#f0d080",
  ramadan:       "#fbbf24",
  laylatul:      "#a78bfa",
  nikah:         "#fca5a5",
  jummah:        "#6ee7b7",
  hajj:          "#fcd34d",
  aqiqah:        "#c4b5fd",
  mawlid:        "#34d399",
  islamicnewyear:"#38bdf8",
  graduation:    "#818cf8",
  general:       "#f0d080",
};

const STAR_POLYGON_POINTS = "12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26";

// 15 stable particle positions (deterministic, no random)
const PARTICLES = [
  { x: 10, y: 80, d: 0    },
  { x: 25, y: 65, d: 0.4  },
  { x: 40, y: 90, d: 0.8  },
  { x: 55, y: 70, d: 1.2  },
  { x: 70, y: 85, d: 0.2  },
  { x: 85, y: 60, d: 1.6  },
  { x: 15, y: 50, d: 2.0  },
  { x: 90, y: 75, d: 0.6  },
  { x: 50, y: 95, d: 1.0  },
  { x: 33, y: 40, d: 2.4  },
  { x: 75, y: 45, d: 1.8  },
  { x: 60, y: 55, d: 0.3  },
  { x: 20, y: 30, d: 2.2  },
  { x: 80, y: 30, d: 1.4  },
  { x: 45, y: 20, d: 0.9  },
];

// ── Theme-specific animated backgrounds ──────────────────────────────────────

function EidBackground() {
  const rays = Array.from({ length: 12 }, (_, index) => index * 30);

  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 18%, rgba(251,191,36,0.16), transparent 30%), radial-gradient(circle at 50% 72%, rgba(255,255,255,0.08), transparent 38%)",
        }}
      />

      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 72, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 240 240" className="h-[88%] w-[88%] opacity-[0.14]" fill="none">
          <circle cx="120" cy="120" r="94" stroke="#f4d58b" strokeWidth="0.8" strokeDasharray="4 10" />
          <circle cx="120" cy="120" r="70" stroke="#f4d58b" strokeWidth="0.7" />
          <circle cx="120" cy="120" r="42" stroke="#f4d58b" strokeWidth="0.6" />
          <rect x="72" y="72" width="96" height="96" stroke="#f4d58b" strokeWidth="1.2" />
          <rect x="72" y="72" width="96" height="96" stroke="#f4d58b" strokeWidth="1.2" transform="rotate(45 120 120)" />
          <polygon
            points="120,44 138,102 196,120 138,138 120,196 102,138 44,120 102,102"
            stroke="#f4d58b"
            strokeWidth="1"
            fill="rgba(244,213,139,0.04)"
          />
          {rays.map((angle) => (
            <line
              key={angle}
              x1="120"
              y1="120"
              x2={120 + 98 * Math.cos((angle * Math.PI) / 180)}
              y2={120 + 98 * Math.sin((angle * Math.PI) / 180)}
              stroke="#f4d58b"
              strokeWidth="0.42"
              opacity="0.45"
            />
          ))}
        </svg>
      </motion.div>

      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 200 200" className="h-1/2 w-1/2 opacity-[0.16]" fill="none">
          <circle cx="100" cy="100" r="44" stroke="#f4d58b" strokeWidth="1" />
          <circle cx="100" cy="100" r="28" stroke="#f4d58b" strokeWidth="0.7" strokeDasharray="3 7" />
          <polygon
            points="100,66 110,90 136,90 116,106 124,132 100,118 76,132 84,106 64,90 90,90"
            stroke="#f4d58b"
            strokeWidth="1.2"
            fill="rgba(244,213,139,0.08)"
          />
          <path d="M100 28l6 14 14 6-14 6-6 14-6-14-14-6 14-6z" stroke="#f4d58b" strokeWidth="0.9" />
        </svg>
      </motion.div>
    </>
  );
}

function RamadanBackground() {
  return (
    <>
      {/* Crescent moon */}
      <div className="absolute top-6 right-8">
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path
              d="M22 4 C12 4 4 12 4 22 C4 32 12 40 22 40 C28 40 33 37 36 32 C30 31 26 26 26 20 C26 14 30 9 36 8 C33 5.5 28 4 22 4Z"
              fill="rgba(251,191,36,0.7)"
            />
          </svg>
        </motion.div>
      </div>
      {/* Swinging lantern */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2">
        <motion.div
          animate={{ rotate: [-10, 10, -10] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50% 0%" }}
        >
          <svg width="28" height="50" viewBox="0 0 28 50" fill="none">
            <line x1="14" y1="0" x2="14" y2="8" stroke="#fbbf24" strokeWidth="1.5" />
            <path d="M6,8 L22,8 L24,14 L24,36 L22,42 L6,42 L4,36 L4,14 Z" fill="rgba(251,191,36,0.25)" stroke="#fbbf24" strokeWidth="1.2" />
            <ellipse cx="14" cy="8" rx="8" ry="3" fill="none" stroke="#fbbf24" strokeWidth="1.2" />
            <ellipse cx="14" cy="42" rx="8" ry="3" fill="none" stroke="#fbbf24" strokeWidth="1.2" />
            {/* lantern glow */}
            <ellipse cx="14" cy="25" rx="5" ry="7" fill="rgba(251,191,36,0.3)" />
          </svg>
        </motion.div>
      </div>
      {/* Twinkling star field */}
      {[{x:15,y:15,d:0},{x:75,y:12,d:0.8},{x:88,y:30,d:1.5},{x:8,y:45,d:0.3},{x:92,y:55,d:2}].map((s,i) => (
        <div key={i} className="absolute" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
          <motion.div
            animate={{ opacity: [0.1, 1, 0.1], scale: [0.8, 1.3, 0.8] }}
            transition={{ duration: 2 + i*0.4, repeat: Infinity, delay: s.d }}
          >
            <svg width="6" height="6" viewBox="0 0 24 24" fill="#fbbf24">
              <polygon points={STAR_POLYGON_POINTS} />
            </svg>
          </motion.div>
        </div>
      ))}
    </>
  );
}

function NikahBackground() {
  return (
    <>
      {/* Arabesque mandala rotating */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 200 200" className="w-3/4 h-3/4 opacity-10" fill="none">
          {[0,30,60,90,120,150].map(angle => (
            <ellipse key={angle} cx="100" cy="100" rx="60" ry="20"
              stroke="#f0a080" strokeWidth="1" fill="none"
              transform={`rotate(${angle} 100 100)`} />
          ))}
          <circle cx="100" cy="100" r="8" fill="rgba(240,160,128,0.4)" />
        </svg>
      </motion.div>
      {/* Floating petals */}
      {[{x:20,y:70,d:0},{x:50,y:80,d:1},{x:80,y:60,d:2},{x:35,y:90,d:0.5},{x:65,y:85,d:1.5}].map((p,i) => (
        <div key={i} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          <motion.div
            animate={{ y: -60, opacity: [0, 0.8, 0], rotate: 180 }}
            transition={{ duration: 4, repeat: Infinity, delay: p.d, ease: "easeOut" }}
          >
            <svg width="10" height="14" viewBox="0 0 10 14" fill="rgba(252,165,165,0.7)">
              <ellipse cx="5" cy="7" rx="4" ry="6" />
            </svg>
          </motion.div>
        </div>
      ))}
    </>
  );
}

function JummahBackground() {
  return (
    <>
      {/* Mosque silhouette */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center opacity-20">
        <svg viewBox="0 0 200 80" className="w-full" fill="none">
          {/* Main dome */}
          <path d="M70,80 L70,45 Q70,20 100,20 Q130,20 130,45 L130,80 Z" fill="#6ee7b7" />
          <ellipse cx="100" cy="20" rx="30" ry="12" fill="#6ee7b7" />
          {/* Left minaret */}
          <rect x="30" y="35" width="12" height="45" fill="#6ee7b7" />
          <path d="M36,35 Q36,25 36,22" stroke="#6ee7b7" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="36" cy="33" rx="7" ry="4" fill="#6ee7b7" />
          {/* Right minaret */}
          <rect x="158" y="35" width="12" height="45" fill="#6ee7b7" />
          <path d="M164,35 Q164,25 164,22" stroke="#6ee7b7" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="164" cy="33" rx="7" ry="4" fill="#6ee7b7" />
        </svg>
      </div>
      {/* Light rays from top */}
      {[10,30,50,70,90].map((x,i) => (
        <motion.div key={i}
          className="absolute top-0 w-px"
          style={{ left: `${x}%`, background: "linear-gradient(to bottom, rgba(110,231,183,0.4), transparent)", height: "40%" }}
          animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, delay: i*0.5 }}
        />
      ))}
    </>
  );
}

function HajjBackground() {
  return (
    <>
      {/* Kaaba */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative" style={{ width: 60, height: 60 }}>
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="opacity-30">
            <rect x="10" y="12" width="40" height="38" fill="rgba(15,15,15,0.8)" stroke="#fcd34d" strokeWidth="1.5" />
            <rect x="18" y="30" width="10" height="20" fill="#fcd34d" opacity="0.4" />
            <rect x="10" y="20" width="40" height="4" fill="rgba(252,211,77,0.5)" />
            <line x1="30" y1="2" x2="30" y2="12" stroke="#fcd34d" strokeWidth="1.5" />
            <polygon points="30,2 40,6 30,10" fill="#fcd34d" />
          </svg>
          {[0,1,2,3,4,5].map((i) => (
            <motion.div
              key={i}
              style={{ position: "absolute", top: "50%", left: "50%", width: 0, height: 0 }}
              animate={{ rotate: [i * 60, i * 60 + 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <div style={{
                position: "absolute",
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "#fcd34d",
                top: -31,
                left: -3,
              }} />
            </motion.div>
          ))}
        </div>
      </div>
      {/* Night sky stars */}
      {[{x:10,y:10},{x:80,y:8},{x:90,y:25},{x:5,y:30},{x:88,y:60}].map((s,i) => (
        <div key={i} className="absolute" style={{ left:`${s.x}%`, top:`${s.y}%` }}>
          <motion.div animate={{ opacity:[0.2,1,0.2] }} transition={{ duration:2+i*0.5, repeat:Infinity, delay:i*0.4 }}>
            <svg width="5" height="5" viewBox="0 0 24 24" fill="#fcd34d">
              <polygon points={STAR_POLYGON_POINTS} />
            </svg>
          </motion.div>
        </div>
      ))}
    </>
  );
}

function AqiqahBackground() {
  return (
    <>
      {/* Soft crescent */}
      <div className="absolute top-4 right-6 opacity-50">
        <motion.div animate={{ opacity:[0.4,0.9,0.4] }} transition={{ duration:4, repeat:Infinity }}>
          <svg width="36" height="36" viewBox="0 0 44 44" fill="none">
            <path d="M22 4 C12 4 4 12 4 22 C4 32 12 40 22 40 C28 40 33 37 36 32 C30 31 26 26 26 20 C26 14 30 9 36 8 C33 5.5 28 4 22 4Z" fill="rgba(196,181,253,0.8)" />
          </svg>
        </motion.div>
      </div>
      {/* Floating sparkle stars */}
      {PARTICLES.slice(0,10).map((p,i) => (
        <div key={i} className="absolute" style={{ left:`${p.x}%`, top:`${p.y}%` }}>
          <motion.div
            animate={{ opacity:[0,0.9,0], y:-50, scale:[0.5,1,0.5] }}
            transition={{ duration:3+i*0.3, repeat:Infinity, delay:p.d*1.2 }}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="#c4b5fd">
              <polygon points={STAR_POLYGON_POINTS} />
            </svg>
          </motion.div>
        </div>
      ))}
    </>
  );
}

function LaylatolQadrBackground() {
  // Night of Power — pulsing concentric rings of divine light descending from above
  return (
    <>
      {/* Descending light column */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 top-0"
        style={{ width: 2, height: "55%", background: "linear-gradient(to bottom, rgba(167,139,250,0.6), transparent)" }}
        animate={{ opacity: [0.3, 0.9, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Concentric pulsing rings */}
      {[40, 65, 90].map((r, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: r * 2, height: r * 2, border: "1px solid rgba(167,139,250,0.3)" }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}
        />
      ))}
      {/* Violet star field */}
      {[{x:12,y:8,d:0},{x:78,y:6,d:1},{x:88,y:22,d:0.5},{x:6,y:35,d:1.8},{x:94,y:48,d:0.9},{x:50,y:5,d:2.2}].map((s,i) => (
        <div key={i} className="absolute" style={{ left:`${s.x}%`, top:`${s.y}%` }}>
          <motion.div
            animate={{ opacity:[0.1,0.9,0.1], scale:[0.7,1.2,0.7] }}
            transition={{ duration:2.5+i*0.3, repeat:Infinity, delay:s.d }}
          >
            <svg width="5" height="5" viewBox="0 0 24 24" fill="#a78bfa">
              <polygon points={STAR_POLYGON_POINTS} />
            </svg>
          </motion.div>
        </div>
      ))}
    </>
  );
}

function MawlidBackground() {
  // Birth of the Prophet — 12-pointed Islamic geometric star in emerald, rising light
  const pts12 = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 - 90) * (Math.PI / 180);
    const r = i % 2 === 0 ? 80 : 40;
    return `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}`;
  }).join(" ");
  return (
    <>
      {/* Rotating 12-pointed star */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 200 200" className="w-4/5 h-4/5 opacity-10" fill="none">
          <polygon points={pts12} stroke="#34d399" strokeWidth="1.2" fill="rgba(52,211,153,0.08)" />
          <circle cx="100" cy="100" r="38" stroke="#34d399" strokeWidth="0.8" fill="none" />
          <circle cx="100" cy="100" r="18" stroke="#34d399" strokeWidth="0.8" fill="none" />
        </svg>
      </motion.div>
      {/* Counter-rotating inner hexagon */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 200 200" className="w-2/5 h-2/5 opacity-15" fill="none">
          <polygon
            points="100,60 133,80 133,120 100,140 67,120 67,80"
            stroke="#34d399" strokeWidth="1.5" fill="none"
          />
        </svg>
      </motion.div>
      {/* Rising emerald light from bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{ background: "linear-gradient(to top, rgba(52,211,153,0.12), transparent)" }}
      />
    </>
  );
}

function IslamicNewYearBackground() {
  // Hijri New Year — time spiral, crescent + star, cerulean tide
  return (
    <>
      {/* Logarithmic spiral — SVG path approximation */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 200 200" className="w-4/5 h-4/5 opacity-10" fill="none">
          {[20,38,56,74,92].map((r,i) => (
            <circle key={i} cx="100" cy="100" r={r} stroke="#0ea5e9" strokeWidth="0.8" fill="none" strokeDasharray={`${r * 0.6} ${r * 0.4}`} />
          ))}
          {[0,60,120,180,240,300].map(a => (
            <line key={a}
              x1="100" y1="100"
              x2={100 + 92*Math.cos(a*Math.PI/180)}
              y2={100 + 92*Math.sin(a*Math.PI/180)}
              stroke="#0ea5e9" strokeWidth="0.5" strokeDasharray="3 6" />
          ))}
        </svg>
      </motion.div>
      {/* Crescent + star top-right */}
      <div className="absolute top-5 right-7 opacity-60">
        <motion.div animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:4, repeat:Infinity }}>
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
            <path d="M21 3 C12 3 4 11 4 21 C4 31 12 39 21 39 C27 39 32 36 35 31 C29 30 25 25 25 19 C25 13 29 8 35 7 C32 4.5 27 3 21 3Z"
              fill="rgba(14,165,233,0.65)" />
            <polygon points="33,7 34.5,11 39,11 35.5,13.5 37,17.5 33,15 29,17.5 30.5,13.5 27,11 31.5,11"
              fill="rgba(14,165,233,0.9)" />
          </svg>
        </motion.div>
      </div>
      {/* Cerulean wave shimmer at bottom */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1/4"
        style={{ background: "linear-gradient(to top, rgba(14,165,233,0.15), transparent)" }}
        animate={{ opacity:[0.6,1,0.6] }}
        transition={{ duration:3, repeat:Infinity }}
      />
    </>
  );
}

function GraduationBackground() {
  // Islamic graduation — sapphire light-rays, knowledge lattice
  return (
    <>
      {/* Radial knowledge beams */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full opacity-8" fill="none">
          {Array.from({length:12},(_,i) => {
            const a = i * 30 * Math.PI / 180;
            return <line key={i} x1="100" y1="100"
              x2={100+95*Math.cos(a)} y2={100+95*Math.sin(a)}
              stroke="#6366f1" strokeWidth="0.6" strokeDasharray="4 8" />;
          })}
        </svg>
      </motion.div>
      {/* Pulsing achievement star at centre */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale:[0.95,1.05,0.95], opacity:[0.5,0.9,0.5] }}
          transition={{ duration:3, repeat:Infinity }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <polygon points={STAR_POLYGON_POINTS} fill="rgba(99,102,241,0.2)" stroke="#6366f1" strokeWidth="0.8" />
          </svg>
        </motion.div>
      </div>
      {/* Rising sapphire motes */}
      {[{x:20,y:85,d:0},{x:40,y:90,d:0.7},{x:60,y:80,d:1.4},{x:75,y:88,d:2.1},{x:85,y:75,d:0.3}].map((p,i) => (
        <div key={i} className="absolute" style={{ left:`${p.x}%`, top:`${p.y}%` }}>
          <motion.div
            animate={{ y:-70, opacity:[0,0.8,0] }}
            transition={{ duration:3.5+i*0.4, repeat:Infinity, delay:p.d }}
          >
            <div className="rounded-full" style={{ width:3, height:3, background:"#818cf8" }} />
          </motion.div>
        </div>
      ))}
      {/* Book / scroll motif bottom-left */}
      <div className="absolute bottom-4 left-4 opacity-15">
        <svg width="32" height="28" viewBox="0 0 32 28" fill="none">
          <rect x="4" y="2" width="24" height="24" rx="2" stroke="#fcd34d" strokeWidth="1.2" fill="none" />
          <line x1="16" y1="2" x2="16" y2="26" stroke="#fcd34d" strokeWidth="0.8" />
          <line x1="7" y1="8" x2="13" y2="8"  stroke="#fcd34d" strokeWidth="0.8" />
          <line x1="7" y1="12" x2="13" y2="12" stroke="#fcd34d" strokeWidth="0.8" />
          <line x1="7" y1="16" x2="13" y2="16" stroke="#fcd34d" strokeWidth="0.8" />
          <line x1="19" y1="8" x2="25" y2="8"  stroke="#fcd34d" strokeWidth="0.8" />
          <line x1="19" y1="12" x2="25" y2="12" stroke="#fcd34d" strokeWidth="0.8" />
          <line x1="19" y1="16" x2="25" y2="16" stroke="#fcd34d" strokeWidth="0.8" />
        </svg>
      </div>
    </>
  );
}

function GeneralBackground() {
  return (
    <>
      {/* 6-fold geometric mandala */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 200 200" className="w-4/5 h-4/5 opacity-10" fill="none">
          {[0,30,60,90,120,150].map(a => (
            <line key={a}
              x1="100" y1="100"
              x2={100 + 85*Math.cos(a*Math.PI/180)}
              y2={100 + 85*Math.sin(a*Math.PI/180)}
              stroke="#c9a84c" strokeWidth="1" />
          ))}
          <circle cx="100" cy="100" r="85" stroke="#c9a84c" strokeWidth="1" fill="none" />
          <circle cx="100" cy="100" r="55" stroke="#c9a84c" strokeWidth="0.8" fill="none" />
          <circle cx="100" cy="100" r="28" stroke="#c9a84c" strokeWidth="0.8" fill="none" />
        </svg>
      </motion.div>
    </>
  );
}

// ── Floating particles (all themes) ──────────────────────────────────────────

function Particles({ color }: { color: string }) {
  return (
    <>
      {PARTICLES.map((p, i) => (
        <div key={i} className="absolute pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          <motion.div
            animate={{ y: -100, opacity: [0, 0.8, 0] }}
            transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: p.d + i * 0.2, ease: "easeOut" }}
          >
            <div className="rounded-full" style={{ width: 2 + (i % 3), height: 2 + (i % 3), backgroundColor: color }} />
          </motion.div>
        </div>
      ))}
    </>
  );
}

// ── The main component ────────────────────────────────────────────────────────

export function CardCanvas({
  template,
  recipientName,
  senderName,
  message,
  selectedVerse,
  fontStyle = "amiri",
  mode = "full",
  contentMode = "personalized",
  showAnimation = true,
}: CardCanvasProps) {
  const t = useTranslations("view");
  const theme = getTheme(template.occasion.slug);
  const particleColor = PARTICLE_COLOR[theme];
  const gradient = GRADIENTS[theme];

  const isPreview = mode === "preview";
  const isTemplateMode = contentMode === "template";
  const hasMessage = Boolean(message?.trim());
  const resolvedMessage = hasMessage
    ? message!.trim()
    : isTemplateMode
      ? template.titleEn
      : "Your personalised message will appear here...";
  const showRecipient = Boolean(recipientName) || !isTemplateMode;
  const showMessage = hasMessage || isTemplateMode || !isPreview;
  const showSender = Boolean(senderName) || !isTemplateMode;
  const messageUsesArabicFont = hasMessage && fontStyle === "amiri";

  return (
    <div
      className={`relative overflow-hidden flex flex-col items-center justify-center ${isPreview ? "rounded-2xl aspect-[3/4] p-6" : "rounded-3xl p-8"} shadow-2xl`}
      style={{ backgroundColor: template.bgColor, minHeight: isPreview ? undefined : "520px" }}
    >
      {/* SVG background image */}
      {template.bgImageUrl && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: `url(${template.bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.6 }}
        />
      )}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: gradient }} />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {template.animationFile && showAnimation ? <LottieLayer src={template.animationFile} /> : null}
        {theme === "eid"           && <EidBackground />}
        {theme === "ramadan"       && <RamadanBackground />}
        {theme === "laylatul"      && <LaylatolQadrBackground />}
        {theme === "nikah"         && <NikahBackground />}
        {theme === "jummah"        && <JummahBackground />}
        {theme === "hajj"          && <HajjBackground />}
        {theme === "aqiqah"        && <AqiqahBackground />}
        {theme === "mawlid"        && <MawlidBackground />}
        {theme === "islamicnewyear"&& <IslamicNewYearBackground />}
        {theme === "graduation"    && <GraduationBackground />}
        {theme === "general"       && <GeneralBackground />}
        <Particles color={particleColor} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center w-full gap-2">
        <motion.p
          className={`font-arabic text-amber-300 ${isPreview ? "text-base" : "text-xl"} mb-2`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        >
          بسم الله الرحمن الرحيم
        </motion.p>

        <motion.p
          className={`text-amber-400 font-bold tracking-widest uppercase ${isPreview ? "text-[9px]" : "text-xs"} mb-1`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          {template.occasion.nameEn}
        </motion.p>

        <motion.p
          className={`font-arabic text-white ${isPreview ? "text-xl" : "text-3xl"} mb-3 drop-shadow`}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        >
          {template.titleAr}
        </motion.p>

        {showRecipient && (
          <motion.div
            className="mb-2"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          >
            <p className={`text-white/50 ${isPreview ? "text-[10px]" : "text-sm"}`}>{t("to")}</p>
            <p className={`text-white font-semibold ${isPreview ? "text-lg" : "text-2xl"}`}>
              {recipientName || "Your Recipient"}
            </p>
          </motion.div>
        )}

        {showMessage && (
          <motion.p
            className={`text-white/85 leading-relaxed ${isPreview ? "text-xs max-w-[160px]" : "text-base max-w-xs"} ${messageUsesArabicFont ? "font-arabic" : ""}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          >
            {resolvedMessage}
          </motion.p>
        )}

        {selectedVerse && (
          <motion.div
            className={`border-t border-amber-400/30 pt-3 mt-2 w-full ${isPreview ? "max-w-[180px]" : "max-w-xs"}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          >
            <p className={`font-arabic text-amber-300 leading-relaxed ${isPreview ? "text-sm" : "text-lg"}`}>
              {selectedVerse.textAr}
            </p>
            {selectedVerse.textEn && !isPreview && (
              <p className="text-white/60 text-sm italic mt-1">&ldquo;{selectedVerse.textEn}&rdquo;</p>
            )}
            <p className={`text-amber-500 ${isPreview ? "text-[9px]" : "text-xs"} mt-1`}>
              — Quran {selectedVerse.ref}
            </p>
          </motion.div>
        )}

        {showSender && (
          <motion.p
            className={`text-white/40 ${isPreview ? "text-[10px]" : "text-sm"} mt-3`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          >
            {t("fromLabel", { name: senderName || "You" })}
          </motion.p>
        )}
      </div>
    </div>
  );
}
