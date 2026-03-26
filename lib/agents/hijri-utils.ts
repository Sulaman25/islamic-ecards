// lib/agents/hijri-utils.ts
// Fourmilab calendar algorithm — converts a Gregorian Date to Hijri { year, month, day }

export interface HijriDate {
  year:  number;
  month: number;  // 1–12
  day:   number;  // 1–30
}

const GREGORIAN_EPOCH = 1721425.5;
const ISLAMIC_EPOCH   = 1948439.5;

function leapGregorian(year: number): boolean {
  return (year % 4 === 0) && !((year % 100 === 0) && (year % 400 !== 0));
}

function gregorianToJulianDay(d: Date): number {
  const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
  return (GREGORIAN_EPOCH - 1)
    + (365 * (y - 1))
    + Math.floor((y - 1) / 4)
    - Math.floor((y - 1) / 100)
    + Math.floor((y - 1) / 400)
    + Math.floor(
        ((367 * m) - 362) / 12
        + (m <= 2 ? 0 : leapGregorian(y) ? -1 : -2)
        + day
      );
}

function islamicToJulianDay(year: number, month: number, day: number): number {
  return day
    + Math.ceil(29.5 * (month - 1))
    + (year - 1) * 354
    + Math.floor((3 + 11 * year) / 30)
    + ISLAMIC_EPOCH - 1;
}

function julianDayToHijri(jd: number): HijriDate {
  jd = Math.floor(jd) - 0.5;
  const year  = Math.floor(((30 * (jd - ISLAMIC_EPOCH)) + 10646) / 10631);
  const month = Math.min(12,
    Math.ceil((jd - (29 + islamicToJulianDay(year, 1, 1))) / 29.5) + 1
  );
  const day = Math.round(jd - islamicToJulianDay(year, month, 1)) + 1;
  return { year, month, day };
}

export function toHijri(date: Date): HijriDate {
  const jd = gregorianToJulianDay(date);
  return julianDayToHijri(jd);
}

export interface UpcomingOccasion {
  name: string;
  daysUntil: number;
  gregorianDate: Date;
}

// Returns the next major Islamic occasion within maxDays, or null.
export function findUpcomingOccasion(maxDays = 14): UpcomingOccasion | null {
  const OCCASIONS: Array<{ name: string; month: number; day: number }> = [
    { name: 'Ramadan',          month: 9,  day: 1  },
    { name: 'Eid ul Fitr',      month: 10, day: 1  },
    { name: 'Eid ul Adha',      month: 12, day: 10 },
    { name: 'Laylatul Qadr',    month: 9,  day: 27 },
    { name: 'Islamic New Year', month: 1,  day: 1  },
    { name: 'Mawlid',           month: 3,  day: 12 },
  ];

  const now = new Date();
  for (let offset = 0; offset <= maxDays; offset++) {
    const d = new Date(now.getTime() + offset * 86_400_000);
    const { month, day } = toHijri(d);
    for (const occ of OCCASIONS) {
      if (occ.month === month && occ.day === day) {
        return { name: occ.name, daysUntil: offset, gregorianDate: d };
      }
    }
  }
  return null;
}

// Maps occasion name to the Occasion.slug used in the DB seed
export const OCCASION_NAME_TO_SLUG: Record<string, string> = {
  'Ramadan':          'ramadan',
  'Eid ul Fitr':      'eid-ul-fitr',
  'Eid ul Adha':      'eid-ul-adha',
  'Laylatul Qadr':    'laylatul-qadr',
  'Islamic New Year': 'islamic-new-year',
  'Mawlid':           'mawlid',
};
