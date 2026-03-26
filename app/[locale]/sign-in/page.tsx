"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense } from "react";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/cards";
  const t = useTranslations("signIn");

  return (
    <div className="min-h-screen pattern-islamic flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center">
        <p className="font-arabic text-2xl text-amber-700 mb-2">
          بسم الله الرحمن الرحيم
        </p>
        <h1 className="text-3xl font-bold text-stone-800 mb-1">{t("title")}</h1>
        <p className="text-stone-500 text-sm mb-8">
          {t("subtitle")}
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full flex items-center justify-center gap-3 border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h13.2c-.6 3-2.4 5.5-5 7.2v6h8c4.7-4.3 7.3-10.7 7.3-17.2z"/>
            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-8-6c-2.1 1.4-4.8 2.3-7.9 2.3-6.1 0-11.2-4.1-13-9.6H2.7v6.2C6.7 42.7 14.8 48 24 48z"/>
            <path fill="#FBBC05" d="M11 28.9c-.5-1.4-.7-2.9-.7-4.4s.3-3 .7-4.4v-6.2H2.7C1 17.2 0 20.5 0 24s1 6.8 2.7 9.1l8.3-4.2z"/>
            <path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.7-6.7C35.9 2.4 30.4 0 24 0 14.8 0 6.7 5.3 2.7 13.1l8.3 4.2C12.8 13.6 17.9 9.5 24 9.5z"/>
          </svg>
          {t("continueGoogle")}
        </button>

        <p className="text-xs text-stone-400 mt-8">
          {t("terms")}
          <br />
          جزاك الله خيراً
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
