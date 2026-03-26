"use client";
import { useState, useCallback } from "react";
import { FlipModal } from "./FlipModal";

interface MasonryCard {
  id: string;
  gradient: string;
  icon: string;
  title: string;
  occasion: string;
  size: "short" | "medium" | "tall";
}

const SAMPLE_CARDS: MasonryCard[] = [
  { id: "eid-crescent",     gradient: "linear-gradient(135deg,#1a1208,#2d1b0e)", icon: "🌙", title: "Eid al-Fitr Mubarak",    occasion: "Eid",     size: "medium" },
  { id: "ramadan-lantern",  gradient: "linear-gradient(135deg,#0a0a2e,#1a1a5e)", icon: "🏮", title: "Ramadan Kareem",         occasion: "Ramadan", size: "tall"   },
  { id: "nikah-gold",       gradient: "linear-gradient(135deg,#1a0a0a,#3d1515)", icon: "💍", title: "Nikah Mubarak",          occasion: "Nikah",   size: "short"  },
  { id: "jummah-mosque",    gradient: "linear-gradient(135deg,#0a1a0a,#0d2318)", icon: "🕌", title: "Jummah Mubarak",         occasion: "Jummah",  size: "medium" },
  { id: "hajj-kaaba",       gradient: "linear-gradient(135deg,#1a1510,#2d2010)", icon: "🕋", title: "Hajj Mubarak",           occasion: "Hajj",    size: "tall"   },
  { id: "aqiqah-stars",     gradient: "linear-gradient(135deg,#1a0a1a,#2d102d)", icon: "⭐", title: "Aqiqah Mubarak",         occasion: "Aqiqah",  size: "short"  },
  { id: "qadr-night",       gradient: "linear-gradient(135deg,#050520,#0d0d40)", icon: "✨", title: "Laylatul Qadr",          occasion: "Ramadan", size: "medium" },
  { id: "general-dua",      gradient: "linear-gradient(135deg,#0a1510,#0f2018)", icon: "🤲", title: "Du'a & Blessings",       occasion: "General", size: "short"  },
];

const HEIGHT_MAP = { short: "80px", medium: "130px", tall: "180px" };

export function MasonryGrid() {
  const [selected, setSelected] = useState<MasonryCard | null>(null);
  const [flipped, setFlipped]   = useState(false);

  const openCard  = useCallback((card: MasonryCard) => { setSelected(card); setFlipped(false); }, []);
  const closeCard = useCallback(() => { setSelected(null); setFlipped(false); }, []);
  const flipCard  = useCallback(() => setFlipped(f => !f), []);

  return (
    <>
      <div className="v3-masonry">
        {SAMPLE_CARDS.map(card => (
          <div
            key={card.id}
            className="v3-masonry-card"
            style={{ height: HEIGHT_MAP[card.size], background: card.gradient }}
            onClick={() => openCard(card)}
            role="button"
            tabIndex={0}
            aria-label={`Preview ${card.title}`}
            onKeyDown={e => e.key === "Enter" && openCard(card)}
          >
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
              {card.icon}
            </div>
            <div className="v3-masonry-hover">Click to preview →</div>
          </div>
        ))}
      </div>

      <FlipModal card={selected} onClose={closeCard} flipped={flipped} onFlip={flipCard} />
    </>
  );
}
