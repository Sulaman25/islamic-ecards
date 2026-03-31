import type { CardCanvasTemplate } from "@/components/cards/CardCanvas";

const GOLDEN_EID_TEMPLATE_KEY = "eid-gold-geometric";
const GOLDEN_EID_FRONT = "/images/cards/eid-gold-geometric-front-photo.png";
const GOLDEN_EID_INSIDE = "/images/cards/eid-gold-geometric-inside-photo.png";
const CRESCENT_EID_TEMPLATE_KEY = "eid-crescent";
const CRESCENT_EID_SOURCE = "/images/cards/eid-crescent.svg";
const CRESCENT_EID_FRONT = "/images/cards/eid-crescent-front-photo.png";
const CRESCENT_EID_INSIDE = "/images/cards/eid-crescent-inside-photo.png";
const CRESCENT_MOON_EID_TEMPLATE_KEY = "eid-crescent-moon";
const CRESCENT_MOON_EID_TITLE = "Crescent Moon Eid";
const CRESCENT_MOON_EID_FRONT = "/images/cards/eid-crescent-moon-front-photo.png";
const CRESCENT_MOON_EID_INSIDE = "/images/cards/eid-crescent-moon-inside-photo.png";
const ARABESQUE_EID_TEMPLATE_KEY = "eid-arabesque";
const ARABESQUE_EID_SOURCE = "/images/cards/eid-arabesque.svg";
const ARABESQUE_EID_FRONT = "/images/cards/eid-arabesque-front-photo.png";
const ARABESQUE_EID_INSIDE = "/images/cards/eid-arabesque-inside-photo.png";

export function applySpecialTemplateArtwork(template: CardCanvasTemplate): CardCanvasTemplate {
  if (template.bgImageUrl?.includes(GOLDEN_EID_TEMPLATE_KEY)) {
    return {
      ...template,
      bgImageUrl: GOLDEN_EID_FRONT,
      insideMediaUrl: GOLDEN_EID_INSIDE,
      insideMediaType: "image",
    };
  }

  if (
    template.bgImageUrl?.includes(CRESCENT_MOON_EID_TEMPLATE_KEY) ||
    template.bgImageUrl === CRESCENT_MOON_EID_FRONT ||
    (
      template.titleEn === CRESCENT_MOON_EID_TITLE &&
      template.animationStyle === "pageflip" &&
      template.occasion.slug === "eid-ul-fitr"
    )
  ) {
    return {
      ...template,
      bgImageUrl: CRESCENT_MOON_EID_FRONT,
      insideMediaUrl: CRESCENT_MOON_EID_INSIDE,
      insideMediaType: "image",
    };
  }

  if (
    template.bgImageUrl === CRESCENT_EID_SOURCE ||
    template.bgImageUrl === CRESCENT_EID_FRONT ||
    template.bgImageUrl?.includes(`${CRESCENT_EID_TEMPLATE_KEY}.svg`)
  ) {
    return {
      ...template,
      bgImageUrl: CRESCENT_EID_FRONT,
      insideMediaUrl: CRESCENT_EID_INSIDE,
      insideMediaType: "image",
    };
  }

  if (
    template.bgImageUrl === ARABESQUE_EID_SOURCE ||
    template.bgImageUrl === ARABESQUE_EID_FRONT ||
    template.bgImageUrl?.includes(ARABESQUE_EID_TEMPLATE_KEY)
  ) {
    return {
      ...template,
      bgImageUrl: ARABESQUE_EID_FRONT,
      insideMediaUrl: ARABESQUE_EID_INSIDE,
      insideMediaType: "image",
    };
  }

  return template;
}
