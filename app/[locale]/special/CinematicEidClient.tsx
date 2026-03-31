"use client";
import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import ParticleBackground from "./ParticleBackground";

// Keyframes extracted from the frames folder
const FRAME_NUMBERS = [
  69, 71, 75, 79, 82, 104, 116, 121, 122, 134, 141, 142, 144, 147, 152, 161, 
  162, 165, 181, 183, 184, 185, 192, 194, 197, 199, 204, 218, 228
];

export default function CinematicEidClient({ locale: _locale }: { locale: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Scene 1: Hero (0.0 - 0.2)
  const heroOpacity = useTransform(smoothProgress, [0, 0.1, 0.2], [1, 1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.2], [1, 0.8]);
  const titleY = useTransform(smoothProgress, [0, 0.2], [0, -100]);

  // Scene 2: Parallax (0.2 - 0.45)
  const parallaxOpacity = useTransform(smoothProgress, [0.15, 0.25, 0.4, 0.5], [0, 1, 1, 0]);
  const pattern1Y = useTransform(smoothProgress, [0.2, 0.5], ["20vh", "-20vh"]);
  const pattern2Y = useTransform(smoothProgress, [0.2, 0.5], ["40vh", "-40vh"]);
  const patternRotate = useTransform(smoothProgress, [0.2, 0.5], [0, 45]);

  // Scene 3: Card Interaction (0.45 - 0.85)
  const cardContainerOpacity = useTransform(smoothProgress, [0.4, 0.45, 0.85, 0.9], [0, 1, 1, 0]);
  const cardZ = useTransform(smoothProgress, [0.45, 0.55], [-1000, 0]);
  const cardScale = useTransform(smoothProgress, [0.45, 0.55, 0.7, 0.85], [0.4, 1, 1, 0.8]);
  const cardRotateY = useTransform(smoothProgress, [0.45, 0.55, 0.65], [-30, 0, -10]);
  
  // POP-UP WORLD Sequence (0.65 - 0.85)
  const sequenceOpacity = useTransform(smoothProgress, [0.65, 0.7, 0.85, 0.9], [0, 1, 1, 0]);
  const cardFaceOpacity = useTransform(smoothProgress, [0.65, 0.72], [1, 0]);
  
  // Map progress (0.72 - 0.85) to frame indices
  const frameIndex = useTransform(smoothProgress, [0.72, 0.85], [0, FRAME_NUMBERS.length - 1]);

  // Scene 4: Celebration (0.85 - 1.0)
  const celebrationOpacity = useTransform(smoothProgress, [0.85, 0.9, 1], [0, 1, 1]);
  const mubarackScale = useTransform(smoothProgress, [0.85, 0.95], [0.8, 1]);

  return (
    <div ref={containerRef} className="h-[500vh] relative">
      <ParticleBackground />

      <div className="fixed inset-0 bg-radial-gradient from-[#0d2b1a] to-[#061a10] z-0" />

      {/* SCENE 1: HERO */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale, y: titleY }}
        className="fixed inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
      >
        <h1 className="text-[#d4af37] text-8xl font-bold tracking-tighter mb-4">EID</h1>
        <p className="text-[#d4af37]/60 text-2xl tracking-[0.5em] uppercase">ul-Adha</p>
      </motion.section>

      {/* SCENE 2: PARALLAX WORLD */}
      <motion.section
        style={{ opacity: parallaxOpacity }}
        className="fixed inset-0 z-10 pointer-events-none overflow-hidden"
      >
        <motion.div style={{ y: pattern1Y, rotate: patternRotate }} className="absolute top-1/4 left-1/4 opacity-10">
          <Octagram size={400} />
        </motion.div>
        <motion.div style={{ y: pattern2Y, rotate: -patternRotate }} className="absolute bottom-1/4 right-1/4 opacity-10">
          <Octagram size={600} />
        </motion.div>
      </motion.section>

      {/* SCENE 3: CARD INTERACTION + POP-UP WORLD */}
      <motion.section
        style={{ opacity: cardContainerOpacity }}
        className="fixed inset-0 z-30 flex items-center justify-center perspective-[2000px]"
      >
        <motion.div
          style={{
            scale: cardScale,
            rotateY: cardRotateY,
            z: cardZ,
            transformStyle: "preserve-3d",
          }}
          className="relative w-[350px] h-[525px] flex items-center justify-center"
        >
          {/* Card Base Layer (Floral Card Face) */}
          <motion.div 
            style={{ opacity: cardFaceOpacity }}
            className="absolute inset-0 rounded-xl shadow-2xl overflow-hidden z-10"
          >
            <img 
              src="/images/cards/eid-adha-premium-floral.svg" 
              alt="Premium Eid Card"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Pop-up Sequence Layer */}
          <motion.div 
            style={{ opacity: sequenceOpacity }}
            className="absolute inset-0 z-20 flex items-center justify-center scale-150"
          >
            {FRAME_NUMBERS.map((num, idx) => (
              <FrameImage 
                key={num} 
                num={num} 
                index={idx} 
                currentIndex={frameIndex} 
              />
            ))}
          </motion.div>
        </motion.div>
      </motion.section>

      {/* SCENE 4: CELEBRATION */}
      <motion.section
        style={{ opacity: celebrationOpacity }}
        className="fixed inset-0 z-40 flex flex-col items-center justify-center pointer-events-none"
      >
        <motion.div style={{ scale: mubarackScale }} className="text-center">
          <h2 className="text-[#d4af37] text-6xl font-serif mb-4">Eid Mubarak</h2>
          <p className="text-[#d4af37]/80 text-lg tracking-widest uppercase">A Gift from the Heart</p>
        </motion.div>
      </motion.section>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 opacity-40">
        <div className="w-px h-12 bg-[#d4af37]" />
        <span className="text-[#d4af37] text-[10px] tracking-[0.3em] uppercase">Scroll</span>
      </div>
    </div>
  );
}

function FrameImage({
  num,
  index,
  currentIndex,
}: {
  num: number;
  index: number;
  currentIndex: MotionValue<number>;
}) {
  // Pad number to 4 digits (e.g., 0069)
  const padded = num.toString().padStart(4, "0");
  
  // Calculate opacity based on proximity to the current frame index
  const opacity = useTransform(
    currentIndex,
    [index - 1, index, index + 1],
    [0, 1, 0]
  );

  return (
    <motion.img
      src={`/animations/eid-sequence/frame_${padded}.png`}
      style={{ opacity }}
      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
    />
  );
}

function Octagram({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 440 440" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M220 0 L284 64 L376 64 L376 156 L440 220 L376 284 L376 376 L284 376 L220 440 L156 376 L64 376 L64 284 L0 220 L64 156 L64 64 L156 64 Z" 
        stroke="#d4af37" 
        strokeWidth="2"
      />
    </svg>
  );
}
