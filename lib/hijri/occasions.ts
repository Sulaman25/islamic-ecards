// lib/hijri/occasions.ts
// Hardcoded 2026-2027 Islamic occasion dates (approximate — based on astronomical calculations)
// Dates may vary by 1-2 days depending on moon sighting.

export interface IslamicOccasion {
  slug: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  dates: string[]; // ISO date strings "YYYY-MM-DD"
  description: string;
}

export const ISLAMIC_OCCASIONS: IslamicOccasion[] = [
  {
    slug: "ramadan",
    nameEn: "Ramadan",
    nameAr: "رمضان كريم",
    icon: "📿",
    dates: ["2026-02-17", "2027-02-06"],
    description: "The holy month of fasting, prayer and reflection. Send Ramadan Mubarak cards and share sehri & iftar blessings.",
  },
  {
    slug: "eid-ul-fitr",
    nameEn: "Eid al-Fitr",
    nameAr: "عيد الفطر المبارك",
    icon: "🎁",
    dates: ["2026-03-20", "2027-03-09"],
    description: "The blessed celebration marking the end of Ramadan. Send Eid Mubarak cards to family and friends around the world.",
  },
  {
    slug: "eid-ul-adha",
    nameEn: "Eid al-Adha",
    nameAr: "عيد الأضحى المبارك",
    icon: "🐑",
    dates: ["2026-05-27", "2027-05-16"],
    description: "The festival of sacrifice is approaching. Send your Eid al-Adha cards to family and loved ones in time.",
  },
  {
    slug: "hajj",
    nameEn: "Hajj Season",
    nameAr: "موسم الحج",
    icon: "🕋",
    dates: ["2026-05-22", "2027-05-11"],
    description: "Hajj season is nearly here. Send Hajj Mabrook cards to those embarking on the blessed pilgrimage.",
  },
  {
    slug: "islamic-new-year",
    nameEn: "Islamic New Year",
    nameAr: "رأس السنة الهجرية",
    icon: "🌙",
    dates: ["2026-06-16", "2027-06-06"],
    description: "Welcome the new Hijri year with heartfelt cards. A moment to reflect, renew intentions, and share blessings.",
  },
  {
    slug: "mawlid",
    nameEn: "Mawlid al-Nabi",
    nameAr: "المولد النبوي",
    icon: "☪️",
    dates: ["2026-09-04", "2027-08-24"],
    description: "Commemoration of the birth of Prophet Muhammad ﷺ. Share blessings and salawat.",
  },
  {
    slug: "laylatul-qadr",
    nameEn: "Laylatul Qadr",
    nameAr: "ليلة القدر",
    icon: "✨",
    dates: ["2026-03-14", "2027-03-03"],
    description: "The Night of Power in the last ten nights of Ramadan — better than a thousand months.",
  },
];

export interface UpcomingOccasion extends IslamicOccasion {
  nextDate: Date;
  daysAway: number;
}

/** Returns all occasions sorted by their next upcoming date, relative to `now`. */
export function getUpcomingOccasions(now: Date = new Date()): UpcomingOccasion[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return ISLAMIC_OCCASIONS
    .map((occ) => {
      const future = occ.dates
        .map((d) => new Date(d))
        .filter((d) => d >= today)
        .sort((a, b) => a.getTime() - b.getTime())[0];

      if (!future) return null;

      const daysAway = Math.round(
        (future.getTime() - today.getTime()) / 86_400_000
      );
      return { ...occ, nextDate: future, daysAway } as UpcomingOccasion;
    })
    .filter((o): o is UpcomingOccasion => o !== null)
    .sort((a, b) => a.daysAway - b.daysAway);
}

/** Returns the single next Islamic occasion from today. */
export function getNextOccasion(now: Date = new Date()): UpcomingOccasion | null {
  return getUpcomingOccasions(now)[0] ?? null;
}
