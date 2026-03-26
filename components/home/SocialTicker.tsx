"use client";

const EVENTS = [
  { avatar: "🌙", name: "Fatima A.", card: "Eid Mubarak — Golden Crescent", time: "2m ago" },
  { avatar: "⭐", name: "Ahmed K.", card: "Ramadan Lantern Wishes", time: "5m ago" },
  { avatar: "💍", name: "Sara M.", card: "Nikah Mubarak — White Rose", time: "8m ago" },
  { avatar: "🕌", name: "Yusuf H.", card: "Jummah Mubarak — Mosque at Dawn", time: "11m ago" },
  { avatar: "🕋", name: "Maryam R.", card: "Hajj Mubarak — Kaaba Blessing", time: "14m ago" },
  { avatar: "🌟", name: "Ibrahim S.", card: "Laylatul Qadr — Night of Power", time: "18m ago" },
  { avatar: "🤲", name: "Aisha T.", card: "Aqiqah Mubarak — Pink Stars", time: "22m ago" },
  { avatar: "🎓", name: "Omar N.", card: "Graduation Mubarak — Gold", time: "27m ago" },
];

// Duplicate for seamless loop
const ALL = [...EVENTS, ...EVENTS];

export function SocialTicker() {
  return (
    <div className="v3-ticker-bar" role="marquee" aria-label="Recent card activity">
      <span className="v3-ticker-label">LIVE</span>
      <div className="v3-ticker-wrap">
        <div className="v3-ticker-track">
          {ALL.map((e, i) => (
            <span key={i} className="v3-ticker-event">
              <span style={{ fontSize: "1rem" }}>{e.avatar}</span>
              <span className="name">{e.name}</span>
              <span style={{ color: "var(--v3-border)" }}>sent</span>
              <span className="cname">"{e.card}"</span>
              <span style={{ opacity: 0.5, fontSize: "0.7rem" }}>{e.time}</span>
              {i < ALL.length - 1 && <span style={{ color: "var(--v3-border)", padding: "0 8px" }}>·</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
