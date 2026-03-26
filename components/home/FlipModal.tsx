"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

interface FlipCard {
  id: string;
  gradient: string;
  icon: string;
  title: string;
  occasion: string;
}

interface FlipModalProps {
  card: FlipCard | null;
  onClose: () => void;
  flipped: boolean;
  onFlip: () => void;
}

export function FlipModal({ card, onClose, flipped, onFlip }: FlipModalProps) {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!card) return null;

  return (
    <div
      className={`v3-flip-overlay${card ? " open" : ""}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${card.title}`}
    >
      <div className="v3-flip-container" onClick={e => { e.stopPropagation(); onFlip(); }}>
        <div className={`v3-flip-inner${flipped ? " flipped" : ""}`}>
          {/* Front */}
          <div
            className="v3-flip-face"
            style={{ background: card.gradient, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}
          >
            <span style={{ fontSize: "64px" }}>{card.icon}</span>
            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", textAlign: "center", padding: "0 20px" }}>{card.title}</span>
            <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>Tap to flip</span>
          </div>
          {/* Back */}
          <div className="v3-flip-back">
            <div>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>
                {card.occasion}
              </p>
              <p style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{card.title}</p>
              <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                Personalise with AI-generated Islamic greetings and Quranic verses.
              </p>
            </div>
            <div>
              <button
                className="v3-btn-send"
                style={{ width: "100%", padding: "12px", marginBottom: "8px", borderRadius: "8px" }}
                onClick={e => { e.stopPropagation(); router.push(`/${locale}/customize/${card.id}`); }}
              >
                Customise & Send →
              </button>
              <button
                style={{ width: "100%", padding: "10px", background: "transparent", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", cursor: "pointer" }}
                onClick={e => { e.stopPropagation(); onClose(); }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
