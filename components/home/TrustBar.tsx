"use client";
import { useEffect, useRef, useState } from "react";

const STATS = [
  { icon: "📨", value: 12400, suffix: "+", label: "cards sent" },
  { icon: "👥", value: 3200,  suffix: "+", label: "happy users" },
  { icon: "🌙", value: 12,    suffix: "",  label: "occasions" },
  { icon: "⭐", value: 4.9,   suffix: "",  label: "rating", decimal: true },
];

function useCountUp(target: number, duration = 1200, decimal = false) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setVal(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { ref, display: decimal ? val.toFixed(1) : Math.floor(val).toLocaleString() };
}

function StatItem({ stat }: { stat: typeof STATS[0] }) {
  const { ref, display } = useCountUp(stat.value, 1200, stat.decimal);
  return (
    <div ref={ref} className="v3-trust-item">
      <span style={{ fontSize: "1.1rem" }}>{stat.icon}</span>
      <strong>{display}{stat.suffix}</strong>
      <span>{stat.label}</span>
    </div>
  );
}

export function TrustBar() {
  return (
    <div className="v3-trust-bar" role="region" aria-label="Platform statistics">
      {STATS.map(s => <StatItem key={s.label} stat={s} />)}
    </div>
  );
}
