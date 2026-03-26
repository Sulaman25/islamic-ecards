"use client";
import { useState } from "react";

const MOODS = [
  { id: "all",        label: "✨ All" },
  { id: "joyful",    label: "🎉 Joyful" },
  { id: "peaceful",  label: "🕊️ Peaceful" },
  { id: "reverent",  label: "🙏 Reverent" },
  { id: "celebratory", label: "💛 Celebratory" },
  { id: "ramadan",   label: "🌙 Ramadan" },
  { id: "eid",       label: "🌸 Eid" },
  { id: "nikah",     label: "💍 Nikah" },
];

interface MoodFilterProps {
  onChange?: (mood: string) => void;
}

export function MoodFilter({ onChange }: MoodFilterProps) {
  const [active, setActive] = useState("all");

  const handleClick = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", marginBottom: "24px", scrollbarWidth: "none" }}>
      {MOODS.map(m => (
        <button
          key={m.id}
          onClick={() => handleClick(m.id)}
          className={`v3-mood-pill${active === m.id ? " active" : ""}`}
          aria-pressed={active === m.id}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
