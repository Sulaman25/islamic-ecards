"use client";

import { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import type { CardCanvasProps } from "./CardCanvas";

const PAPER_FILL = "linear-gradient(180deg, #fffaf0 0%, #f3ead8 100%)";
const PAPER_EDGE = "rgba(120, 86, 58, 0.16)";
const FOIL = "#f4d58b";
const GOLDEN_EID_GREETING_AR = "\u0639\u064A\u062F \u0627\u0644\u0641\u0637\u0631 \u0627\u0644\u0645\u0628\u0627\u0631\u0643";
const GOLDEN_EID_GREETING_EN = "Eid ul-Fitr Mubarak";
const GOLDEN_EID_TEAL = "#1f516d";
const GOLDEN_EID_GOLD = "#b98833";
const SPECIAL_EID_PAGEFLIP_KEYS = ["eid-gold-geometric", "eid-crescent", "eid-crescent-moon", "eid-arabesque"];
const SPECIAL_RAMADAN_PAGEFLIP_KEYS = ["ramadan-lantern"];
const SPECIAL_ARTWORK_PAGEFLIP_KEYS = [
  ...SPECIAL_EID_PAGEFLIP_KEYS,
  ...SPECIAL_RAMADAN_PAGEFLIP_KEYS,
];

export function GoldenBookCanvas({
  template,
  recipientName,
  senderName,
  message,
  selectedVerse,
  mode = "preview",
  contentMode = "personalized",
  autoOpen = false,
  interactive = true,
}: CardCanvasProps & {
  autoOpen?: boolean;
  interactive?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const isPreview = mode === "preview";
  const isTemplateMode = contentMode === "template";
  const isSpecialArtworkCard = SPECIAL_ARTWORK_PAGEFLIP_KEYS.some(key => template.bgImageUrl?.includes(key));
  const isSpecialEidCard = SPECIAL_EID_PAGEFLIP_KEYS.some(key => template.bgImageUrl?.includes(key));
  const isEidFitrMubarakCard = template.bgImageUrl?.includes("eid-crescent-front-photo") ?? false;
  const isCrescentMoonEidCard = template.bgImageUrl?.includes("eid-crescent-moon") ?? false;
  const isArabesqueEidCard = template.bgImageUrl?.includes("eid-arabesque") ?? false;
  const isRamadanArtworkCard = SPECIAL_RAMADAN_PAGEFLIP_KEYS.some(key => template.bgImageUrl?.includes(key));
  const isExactArtworkCoverCard =
    isCrescentMoonEidCard || isArabesqueEidCard || isRamadanArtworkCard;
  const isTextFreeCoverCard = isExactArtworkCoverCard || isEidFitrMubarakCard;
  const rootRef = useRef<HTMLDivElement>(null);
  const sideShadowRef = useRef<HTMLDivElement>(null);
  const groundShadowRef = useRef<HTMLDivElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const resolvedRecipient =
    recipientName?.trim() || (isTemplateMode ? "Your Loved One" : "Your Recipient");
  const resolvedSender = senderName?.trim() || (isTemplateMode ? "From You" : "You");
  const resolvedMessage = message?.trim()
    ? message.trim()
    : isTemplateMode
      ? isSpecialArtworkCard
        ? isRamadanArtworkCard
          ? "May this blessed month fill your home with light, your fasting with acceptance, and your nights with answered duas."
          : "May Allah accept your Ramadan and fill your Eid day with prayer, family, gifts, and sweet moments."
        : "Personalise this card with names, your own message, and an optional Quran verse."
      : "Your heartfelt message will appear here.";
  const coverEyebrow = isSpecialArtworkCard ? null : template.occasion.nameEn;
  const coverHeadingAr = isSpecialEidCard ? GOLDEN_EID_GREETING_AR : template.titleAr;
  const coverHeadingEn = isSpecialEidCard ? GOLDEN_EID_GREETING_EN : template.titleEn;
  const coverMessage = isSpecialArtworkCard ? null : resolvedMessage;
  const insideMediaUrl = template.insideMediaUrl ?? template.bgImageUrl;
  const insideMediaType =
    template.insideMediaType ??
    (insideMediaUrl?.toLowerCase().includes(".mp4") ? "video" : "image");
  const useFullPageInsideArtwork = isSpecialArtworkCard && insideMediaType === "image" && !!insideMediaUrl;
  const insideMediaLabel = isSpecialArtworkCard ? "Inside memory" : `${template.occasion.nameEn} media`;
  const insideMediaCaption = insideMediaType === "video" ? "A video inside the card" : "A picture inside the card";

  const radius = isPreview ? "1rem" : "1.5rem";
  const rightPageRadius = isPreview ? "0 1rem 1rem 0" : "0 1.5rem 1.5rem 0";
  const leftPageRadius = isPreview ? "1rem 0 0 1rem" : "1.5rem 0 0 1.5rem";
  const pageWidth = isPreview ? "min(100%, 320px)" : "min(100%, 390px)";
  const titleSize = isPreview ? "1.18rem" : "1.5rem";
  const bodySize = isPreview ? "0.82rem" : "0.94rem";
  const smallSize = isPreview ? "0.48rem" : "0.58rem";
  const pagePadding = isPreview ? "16px 16px 18px" : "26px 24px 28px";

  useLayoutEffect(() => {
    if (!coverRef.current || !sideShadowRef.current || !groundShadowRef.current || !spineRef.current) {
      return;
    }

    const openDuration = reduceMotion ? 1.2 : isPreview ? 4.8 : 5.2;
    const depthDuration = reduceMotion ? 1.2 : openDuration;

    const context = gsap.context(() => {
      gsap.set(coverRef.current, {
        transformPerspective: 2200,
        transformOrigin: "left center",
        transformStyle: "preserve-3d",
        rotateY: 0,
        x: 0,
        y: 0,
        scale: 1,
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

      const timeline = gsap.timeline({
        paused: true,
      });

      timeline
        .to(
          sideShadowRef.current,
          {
            opacity: 0.2,
            scaleX: 1.06,
            duration: depthDuration,
            ease: "none",
          },
          0,
        )
        .to(
          groundShadowRef.current,
          {
            opacity: 0.3,
            scaleX: 1.14,
            duration: depthDuration,
            ease: "none",
          },
          0,
        )
        .to(
          spineRef.current,
          {
            opacity: 0.24,
            duration: depthDuration,
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

      if (autoOpen) {
        timeline.progress(1);
      } else {
        timeline.progress(0);
      }

      timelineRef.current = timeline;
    }, rootRef);

    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
      context.revert();
    };
  }, [autoOpen, isPreview, reduceMotion]);

  const handleToggle = () => {
    const timeline = timelineRef.current;
    if (!interactive || !timeline || timeline.isActive()) return;

    if (timeline.progress() > 0.98) {
      timeline.reverse();
      return;
    }

    timeline.play();
  };

  return (
    <div
      onClick={handleToggle}
      ref={rootRef}
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
        <div
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
                opacity: isExactArtworkCoverCard ? 0 : 0.07,
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
            <div style={{ display: "flex", flexDirection: "column", gap: isPreview ? "12px" : "16px" }}>
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

              <div style={{ display: "flex", flexDirection: "column", gap: isPreview ? "6px" : "8px" }}>
                <div
                  style={{
                    fontSize: smallSize,
                    letterSpacing: isPreview ? "1.5px" : "2px",
                    textTransform: "uppercase",
                    color: "rgba(82,56,36,0.7)",
                  }}
                >
                  {coverEyebrow}
                </div>

                <div
                  style={{
                    fontFamily: "'Amiri', serif",
                    fontSize: titleSize,
                    lineHeight: 1.14,
                    color: "#2f1f14",
                  }}
                >
                  {coverHeadingAr}
                </div>

                <div
                  style={{
                    fontSize: isPreview ? "1.02rem" : "1.24rem",
                    lineHeight: 1.08,
                    color: "#2f1f14",
                    fontWeight: 700,
                  }}
                >
                  {coverHeadingEn}
                </div>
              </div>

              <div
                style={{
                  width: isPreview ? "44px" : "56px",
                  height: "1px",
                  background: "rgba(82,56,36,0.26)",
                }}
              />

              <div
                style={{
                  fontSize: bodySize,
                  lineHeight: 1.72,
                  color: "#4a3424",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: isPreview ? 6 : 8,
                  overflow: "hidden",
                }}
              >
                {resolvedMessage}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: isPreview ? "10px" : "14px" }}>
              {selectedVerse ? (
                <div
                  style={{
                    border: "1px solid rgba(120,86,58,0.16)",
                    background: "rgba(255,250,242,0.74)",
                    borderRadius: isPreview ? "12px" : "14px",
                    padding: isPreview ? "10px" : "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: isPreview ? "4px" : "6px",
                  }}
                >
                  <div
                    style={{
                      fontSize: smallSize,
                      letterSpacing: isPreview ? "1.3px" : "1.7px",
                      textTransform: "uppercase",
                      color: "rgba(82,56,36,0.72)",
                    }}
                  >
                    Quran reflection
                  </div>
                  <div
                    style={{
                      fontFamily: "'Amiri', serif",
                      fontSize: isPreview ? "0.76rem" : "0.98rem",
                      lineHeight: 1.55,
                      color: "#513827",
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: isPreview ? 3 : 5,
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
                  marginLeft: "auto",
                  minWidth: isPreview ? "96px" : "118px",
                  display: "flex",
                  flexDirection: "column",
                  gap: isPreview ? "3px" : "4px",
                  textAlign: "right",
                }}
              >
                <div
                  style={{
                    fontSize: smallSize,
                    letterSpacing: isPreview ? "1.2px" : "1.6px",
                    textTransform: "uppercase",
                    color: "rgba(82,56,36,0.66)",
                  }}
                >
                  From
                </div>
                <div
                  style={{
                    fontFamily: "'Amiri', serif",
                    fontSize: isPreview ? "0.92rem" : "1.1rem",
                    lineHeight: 1.15,
                    color: "#2f1f14",
                  }}
                >
                  {resolvedSender}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={sideShadowRef}
          style={{
            position: "absolute",
            inset: "-2% -6% -2% auto",
            width: "38%",
            borderRadius: "999px",
            background: "radial-gradient(circle at left center, rgba(0,0,0,0.22), rgba(0,0,0,0))",
            filter: "blur(18px)",
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
            width: isPreview ? "6px" : "8px",
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
                  backgroundSize: isExactArtworkCoverCard ? "100% 100%" : "cover",
                  backgroundPosition: isExactArtworkCoverCard ? "center center" : isSpecialArtworkCard ? "center 20%" : "center",
                  opacity: isExactArtworkCoverCard ? 1 : isSpecialArtworkCard ? 0.9 : 0.55,
                }}
              />
            ) : null}

            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  isExactArtworkCoverCard
                    ? "linear-gradient(180deg, rgba(255,250,240,0.01) 0%, rgba(24,37,52,0.02) 100%)"
                    : isSpecialArtworkCard
                    ? "linear-gradient(180deg, rgba(255,250,240,0.03) 0%, rgba(24,37,52,0.06) 46%, rgba(24,37,52,0.16) 100%)"
                    : "linear-gradient(180deg, rgba(8,7,6,0.18) 0%, rgba(8,7,6,0.48) 58%, rgba(8,7,6,0.72) 100%)",
              }}
            />

            {isSpecialArtworkCard && !isExactArtworkCoverCard ? (
              <div
                style={{
                  position: "absolute",
                  inset: "10% 10% 18%",
                  borderRadius: isPreview ? "20px" : "24px",
                  border: "1px solid rgba(189,145,67,0.12)",
                  background: "linear-gradient(180deg, rgba(255,250,240,0.14) 0%, rgba(255,250,240,0) 100%)",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
                }}
              />
            ) : null}

            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `repeating-linear-gradient(45deg, ${FOIL}10 0px, ${FOIL}10 1px, transparent 1px, transparent 14px)`,
                opacity: isExactArtworkCoverCard ? 0.06 : isSpecialArtworkCard ? 0.2 : 0.48,
              }}
            />

            <div
              style={{
                position: "absolute",
                inset: 0,
                padding: isPreview ? "18px 18px 20px" : "24px 24px 28px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                textAlign: "center",
              }}
            >
              {coverEyebrow ? (
                <div
                  style={{
                    fontSize: smallSize,
                    letterSpacing: isPreview ? "2px" : "2.6px",
                    textTransform: "uppercase",
                    color: `${FOIL}db`,
                  }}
                >
                  {coverEyebrow}
                </div>
              ) : null}

              {!isTextFreeCoverCard ? (
                <div
                  style={{
                    alignSelf: "stretch",
                    marginTop: "auto",
                    padding: isPreview ? "12px 12px 14px" : "16px 16px 18px",
                    borderRadius: isPreview ? "16px" : "18px",
                    border: isSpecialArtworkCard ? "none" : `1px solid ${FOIL}24`,
                    background: isSpecialArtworkCard ? "transparent" : "linear-gradient(180deg, rgba(9,7,5,0.24) 0%, rgba(9,7,5,0.6) 100%)",
                    boxShadow: isSpecialArtworkCard ? "none" : "0 18px 30px rgba(0,0,0,0.2)",
                    backdropFilter: isSpecialArtworkCard ? undefined : "blur(6px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: isSpecialArtworkCard ? (isPreview ? "8px" : "12px") : isPreview ? "6px" : "10px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Amiri', serif",
                      fontSize: isPreview ? "1.22rem" : "1.84rem",
                      lineHeight: 1.12,
                      color: isSpecialArtworkCard ? GOLDEN_EID_TEAL : "#fff6df",
                      textShadow: isSpecialArtworkCard ? "0 1px 0 rgba(255,255,255,0.55)" : "0 10px 26px rgba(0,0,0,0.35)",
                    }}
                  >
                    {coverHeadingAr}
                  </div>

                  <div
                    style={{
                      fontSize: isPreview ? "0.58rem" : "0.74rem",
                      letterSpacing: isPreview ? "1.6px" : "2.2px",
                      textTransform: "uppercase",
                      color: isSpecialArtworkCard ? GOLDEN_EID_GOLD : `${FOIL}d2`,
                      lineHeight: 1.45,
                      fontWeight: isSpecialArtworkCard ? 700 : 500,
                    }}
                  >
                    {coverHeadingEn}
                  </div>

                  {coverMessage ? (
                    <>
                      <div
                        style={{
                          width: isPreview ? "40px" : "52px",
                          height: "1px",
                          background: "rgba(244,213,139,0.36)",
                        }}
                      />

                      <div
                        style={{
                          maxWidth: isPreview ? "86%" : "88%",
                          fontSize: isPreview ? "0.64rem" : "0.82rem",
                          lineHeight: 1.5,
                          color: "rgba(255,246,223,0.92)",
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: isPreview ? 4 : 5,
                          overflow: "hidden",
                        }}
                      >
                        {coverMessage}
                      </div>
                    </>
                  ) : null}
                </div>
              ) : null}

              {!isSpecialArtworkCard ? (
                <div
                  style={{
                    fontSize: smallSize,
                    letterSpacing: isPreview ? "1.2px" : "1.8px",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.76)",
                  }}
                >
                  {interactive ? "Open to reveal your greeting" : coverHeadingEn}
                </div>
              ) : null}
            </div>

            {isCrescentMoonEidCard ? (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: isPreview ? "18%" : "18.5%",
                    right: isPreview ? "18%" : "18.5%",
                    bottom: isPreview ? "10.9%" : "11.5%",
                    textAlign: "center",
                    pointerEvents: "none",
                    fontFamily: "'Amiri', serif",
                    fontSize: isPreview ? "0.86rem" : "1.16rem",
                    lineHeight: 1.02,
                    color: GOLDEN_EID_TEAL,
                    textShadow: "0 1px 0 rgba(255,255,255,0.72)",
                  }}
                >
                  {coverHeadingAr}
                </div>

                <div
                  style={{
                    position: "absolute",
                    left: isPreview ? "18%" : "18.5%",
                    right: isPreview ? "18%" : "18.5%",
                    bottom: isPreview ? "8.2%" : "8.8%",
                    textAlign: "center",
                    pointerEvents: "none",
                    fontSize: isPreview ? "0.47rem" : "0.62rem",
                    letterSpacing: isPreview ? "1.35px" : "1.8px",
                    textTransform: "uppercase",
                    color: GOLDEN_EID_GOLD,
                    lineHeight: 1.2,
                    fontWeight: 700,
                  }}
                >
                  {coverHeadingEn}
                </div>
              </>
            ) : null}

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
                  opacity: isExactArtworkCoverCard ? 0 : 0.07,
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
              {useFullPageInsideArtwork ? (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${insideMediaUrl})`,
                    backgroundSize: isSpecialArtworkCard ? "cover" : "cover",
                    backgroundPosition: isSpecialArtworkCard ? "center" : "center",
                    backgroundRepeat: "no-repeat",
                  }}
                />
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: isPreview ? "12px" : "16px" }}>
                    <div
                      style={{
                        fontSize: smallSize,
                        letterSpacing: isPreview ? "1.6px" : "2px",
                        textTransform: "uppercase",
                        color: "rgba(82,56,36,0.74)",
                        marginBottom: isPreview ? "8px" : "12px",
                      }}
                    >
                      {insideMediaLabel}
                    </div>

                    <div
                      style={{
                        position: "relative",
                        minHeight: isPreview ? "198px" : "250px",
                        borderRadius: isPreview ? "18px" : "22px",
                        overflow: "hidden",
                        border: `1px solid ${FOIL}34`,
                        background:
                          "linear-gradient(180deg, rgba(50,31,18,0.96) 0%, rgba(18,11,6,0.98) 100%)",
                        boxShadow: "0 18px 34px rgba(44,27,17,0.12)",
                      }}
                    >
                      {insideMediaUrl ? (
                        insideMediaType === "video" ? (
                          <video
                            src={insideMediaUrl}
                            controls
                            playsInline
                            muted
                            loop
                            onClick={(event) => event.stopPropagation()}
                            style={{
                              position: "absolute",
                              inset: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              backgroundImage: `url(${insideMediaUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: isSpecialArtworkCard ? "center 24%" : "center",
                              opacity: 0.96,
                            }}
                          />
                        )
                      ) : (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: isPreview ? "0.72rem" : "0.86rem",
                            color: "rgba(255,246,223,0.78)",
                            textAlign: "center",
                            padding: "18px",
                          }}
                        >
                          Add a video or picture to this page.
                        </div>
                      )}

                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(180deg, rgba(8,7,6,0.08) 0%, rgba(8,7,6,0.18) 60%, rgba(8,7,6,0.4) 100%)",
                          pointerEvents: "none",
                        }}
                      />

                      <div
                        style={{
                          position: "absolute",
                          inset: isPreview ? "12px" : "14px",
                          borderRadius: isPreview ? "14px" : "18px",
                          border: `1px solid ${FOIL}22`,
                          pointerEvents: "none",
                        }}
                      />
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
                    {insideMediaCaption}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div
          ref={groundShadowRef}
          style={{
            position: "absolute",
            left: "50%",
            bottom: isPreview ? "14px" : "18px",
            width: isPreview ? "108px" : "132px",
            height: isPreview ? "22px" : "28px",
            transform: "translateX(-50%)",
            borderRadius: "999px",
            background: "radial-gradient(circle at center, rgba(0,0,0,0.18), rgba(0,0,0,0))",
            filter: "blur(14px)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}
