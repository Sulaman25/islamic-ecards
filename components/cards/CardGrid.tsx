"use client";

import Link from "next/link";

interface CardTemplate {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  bgColor: string;
  bgImageUrl: string;
  animationFile: string;
  isPremium: boolean;
  occasion: {
    slug: string;
    nameEn: string;
    nameAr: string;
  };
}

interface Props {
  templates: CardTemplate[];
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
      {templates.map((template) => (
        <Link
          key={template.id}
          href={`/customize/${template.id}`}
          className="card-hover group rounded-2xl overflow-hidden shadow-md relative"
        >
          {/* Card background */}
          <div
            className="aspect-[3/4] flex flex-col items-center justify-center p-4 relative"
            style={{ backgroundColor: template.bgColor }}
          >
            {/* Premium badge */}
            {template.isPremium && (
              <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                Premium
              </span>
            )}

            {/* Geometric pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon
                  points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
                  stroke="#c9a84c"
                  strokeWidth="2"
                  fill="none"
                />
                <polygon
                  points="50,15 85,32.5 85,67.5 50,85 15,67.5 15,32.5"
                  stroke="#c9a84c"
                  strokeWidth="1.5"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="20"
                  stroke="#c9a84c"
                  strokeWidth="1"
                  fill="none"
                />
                <line
                  x1="50"
                  y1="5"
                  x2="50"
                  y2="95"
                  stroke="#c9a84c"
                  strokeWidth="0.5"
                />
                <line
                  x1="5"
                  y1="50"
                  x2="95"
                  y2="50"
                  stroke="#c9a84c"
                  strokeWidth="0.5"
                />
              </svg>
            </div>

            {/* Card titles */}
            <p className="font-arabic text-center text-white text-2xl mb-1 relative z-10 drop-shadow">
              {template.titleAr}
            </p>
            <p className="text-amber-300 text-xs font-semibold tracking-wider text-center relative z-10 drop-shadow uppercase">
              {template.occasion.nameEn}
            </p>
          </div>

          {/* Card label */}
          <div className="bg-white px-3 py-2">
            <p className="text-stone-700 text-sm font-semibold truncate">
              {template.titleEn}
            </p>
            <p className="text-amber-600 text-xs mt-0.5">
              Tap to personalise →
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
