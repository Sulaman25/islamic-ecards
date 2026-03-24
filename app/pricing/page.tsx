"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";

const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "3 cards per month",
      "Email delivery",
      "Basic card designs",
      "Quranic verse picker",
    ],
    missing: ["AI message generation", "WhatsApp delivery", "Unlimited sends"],
    cta: "Get Started",
    highlight: false,
  },
  {
    id: "MONTHLY",
    name: "Monthly",
    price: "$7.99",
    period: "per month",
    features: [
      "Unlimited cards",
      "AI message generation",
      "Email + WhatsApp delivery",
      "All card designs",
      "Quranic verse picker",
      "No watermark",
    ],
    missing: [],
    cta: "Start Monthly",
    highlight: true,
  },
  {
    id: "ANNUAL",
    name: "Annual",
    price: "$35.99",
    period: "per year (save 62%)",
    features: [
      "Everything in Monthly",
      "Priority support",
      "Early access to new cards",
    ],
    missing: [],
    cta: "Start Annual",
    highlight: false,
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === "FREE") {
      if (!session) signIn("google");
      else router.push("/cards");
      return;
    }

    if (!session) {
      signIn("google");
      return;
    }

    setLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-stone-800 mb-2">
            Simple, Honest Pricing
          </h1>
          <p className="text-center text-stone-500 mb-4">
            Spread Islamic blessings — start free, upgrade anytime.
          </p>
          <p className="font-arabic text-center text-amber-700 text-xl mb-12">
            خير الناس أنفعهم للناس
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 flex flex-col shadow-sm border-2 ${
                  plan.highlight
                    ? "border-amber-400 bg-amber-50"
                    : "border-stone-200 bg-white"
                }`}
              >
                {plan.highlight && (
                  <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-3">
                    Most Popular
                  </span>
                )}
                <h2 className="text-2xl font-bold text-stone-800">
                  {plan.name}
                </h2>
                <div className="mt-2 mb-4">
                  <span className="text-4xl font-bold text-stone-900">
                    {plan.price}
                  </span>
                  <span className="text-stone-400 text-sm ml-1">
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-stone-600">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-stone-300">
                      <span>✗</span> {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                    plan.highlight
                      ? "bg-amber-600 hover:bg-amber-500 text-white"
                      : "border-2 border-stone-300 text-stone-600 hover:border-amber-400 hover:text-amber-700"
                  } disabled:opacity-50`}
                >
                  {loading === plan.id ? "Loading..." : plan.cta}
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-stone-400 text-sm mt-8">
            All plans include a 7-day free trial. Cancel anytime. No contracts.
          </p>
        </div>
      </main>
    </div>
  );
}
