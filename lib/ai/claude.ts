import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type MessageTone = "warm" | "formal" | "poetic";
export type MessageLanguage = "en" | "ar" | "bilingual";

export interface MessageGenerationParams {
  occasion: string;
  recipientName: string;
  senderName: string;
  tone: MessageTone;
  language: MessageLanguage;
  includeVerse: boolean;
  selectedVerse?: string;
}

const OCCASION_DESCRIPTIONS: Record<string, string> = {
  "eid-ul-fitr": "Eid ul-Fitr — the celebration marking the end of Ramadan",
  "eid-ul-adha": "Eid ul-Adha — the Festival of Sacrifice",
  ramadan: "the blessed month of Ramadan",
  "laylatul-qadr": "Laylatul Qadr — the Night of Power in the last ten days of Ramadan",
  nikah: "a Nikah (Islamic wedding ceremony) — a joyful union blessed by Allah",
  aqiqah: "the blessed arrival of a new baby (Aqiqah celebration)",
  hajj: "the completion of Hajj or Umrah pilgrimage",
  graduation: "a graduation — an achievement celebrated with gratitude to Allah",
  jummah: "Jummah (the blessed Friday prayer and gathering)",
  "islamic-new-year": "the Islamic New Year (1 Muharram) — a time of reflection",
  mawlid: "Mawlid al-Nabi — the celebration of the Prophet Muhammad's ﷺ birth",
  general: "a general Islamic blessing and du'a",
};

const LANGUAGE_INSTRUCTIONS: Record<MessageLanguage, string> = {
  en: "Write entirely in English. You may include well-known Arabic phrases like 'Assalamu Alaikum', 'Alhamdulillah', 'Masha Allah', 'Barakallahu Feekum', 'Eid Mubarak', 'Ramadan Kareem' etc. in Arabic script where they naturally fit.",
  ar: "Write entirely in Modern Standard Arabic (فصحى). Use beautiful, heartfelt Islamic Arabic phrasing. Include appropriate Islamic greetings and du'a.",
  bilingual:
    "Write primarily in English but weave in meaningful Arabic phrases naturally — in Arabic script — at key moments. Balance both languages so the message flows beautifully for a bilingual reader.",
};

const TONE_INSTRUCTIONS: Record<MessageTone, string> = {
  warm: "The tone should be warm, personal, and heartfelt — like a message from a close friend or family member.",
  formal: "The tone should be respectful and formal — appropriate for colleagues, elders, or acquaintances.",
  poetic: "The tone should be poetic and lyrical — use evocative imagery inspired by Islamic themes: light, stars, the moon, gardens of paradise, flowing rivers.",
};

export function buildIslamicGreetingPrompt(
  params: MessageGenerationParams
): string {
  const occasionDescription =
    OCCASION_DESCRIPTIONS[params.occasion] ?? params.occasion;
  const languageInstruction = LANGUAGE_INSTRUCTIONS[params.language];
  const toneInstruction = TONE_INSTRUCTIONS[params.tone];

  return `You are a gifted Islamic greeting card writer with deep knowledge of Islamic tradition, Quranic wisdom, and heartfelt expression.

Write a greeting card message for the following occasion: ${occasionDescription}

Details:
- The card is FROM: ${params.senderName}
- The card is TO: ${params.recipientName}

Instructions:
1. ${languageInstruction}
2. ${toneInstruction}
3. Length: 3–5 sentences — concise yet meaningful, perfect for a greeting card.
4. Begin with an appropriate Islamic greeting (e.g., "Assalamu Alaikum", "Eid Mubarak", "Ramadan Kareem", "Masha Allah" as fits the occasion).
5. Close with a sincere du'a (prayer/blessing) for the recipient.
6. Draw on authentic Islamic values: gratitude to Allah, love, community, mercy, hope, and barakah.
${
  params.includeVerse && params.selectedVerse
    ? `7. Elegantly incorporate or reference this Quranic verse in the message: "${params.selectedVerse}"`
    : ""
}
8. Do NOT include any non-Islamic religious references.
9. Do NOT include any preamble, explanation, or meta-commentary — output ONLY the card message itself.
10. Do NOT sign the message with the sender's name — that is printed separately on the card.`;
}
