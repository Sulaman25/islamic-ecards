export const STRIPE_PLANS = {
  MONTHLY: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID ?? "",
    name: "Monthly",
    price: "$7.99/month",
    interval: "month",
  },
  ANNUAL: {
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID ?? "",
    name: "Annual",
    price: "$35.99/year",
    interval: "year",
  },
} as const;

export function canSendCard(
  plan: string,
  monthlyCount: number
): boolean {
  if (plan !== "FREE") return true;
  return monthlyCount < 3;
}

export function canUseAI(plan: string): boolean {
  return plan !== "FREE";
}

export function canSchedule(plan: string): boolean {
  return plan !== "FREE";
}

export function canUsePremiumCards(plan: string): boolean {
  return plan !== "FREE";
}

export function getRemainingFreeSends(monthlyCount: number): number {
  return Math.max(0, 3 - monthlyCount);
}
