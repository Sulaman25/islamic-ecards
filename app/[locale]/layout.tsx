import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { SessionProvider } from "@/components/layout/SessionProvider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

export const metadata: Metadata = {
  title: "Islamic Ecards — Spread Blessings",
  description:
    "Send beautiful animated Islamic greeting cards for Eid, Ramadan, Nikah, and more. Personalized with AI-generated messages and Quranic verses.",
  keywords: [
    "Islamic ecards",
    "Eid cards",
    "Ramadan cards",
    "Muslim greeting cards",
    "Islamic gifts",
  ],
};

const fontVars: CSSProperties = {
  ["--font-amiri" as string]: "Amiri",
  ["--font-noto-naskh" as string]: "Noto Naskh Arabic",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "ar" | "ur")) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === "ar" || locale === "ur" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className="h-full"
      style={fontVars}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 antialiased">
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
