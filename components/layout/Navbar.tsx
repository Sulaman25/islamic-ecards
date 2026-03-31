"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/lib/i18n-navigation";
import { HijriPill } from "@/components/home/HijriPill";

const LOCALES = [
  { code: "en", label: "English" },
  { code: "ar", label: "Arabic" },
  { code: "ur", label: "Urdu" },
];

function LocaleSelect({
  locale,
  onChangeLocale,
  onSwitch,
}: {
  locale: string;
  onChangeLocale: (nextLocale: string) => void;
  onSwitch?: () => void;
}) {
  return (
    <select
      value={locale}
      onChange={(event) => {
        onChangeLocale(event.target.value);
        onSwitch?.();
      }}
      className="text-xs font-semibold px-2 py-1 rounded-full border border-amber-300 text-amber-700 bg-white hover:bg-amber-50 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
    >
      {LOCALES.map(({ code, label }) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  );
}

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const closeMenu = () => setMenuOpen(false);
  const handleLocaleChange = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: "rgba(3,2,10,0.85)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🌙</span>
          <span className="font-bold text-amber-300 text-lg">Islamic Ecards</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-stone-100">
          <Link
            href="/cards"
            className="hover:text-amber-700 transition-colors font-medium"
          >
            {t("browseCards")}
          </Link>
          <Link
            href="/pricing"
            className="hover:text-amber-700 transition-colors font-medium"
          >
            {t("pricing")}
          </Link>
          {session && (
            <Link
              href="/dashboard"
              className="hover:text-amber-700 transition-colors font-medium"
            >
              {t("dashboard")}
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <HijriPill />
          <LocaleSelect locale={locale} onChangeLocale={handleLocaleChange} />
          {session ? (
            <>
              <span className="text-sm text-stone-300">{session.user?.name}</span>
              <button
                onClick={() => signOut()}
                className="text-sm text-stone-300 hover:text-white transition-colors"
              >
                {t("signOut")}
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              {t("signIn")}
            </button>
          )}
        </div>

        <button
          className="md:hidden flex items-center justify-center w-10 h-10 text-stone-300 hover:text-amber-400 transition-colors text-xl"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div
          className="md:hidden border-t border-amber-100"
          style={{ backgroundColor: "#1a3a2a" }}
        >
          <div className="px-4 py-3 flex flex-col gap-1">
            <Link
              href="/cards"
              onClick={closeMenu}
              className="flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium text-stone-200 hover:bg-white/10 hover:text-amber-400 transition-colors"
            >
              {t("browseCards")}
            </Link>
            <Link
              href="/pricing"
              onClick={closeMenu}
              className="flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium text-stone-200 hover:bg-white/10 hover:text-amber-400 transition-colors"
            >
              {t("pricing")}
            </Link>
            {session && (
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium text-stone-200 hover:bg-white/10 hover:text-amber-400 transition-colors"
              >
                {t("dashboard")}
              </Link>
            )}

            <div className="border-t border-white/10 my-1" />

            <div className="px-3 py-2">
              <LocaleSelect
                locale={locale}
                onChangeLocale={handleLocaleChange}
                onSwitch={closeMenu}
              />
            </div>

            {session ? (
              <>
                <span className="px-3 py-1 text-xs text-stone-400">
                  {session.user?.name}
                </span>
                <button
                  onClick={() => {
                    signOut();
                    closeMenu();
                  }}
                  className="text-left px-3 py-3 rounded-lg text-sm font-medium text-stone-200 hover:bg-white/10 hover:text-amber-400 transition-colors"
                >
                  {t("signOut")}
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  signIn("google");
                  closeMenu();
                }}
                className="mx-3 my-1 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors text-center"
              >
                {t("signIn")}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
