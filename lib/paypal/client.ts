const PAYPAL_BASE_URL =
  process.env.PAYPAL_MODE !== "sandbox"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `PayPal token request failed (${response.status}): ${text}`
    );
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function createSubscription(
  planId: string,
  returnUrl: string,
  cancelUrl: string
): Promise<{ subscriptionId: string; approvalUrl: string }> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      plan_id: planId,
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        user_action: "SUBSCRIBE_NOW",
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `PayPal create subscription failed (${response.status}): ${text}`
    );
  }

  const data = (await response.json()) as {
    id: string;
    links: Array<{ href: string; rel: string; method: string }>;
  };

  const approvalLink = data.links.find((link) => link.rel === "approve");
  if (!approvalLink) {
    throw new Error("PayPal response missing approval link");
  }

  return {
    subscriptionId: data.id,
    approvalUrl: approvalLink.href,
  };
}
