"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { AuroraBackground } from "@/components/home/AuroraBackground";
import { CustomCursor } from "@/components/home/CustomCursor";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/cards";
  const t = useTranslations("signIn");

  return (
    <div style={{
      minHeight:      "100vh",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      padding:        "24px",
      background:     "var(--v3-bg)",
      position:       "relative",
      overflow:       "hidden",
    }}>
      <AuroraBackground />
      <CustomCursor />

      <div style={{
        position:       "relative",
        zIndex:         2,
        background:     "rgba(255,255,255,0.04)",
        border:         "1px solid var(--v3-border)",
        backdropFilter: "blur(20px)",
        borderRadius:   "24px",
        padding:        "48px 40px",
        width:          "100%",
        maxWidth:       "420px",
        textAlign:      "center",
        boxShadow:      "0 24px 80px rgba(0,0,0,0.6)",
      }}>
        {/* Arabic header */}
        <p style={{
          fontFamily:   "var(--font-amiri, serif)",
          fontSize:     "1.5rem",
          color:        "var(--gold)",
          marginBottom: "8px",
          textShadow:   "0 0 20px rgba(240,208,128,0.3)",
        }}>
          بسم الله الرحمن الرحيم
        </p>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ height: "1px", width: "48px", background: "linear-gradient(to right, transparent, rgba(240,208,128,0.4))" }} />
          <span style={{ color: "var(--gold)", fontSize: "0.55rem", opacity: 0.7 }}>✦</span>
          <div style={{ height: "1px", width: "48px", background: "linear-gradient(to left, transparent, rgba(240,208,128,0.4))" }} />
        </div>

        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>
          {t("title")}
        </h1>
        <p style={{ color: "var(--v3-text-dim)", fontSize: "0.9rem", marginBottom: "32px" }}>
          {t("subtitle")}
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl })}
          style={{
            width:          "100%",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            gap:            "12px",
            padding:        "14px 24px",
            borderRadius:   "14px",
            border:         "1px solid var(--v3-border)",
            background:     "rgba(255,255,255,0.06)",
            color:          "var(--v3-text)",
            fontSize:       "0.95rem",
            fontWeight:     600,
            cursor:         "pointer",
            transition:     "all 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(240,208,128,0.4)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--v3-border)")}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h13.2c-.6 3-2.4 5.5-5 7.2v6h8c4.7-4.3 7.3-10.7 7.3-17.2z"/>
            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-8-6c-2.1 1.4-4.8 2.3-7.9 2.3-6.1 0-11.2-4.1-13-9.6H2.7v6.2C6.7 42.7 14.8 48 24 48z"/>
            <path fill="#FBBC05" d="M11 28.9c-.5-1.4-.7-2.9-.7-4.4s.3-3 .7-4.4v-6.2H2.7C1 17.2 0 20.5 0 24s1 6.8 2.7 9.1l8.3-4.2z"/>
            <path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.7-6.7C35.9 2.4 30.4 0 24 0 14.8 0 6.7 5.3 2.7 13.1l8.3 4.2C12.8 13.6 17.9 9.5 24 9.5z"/>
          </svg>
          {t("continueGoogle")}
        </button>

        <p style={{ fontSize: "0.75rem", color: "var(--v3-text-dim)", marginTop: "28px", lineHeight: 1.7 }}>
          {t("terms")}
          <br />
          <span style={{ color: "var(--gold)", opacity: 0.7 }}>جزاك الله خيراً</span>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
