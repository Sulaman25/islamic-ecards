import type { Metadata } from "next";
import { Amiri, Noto_Naskh_Arabic } from "next/font/google";
import { SessionProvider } from "@/components/layout/SessionProvider";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${amiri.variable} ${notoNaskh.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
