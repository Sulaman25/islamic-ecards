"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { CardCanvasProps } from "./CardCanvas";

const PAPER_FILL = "linear-gradient(180deg, #fffaf0 0%, #f3ead8 100%)";
const PAPER_EDGE = "rgba(120, 86, 58, 0.16)";
const FOIL = "#f4d58b";
const BISMILLAH = "\u0628\u0633\u0645 \u0627\u0644\u0644\u0647 \u0627\u0644\u0631\u062d\u0645\u0646 \u0627\u0644\u0631\u062d\u064a\u0645";
const ORNAMENT = "\u2726";

export function BookCanvas({
  template,
  recipientName,
  senderName,
  message,
  selectedVerse,
  mode = "preview",
  contentMode = "personalized",
  autoOpen = false,
  interactive = true,
  motionProfile = "default",
}: CardCanvasProps & {
  autoOpen?: boolean;
  interactive?: boolean;
  motionProfile?: "default" | "deliberate";
}) {
  const reduceMotion = useReducedMotion();
  const isPreview = mode === "preview";
  const isTemplateMode = contentMode === "template";
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!autoOpen) {
      const closeTimer = window.setTimeout(() => setIsOpen(false), 0);
      return () => window.clearTimeout(closeTimer);
    }

    if (reduceMotion) {
      const openTimer = window.setTimeout(() => setIsOpen(true), 0);
      return () => window.clearTimeout(openTimer);
    }

    const closeTimer = window.setTimeout(() => setIsOpen(false), 0);
    const openTimer = window.setTimeout(() => setIsOpen(true), 520);
    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(openTimer);
    };
  }, [autoOpen, reduceMotion, template.bgImageUrl, template.titleEn]);

  const resolvedRecipient =
    recipientName?.trim() || (isTemplateMode ? "Your Loved One" : "Your Recipient");
  const resolvedSender = senderName?.trim() || (isTemplateMode ? "From You" : "You");
  const resolvedMessage = message?.trim()
    ? message.trim()
    : isTemplateMode
      ? "Personalise this card with names, a dua, and your own Eid message."
      : "Your heartfelt Eid message will appear here.";

  const radius = isPreview ? "1rem" : "1.5rem";
  const rightPageRadius = isPreview ? "0 1rem 1rem 0" : "0 1.5rem 1.5rem 0";
  const leftPageRadius = isPreview ? "1rem 0 0 1rem" : "1.5rem 0 0 1.5rem";
  const pageWidth = isPreview ? "min(100%, 320px)" : "min(100%, 390px)";
  const titleSize = isPreview ? "1.18rem" : "1.5rem";
  const bodySize = isPreview ? "0.82rem" : "0.94rem";
  const smallSize = isPreview ? "0.48rem" : "0.58rem";
  const pagePadding = isPreview ? "16px 16px 18px" : "26px 24px 28px";
  const isDeliberate = motionProfile === "deliberate";
  const depthTransition = reduceMotion
    ? { duration: 0.01 }
    : {
        duration: isOpen ? (isDeliberate ? 1.2 : 0.9) : (isDeliberate ? 0.6 : 0.35),
        ease: isDeliberate ? ([0.16, 0.72, 0.18, 1] as const) : ([0.2, 0.9, 0.25, 1] as const),
      };
  const coverTransition = reduceMotion
    ? { duration: 0.01 }
    : isOpen
      ? {
          duration: isDeliberate ? 5.8 : 4.2,
          ease: isDeliberate ? ([0.16, 0.02, 0.12, 1] as const) : ([0.06, 0.76, 0.2, 1] as const),
        }
      : {
          duration: isDeliberate ? 2.2 : 1.18,
          ease: isDeliberate ? ([0.28, 0.04, 0.16, 1] as const) : ([0.4, 0.02, 0.22, 1] as const),
        };

  return (
    <div
      onClick={interactive ? () => setIsOpen((open) => !open) : undefined}
      style={{
        position: "relative",
        width: "100%",
        minHeight: isPreview ? undefined : "520px",
        aspectRatio: isPreview ? "3 / 4" : undefined,
        perspective: "2200px",
        perspectiveOrigin: "50% 50%",
        cursor: interactive ? "pointer" : "default",
        userSelect: "none",
        overflow: "visible",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: pageWidth,
          aspectRatio: "3 / 4",
          overflow: "visible",
        }}
      >
        <motion.div
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
          }}
          transition={{ duration: 0.01 }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: rightPageRadius,
            overflow: "hidden",
            background: PAPER_FILL,
            border: `1px solid ${PAPER_EDGE}`,
            boxShadow: "0 18px 44px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.34)",
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

            <div style={{ display: "flex", flexDirection: "column", gap: isPreview ? "8px" : "12px" }}>
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
                {interactive && isOpen ? "Tap again to close" : `From ${resolvedSender}`}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          animate={{
            opacity: isOpen ? 0.18 : 0.08,
            scaleX: isOpen ? 1 : 0.86,
          }}
          transition={depthTransition}
          style={{
            position: "absolute",
            inset: "-2% -6% -2% auto",
            width: "38%",
            borderRadius: "999px",
            background: "radial-gradient(circle at left center, rgba(0,0,0,0.22), rgba(0,0,0,0))",
            filter: "blur(18px)",
            transformOrigin: "left center",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        <motion.div
          animate={{
            opacity: isOpen ? 0.24 : 0.1,
            scaleY: 1,
          }}
          transition={depthTransition}
          style={{
            position: "absolute",
            top: "6%",
            bottom: "6%",
            left: 0,
            width: isPreview ? "6px" : "8px",
            transform: "translateX(-50%)",
            borderRadius: "999px",
            background: "linear-gradient(180deg, rgba(120,86,58,0.12), rgba(120,86,58,0.03))",
            boxShadow: "0 0 8px rgba(0,0,0,0.04)",
            pointerEvents: "none",
            zIndex: 4,
          }}
        />

        <motion.div
          animate={{
            rotateY: isOpen
              ? (isDeliberate
                  ? [0, -6, -14, -28, -52, -84, -124, -180]
                  : [0, -8, -18, -36, -68, -108, -145, -180])
              : 0,
            x: isOpen
              ? (isDeliberate
                  ? [0, 0, -1, -2, -3, -5, -3, 0]
                  : [0, 0, -1, -2, -5, -8, -6, 0])
              : 0,
            y: isOpen
              ? (isDeliberate
                  ? [0, 0, -1, -1, -1, -2, -2, 0]
                  : [0, 0, -1, -1, -2, -4, -4, 0])
              : 0,
            scale: isOpen
              ? (isDeliberate
                  ? [1, 1, 1.001, 1.003, 1.005, 1.008, 1.006, 1]
                  : [1, 1, 1.002, 1.004, 1.008, 1.014, 1.012, 1])
              : 1,
          }}
          transition={{
            ...coverTransition,
            times: isOpen
              ? (isDeliberate
                  ? [0, 0.12, 0.24, 0.38, 0.54, 0.72, 0.88, 1]
                  : [0, 0.18, 0.3, 0.44, 0.6, 0.76, 0.9, 1])
              : undefined,
          }}
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
              borderRadius: radius,
              overflow: "hidden",
              background: `linear-gradient(160deg, color-mix(in srgb, ${template.bgColor} 38%, #23150a) 0%, color-mix(in srgb, ${template.bgColor} 78%, #090705) 100%)`,
              border: `1px solid ${FOIL}35`,
              boxShadow: "0 22px 48px rgba(0,0,0,0.36)",
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
              borderRadius: leftPageRadius,
              overflow: "hidden",
              background: PAPER_FILL,
              border: `1px solid ${PAPER_EDGE}`,
              boxShadow: "0 18px 44px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.34)",
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
                  "linear-gradient(90deg, rgba(70,48,31,0.06) 0%, transparent 20%, rgba(70,48,31,0.12) 100%)",
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
                color: "#3f2b1e",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: smallSize,
                    letterSpacing: isPreview ? "1.6px" : "2px",
                    textTransform: "uppercase",
                    color: "rgba(82,56,36,0.74)",
                    marginBottom: isPreview ? "8px" : "12px",
                  }}
                >
                  {template.occasion.nameEn}
                </div>

                <div
                  style={{
                    fontFamily: "'Amiri', serif",
                    fontSize: isPreview ? "1.12rem" : "1.52rem",
                    lineHeight: 1.18,
                    color: "#2f1f14",
                  }}
                >
                  {BISMILLAH}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: isPreview ? "10px" : "14px" }}>
                <div
                  style={{
                    width: isPreview ? "46px" : "58px",
                    height: "1px",
                    background: "rgba(82,56,36,0.26)",
                  }}
                />

                <div
                  style={{
                    fontSize: bodySize,
                    lineHeight: 1.75,
                    color: "#4a3424",
                  }}
                >
                  {isTemplateMode
                    ? "Open this card to add your own message, names, and a Quran verse."
                    : "A thoughtful Eid greeting crafted to feel like a keepsake."}
                </div>
              </div>

              <div
                style={{
                  fontSize: smallSize,
                  letterSpacing: isPreview ? "1.2px" : "1.6px",
                  textTransform: "uppercase",
                  color: "rgba(82,56,36,0.72)",
                }}
              >
                Inside cover
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
