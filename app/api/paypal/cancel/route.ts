import { auth } from "@/auth";
import { getAccessToken } from "@/lib/paypal/client";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionId: true, plan: true },
  });

  if (!user?.subscriptionId || user.plan === "FREE") {
    return NextResponse.json({ error: "No active subscription" }, { status: 400 });
  }

  const accessToken = await getAccessToken();

  const PAYPAL_BASE_URL =
    process.env.PAYPAL_MODE !== "sandbox"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const res = await fetch(
    `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${user.subscriptionId}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason: "User requested cancellation" }),
    }
  );

  // PayPal returns 204 No Content on success
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(`PayPal cancel failed (${res.status}): ${text}`);
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { plan: "FREE", subscriptionId: null },
  });

  return NextResponse.json({ success: true });
}
