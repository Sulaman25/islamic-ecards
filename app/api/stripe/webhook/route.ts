import { prisma } from "@/lib/db/prisma";
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover" as const,
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId) break;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      const priceId = subscription.items.data[0]?.price.id;
      const plan =
        priceId === process.env.STRIPE_ANNUAL_PRICE_ID ? "ANNUAL" : "MONTHLY";

      // current_period_end is on the subscription's billing cycle
      const periodEnd = (subscription as unknown as Record<string, unknown>).current_period_end as number | undefined;

      await prisma.user.update({
        where: { id: userId },
        data: {
          plan,
          stripeCustomerId: session.customer as string,
          subscriptionId: subscription.id,
          subscriptionEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await prisma.user.findFirst({
        where: { subscriptionId: subscription.id },
      });
      if (!user) break;

      const priceId = subscription.items.data[0]?.price.id;
      const plan =
        priceId === process.env.STRIPE_ANNUAL_PRICE_ID ? "ANNUAL" : "MONTHLY";

      const periodEnd = (subscription as unknown as Record<string, unknown>).current_period_end as number | undefined;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan,
          subscriptionEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { subscriptionId: subscription.id },
        data: { plan: "FREE", subscriptionId: null, subscriptionEnd: null },
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
