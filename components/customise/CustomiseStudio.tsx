"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { VersePicker } from "./VersePicker";
import type { QuranVerse } from "@/lib/verses/quran-data";

interface CardTemplate {
  id: string;
  titleEn: string;
  titleAr: string;
  bgColor: string;
  bgImageUrl: string;
  animationFile: string;
  isPremium: boolean;
  occasion: {
    slug: string;
    nameEn: string;
    nameAr: string;
  };
}

interface Props {
  template: CardTemplate;
  verses: QuranVerse[];
}

const FONTS = [
  { value: "amiri", label: "Amiri (Arabic)", preview: "بسم الله" },
  { value: "noto-naskh", label: "Noto Naskh", preview: "بسم الله" },
  { value: "serif", label: "Serif (English)", preview: "Bismillah" },
];

export function CustomiseStudio({ template, verses }: Props) {
  const { data: session } = useSession();
  const router = useRouter();

  const [senderName, setSenderName] = useState(session?.user?.name ?? "");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedVerse, setSelectedVerse] = useState<QuranVerse | null>(null);
  const [fontStyle, setFontStyle] = useState("amiri");
  const [showVersePicker, setShowVersePicker] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const generateAIMessage = useCallback(async () => {
    if (!session) {
      router.push("/sign-in");
      return;
    }

    setAiLoading(true);
    setAiError("");
    setMessage("");
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/ai/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion: template.occasion.slug,
          recipientName: recipientName || "Dear Friend",
          senderName: senderName || "A Friend",
          tone: "warm",
          language: "en",
          includeVerse: !!selectedVerse,
          selectedVerse: selectedVerse
            ? `${selectedVerse.ref} — ${selectedVerse.textEn}`
            : undefined,
        }),
        signal: abortRef.current.signal,
      });

      if (res.status === 403) {
        const data = await res.json();
        setAiError(data.error ?? "Upgrade to use AI message generation.");
        return;
      }

      if (!res.ok || !res.body) {
        setAiError("Failed to generate message. Please try again.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setMessage(text);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setAiError("Something went wrong. Please try again.");
      }
    } finally {
      setAiLoading(false);
    }
  }, [session, template, recipientName, senderName, selectedVerse, router]);

  const handleNext = () => {
    if (!message.trim() || !recipientName.trim()) return;

    const params = new URLSearchParams({
      templateId: template.id,
      senderName,
      recipientName,
      message,
      fontStyle,
      ...(selectedVerse
        ? {
            verseRef: selectedVerse.ref,
            verseTextEn: selectedVerse.textEn,
            verseTextAr: selectedVerse.textAr,
          }
        : {}),
    });

    router.push(`/send?${params.toString()}`);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Card Preview */}
      <div className="sticky top-24">
        <div
          className="rounded-2xl overflow-hidden shadow-xl aspect-[3/4] flex flex-col items-center justify-center p-8 relative"
          style={{ backgroundColor: template.bgColor }}
        >
          {/* Geometric overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 300" className="w-full h-full" fill="none">
              <polygon
                points="100,10 190,55 190,145 100,190 10,145 10,55"
                stroke="#c9a84c"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="100" cy="100" r="60" stroke="#c9a84c" strokeWidth="1.5" fill="none" />
              <circle cx="100" cy="100" r="40" stroke="#c9a84c" strokeWidth="1" fill="none" />
              <line x1="100" y1="10" x2="100" y2="290" stroke="#c9a84c" strokeWidth="0.5" />
              <line x1="10" y1="150" x2="190" y2="150" stroke="#c9a84c" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Bismillah */}
          <p className="font-arabic text-amber-300 text-lg mb-6 relative z-10">
            بسم الله الرحمن الرحيم
          </p>

          {/* Recipient */}
          <p className="text-white/60 text-sm relative z-10">To</p>
          <p className="text-white text-2xl font-semibold mb-4 relative z-10">
            {recipientName || "Your Recipient"}
          </p>

          {/* Card title in Arabic */}
          <p className="font-arabic text-amber-300 text-2xl mb-4 relative z-10">
            {template.titleAr}
          </p>

          {/* Message */}
          <p
            className={`text-white/90 text-sm leading-relaxed text-center mb-4 relative z-10 max-w-xs ${
              fontStyle === "amiri" ? "font-arabic" : ""
            }`}
          >
            {message || "Your personalised message will appear here..."}
          </p>

          {/* Verse */}
          {selectedVerse && (
            <div className="border-t border-amber-400/30 pt-3 mt-2 relative z-10 text-center">
              <p className="font-arabic text-amber-300 text-sm">
                {selectedVerse.textAr}
              </p>
              <p className="text-white/60 text-xs mt-1">
                — Quran {selectedVerse.ref}
              </p>
            </div>
          )}

          {/* From */}
          <p className="text-white/50 text-xs mt-4 relative z-10">
            From: {senderName || "You"}
          </p>
        </div>
      </div>

      {/* Editor Panel */}
      <div className="space-y-6">
        {/* Names */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-stone-700 text-lg">
            1. Names
          </h2>
          <div>
            <label className="text-sm text-stone-500 block mb-1">
              Recipient&apos;s Name *
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Sister Fatima"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-sm text-stone-500 block mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. Brother Ahmed"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Message */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="font-semibold text-stone-700 text-lg">
            2. Your Message
          </h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Write your heartfelt message here..."
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-800 text-sm focus:outline-none focus:border-amber-400 resize-none"
          />
          {/* AI Generate */}
          <button
            onClick={generateAIMessage}
            disabled={aiLoading}
            className="w-full py-2.5 rounded-lg border-2 border-amber-400 text-amber-700 font-semibold text-sm hover:bg-amber-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {aiLoading ? (
              <>
                <span className="animate-spin">✨</span> Generating...
              </>
            ) : (
              <>✨ Generate with AI</>
            )}
          </button>
          {aiError && (
            <p className="text-red-500 text-sm">{aiError}</p>
          )}
        </div>

        {/* Quranic Verse */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-stone-700 text-lg mb-3">
            3. Quranic Verse (optional)
          </h2>
          {selectedVerse ? (
            <div className="bg-amber-50 rounded-lg p-3 flex items-start justify-between gap-2">
              <div>
                <p className="font-arabic text-stone-700 text-base">
                  {selectedVerse.textAr}
                </p>
                <p className="text-stone-500 text-sm mt-1">
                  {selectedVerse.textEn}
                </p>
                <p className="text-amber-600 text-xs mt-1">
                  — Quran {selectedVerse.ref}
                </p>
              </div>
              <button
                onClick={() => setSelectedVerse(null)}
                className="text-stone-400 hover:text-red-500 text-lg shrink-0"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowVersePicker(true)}
              className="w-full py-2.5 rounded-lg border-2 border-dashed border-stone-200 text-stone-400 text-sm hover:border-amber-300 hover:text-amber-600 transition-colors"
            >
              📖 Pick a Quranic Verse
            </button>
          )}
        </div>

        {/* Font */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-stone-700 text-lg mb-3">
            4. Font Style
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {FONTS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFontStyle(f.value)}
                className={`p-3 rounded-lg border-2 text-center transition-colors ${
                  fontStyle === f.value
                    ? "border-amber-500 bg-amber-50"
                    : "border-stone-200 hover:border-amber-200"
                }`}
              >
                <p
                  className={`text-lg ${f.value === "amiri" ? "font-arabic" : ""}`}
                >
                  {f.preview}
                </p>
                <p className="text-xs text-stone-500 mt-1">{f.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={!message.trim() || !recipientName.trim()}
          className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-300 text-white font-bold text-lg rounded-xl transition-colors shadow-lg"
        >
          Next: Send Your Card →
        </button>
        {(!message.trim() || !recipientName.trim()) && (
          <p className="text-center text-stone-400 text-sm">
            Add a recipient name and message to continue.
          </p>
        )}
      </div>

      {/* Verse Picker Modal */}
      {showVersePicker && (
        <VersePicker
          verses={verses}
          onSelect={(v) => {
            setSelectedVerse(v);
            setShowVersePicker(false);
          }}
          onClose={() => setShowVersePicker(false)}
        />
      )}
    </div>
  );
}
