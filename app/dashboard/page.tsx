import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

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
    where: { senderId: session.user.id, createdAt: { gte: startOfMonth } },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-800">
              Dashboard
            </h1>
            <p className="text-stone-500">
              Ahlan wa sahlan, {user?.name ?? "Friend"} 🌙
            </p>
          </div>
          <Link
            href="/cards"
            className="bg-amber-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-amber-500 transition-colors text-sm"
          >
            + Send a Card
          </Link>
        </div>

        {/* Plan status */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-stone-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-400 mb-1">Current Plan</p>
            <p className="text-xl font-bold text-stone-800">
              {user?.plan === "FREE"
                ? "Free"
                : user?.plan === "MONTHLY"
                ? "Monthly"
                : "Annual"}{" "}
              Plan
            </p>
            {user?.plan === "FREE" && (
              <p className="text-sm text-stone-500 mt-1">
                {monthlyCount}/3 free cards used this month
              </p>
            )}
          </div>
          {user?.plan === "FREE" && (
            <Link
              href="/pricing"
              className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-amber-200 transition-colors"
            >
              Upgrade
            </Link>
          )}
        </div>

        {/* Recent cards */}
        <h2 className="text-xl font-bold text-stone-700 mb-4">
          Recent Cards
        </h2>
        {recentCards.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-4xl mb-3">🌙</p>
            <p className="text-stone-500 mb-4">
              You haven&apos;t sent any cards yet.
            </p>
            <Link
              href="/cards"
              className="text-amber-600 font-semibold hover:underline"
            >
              Browse cards →
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
                    To: {card.recipientName}
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
                    View
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
