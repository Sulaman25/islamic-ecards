"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

const OCCASIONS = [
  { slug: "all",     icon: "🌟", label: "All Cards" },
  { slug: "eid",     icon: "🌙", label: "Eid" },
  { slug: "ramadan", icon: "✨", label: "Ramadan" },
  { slug: "nikah",   icon: "💍", label: "Nikah" },
  { slug: "jummah",  icon: "🕌", label: "Jummah" },
  { slug: "hajj",    icon: "🕋", label: "Hajj" },
  { slug: "aqiqah",  icon: "🤲", label: "Aqiqah" },
  { slug: "general", icon: "🌸", label: "Blessings" },
];

export function OccasionMedallions() {
  const [active, setActive] = useState("all");
  const router = useRouter();
  const locale = useLocale();

  const handleClick = (slug: string) => {
    setActive(slug);
    const url = slug === "all" ? `/${locale}/cards` : `/${locale}/cards?occasion=${slug}`;
    router.push(url);
  };

  return (
    <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "8px", scrollbarWidth: "none" }}>
      {OCCASIONS.map(o => (
        <button
          key={o.slug}
          onClick={() => handleClick(o.slug)}
          className={`v3-medallion${active === o.slug ? " active" : ""}`}
          style={{ background: "none", border: "none", padding: 0 }}
          aria-pressed={active === o.slug}
        >
          <div className="v3-med-circle">{o.icon}</div>
          <span className="v3-med-label">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
