"use client";
import { useEffect, useRef } from "react";

const AURORA_BANDS = [
  { w: 900, h: 600, top: "-20%", left: "-10%", bg: "rgba(201,168,76,0.9)", dur: "22s", tx: "60px", ty: "40px" },
  { w: 700, h: 500, top: "30%",  left: "40%",  bg: "rgba(78,205,196,0.9)", dur: "28s", tx: "-40px", ty: "50px" },
  { w: 600, h: 400, top: "60%",  left: "10%",  bg: "rgba(167,139,250,0.9)", dur: "18s", tx: "50px", ty: "-30px" },
];

const SHOOT_STARS = [
  { top: "10%", left: "20%", sx: "400px", sy: "300px", sd: "5s", sdel: "0s" },
  { top: "5%",  left: "60%", sx: "300px", sy: "400px", sd: "7s", sdel: "2.5s" },
  { top: "20%", left: "80%", sx: "-200px", sy: "350px", sd: "6s", sdel: "4s" },
  { top: "40%", left: "5%",  sx: "500px", sy: "200px", sd: "8s", sdel: "1s" },
];

export function AuroraBackground() {
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!starsRef.current) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 120; i++) {
      const s = document.createElement("div");
      s.className = "v3-star";
      const size = Math.random() * 2 + 0.5;
      s.style.cssText = `
        width:${size}px; height:${size}px;
        top:${Math.random() * 100}%;
        left:${Math.random() * 100}%;
        --d:${(Math.random() * 3 + 1.5).toFixed(1)}s;
        --star-a:${(Math.random() * 0.4 + 0.1).toFixed(2)};
        --star-b:${(Math.random() * 0.5 + 0.5).toFixed(2)};
        animation-delay:${(Math.random() * 4).toFixed(1)}s;
      `;
      frag.appendChild(s);
    }
    starsRef.current.appendChild(frag);
  }, []);

  return (
    <>
      {/* Aurora bands */}
      <div className="v3-aurora" aria-hidden="true">
        {AURORA_BANDS.map((b, i) => (
          <div
            key={i}
            className="v3-aurora-band"
            style={{
              width: b.w, height: b.h, top: b.top, left: b.left,
              background: b.bg,
              ["--dur" as string]: b.dur,
              ["--tx" as string]: b.tx,
              ["--ty" as string]: b.ty,
            }}
          />
        ))}
      </div>

      {/* Starfield */}
      <div
        ref={starsRef}
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
        aria-hidden="true"
      />

      {/* Shooting stars */}
      {SHOOT_STARS.map((s, i) => (
        <div
          key={i}
          className="v3-shoot"
          style={{
            top: s.top, left: s.left,
            ["--sx" as string]: s.sx,
            ["--sy" as string]: s.sy,
            ["--sd" as string]: s.sd,
            ["--sdel" as string]: s.sdel,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}
