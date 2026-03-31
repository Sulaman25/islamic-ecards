"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { AuroraBackground } from "@/components/home/AuroraBackground";
import { CustomCursor } from "@/components/home/CustomCursor";

type Channel = "EMAIL" | "WHATSAPP";

function SendPageContent() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const { data: session } = useSession();
  const t = useTranslations("send");

  const templateId     = searchParams.get("templateId") ?? "";
  const senderName     = searchParams.get("senderName") ?? "";
  const recipientName  = searchParams.get("recipientName") ?? "";
  const message        = searchParams.get("message") ?? "";
  const fontStyle      = searchParams.get("fontStyle") ?? "amiri";
  const verseRef       = searchParams.get("verseRef") ?? undefined;
  const verseTextEn    = searchParams.get("verseTextEn") ?? undefined;
  const verseTextAr    = searchParams.get("verseTextAr") ?? undefined;

  const [channel,        setChannel]        = useState<Channel>("EMAIL");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [done,           setDone]           = useState<{ viewToken: string; shareUrl?: string; scheduled?: boolean; scheduledAt?: string } | null>(null);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt,    setScheduledAt]    = useState("");

  const pageWrapper = (children: React.ReactNode) => (
    <div style={{ background: "var(--v3-bg)", color: "var(--v3-text)", minHeight: "100vh", overflowX: "hidden" }}>
      <AuroraBackground />
      <CustomCursor />
      <Navbar />
      {children}
    </div>
  )

  if (!session) {
    return pageWrapper(
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center" }}>
        <p style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🔒</p>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>{t("signInTitle")}</h2>
        <p style={{ color: "var(--v3-text-dim)", marginBottom: "28px", fontSize: "0.95rem" }}>{t("signInDesc")}</p>
        <button
          onClick={() => signIn("google")}
          style={{ background: "linear-gradient(135deg, #b8860b, var(--gold))", color: "#1a1208", padding: "12px 32px", borderRadius: "40px", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", border: "none" }}
        >
          {t("signInGoogle")}
        </button>
      </div>
    );
  }

  if (done) {
    const viewUrl = `${window.location.origin}/view/${done.viewToken}`;
    return pageWrapper(
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center" }}>
        {done.scheduled ? (
          <>
            <p style={{ fontSize: "4rem", marginBottom: "16px" }}>🕐</p>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>{t("scheduledTitle")}</h2>
            <p style={{ color: "var(--v3-text-dim)", marginBottom: "28px" }}>
              {t("scheduledDesc", { name: recipientName, date: new Date(done.scheduledAt!).toLocaleString() })}
            </p>
          </>
        ) : (
          <>
            <p style={{ fontSize: "4rem", marginBottom: "16px" }}>✅</p>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>{t("sentTitle")}</h2>
            <p style={{ color: "var(--v3-text-dim)", marginBottom: "28px" }}>{t("sentDesc", { name: recipientName })}</p>
          </>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
          {done.shareUrl && (
            <a href={done.shareUrl} target="_blank" rel="noopener noreferrer"
              style={{ background: "#16a34a", color: "#fff", padding: "12px 28px", borderRadius: "40px", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>
              {t("shareWhatsapp")}
            </a>
          )}
          <a href={viewUrl} target="_blank" rel="noopener noreferrer"
            style={{ background: "linear-gradient(135deg, #b8860b, var(--gold))", color: "#1a1208", padding: "12px 28px", borderRadius: "40px", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>
            {t("previewCard")}
          </a>
          <button onClick={() => router.push("/cards")}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--v3-border)", color: "var(--v3-text)", padding: "12px 28px", borderRadius: "40px", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}>
            {t("sendAnother")}
          </button>
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    if (channel === "EMAIL" && !recipientEmail) { setError(t("errorNoEmail")); return; }
    if (scheduleEnabled && !scheduledAt) { setError(t("errorNoTime")); return; }

    setLoading(true);
    setError("");

    const endpoint = channel === "EMAIL" ? "/api/send/email" : "/api/send/whatsapp";
    const body = {
      templateId, senderName, recipientName,
      customMessage: message, fontStyle,
      selectedVerse: verseRef, verseTextEn, verseTextAr,
      aiGenerated: false,
      ...(channel === "EMAIL" ? { recipientEmail } : {}),
      ...(scheduleEnabled && scheduledAt ? { scheduledAt: new Date(scheduledAt).toISOString() } : {}),
    };

    try {
      const res  = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) {
        if (data.upgradeRequired) { router.push("/pricing"); return; }
        setError(data.error ?? t("errorFailed"));
        return;
      }
      setDone({ viewToken: data.viewToken, shareUrl: data.shareUrl, scheduled: data.scheduled, scheduledAt: data.scheduledAt });
    } catch {
      setError(t("errorNetwork"));
    } finally {
      setLoading(false);
    }
  };

  const channels = [
    { value: "EMAIL" as Channel,    label: t("channelEmail"),    icon: "📧", desc: t("emailDesc") },
    { value: "WHATSAPP" as Channel, label: t("channelWhatsApp"), icon: "📲", desc: t("whatsappDesc") },
  ];

  const card = (children: React.ReactNode) => (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--v3-border)", borderRadius: "16px", padding: "24px", marginBottom: "20px", backdropFilter: "blur(10px)" }}>
      {children}
    </div>
  )

  return pageWrapper(
    <main style={{ position: "relative", zIndex: 2, maxWidth: "480px", margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>{t("pageTitle")}</h1>
      <p style={{ color: "var(--v3-text-dim)", marginBottom: "28px", fontSize: "0.9rem" }}>{t("pageSubtitle", { name: recipientName })}</p>

      {/* Summary */}
      {card(
        <div style={{ fontSize: "0.85rem", color: "var(--v3-text-dim)", lineHeight: 1.8 }}>
          <p><span style={{ color: "var(--v3-text)", fontWeight: 600 }}>{t("labelTo")}:</span> {recipientName}</p>
          <p style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            <span style={{ color: "var(--v3-text)", fontWeight: 600 }}>{t("labelMessage")}:</span> {message}
          </p>
        </div>
      )}

      {/* Channel selector */}
      {card(<>
        <h2 style={{ fontWeight: 700, color: "#fff", marginBottom: "16px", fontSize: "0.95rem" }}>{t("deliveryMethod")}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {channels.map((c) => (
            <button key={c.value} onClick={() => setChannel(c.value)}
              style={{
                padding:      "16px 12px",
                borderRadius: "12px",
                textAlign:    "left",
                cursor:       "pointer",
                transition:   "all 0.2s",
                background:   channel === c.value ? "rgba(240,208,128,0.1)" : "rgba(255,255,255,0.04)",
                border:       `1px solid ${channel === c.value ? "rgba(240,208,128,0.5)" : "var(--v3-border)"}`,
              }}
            >
              <div style={{ fontSize: "1.4rem", marginBottom: "4px" }}>{c.icon}</div>
              <div style={{ fontWeight: 700, color: channel === c.value ? "var(--gold)" : "var(--v3-text)", fontSize: "0.88rem" }}>{c.label}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--v3-text-dim)", marginTop: "2px" }}>{c.desc}</div>
            </button>
          ))}
        </div>

        {channel === "EMAIL" && (
          <div style={{ marginTop: "16px" }}>
            <label style={{ fontSize: "0.82rem", color: "var(--v3-text-dim)", display: "block", marginBottom: "6px" }}>{t("recipientEmailLabel")}</label>
            <input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="recipient@example.com"
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid var(--v3-border)", borderRadius: "10px", padding: "10px 14px", color: "var(--v3-text)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>
        )}
        {channel === "WHATSAPP" && (
          <p style={{ marginTop: "12px", fontSize: "0.82rem", color: "var(--v3-text-dim)", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "12px" }}>{t("whatsappNote")}</p>
        )}
      </>)}

      {/* Schedule */}
      {card(<>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>{t("scheduleTitle")}</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--v3-text-dim)", marginTop: "2px" }}>{t("scheduleDesc")}</p>
          </div>
          <button onClick={() => setScheduleEnabled(!scheduleEnabled)}
            style={{ position: "relative", width: "44px", height: "24px", borderRadius: "40px", cursor: "pointer", border: "none", transition: "background 0.2s", background: scheduleEnabled ? "var(--gold)" : "rgba(255,255,255,0.15)" }}
          >
            <span style={{ position: "absolute", top: "2px", left: scheduleEnabled ? "22px" : "2px", width: "20px", height: "20px", background: "#fff", borderRadius: "50%", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
          </button>
        </div>
        {scheduleEnabled && (
          <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
            min={new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)}
            style={{ marginTop: "16px", width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid var(--v3-border)", borderRadius: "10px", padding: "10px 14px", color: "var(--v3-text)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
          />
        )}
      </>)}

      {error && (
        <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      <button onClick={handleSend} disabled={loading}
        style={{
          width:        "100%",
          padding:      "16px",
          background:   "linear-gradient(135deg, #b8860b, var(--gold))",
          color:        "#1a1208",
          fontWeight:   800,
          fontSize:     "1rem",
          borderRadius: "14px",
          border:       "none",
          cursor:       "pointer",
          opacity:      loading ? 0.6 : 1,
          transition:   "all 0.2s",
          boxShadow:    "0 4px 24px rgba(240,208,128,0.25)",
        }}
      >
        {loading
          ? t("sending")
          : scheduleEnabled
          ? t("scheduleCard")
          : channel === "EMAIL"
          ? t("sendEmail")
          : t("shareViaWhatsApp")}
      </button>
    </main>
  );
}

export default function SendPage() {
  return (
    <Suspense fallback={<div style={{ background: "var(--v3-bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)" }}>Loading...</div>}>
      <SendPageContent />
    </Suspense>
  );
}
