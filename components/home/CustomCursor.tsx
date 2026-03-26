"use client";
import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only on pointer-fine devices (real mouse)
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.body.classList.add("v3-page");

    let raf: number;
    let gx = 0, gy = 0;

    const onMove = (e: MouseEvent) => {
      const x = e.clientX, y = e.clientY;
      if (dotRef.current)  dotRef.current.style.transform  = `translate(${x}px,${y}px) translate(-50%,-50%)`;
      if (ringRef.current) ringRef.current.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
      // Glow follows with lag
      cancelAnimationFrame(raf);
      gx += (x - gx) * 0.12;
      gy += (y - gy) * 0.12;
      if (glowRef.current) glowRef.current.style.transform = `translate(${gx}px,${gy}px) translate(-50%,-50%)`;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.body.classList.remove("v3-page");
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div id="v3-cursor-dot"  ref={dotRef}  aria-hidden="true" />
      <div id="v3-cursor-ring" ref={ringRef} aria-hidden="true" />
      <div id="v3-cursor-glow" ref={glowRef} aria-hidden="true" />
    </>
  );
}
