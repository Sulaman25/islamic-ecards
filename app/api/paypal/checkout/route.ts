import { auth } from "@/auth";
import { createSubscription } from "@/lib/paypal/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const checkoutSchema = z.object({
  plan: z.enum(["MONTHLY", "ANNUAL"]),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const planId =
    parsed.data.plan === "MONTHLY"
      ? process.env.PAYPAL_MONTHLY_PLAN_ID
      : process.env.PAYPAL_ANNUAL_PLAN_ID;

  if (!planId) {
    return NextResponse.json(
      { error: "Plan ID not configured" },
      { status: 500 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const returnUrl = `${appUrl}/dashboard?paypal=success`;
  const cancelUrl = `${appUrl}/pricing`;

  const { approvalUrl } = await createSubscription(planId, returnUrl, cancelUrl);

  return NextResponse.json({ url: approvalUrl });
}
