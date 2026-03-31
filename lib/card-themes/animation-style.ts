import type { AnimationStyle } from "@/types/card";

interface ResolveAnimationStyleInput {
  animationStyle?: string | null;
  bgImageUrl?: string | null;
  titleEn?: string | null;
  occasionSlug?: string | null;
}

export function resolveTemplateAnimationStyle({
  animationStyle,
  bgImageUrl,
  titleEn,
  occasionSlug,
}: ResolveAnimationStyleInput): AnimationStyle | null {
  if (animationStyle || bgImageUrl || titleEn || occasionSlug) {
    return "pageflip";
  }

  return null;
}
