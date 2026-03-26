"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

const TYPEWRITER_PHRASES = [
  "Eid al-Fitr blessings",
  "Ramadan Mubarak wishes",
  "Nikah congratulations",
  "Jummah reminders",
  "Hajj Mubarak greetings",
  "Laylatul Qadr du'a",
];

const TRENDING = ["✨ Eid Mubarak", "🌙 Ramadan", "💍 Nikah", "🕌 Jummah", "🕋 Hajj", "🤲 Du'a"];

function useTypewriter(phrases: string[], speed = 60, pause = 2000) {
  const [display, setDisplay] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[phraseIdx];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && charIdx <= phrase.length) {
      timeout = setTimeout(() => {
        setDisplay(phrase.slice(0, charIdx));
        setCharIdx(c => c + 1);
      }, charIdx === phrase.length ? pause : speed);
    } else if (deleting && charIdx >= 0) {
      timeout = setTimeout(() => {
        setDisplay(phrase.slice(0, charIdx));
        setCharIdx(c => c - 1);
      }, speed / 2);
    } else {
      setDeleting(d => !d);
      if (deleting) setPhraseIdx(i => (i + 1) % phrases.length);
    }
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, phraseIdx, phrases, speed, pause]);

  return display;
}

export function HeroSection() {
  const typed = useTypewriter(TYPEWRITER_PHRASES);
  const router = useRouter();
  const locale = useLocale();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/${locale}/cards?q=${encodeURIComponent(query.trim())}`);
    else router.push(`/${locale}/cards`);
  };

  return (
    <section
      className="relative z-10 pt-24 pb-16 px-4 text-center overflow-hidden"
      style={{ color: "var(--v3-text)" }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.14) 0%, transparent 60%)" }}
        aria-hidden="true"
      />

      {/* Greeting pill */}
      <div className="v3-greeting-pill v3-reveal">
        <span className="v3-greeting-dot" />
        <span>As-salamu alaykum — Send Blessings Today</span>
      </div>

      {/* Animated moon */}
      <div className="v3-moon-stage v3-reveal v3-reveal-delay-1">
        <div className="v3-moon-halo" aria-hidden="true" />
        <div className="v3-moon-halo2" aria-hidden="true" />
        <span className="v3-moon-icon" role="img" aria-label="Crescent moon">☽</span>
      </div>

      {/* Title */}
      <div className="v3-reveal v3-reveal-delay-1">
        <p style={{ fontSize: "0.78rem", letterSpacing: "3px", textTransform: "uppercase", color: "var(--gold)", opacity: 0.8, marginBottom: "14px" }}>
          Islamic Ecards Platform
        </p>
        <h1 style={{ fontSize: "clamp(2.4rem,6vw,4.2rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: "12px" }}>
          <span className="v3-shimmer-text">Noor Cards</span>
          <span style={{ display: "block", color: "rgba(255,255,255,0.4)", fontWeight: 300, fontSize: "0.55em", marginTop: "6px", letterSpacing: "2px" }}>
            SPREAD LIGHT · SHARE BLESSINGS
          </span>
        </h1>
      </div>

      {/* Typewriter subtitle */}
      <p className="v3-reveal v3-reveal-delay-2" style={{ fontSize: "1.05rem", color: "var(--v3-text-dim)", maxWidth: "520px", margin: "0 auto 36px", lineHeight: 1.6, minHeight: "2.4em" }}>
        Beautiful animated cards for{" "}
        <span style={{ color: "var(--gold)", fontWeight: 500 }}>{typed}</span>
        <span style={{ display: "inline-block", width: "2px", height: "1em", background: "var(--gold)", marginLeft: "2px", verticalAlign: "text-bottom", animation: "blink-cursor 0.75s step-end infinite" }} />
      </p>

      {/* Search bar */}
      <form className="v3-search v3-reveal v3-reveal-delay-2" onSubmit={handleSearch}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search cards — Eid, Nikah, Ramadan..."
          aria-label="Search cards"
        />
        <button className="v3-search-btn" type="submit">Browse →</button>
      </form>

      {/* Trending tags */}
      <div className="v3-reveal v3-reveal-delay-3" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px", marginBottom: "48px" }}>
        {TRENDING.map(tag => (
          <button
            key={tag}
            onClick={() => router.push(`/${locale}/cards?q=${encodeURIComponent(tag.replace(/^[^\w]+/, "").trim())}`)}
            style={{
              background: "var(--v3-surface)", border: "1px solid var(--v3-border)",
              color: "var(--v3-text-dim)", padding: "5px 14px", borderRadius: "20px",
              fontSize: "0.8rem", cursor: "pointer",
            }}
          >
            {tag}
          </button>
        ))}
      </div>
    </section>
  );
}
