"use client";
import { useEffect, useState } from "react";

function toHijri(date: Date): string {
  // Approximate Hijri calculation (within ±1 day)
  const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
  const l  = jd - 1948440 + 10632;
  const n  = Math.floor((l - 1) / 10631);
  const ll = l - 10631 * n + 354;
  const j  = Math.floor((10985 - ll) / 5316) * Math.floor((50 * ll) / 17719) +
             Math.floor(ll / 5670) * Math.floor((43 * ll) / 15238);
  const lll = ll - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
              Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * lll) / 709);
  const day   = lll - Math.floor((709 * month) / 24);
  const year  = 30 * n + j - 30;
  const MONTHS = ["Muharram","Safar","Rabi I","Rabi II","Jumada I","Jumada II",
                  "Rajab","Sha'ban","Ramadan","Shawwal","Dhul Qa'dah","Dhul Hijjah"];
  return `${day} ${MONTHS[month - 1]} ${year} AH`;
}

export function HijriPill() {
  const [hijri, setHijri] = useState("");
  useEffect(() => { setHijri(toHijri(new Date())); }, []);
  if (!hijri) return null;
  return (
    <div className="v3-hijri-pill">
      <span>🌙</span>
      <span>{hijri}</span>
    </div>
  );
}
