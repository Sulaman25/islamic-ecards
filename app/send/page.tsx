"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";

type Channel = "EMAIL" | "WHATSAPP";

function SendPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const templateId = searchParams.get("templateId") ?? "";
  const senderName = searchParams.get("senderName") ?? "";
  const recipientName = searchParams.get("recipientName") ?? "";
  const message = searchParams.get("message") ?? "";
  const fontStyle = searchParams.get("fontStyle") ?? "amiri";
  const verseRef = searchParams.get("verseRef") ?? undefined;
  const verseTextEn = searchParams.get("verseTextEn") ?? undefined;
  const verseTextAr = searchParams.get("verseTextAr") ?? undefined;

  const [channel, setChannel] = useState<Channel>("EMAIL");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ viewToken: string; shareUrl?: string } | null>(null);

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <p className="text-5xl mb-4">🔒</p>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">
            Sign in to send your card
          </h2>
          <p className="text-stone-500 mb-6">
            Create a free account to send Islamic ecards.
          </p>
          <button
            onClick={() => signIn("google")}
            className="bg-amber-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-amber-500 transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    const viewUrl = `${window.location.origin}/view/${done.viewToken}`;
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <p className="text-6xl mb-4">✅</p>
          <h2 className="text-3xl font-bold text-stone-800 mb-2">
            Card Sent! Alhamdulillah 🌙
          </h2>
          <p className="text-stone-500 mb-6">
            Your card has been sent to {recipientName}.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {done.shareUrl && (
              <a
                href={done.shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-500 transition-colors"
              >
                📲 Share on WhatsApp
              </a>
            )}
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-amber-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-amber-500 transition-colors"
            >
              👁 Preview Card
            </a>
            <button
              onClick={() => router.push("/cards")}
              className="border border-stone-300 text-stone-600 px-6 py-3 rounded-full font-semibold hover:bg-stone-50 transition-colors"
            >
              Send Another Card
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    if (channel === "EMAIL" && !recipientEmail) {
      setError("Please enter the recipient's email address.");
      return;
    }

    setLoading(true);
    setError("");

    const endpoint =
      channel === "EMAIL" ? "/api/send/email" : "/api/send/whatsapp";

    const body = {
      templateId,
      senderName,
      recipientName,
      customMessage: message,
      fontStyle,
      selectedVerse: verseRef,
      verseTextEn,
      verseTextAr,
      aiGenerated: false,
      ...(channel === "EMAIL" ? { recipientEmail } : {}),
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.upgradeRequired) {
          router.push("/pricing");
          return;
        }
        setError(data.error ?? "Failed to send. Please try again.");
        return;
      }

      setDone({ viewToken: data.viewToken, shareUrl: data.shareUrl });
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-10">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">
          Send Your Card
        </h1>
        <p className="text-stone-500 mb-8">
          Choose how to deliver your card to {recipientName}
        </p>

        {/* Summary */}
        <div className="bg-stone-100 rounded-xl p-4 mb-6 text-sm text-stone-600">
          <p>
            <span className="font-medium">To:</span> {recipientName}
          </p>
          <p className="mt-1 line-clamp-2">
            <span className="font-medium">Message:</span> {message}
          </p>
        </div>

        {/* Channel selector */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-stone-700 mb-4">
            Delivery Method
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: "EMAIL", label: "Email", icon: "📧", desc: "Direct to inbox" },
              { value: "WHATSAPP", label: "WhatsApp", icon: "📲", desc: "Share a link" },
            ] as const).map((c) => (
              <button
                key={c.value}
                onClick={() => setChannel(c.value)}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${
                  channel === c.value
                    ? "border-amber-500 bg-amber-50"
                    : "border-stone-200 hover:border-amber-200"
                }`}
              >
                <div className="text-2xl mb-1">{c.icon}</div>
                <div className="font-semibold text-stone-700">{c.label}</div>
                <div className="text-xs text-stone-400">{c.desc}</div>
              </button>
            ))}
          </div>

          {channel === "EMAIL" && (
            <div className="mt-4">
              <label className="text-sm text-stone-500 block mb-1">
                Recipient&apos;s Email Address *
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          {channel === "WHATSAPP" && (
            <p className="mt-3 text-sm text-stone-400 bg-stone-50 rounded-lg p-3">
              We&apos;ll create your card and open WhatsApp with a pre-filled message and link.
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={loading}
          className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-300 text-white font-bold text-lg rounded-xl transition-colors shadow-lg"
        >
          {loading
            ? "Sending..."
            : channel === "EMAIL"
            ? "Send Card via Email"
            : "Share via WhatsApp"}
        </button>
      </main>
    </div>
  );
}

export default function SendPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <SendPageContent />
    </Suspense>
  );
}
