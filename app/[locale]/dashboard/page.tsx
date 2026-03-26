import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { Navbar } from "@/components/layout/Navbar";
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
        // Map PayPal plan IDs to our Plan enum values
        const PAYPAL_MONTHLY_PLAN_ID = process.env.PAYPAL_MONTHLY_PLAN_ID ?? "";
        const PAYPAL_ANNUAL_PLAN_ID = process.env.PAYPAL_ANNUAL_PLAN_ID ?? "";
        const plan =
          planId === PAYPAL_ANNUAL_PLAN_ID
            ? "ANNUAL"
            : planId === PAYPAL_MONTHLY_PLAN_ID
            ? "MONTHLY"
            : "MONTHLY";

        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            plan,
            subscriptionId: params.subscription_id,
          },
        });
      }
    } catch {
      // Silently continue to dashboard even if activation check fails
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-800">
              {t("title")}
            </h1>
            <p className="text-stone-500">
              {t("greeting")}, {user?.name ?? "Friend"} 🌙
            </p>
          </div>
          <Link
            href="/cards"
            className="bg-amber-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-amber-500 transition-colors text-sm"
          >
            {t("sendCard")}
          </Link>
        </div>

        {/* Plan status */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-stone-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-400 mb-1">{t("currentPlan")}</p>
            <p className="text-xl font-bold text-stone-800">
              {user?.plan === "FREE"
                ? t("free")
                : user?.plan === "MONTHLY"
                ? t("monthly")
                : t("annual")}{" "}
              {t("plan")}
            </p>
            {user?.plan === "FREE" && (
              <p className="text-sm text-stone-500 mt-1">
                {t("freeUsed", { count: monthlyCount })}
              </p>
            )}
          </div>
          {user?.plan === "FREE" ? (
            <Link
              href="/pricing"
              className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-amber-200 transition-colors"
            >
              {t("upgrade")}
            </Link>
          ) : (
            <CancelSubscriptionButton />
          )}
        </div>

        {/* Recent cards */}
        <h2 className="text-xl font-bold text-stone-700 mb-4">
          {t("recentCards")}
        </h2>
        {recentCards.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-4xl mb-3">🌙</p>
            <p className="text-stone-500 mb-4">
              {t("noCards")}
            </p>
            <Link
              href="/cards"
              className="text-amber-600 font-semibold hover:underline"
            >
              {t("browseCards")}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentCards.map((card: typeof recentCards[0]) => (
              <div
                key={card.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-stone-100 flex items-center justify-between gap-4"
              >
                <div
                  className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-amber-300 font-arabic"
                  style={{ backgroundColor: card.template.bgColor }}
                >
                  🌙
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-700 truncate">
                    {t("to")}: {card.recipientName}
                  </p>
                  <p className="text-stone-400 text-sm">
                    {card.template.occasion.nameEn} ·{" "}
                    {card.channel.toLowerCase()} ·{" "}
                    {new Date(card.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      card.status === "VIEWED"
                        ? "bg-green-100 text-green-700"
                        : card.status === "SENT"
                        ? "bg-blue-100 text-blue-700"
                        : card.status === "FAILED"
                        ? "bg-red-100 text-red-700"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {card.status}
                  </span>
                  <Link
                    href={`/view/${card.viewToken}`}
                    target="_blank"
                    className="text-amber-600 text-sm hover:underline"
                  >
                    {t("view")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
