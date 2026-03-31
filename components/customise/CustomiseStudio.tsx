"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { CardCanvas } from "@/components/cards/CardCanvas";
import { BookCanvas } from "@/components/cards/BookCanvas";
import { GoldenBookCanvas } from "@/components/cards/GoldenBookCanvas";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { VersePicker } from "./VersePicker";
import type { QuranVerse } from "@/lib/verses/quran-data";
import { getMessagesForOccasion } from "@/lib/messages/preset-messages";
import { resolveTemplateAnimationStyle } from "@/lib/card-themes/animation-style";
import { applySpecialTemplateArtwork } from "@/lib/card-themes/special-template-artwork";

interface CardTemplate {
  id: string;
  titleEn: string;
  titleAr: string;
  bgColor: string;
  bgImageUrl: string;
  animationFile: string;
  animationStyle?: string | null;
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
  const t = useTranslations("studio");
  const defaultSenderName = session?.user?.name ?? "";

  const [senderName, setSenderName] = useState(defaultSenderName);
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedVerse, setSelectedVerse] = useState<QuranVerse | null>(null);
  const [fontStyle, setFontStyle] = useState("amiri");
  const [showVersePicker, setShowVersePicker] = useState(false);
  const [showMessagePicker, setShowMessagePicker] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const presetMessages = getMessagesForOccasion(template.occasion.slug);
  const animationStyle = resolveTemplateAnimationStyle({
    animationStyle: template.animationStyle,
    bgImageUrl: template.bgImageUrl,
    titleEn: template.titleEn,
    occasionSlug: template.occasion.slug,
  });
  const previewTemplate = applySpecialTemplateArtwork({
    bgColor: template.bgColor,
    bgImageUrl: template.bgImageUrl,
    titleAr: template.titleAr,
    titleEn: template.titleEn,
    animationFile: template.animationFile,
    animationStyle: template.animationStyle,
    occasion: {
      slug: template.occasion.slug,
      nameEn: template.occasion.nameEn,
    },
  });
  const hasCustomSender = senderName.trim() !== defaultSenderName.trim();
  const previewContentMode =
    recipientName.trim() || message.trim() || selectedVerse || hasCustomSender
      ? "personalized"
      : "template";

  const generateAIMessage = useCallback(async () => {
    if (!session) { router.push("/sign-in"); return; }
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
          selectedVerse: selectedVerse ? `${selectedVerse.ref} — ${selectedVerse.textEn}` : undefined,
        }),
        signal: abortRef.current.signal,
      });
      if (res.status === 403) { const data = await res.json(); setAiError(data.error ?? t("aiUpgrade")); return; }
      if (!res.ok || !res.body) { setAiError(t("aiFailed")); return; }
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
      if ((err as Error).name !== "AbortError") setAiError(t("aiError"));
    } finally {
      setAiLoading(false);
    }
  }, [session, template, recipientName, senderName, selectedVerse, router, t]);

  const pickMessage = useCallback((text: string) => {
    const personalised = text
      .replace(/your recipient/gi, recipientName || "Dear Friend")
      .replace(/dear friend/gi, recipientName || "Dear Friend");
    setMessage(personalised);
    setShowMessagePicker(false);
  }, [recipientName]);

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
        {animationStyle === "pageflip" ? (
          <GoldenBookCanvas
            template={previewTemplate}
            recipientName={recipientName}
            senderName={senderName}
            message={message}
            selectedVerse={selectedVerse}
            fontStyle={fontStyle}
            mode="preview"
            contentMode={previewContentMode}
            autoOpen={false}
          />
        ) : animationStyle === "book" ? (
          <BookCanvas
            template={previewTemplate}
            recipientName={recipientName}
            senderName={senderName}
            message={message}
            selectedVerse={selectedVerse}
            fontStyle={fontStyle}
            mode="preview"
            contentMode={previewContentMode}
            autoOpen={false}
          />
        ) : (
          <CardCanvas
            template={previewTemplate}
            recipientName={recipientName}
            senderName={senderName}
            message={message}
            selectedVerse={selectedVerse}
            fontStyle={fontStyle}
            mode="preview"
            contentMode={previewContentMode}
          />
        )}
      </div>

      {/* Editor Panel */}
      <div className="space-y-6">
        {/* Names */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-stone-700 text-lg">
            {t("sectionNames")}
          </h2>
          <div>
            <label className="text-sm text-stone-500 block mb-1">
              {t("recipientNameLabel")}
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder={t("recipientNamePlaceholder")}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-sm text-stone-500 block mb-1">
              {t("senderNameLabel")}
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder={t("senderNamePlaceholder")}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Message */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="font-semibold text-stone-700 text-lg">
            {t("sectionMessage")}
          </h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder={t("messagePlaceholder")}
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-stone-800 text-sm focus:outline-none focus:border-amber-400 resize-none"
          />
          {/* Preset message picker */}
          <button
            onClick={() => setShowMessagePicker(true)}
            className="w-full py-2.5 rounded-lg border-2 border-amber-400 text-amber-700 font-semibold text-sm hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
          >
            {t("pickMessage")}
          </button>
          {/* AI generate button */}
          <button
            onClick={generateAIMessage}
            disabled={aiLoading}
            className="w-full py-2.5 rounded-lg border-2 border-indigo-400 text-indigo-700 font-semibold text-sm hover:bg-indigo-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {aiLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                {t("generating")}
              </>
            ) : (
              t("generateAI")
            )}
          </button>
          {aiError && (
            <p className="text-red-500 text-xs text-center">{aiError}</p>
          )}
        </div>

        {/* Quranic Verse */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-stone-700 text-lg mb-3">
            {t("sectionVerse")}
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
              {t("pickVerse")}
            </button>
          )}
        </div>

        {/* Font */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-stone-700 text-lg mb-3">
            {t("sectionFont")}
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
          {t("nextButton")}
        </button>
        {(!message.trim() || !recipientName.trim()) && (
          <p className="text-center text-stone-400 text-sm">
            {t("nextHint")}
          </p>
        )}
      </div>

      {/* Preset Message Picker Modal */}
      {showMessagePicker && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <h3 className="font-bold text-stone-800 text-lg">{t("pickerTitle")}</h3>
              <button
                onClick={() => setShowMessagePicker(false)}
                className="text-stone-400 hover:text-stone-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {presetMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => pickMessage(msg.text)}
                  className="w-full text-left p-4 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50 transition-colors text-stone-700 text-sm leading-relaxed"
                >
                  {msg.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
