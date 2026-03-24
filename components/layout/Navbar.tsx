"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-amber-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🌙</span>
          <span className="font-bold text-stone-800 text-lg">
            Islamic Ecards
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-stone-600">
          <Link href="/cards" className="hover:text-amber-700 transition-colors font-medium">
            Browse Cards
          </Link>
          <Link href="/pricing" className="hover:text-amber-700 transition-colors font-medium">
            Pricing
          </Link>
          {session && (
            <Link href="/dashboard" className="hover:text-amber-700 transition-colors font-medium">
              Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <span className="text-sm text-stone-500 hidden md:block">
                {session.user?.name}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
