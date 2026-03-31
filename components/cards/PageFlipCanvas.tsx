"use client";

import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { CardCanvasProps } from "./CardCanvas";

const PAPER_FILL = "linear-gradient(180deg, #fffaf0 0%, #f3ead8 100%)";
const PAPER_EDGE = "rgba(120, 86, 58, 0.16)";
const FOIL = "#f4d58b";
const ORNAMENT = "\u2726";

export function PageFlipCanvas({
  template,
  recipientName,
  senderName,
  message,
  selectedVerse,
  mode = "preview",
  contentMode = "template",
  autoOpen = false,
  interactive = true,
}: CardCanvasProps & { autoOpen?: boolean; interactive?: boolean }) {
  const reduceMotion = useReducedMotion();
  const isPreview = mode === "preview";
  const isTemplateMode = contentMode === "template";

  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const resolvedRecipient =
    recipientName?.trim() || (isTemplateMode ? "Your Loved One" : "Your Recipient");
  const resolvedSender = senderName?.trim() || (isTemplateMode ? "From You" : "You");
  const resolvedMessage = message?.trim()
    ? message.trim()
    : isTemplateMode
      ? "Personalise this card with names, a dua, and your own Eid message."
      : "Your heartfelt Eid message will appear here.";

  const titleSize = isPreview ? "1.18rem" : "1.5rem";
  const bodySize = isPreview ? "0.82rem" : "0.94rem";
  const smallSize = isPreview ? "0.48rem" : "0.58rem";
  const pagePadding = isPreview ? "16px 16px 18px" : "26px 24px 28px";

  const flipMs = reduceMotion ? 800 : 2500;
  const radius = isPreview ? "1rem" : "1.5rem";

  useEffect(() => {
    if (!autoOpen) return;
    const t = window.setTimeout(() => {
      setIsAnimating(true);
      setIsOpen(true);
    }, 1000);
    return () => window.clearTimeout(t);
  }, [autoOpen]);

  const handleToggle = useCallback(() => {
    if (!interactive || isAnimating) return;
    setIsAnimating(true);
    setIsOpen((prev) => !prev);
  }, [interactive, isAnimating]);

  const handleTransitionEnd = useCallback((e: React.TransitionEvent) => {
    if (e.propertyName === "transform") setIsAnimating(false);
  }, []);

  return (
    <div
      onClick={handleToggle}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: isPreview ? "3 / 4" : undefined,
        minHeight: !isPreview ? "520px" : undefined,
        cursor: interactive ? "pointer" : "default",
        userSelect: "none",
        overflow: "visible",
        perspective: "1400px",
        perspectiveOrigin: "50% 50%",
      }}
    >
      {/* Inside page — always rendered, revealed as cover rotates away */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          overflow: "hidden",
          background: PAPER_FILL,
          border: `1px solid ${PAPER_EDGE}`,
          boxShadow:
            "0 18px 44px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.34)",
        }}
      >
        {template.bgImageUrl ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${template.bgImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.07,
              filter: "sepia(0.45)",
            }}
          />
        ) : null}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(70,48,31,0.16) 0%, rgba(70,48,31,0.06) 12%, transparent 24%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: pagePadding,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: isPreview ? "12px" : "16px",
            color: "#3f2b1e",
          }}
        >
          <div>
            <div
              style={{
                fontSize: smallSize,
                letterSpacing: isPreview ? "1.4px" : "2px",
                textTransform: "uppercase",
                color: "rgba(82,56,36,0.74)",
                marginBottom: isPreview ? "8px" : "10px",
              }}
            >
              To {resolvedRecipient}
            </div>

            <div
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: titleSize,
                lineHeight: 1.14,
                color: "#2f1f14",
                marginBottom: isPreview ? "10px" : "12px",
              }}
            >
              {template.titleAr}
            </div>

            <div
              style={{
                fontSize: bodySize,
                lineHeight: 1.72,
                color: "#4a3424",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: isPreview ? 7 : 10,
                overflow: "hidden",
              }}
            >
              {resolvedMessage}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: isPreview ? "8px" : "12px",
            }}
          >
            {selectedVerse ? (
              <div
                style={{
                  borderTop: "1px solid rgba(120,86,58,0.18)",
                  paddingTop: isPreview ? "8px" : "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Amiri', serif",
                    fontSize: isPreview ? "0.76rem" : "0.98rem",
                    lineHeight: 1.55,
                    color: "#513827",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: isPreview ? 3 : 4,
                    overflow: "hidden",
                  }}
                >
                  {selectedVerse.textAr}
                </div>
                <div style={{ fontSize: smallSize, color: "rgba(82,56,36,0.7)" }}>
                  Quran {selectedVerse.ref}
                </div>
              </div>
            ) : null}

            <div
              style={{
                fontSize: smallSize,
                letterSpacing: isPreview ? "1.2px" : "1.6px",
                textTransform: "uppercase",
                color: "rgba(82,56,36,0.8)",
              }}
            >
              From {resolvedSender}
            </div>
          </div>
        </div>
      </div>

      {/* Front cover — rotates open on click */}
      <div
        onTransitionEnd={handleTransitionEnd}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          overflow: "hidden",
          background: `linear-gradient(160deg, color-mix(in srgb, ${template.bgColor} 38%, #23150a) 0%, color-mix(in srgb, ${template.bgColor} 78%, #090705) 100%)`,
          border: `1px solid ${FOIL}35`,
          boxShadow: "0 22px 48px rgba(0,0,0,0.36)",
          transformOrigin: "left center",
          transform: isOpen ? "rotateY(-180deg)" : "rotateY(0deg)",
          transition: reduceMotion
            ? `transform ${flipMs}ms ease`
            : `transform ${flipMs}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden" as React.CSSProperties["backfaceVisibility"],
        }}
      >
        {template.bgImageUrl ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${template.bgImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.55,
            }}
          />
        ) : null}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(8,7,6,0.18) 0%, rgba(8,7,6,0.48) 58%, rgba(8,7,6,0.72) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `repeating-linear-gradient(45deg, ${FOIL}10 0px, ${FOIL}10 1px, transparent 1px, transparent 14px)`,
            opacity: 0.48,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: isPreview ? "20px 18px" : "28px 24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: smallSize,
              letterSpacing: isPreview ? "2px" : "2.6px",
              textTransform: "uppercase",
              color: `${FOIL}db`,
            }}
          >
            Premium Eid Card
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: isPreview ? "10px" : "14px",
            }}
          >
            <div
              style={{
                width: isPreview ? "62px" : "78px",
                height: isPreview ? "62px" : "78px",
                borderRadius: "50%",
                border: `1px solid ${FOIL}70`,
                boxShadow: `0 0 22px ${FOIL}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: FOIL,
                fontSize: isPreview ? "1.3rem" : "1.8rem",
              }}
            >
              {ORNAMENT}
            </div>

            <div
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: isPreview ? "1.22rem" : "1.82rem",
                lineHeight: 1.12,
                color: "#fff6df",
                textShadow: "0 10px 26px rgba(0,0,0,0.35)",
              }}
            >
              {template.titleAr}
            </div>

            <div
              style={{
                fontSize: isPreview ? "0.56rem" : "0.72rem",
                letterSpacing: isPreview ? "1.6px" : "2.2px",
                textTransform: "uppercase",
                color: `${FOIL}d2`,
                lineHeight: 1.45,
              }}
            >
              {template.titleEn}
            </div>
          </div>

          <div
            style={{
              fontSize: smallSize,
              letterSpacing: isPreview ? "1.2px" : "1.8px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.76)",
            }}
          >
            {interactive ? "Tap to open" : "Golden Eid ul-Fitr"}
          </div>
        </div>
      </div>

      {/* Drop shadow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: isPreview ? "14px" : "18px",
          width: isPreview ? "108px" : "132px",
          height: isPreview ? "22px" : "28px",
          transform: "translateX(-50%)",
          borderRadius: "999px",
          background:
            "radial-gradient(circle at center, rgba(0,0,0,0.18), rgba(0,0,0,0))",
          filter: "blur(14px)",
          opacity: 0.22,
          pointerEvents: "none",
          transition: "opacity 320ms ease",
        }}
      />
    </div>
  );
}
