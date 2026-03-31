import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { AuroraBackground } from "@/components/home/AuroraBackground";
import { CustomCursor } from "@/components/home/CustomCursor";
import { CancelSubscriptionButton } from "@/components/dashboard/CancelSubscriptionButton";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

async function getPayPalAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token as string;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const params = await searchParams;

  if (
    params.paypal === "success" &&
    typeof params.subscription_id === "string" &&
    params.subscription_id
  ) {
    try {
      const accessToken = await getPayPalAccessToken();

      const subRes = await fetch(
        `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${params.subscription_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const sub = await subRes.json();

      if (sub.status === "ACTIVE") {
        const planId = sub.plan_id as string;
        const PAYPAL_MONTHLY_PLAN_ID = process.env.PAYPAL_MONTHLY_PLAN_ID ?? "";
        const PAYPAL_ANNUAL_PLAN_ID  = process.env.PAYPAL_ANNUAL_PLAN_ID ?? "";
        const plan =
          planId === PAYPAL_ANNUAL_PLAN_ID
            ? "ANNUAL"
            : planId === PAYPAL_MONTHLY_PLAN_ID
            ? "MONTHLY"
            : "MONTHLY";

        await prisma.user.update({
          where: { id: session.user.id },
          data: { plan, subscriptionId: params.subscription_id },
        });
      }
    } catch {
      // Silently continue
    }

    redirect("/dashboard");
  }

  const t = await getTranslations("dashboard");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, name: true },
  });

  const recentCards = await prisma.sentCard.findMany({
    where: { senderId: session.user.id },
    include: { template: { include: { occasion: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyCount = await prisma.sentCard.count({
    where: { senderId: session.user.id, createdAt: { gte: startOfMonth }, status: { in: ["SENT", "VIEWED"] } },
  });

  const planLabel = user?.plan === "FREE"
    ? t("free") : user?.plan === "MONTHLY"
    ? t("monthly") : t("annual")

  const statusColor = (status: string) => {
    if (status === "VIEWED")  return { bg: "rgba(74,222,128,0.12)",  color: "#4ade80" }
    if (status === "SENT")    return { bg: "rgba(96,165,250,0.12)",  color: "#60a5fa" }
    if (status === "FAILED")  return { bg: "rgba(248,113,113,0.12)", color: "#f87171" }
    return { bg: "rgba(255,255,255,0.06)", color: "var(--v3-text-dim)" }
  }

  return (
    <div style={{ background: "var(--v3-bg)", color: "var(--v3-text)", minHeight: "100vh", overflowX: "hidden" }}>
      <AuroraBackground />
      <CustomCursor />
      <Navbar />

      <main style={{ position: "relative", zIndex: 2, maxWidth: "56rem", margin: "0 auto", padding: "40px 24px" }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.6rem,3vw,2rem)", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>
              {t("title")}
            </h1>
            <p style={{ color: "var(--v3-text-dim)", fontSize: "0.9rem" }}>
              {t("greeting")}, {user?.name ?? "Friend"} 🌙
            </p>
          </div>
          <Link
            href="/cards"
            style={{
              background:   "linear-gradient(135deg, #b8860b, var(--gold))",
              color:        "#1a1208",
              padding:      "10px 22px",
              borderRadius: "40px",
              fontWeight:   700,
              fontSize:     "0.88rem",
              textDecoration: "none",
            }}
          >
            {t("sendCard")}
          </Link>
        </div>

        {/* Plan status */}
        <div style={{
          background:   "rgba(255,255,255,0.04)",
          border:       "1px solid var(--v3-border)",
          borderRadius: "16px",
          padding:      "20px 24px",
          marginBottom: "24px",
          display:      "flex",
          alignItems:   "center",
          justifyContent: "space-between",
          flexWrap:     "wrap",
          gap:          "12px",
        }}>
          <div>
            <p style={{ fontSize: "0.78rem", color: "var(--v3-text-dim)", marginBottom: "4px", letterSpacing: "1px", textTransform: "uppercase" }}>
              {t("currentPlan")}
            </p>
            <p style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--gold)" }}>
              {planLabel} {t("plan")}
            </p>
            {user?.plan === "FREE" && (
              <p style={{ fontSize: "0.82rem", color: "var(--v3-text-dim)", marginTop: "2px" }}>
                {t("freeUsed", { count: monthlyCount })}
              </p>
            )}
          </div>
          {user?.plan === "FREE" ? (
            <Link
              href="/pricing"
              style={{
                background:   "rgba(240,208,128,0.12)",
                border:       "1px solid rgba(240,208,128,0.3)",
                color:        "var(--gold)",
                padding:      "8px 20px",
                borderRadius: "40px",
                fontSize:     "0.82rem",
                fontWeight:   600,
                textDecoration: "none",
              }}
            >
              {t("upgrade")}
            </Link>
          ) : (
            <CancelSubscriptionButton />
          )}
        </div>

        {/* Recent cards */}
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", marginBottom: "16px" }}>
          {t("recentCards")}
        </h2>

        {recentCards.length === 0 ? (
          <div style={{
            background:   "rgba(255,255,255,0.04)",
            border:       "1px solid var(--v3-border)",
            borderRadius: "16px",
            padding:      "48px 24px",
            textAlign:    "center",
          }}>
            <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🌙</p>
            <p style={{ color: "var(--v3-text-dim)", marginBottom: "16px", fontSize: "0.9rem" }}>
              {t("noCards")}
            </p>
            <Link href="/cards" style={{ color: "var(--gold)", fontWeight: 600, textDecoration: "none", fontSize: "0.9rem" }}>
              {t("browseCards")}
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recentCards.map((card: typeof recentCards[0]) => {
              const sc = statusColor(card.status)
              return (
                <div
                  key={card.id}
                  style={{
                    background:   "rgba(255,255,255,0.04)",
                    border:       "1px solid var(--v3-border)",
                    borderRadius: "14px",
                    padding:      "14px 18px",
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "space-between",
                    gap:          "14px",
                  }}
                >
                  <div style={{
                    width:          "38px",
                    height:         "38px",
                    borderRadius:   "10px",
                    flexShrink:     0,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    fontSize:       "1.1rem",
                    background:     card.template.bgColor,
                  }}>
                    🌙
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: "var(--v3-text)", fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t("to")}: {card.recipientName}
                    </p>
                    <p style={{ color: "var(--v3-text-dim)", fontSize: "0.78rem", marginTop: "2px" }}>
                      {card.template.occasion.nameEn} · {card.channel.toLowerCase()} · {new Date(card.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                    <span style={{
                      fontSize:     "0.72rem",
                      fontWeight:   700,
                      padding:      "4px 10px",
                      borderRadius: "40px",
                      background:   sc.bg,
                      color:        sc.color,
                    }}>
                      {card.status}
                    </span>
                    <Link
                      href={`/view/${card.viewToken}`}
                      target="_blank"
                      style={{ color: "var(--gold)", fontSize: "0.82rem", textDecoration: "none", opacity: 0.85 }}
                    >
                      {t("view")}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  );
}
