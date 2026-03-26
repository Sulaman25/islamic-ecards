import type { Metadata } from "next";
import { Amiri, Noto_Naskh_Arabic } from "next/font/google";
import { SessionProvider } from "@/components/layout/SessionProvider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

const notoNaskh = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

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
      className={`${amiri.variable} ${notoNaskh.variable} h-full`}
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
