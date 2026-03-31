"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { AuroraBackground } from "@/components/home/AuroraBackground";
import { CustomCursor } from "@/components/home/CustomCursor";

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
    <div style={{ background: "var(--v3-bg)", color: "var(--v3-text)", minHeight: "100vh", overflowX: "hidden" }}>
      <AuroraBackground />
      <CustomCursor />
      <Navbar />

      <main style={{ position: "relative", zIndex: 2, padding: "64px 24px", overflow: "hidden" }}>
        <div style={{ maxWidth: "1024px", margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{
              fontFamily:   "var(--font-amiri, serif)",
              fontSize:     "1.5rem",
              color:        "var(--gold)",
              marginBottom: "12px",
              textShadow:   "0 0 20px rgba(240,208,128,0.3)",
              letterSpacing: "2px",
            }}>
              خير الناس أنفعهم للناس
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{ height: "1px", width: "64px", background: "linear-gradient(to right, transparent, rgba(240,208,128,0.4))" }} />
              <span style={{ color: "var(--gold)", fontSize: "0.6rem" }}>✦</span>
              <div style={{ height: "1px", width: "64px", background: "linear-gradient(to left, transparent, rgba(240,208,128,0.4))" }} />
            </div>
            <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, color: "#fff", marginBottom: "12px" }}>
              {t("title")}
            </h1>
            <p style={{ color: "var(--v3-text-dim)", fontSize: "1rem" }}>{t("subtitle")}</p>
          </div>

          {/* Plans */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                style={{
                  position:   "relative",
                  borderRadius: "20px",
                  padding:    "28px 24px",
                  display:    "flex",
                  flexDirection: "column",
                  background: plan.highlight
                    ? "linear-gradient(135deg, rgba(30,20,8,0.9) 0%, rgba(45,27,14,0.9) 100%)"
                    : "rgba(255,255,255,0.04)",
                  border:     plan.highlight
                    ? "1px solid rgba(240,208,128,0.5)"
                    : "1px solid var(--v3-border)",
                  backdropFilter: "blur(12px)",
                  transition: "transform 0.2s",
                }}
              >
                {plan.highlight && (
                  <span style={{
                    position:     "absolute",
                    top:          "-14px",
                    left:         "50%",
                    transform:    "translateX(-50%)",
                    fontSize:     "0.72rem",
                    fontWeight:   700,
                    padding:      "4px 16px",
                    borderRadius: "40px",
                    background:   "linear-gradient(135deg, #b8860b, var(--gold))",
                    color:        "#1a1208",
                    whiteSpace:   "nowrap",
                  }}>
                    {t("mostPopular")}
                  </span>
                )}

                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                  {plan.name}
                </h2>

                <div style={{ marginBottom: "24px", marginTop: "4px" }}>
                  <span style={{ fontSize: "2.6rem", fontWeight: 800, color: plan.highlight ? "var(--gold)" : "#fff" }}>
                    {plan.price}
                  </span>
                  <span style={{ color: "var(--v3-text-dim)", fontSize: "0.85rem", marginLeft: "6px" }}>
                    / {plan.period}
                  </span>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem", color: "var(--v3-text)" }}>
                      <span style={{ color: "var(--gold)" }}>✓</span> {f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem", color: "rgba(255,255,255,0.2)" }}>
                      <span>✗</span> {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  style={{
                    width:        "100%",
                    padding:      "14px",
                    borderRadius: "14px",
                    fontWeight:   700,
                    fontSize:     "0.95rem",
                    cursor:       "pointer",
                    transition:   "all 0.2s",
                    opacity:      loading === plan.id ? 0.5 : 1,
                    ...(plan.highlight
                      ? { background: "linear-gradient(135deg, #b8860b, var(--gold))", color: "#1a1208", border: "none" }
                      : { background: "transparent", border: "1px solid rgba(240,208,128,0.3)", color: "var(--gold)" }),
                  }}
                >
                  {loading === plan.id ? t("loading") : plan.cta}
                </button>
              </div>
            ))}
          </div>

          <p style={{ textAlign: "center", color: "var(--v3-text-dim)", fontSize: "0.82rem", marginTop: "32px" }}>
            {t("disclaimer")}
          </p>
        </div>
      </main>
    </div>
  );
}
