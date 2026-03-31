"use client";

import { CardCanvas, type CardCanvasTemplate } from "./CardCanvas";
import { BookCanvas } from "./BookCanvas";
import { GoldenBookCanvas } from "./GoldenBookCanvas";
import { resolveTemplateAnimationStyle } from "@/lib/card-themes/animation-style";

interface Props {
  template: CardCanvasTemplate;
  variant?: "stage" | "floating" | "thumb";
  cardWidth?: string;
}

export function TemplateCardPreview({
  template,
  variant = "floating",
  cardWidth,
}: Props) {
  const animationStyle = resolveTemplateAnimationStyle({
    animationStyle: template.animationStyle,
    bgImageUrl: template.bgImageUrl,
    titleEn: template.titleEn,
    occasionSlug: template.occasion.slug,
  });

  if (variant === "stage") {
    if (animationStyle === "pageflip") {
      return (
        <GoldenBookCanvas
          template={template}
          mode="preview"
          contentMode="template"
          autoOpen={false}
        />
      );
    }

    return animationStyle === "book" ? (
      <BookCanvas
        template={template}
        mode="preview"
        contentMode="template"
        autoOpen={false}
      />
    ) : (
      <CardCanvas template={template} mode="preview" contentMode="template" />
    );
  }

  if (variant === "thumb") {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: "inherit",
          overflow: "hidden",
          backgroundColor: template.bgColor,
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
              opacity: 0.88,
            }}
          />
        ) : null}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.12) 35%, rgba(0,0,0,0.62) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            padding: "2px 5px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.78)",
            fontSize: "0.4rem",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          {template.occasion.nameEn.split(" ")[0]}
        </div>

        <div
          style={{
            position: "absolute",
            left: "6px",
            right: "6px",
            bottom: "6px",
            color: "rgba(240,208,128,0.94)",
            fontFamily: "'Amiri', serif",
            fontSize: "0.62rem",
            lineHeight: 1.2,
            textAlign: "center",
            textShadow: "0 2px 10px rgba(0,0,0,0.55)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {template.titleAr}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 12px 0",
      }}
    >
      <div style={{ width: cardWidth ?? "min(150px, 72%)" }}>
        {animationStyle === "pageflip" ? (
          <GoldenBookCanvas
            template={template}
            mode="preview"
            contentMode="template"
            showAnimation={false}
            autoOpen={false}
            interactive={false}
          />
        ) : animationStyle === "book" ? (
          <BookCanvas
            template={template}
            mode="preview"
            contentMode="template"
            showAnimation={false}
            autoOpen={false}
            interactive={false}
          />
        ) : (
          <CardCanvas
            template={template}
            mode="preview"
            contentMode="template"
            showAnimation={false}
          />
        )}
      </div>
    </div>
  );
}
