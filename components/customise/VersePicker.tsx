"use client";

import { useState } from "react";
import type { QuranVerse } from "@/lib/verses/quran-data";

interface Props {
  verses: QuranVerse[];
  onSelect: (verse: QuranVerse) => void;
  onClose: () => void;
}

export function VersePicker({ verses, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");

  const filtered = query
    ? verses.filter(
        (v) =>
          v.textEn.toLowerCase().includes(query.toLowerCase()) ||
          v.surahEn.toLowerCase().includes(query.toLowerCase()) ||
          v.ref.includes(query)
      )
    : verses;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-stone-800 text-lg">
              Choose a Quranic Verse
            </h2>
            <p className="text-stone-400 text-sm">
              Include a verse of meaning on your card
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-4 border-b border-stone-100">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by surah name, keywords, or ref (e.g. 2:286)..."
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
            autoFocus
          />
        </div>

        <div className="overflow-y-auto flex-1 p-2">
          {filtered.length === 0 ? (
            <p className="text-center text-stone-400 py-8">No verses found</p>
          ) : (
            filtered.map((verse) => (
              <button
                key={verse.ref}
                onClick={() => onSelect(verse)}
                className="w-full text-left p-4 rounded-xl hover:bg-amber-50 transition-colors border border-transparent hover:border-amber-200 mb-1"
              >
                <p className="font-arabic text-stone-700 text-lg leading-relaxed mb-2">
                  {verse.textAr}
                </p>
                <p className="text-stone-600 text-sm italic leading-relaxed">
                  &ldquo;{verse.textEn}&rdquo;
                </p>
                <p className="text-amber-600 text-xs mt-2 font-medium">
                  {verse.surahEn} — Quran {verse.ref}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
