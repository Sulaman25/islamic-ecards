"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const t = useTranslations("pricing");

  const PLANS = [
    {
      id: "FREE",
      name: t("planFree"),
      price: "$0",
      period: t("periodForever"),
      features: [t("feat3Cards"), t("featEmailDelivery"), t("featBasicDesigns"), t("featVersePicker")],
      missing: [t("missingAI"), t("missingWhatsApp"), t("missingUnlimited")],
      cta: t("ctaFree"),
      highlight: false,
    },
    {
      id: "MONTHLY",
      name: t("planMonthly"),
      price: "$7.99",
      period: t("periodMonth"),
      features: [t("featUnlimited"), t("featAI"), t("featEmailWhatsApp"), t("featAllDesigns"), t("featVersePicker"), t("featNoWatermark")],
      missing: [],
      cta: t("ctaMonthly"),
      highlight: true,
    },
    {
      id: "ANNUAL",
      name: t("planAnnual"),
      price: "$35.99",
      period: t("periodYear"),
      features: [t("featEverything"), t("featPriority"), t("featEarlyAccess")],
      missing: [],
      cta: t("ctaAnnual"),
      highlight: false,
    },
  ];

  const handleSubscribe = async (planId: string) => {
    if (planId === "FREE") {
      if (!session) router.push("/sign-in");
      else router.push("/cards");
      return;
    }
    if (!session) { router.push("/sign-in"); return; }
    setLoading(planId);
    try {
      const res = await fetch("/api/paypal/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      console.error("Checkout failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a1a0d" }}>
      <Navbar />

      <main className="flex-1 py-16 px-4 relative overflow-hidden">
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="font-arabic text-[#c9a84c] text-2xl mb-3 tracking-widest" style={{ textShadow: "0 0 20px rgba(201,168,76,0.3)" }}>
              خير الناس أنفعهم للناس
            </p>
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a84c]/40" />
              <span style={{ color: "#c9a84c", fontSize: "0.6rem" }}>✦</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a84c]/40" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">{t("title")}</h1>
            <p className="text-stone-400">{t("subtitle")}</p>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className="relative rounded-2xl p-6 flex flex-col transition-all duration-300"
                style={{
                  background: plan.highlight
                    ? "linear-gradient(135deg, #1a1208 0%, #2d1b0e 100%)"
                    : "rgba(255,255,255,0.04)",
                  border: plan.highlight
                    ? "1px solid rgba(201,168,76,0.6)"
                    : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {plan.highlight && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full"
                    style={{ background: "#c9a84c", color: "#1a1208" }}
                  >
                    {t("mostPopular")}
                  </span>
                )}

                <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>

                <div className="mb-5 mt-1">
                  <span className="text-4xl font-bold" style={{ color: plan.highlight ? "#c9a84c" : "white" }}>
                    {plan.price}
                  </span>
                  <span className="text-stone-500 text-sm ml-1">/ {plan.period}</span>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-stone-300">
                      <span style={{ color: "#c9a84c" }}>✓</span> {f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-stone-600">
                      <span>✗</span> {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  className="w-full py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
                  style={
                    plan.highlight
                      ? { background: "#c9a84c", color: "#1a1208" }
                      : { border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c", background: "transparent" }
                  }
                >
                  {loading === plan.id ? t("loading") : plan.cta}
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-stone-600 text-sm mt-8">{t("disclaimer")}</p>
        </div>
      </main>
    </div>
  );
}
