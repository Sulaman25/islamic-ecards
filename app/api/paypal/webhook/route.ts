import { prisma } from "@/lib/db/prisma";
import { getAccessToken } from "@/lib/paypal/client";
import { NextRequest, NextResponse } from "next/server";

interface PayPalWebhookEvent {
  event_type: string;
  resource: {
    id: string;
    plan_id?: string;
    subscriber?: {
      email_address?: string;
    };
  };
}

const PAYPAL_BASE_URL =
  process.env.PAYPAL_MODE !== "sandbox"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

/**
 * Verify the PayPal webhook signature by calling their verification endpoint.
 * Returns true only when PayPal confirms the signature is valid.
 * See: https://developer.paypal.com/api/rest/webhooks/
 */
async function verifyWebhookSignature(
  request: NextRequest,
  rawBody: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.error("PAYPAL_WEBHOOK_ID is not set — skipping verification");
    return false;
  }

  const transmissionId = request.headers.get("paypal-transmission-id");
  const transmissionTime = request.headers.get("paypal-transmission-time");
  const certUrl = request.headers.get("paypal-cert-url");
  const transmissionSig = request.headers.get("paypal-transmission-sig");
  const authAlgo = request.headers.get("paypal-auth-algo");

  if (
    !transmissionId ||
    !transmissionTime ||
    !certUrl ||
    !transmissionSig ||
    !authAlgo
  ) {
    console.error("PayPal webhook: missing required signature headers");
    return false;
  }

  try {
    const accessToken = await getAccessToken();

    const verifyResponse = await fetch(
      `${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth_algo: authAlgo,
          cert_url: certUrl,
          transmission_id: transmissionId,
          transmission_sig: transmissionSig,
          transmission_time: transmissionTime,
          webhook_id: webhookId,
          webhook_event: JSON.parse(rawBody),
        }),
      }
    );

    if (!verifyResponse.ok) {
      console.error(
        `PayPal webhook verification request failed: ${verifyResponse.status}`
      );
      return false;
    }

    const result = (await verifyResponse.json()) as {
      verification_status: string;
    };
    return result.verification_status === "SUCCESS";
  } catch (err) {
    console.error("PayPal webhook signature verification threw:", err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  // Read the raw body once so we can pass it to both JSON.parse and the
  // signature verifier (which needs the exact original bytes).
  const rawBody = await request.text();

  const isValid = await verifyWebhookSignature(request, rawBody);
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  let event: PayPalWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PayPalWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const email = event.resource.subscriber?.email_address;
        const planId = event.resource.plan_id;
        const subscriptionId = event.resource.id;

        if (!email || !planId) {
          console.warn(
            "BILLING.SUBSCRIPTION.ACTIVATED: missing email or plan_id — skipping DB update"
          );
          break;
        }

        const plan =
          planId === process.env.PAYPAL_ANNUAL_PLAN_ID
            ? ("ANNUAL" as const)
            : ("MONTHLY" as const);

        // Use updateMany so that a missing user row does not throw (returns
        // count: 0 silently instead of a P2025 error that would cause a 500
        // and trigger infinite PayPal retries).
        const result = await prisma.user.updateMany({
          where: { email },
          data: { plan, subscriptionId },
        });

        if (result.count === 0) {
          console.warn(
            `BILLING.SUBSCRIPTION.ACTIVATED: no user found for email ${email}`
          );
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED": {
        const subscriptionId = event.resource.id;

        // updateMany never throws on zero matches — safe as-is.
        await prisma.user.updateMany({
          where: { subscriptionId },
          data: { plan: "FREE", subscriptionId: null },
        });
        break;
      }

      default:
        // PayPal requires 200 for all event types, even ones we don't handle,
        // otherwise it retries. We fall through and return 200 below.
        break;
    }
  } catch (err) {
    // Log the error but still return 200 so PayPal does not retry.
    // Retrying a DB error will not fix it; monitor logs and fix the root cause.
    console.error(
      `PayPal webhook DB error for event ${event.event_type}:`,
      err
    );
  }

  return NextResponse.json({ received: true });
}
