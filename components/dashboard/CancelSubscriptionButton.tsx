"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function CancelSubscriptionButton() {
  const router = useRouter();
  const t = useTranslations("dashboard");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCancel = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/paypal/cancel", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? t("cancelError"));
        return;
      }
      router.refresh();
    } catch {
      setError(t("cancelErrorGeneric"));
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-stone-500">{t("cancelConfirm")}</span>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-red-500 disabled:opacity-60 transition-colors"
        >
          {loading ? t("cancelling") : t("cancelYes")}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-stone-400 px-3 py-1.5 rounded-full text-sm hover:text-stone-600 transition-colors"
        >
          {t("cancelNo")}
        </button>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-stone-400 text-sm hover:text-red-500 transition-colors"
    >
      {t("cancelButton")}
    </button>
  );
}
