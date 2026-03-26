"use client";

import { Link } from "@/lib/i18n-navigation";
import { motion } from "framer-motion";

interface CardTemplate {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  bgColor: string;
  bgImageUrl: string;
  animationFile: string;
  isPremium: boolean;
  occasion: { slug: string; nameEn: string; nameAr: string };
}

interface Props { templates: CardTemplate[] }

// Per-occasion accent colours for thumbnails
function getAccent(slug: string) {
  if (slug.includes("eid"))     return "#f0d080";
  if (slug.includes("ramadan") || slug.includes("laylatul")) return "#fbbf24";
  if (slug.includes("nikah"))   return "#fca5a5";
  if (slug.includes("jummah"))  return "#6ee7b7";
  if (slug.includes("hajj"))    return "#fcd34d";
  if (slug.includes("aqiqah"))  return "#c4b5fd";
  return "#c9a84c";
}

// Tiny SVG pattern per occasion for thumbnail
function ThumbnailPattern({ slug, accent }: { slug: string; accent: string }) {
  if (slug.includes("ramadan") || slug.includes("laylatul")) {
    return (
      <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 150" fill="none">
        <path d="M50 10 C30 10 15 25 15 45 C15 65 30 80 50 80 C60 80 68 76 74 69 C64 67 57 59 57 49 C57 39 64 31 74 28 C68 19 60 10 50 10Z" fill={accent} />
        {[20,40,65,80,10].map((x,i) => <circle key={i} cx={x} cy={10+i*15} r="1.5" fill={accent} />)}
      </svg>
    );
  }
  if (slug.includes("nikah")) {
    return (
      <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 150" fill="none">
        {[0,30,60,90,120,150].map(a => (
          <ellipse key={a} cx="50" cy="75" rx="40" ry="12" stroke={accent} strokeWidth="0.8" fill="none" transform={`rotate(${a} 50 75)`} />
        ))}
      </svg>
    );
  }
  if (slug.includes("jummah")) {
    return (
      <svg className="absolute bottom-0 left-0 right-0 w-full opacity-20" viewBox="0 0 100 40" fill="none">
        <path d="M30,40 L30,22 Q30,10 50,10 Q70,10 70,22 L70,40 Z" fill={accent} />
        <ellipse cx="50" cy="10" rx="20" ry="6" fill={accent} />
        <rect x="12" y="18" width="7" height="22" fill={accent} />
        <rect x="81" y="18" width="7" height="22" fill={accent} />
      </svg>
    );
  }
  if (slug.includes("hajj") || slug.includes("eid-adha")) {
    return (
      <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 150" fill="none">
        <rect x="35" y="55" width="30" height="28" stroke={accent} strokeWidth="1.2" fill="none" />
        {[0,60,120,180,240,300].map((deg,i) => {
          const rad = deg * Math.PI / 180;
          const cx = 50 + 22*Math.cos(rad), cy = 69 + 22*Math.sin(rad);
          return <circle key={i} cx={cx} cy={cy} r="2" fill={accent} />;
        })}
      </svg>
    );
  }
  // Default / Eid: 8-pointed star
  return (
    <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 150" fill="none">
      <rect x="25" y="50" width="50" height="50" stroke={accent} strokeWidth="1" fill="none" transform="rotate(0 50 75)" />
      <rect x="25" y="50" width="50" height="50" stroke={accent} strokeWidth="1" fill="none" transform="rotate(45 50 75)" />
      <circle cx="50" cy="75" r="22" stroke={accent} strokeWidth="0.8" fill="none" />
    </svg>
  );
}

export function CardGrid({ templates }: Props) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-20 text-stone-400">
        <p className="text-5xl mb-4">🌙</p>
        <p className="text-lg">No cards found for this occasion yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {templates.map((template, i) => {
        const accent = getAccent(template.occasion.slug);
        return (
          <Link key={template.id} href={`/customize/${template.id}`}>
            <motion.div
              className="card-hover group rounded-2xl overflow-hidden shadow-md cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6, boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 20px ${accent}30` }}
            >
              {/* Card thumbnail */}
              <div
                className="aspect-[3/4] flex flex-col items-center justify-center p-4 relative overflow-hidden"
                style={{ backgroundColor: template.bgColor }}
              >
                {/* Radial glow */}
                <div
                  className="absolute inset-0"
                  style={{ backgroundImage: `radial-gradient(ellipse at 50% 40%, ${accent}20 0%, transparent 70%)` }}
                />

                {/* Occasion-themed pattern */}
                <ThumbnailPattern slug={template.occasion.slug} accent={accent} />

                {/* Premium badge */}
                {template.isPremium && (
                  <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow">
                    ✦ Premium
                  </span>
                )}

                {/* Hover shimmer overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ backgroundImage: `linear-gradient(135deg, ${accent}10 0%, transparent 50%, ${accent}10 100%)` }}
                />

                {/* Titles */}
                <div className="relative z-10 text-center">
                  <p className="font-arabic text-white text-2xl mb-1 drop-shadow-lg leading-relaxed">
                    {template.titleAr}
                  </p>
                  <p className="text-amber-300 text-xs font-bold tracking-wider uppercase drop-shadow">
                    {template.occasion.nameEn}
                  </p>
                </div>
              </div>

              {/* Label */}
              <div className="bg-white px-3 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-stone-700 text-sm font-semibold truncate leading-tight">
                    {template.titleEn}
                  </p>
                  <p className="text-stone-400 text-xs mt-0.5">{template.occasion.nameEn}</p>
                </div>
                <motion.span
                  className="text-amber-500 text-lg shrink-0"
                  whileHover={{ scale: 1.3 }}
                >
                  →
                </motion.span>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}
