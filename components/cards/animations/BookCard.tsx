"use client";

import { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ArtLayer } from "../ArtLayer";
import type { ECardData } from "@/types/card";

const ORNAMENT = "\u2726";
const PAPER_FILL = "linear-gradient(180deg, #fffaf0 0%, #f3ead8 100%)";
const PAPER_EDGE = "rgba(120,86,58,0.16)";

interface Props {
  card: ECardData;
  isOpen: boolean;
  onToggle: () => void;
}

export function BookCard({ card, isOpen, onToggle }: Props) {
  const reduceMotion = useReducedMotion();
  const { palette } = card;
  const rootRef = useRef<HTMLDivElement>(null);
  const sideShadowRef = useRef<HTMLDivElement>(null);
  const groundShadowRef = useRef<HTMLDivElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    if (!coverRef.current || !sideShadowRef.current || !groundShadowRef.current || !spineRef.current) {
      return;
    }

    const openDuration = reduceMotion ? 1.2 : 4.6;

    const context = gsap.context(() => {
      gsap.set(coverRef.current, {
        transformPerspective: 1600,
        transformOrigin: "left center",
        transformStyle: "preserve-3d",
        rotateY: 0,
      });
      gsap.set(sideShadowRef.current, {
        opacity: 0.08,
        scaleX: 0.86,
        transformOrigin: "left center",
      });
      gsap.set(groundShadowRef.current, {
        opacity: 0.22,
        scaleX: 1,
        transformOrigin: "center center",
      });
      gsap.set(spineRef.current, { opacity: 0.1 });

      const timeline = gsap.timeline({ paused: true });
      timeline
        .to(
          sideShadowRef.current,
          {
            opacity: 0.2,
            scaleX: 1.06,
            duration: openDuration,
            ease: "none",
          },
          0,
        )
        .to(
          groundShadowRef.current,
          {
            opacity: 0.3,
            scaleX: 1.14,
            duration: openDuration,
            ease: "none",
          },
          0,
        )
        .to(
          spineRef.current,
          {
            opacity: 0.24,
            duration: openDuration,
            ease: "none",
          },
          0,
        )
        .to(
          coverRef.current,
          {
            rotateY: -180,
            duration: openDuration,
            ease: "power2.inOut",
          },
          0,
        );

      timeline.progress(isOpen ? 1 : 0).pause();
      timelineRef.current = timeline;
    }, rootRef);

    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
      context.revert();
    };
  }, [card.id, isOpen, palette.background, palette.primary, reduceMotion]);

  useLayoutEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline || timeline.isActive()) return;
    if (isOpen) {
      timeline.play();
    } else {
      timeline.reverse();
    }
  }, [isOpen]);

  return (
    <div
      onClick={onToggle}
      ref={rootRef}
      style={{
        width: "200px",
        height: "270px",
        position: "relative",
        cursor: "pointer",
        perspective: "1600px",
        perspectiveOrigin: "50% 50%",
        userSelect: "none",
        overflow: "visible",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "0 12px 12px 0",
          overflow: "hidden",
          background: PAPER_FILL,
          border: `1px solid ${PAPER_EDGE}`,
          boxShadow: "0 16px 40px rgba(0,0,0,0.14)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(70,48,31,0.14) 0%, rgba(70,48,31,0.04) 10%, transparent 22%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "16px 14px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: "#3f2b1e",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.42rem",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "rgba(82,56,36,0.72)",
              }}
            >
              To your loved one
            </div>
            <div
              style={{
                marginTop: "8px",
                fontSize: "0.9rem",
                color: "#2f1f14",
                fontFamily: "serif",
                lineHeight: 1.15,
              }}
            >
              {card.arabicVerse}
            </div>
            <div
              style={{
                marginTop: "12px",
                fontSize: "0.44rem",
                color: "#4a3424",
                lineHeight: 1.7,
              }}
            >
              {card.englishMessage}
            </div>
          </div>

          <div
            style={{
              fontSize: "0.4rem",
              color: "rgba(82,56,36,0.72)",
              textTransform: "uppercase",
              letterSpacing: "1.2px",
            }}
          >
            {isOpen ? "Tap again to close" : "From you"}
          </div>
        </div>
      </div>

      <div
        ref={sideShadowRef}
        style={{
          position: "absolute",
          inset: "-2% -8% -2% auto",
          width: "40%",
          borderRadius: "999px",
          background: "radial-gradient(circle at left center, rgba(0,0,0,0.2), rgba(0,0,0,0))",
          filter: "blur(16px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div
        ref={spineRef}
        style={{
          position: "absolute",
          top: "6%",
          bottom: "6%",
          left: 0,
          width: "6px",
          transform: "translateX(-50%)",
          borderRadius: "999px",
          background: "linear-gradient(180deg, rgba(120,86,58,0.12), rgba(120,86,58,0.03))",
          boxShadow: "0 0 8px rgba(0,0,0,0.04)",
          pointerEvents: "none",
          zIndex: 4,
        }}
      />

      <div
        ref={coverRef}
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "left center",
          transformStyle: "preserve-3d",
          zIndex: 5,
          overflow: "visible",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: "12px",
            overflow: "hidden",
            background: `linear-gradient(160deg, color-mix(in srgb, ${palette.background} 38%, #23150a) 0%, color-mix(in srgb, ${palette.background} 78%, #090705) 100%)`,
            border: `1px solid ${palette.primary}45`,
            boxShadow: "0 18px 42px rgba(0,0,0,0.34)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `repeating-linear-gradient(45deg, ${palette.primary}12 0px, ${palette.primary}12 1px, transparent 1px, transparent 12px)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: "18px 14px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "0.42rem",
                letterSpacing: "1.8px",
                textTransform: "uppercase",
                color: `${palette.primary}cc`,
              }}
            >
              Islamic card
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "58px",
                  height: "58px",
                  borderRadius: "50%",
                  border: `1px solid ${palette.primary}70`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: palette.primary,
                  fontSize: "1.3rem",
                  boxShadow: `0 0 20px ${palette.primary}20`,
                }}
              >
                {ORNAMENT}
              </div>

              <div
                style={{
                  fontSize: "0.82rem",
                  color: "#fff7e6",
                  fontFamily: "serif",
                  lineHeight: 1.15,
                }}
              >
                {card.arabicLabel}
              </div>
            </div>

            <div
              style={{
                fontSize: "0.42rem",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.74)",
              }}
            >
              Tap to open
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            borderRadius: "12px 0 0 12px",
            overflow: "hidden",
            background: PAPER_FILL,
            border: `1px solid ${PAPER_EDGE}`,
            boxShadow: "0 16px 40px rgba(0,0,0,0.14)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: "16px 14px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              color: "#3f2b1e",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.42rem",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "rgba(82,56,36,0.72)",
                }}
              >
                Inside cover
              </div>
              <div
                style={{
                  fontSize: "0.86rem",
                  color: "#2f1f14",
                  fontFamily: "serif",
                  lineHeight: 1.16,
                  marginTop: "8px",
                }}
              >
                {card.arabicVerse}
              </div>
            </div>

            <div style={{ height: "74px", width: "100%" }}>
              <ArtLayer art={card.art} palette={palette} isOpen={isOpen} />
            </div>

            <div
              style={{
                fontSize: "0.4rem",
                color: "rgba(82,56,36,0.72)",
                textTransform: "uppercase",
                letterSpacing: "1.2px",
              }}
            >
              Islamic keepsake
            </div>
          </div>
        </div>
      </div>

      <div
        ref={groundShadowRef}
        style={{
          position: "absolute",
          left: "50%",
          bottom: "10px",
          width: "104px",
          height: "22px",
          transform: "translateX(-50%)",
          borderRadius: "999px",
          background: "radial-gradient(circle at center, rgba(0,0,0,0.18), rgba(0,0,0,0))",
          filter: "blur(14px)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
