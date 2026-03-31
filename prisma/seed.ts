import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Seed Occasions
  const occasions = [
    {
      slug: "eid-ul-fitr",
      nameEn: "Eid ul-Fitr",
      nameAr: "عيد الفطر",
      category: "EID" as const,
      sortOrder: 1,
    },
    {
      slug: "eid-ul-adha",
      nameEn: "Eid ul-Adha",
      nameAr: "عيد الأضحى",
      category: "EID" as const,
      sortOrder: 2,
    },
    {
      slug: "ramadan",
      nameEn: "Ramadan Mubarak",
      nameAr: "رمضان مبارك",
      category: "RAMADAN" as const,
      sortOrder: 3,
    },
    {
      slug: "laylatul-qadr",
      nameEn: "Laylatul Qadr",
      nameAr: "ليلة القدر",
      category: "RAMADAN" as const,
      sortOrder: 4,
    },
    {
      slug: "nikah",
      nameEn: "Nikah (Wedding)",
      nameAr: "النكاح",
      category: "LIFE_EVENT" as const,
      sortOrder: 5,
    },
    {
      slug: "aqiqah",
      nameEn: "Aqiqah (Newborn)",
      nameAr: "العقيقة",
      category: "LIFE_EVENT" as const,
      sortOrder: 6,
    },
    {
      slug: "hajj",
      nameEn: "Hajj & Umrah",
      nameAr: "الحج والعمرة",
      category: "LIFE_EVENT" as const,
      sortOrder: 7,
    },
    {
      slug: "graduation",
      nameEn: "Graduation",
      nameAr: "التخرج",
      category: "LIFE_EVENT" as const,
      sortOrder: 8,
    },
    {
      slug: "jummah",
      nameEn: "Jummah Mubarak",
      nameAr: "جمعة مباركة",
      category: "WEEKLY" as const,
      sortOrder: 9,
    },
    {
      slug: "islamic-new-year",
      nameEn: "Islamic New Year",
      nameAr: "السنة الهجرية الجديدة",
      category: "GENERAL" as const,
      sortOrder: 10,
    },
    {
      slug: "mawlid",
      nameEn: "Mawlid al-Nabi",
      nameAr: "المولد النبوي",
      category: "GENERAL" as const,
      sortOrder: 11,
    },
    {
      slug: "general",
      nameEn: "General Blessings",
      nameAr: "أدعية عامة",
      category: "GENERAL" as const,
      sortOrder: 12,
    },
  ];

  for (const occasion of occasions) {
    await prisma.occasion.upsert({
      where: { slug: occasion.slug },
      update: {},
      create: occasion,
    });
  }

  console.log("Seeded occasions");

  // Seed Card Templates
  const eidFitr = await prisma.occasion.findUnique({
    where: { slug: "eid-ul-fitr" },
  });
  const eidAdha = await prisma.occasion.findUnique({
    where: { slug: "eid-ul-adha" },
  });
  const ramadan = await prisma.occasion.findUnique({
    where: { slug: "ramadan" },
  });
  const nikah = await prisma.occasion.findUnique({ where: { slug: "nikah" } });
  const jummah = await prisma.occasion.findUnique({
    where: { slug: "jummah" },
  });
  const aqiqah = await prisma.occasion.findUnique({
    where: { slug: "aqiqah" },
  });
  const hajj = await prisma.occasion.findUnique({ where: { slug: "hajj" } });
  const laylatul = await prisma.occasion.findUnique({ where: { slug: "laylatul-qadr" } });
  const mawlid = await prisma.occasion.findUnique({ where: { slug: "mawlid" } });
  const islamicNewYear = await prisma.occasion.findUnique({ where: { slug: "islamic-new-year" } });
  const graduation = await prisma.occasion.findUnique({ where: { slug: "graduation" } });
  const general = await prisma.occasion.findUnique({ where: { slug: "general" } });

  const templates = [
    // Eid ul-Fitr
    {
      slug: "eid-fitr-gold-geometric",
      titleEn: "Golden Eid ul-Fitr",
      titleAr: "\u0639\u064A\u062F \u0627\u0644\u0641\u0637\u0631 \u0627\u0644\u0645\u0628\u0627\u0631\u0643",
      occasionId: eidFitr!.id,
      animationFile: "/animations/eid-geometric.json",
      animationStyle: "pageflip",
      bgImageUrl: "/images/cards/eid-gold-geometric.svg",
      bgColor: "#2d1b0e",
      isPremium: false,
      sortOrder: 1,
    },
    {
      slug: "eid-fitr-crescent-moon",
      titleEn: "Eid al-Fitr Mubarak",
      titleAr: "عيد الهلال",
      occasionId: eidFitr!.id,
      animationFile: "/animations/eid-geometric.json",
      animationStyle: "pageflip",
      bgImageUrl: "/images/cards/eid-crescent.svg",
      bgColor: "#0f1f3d",
      isPremium: false,
      sortOrder: 2,
    },
    {
      slug: "eid-fitr-arabesque",
      titleEn: "Arabesque Eid Mubarak",
      titleAr: "عيد مبارك الأرابيسك",
      occasionId: eidFitr!.id,
      animationFile: "/animations/eid-geometric.json",
      animationStyle: "pageflip",
      bgImageUrl: "/images/cards/eid-arabesque.svg",
      bgColor: "#1a0a2e",
      isPremium: true,
      sortOrder: 3,
    },
    // Eid ul-Adha
    {
      slug: "eid-adha-sacrifice",
      titleEn: "Eid ul-Adha Blessings",
      titleAr: "عيد الأضحى المبارك",
      occasionId: eidAdha!.id,
      animationFile: "/animations/eid-geometric.json",
      bgImageUrl: "/images/cards/eid-adha.svg",
      bgColor: "#1a2e0a",
      isPremium: false,
      sortOrder: 1,
    },
    {
      slug: "eid-adha-kaaba",
      titleEn: "Sacred Journey Eid",
      titleAr: "رحلة مباركة",
      occasionId: eidAdha!.id,
      animationFile: "/animations/hajj-kaaba.json",
      bgImageUrl: "/images/cards/eid-adha-kaaba.svg",
      bgColor: "#0d1a0d",
      isPremium: true,
      sortOrder: 2,
    },
    {
      slug: "eid-adha-premium-floral",
      titleEn: "Premium Floral Eid",
      titleAr: "عيد الأضحى المزخرف",
      occasionId: eidAdha!.id,
      animationFile: "/animations/eid-geometric.json",
      animationStyle: 'book',
      bgImageUrl: "/images/cards/eid-adha-premium-floral.svg",
      bgColor: "#061a10",
      isPremium: true,
      sortOrder: 3,
    },
    // Ramadan
    {
      slug: "ramadan-mubarak-lantern",
      titleEn: "Ramadan Lantern",
      titleAr: "فانوس رمضان",
      occasionId: ramadan!.id,
      animationFile: "/animations/ramadan-crescent.json",
      bgImageUrl: "/images/cards/ramadan-lantern.svg",
      bgColor: "#1a0a0a",
      isPremium: false,
      sortOrder: 1,
    },
    {
      slug: "ramadan-mubarak-mosque",
      titleEn: "Mosque at Night",
      titleAr: "المسجد في الليل",
      occasionId: ramadan!.id,
      animationFile: "/animations/ramadan-crescent.json",
      bgImageUrl: "/images/cards/ramadan-mosque.svg",
      bgColor: "#0a0a1a",
      isPremium: false,
      sortOrder: 2,
    },
    {
      slug: "ramadan-kareem-pattern",
      titleEn: "Ramadan Kareem",
      titleAr: "رمضان كريم",
      occasionId: ramadan!.id,
      animationFile: "/animations/ramadan-crescent.json",
      bgImageUrl: "/images/cards/ramadan-pattern.svg",
      bgColor: "#1a1a0a",
      isPremium: true,
      sortOrder: 3,
    },
    // Nikah
    {
      slug: "nikah-floral-gold",
      titleEn: "Nikah Mubarak Gold",
      titleAr: "مبارك النكاح الذهبي",
      occasionId: nikah!.id,
      animationFile: "/animations/nikah-arabesque.json",
      bgImageUrl: "/images/cards/nikah-gold.svg",
      bgColor: "#2d1b0e",
      isPremium: false,
      sortOrder: 1,
    },
    {
      slug: "nikah-arabesque-white",
      titleEn: "Nikah Blessings",
      titleAr: "بركات النكاح",
      occasionId: nikah!.id,
      animationFile: "/animations/nikah-arabesque.json",
      bgImageUrl: "/images/cards/nikah-white.svg",
      bgColor: "#f5f0e8",
      isPremium: true,
      sortOrder: 2,
    },
    // Jummah
    {
      slug: "jummah-mubarak-mosque",
      titleEn: "Jummah Mubarak",
      titleAr: "جمعة مباركة",
      occasionId: jummah!.id,
      animationFile: "/animations/jummah-mosque.json",
      bgImageUrl: "/images/cards/jummah-mosque.svg",
      bgColor: "#0a1a0a",
      isPremium: false,
      sortOrder: 1,
    },
    {
      slug: "jummah-green-geometric",
      titleEn: "Blessed Friday",
      titleAr: "يوم الجمعة المبارك",
      occasionId: jummah!.id,
      animationFile: "/animations/jummah-mosque.json",
      bgImageUrl: "/images/cards/jummah-green.svg",
      bgColor: "#0d2b0d",
      isPremium: false,
      sortOrder: 2,
    },
    // Aqiqah
    {
      slug: "aqiqah-newborn-stars",
      titleEn: "Welcome Baby",
      titleAr: "مرحباً بالمولود",
      occasionId: aqiqah!.id,
      animationFile: "/animations/aqiqah-stars.json",
      bgImageUrl: "/images/cards/aqiqah-stars.svg",
      bgColor: "#1a0a2e",
      isPremium: false,
      sortOrder: 1,
    },
    // Hajj
    {
      slug: "hajj-mabrour",
      titleEn: "Hajj Mabrour",
      titleAr: "حج مبرور",
      occasionId: hajj!.id,
      animationFile: "/animations/hajj-kaaba.json",
      bgImageUrl: "/images/cards/hajj-kaaba.svg",
      bgColor: "#0d1a0d",
      isPremium: false,
      sortOrder: 1,
    },
    // General
    {
      slug: "general-dua-gold",
      titleEn: "Islamic Blessings",
      titleAr: "البركات الإسلامية",
      occasionId: general!.id,
      animationFile: "/animations/eid-geometric.json",
      bgImageUrl: "/images/cards/general-dua.svg",
      bgColor: "#1a1a0a",
      isPremium: false,
      sortOrder: 1,
    },
    // Laylatul Qadr — theme: laylatul-qadr (#0d0a1a deep indigo)
    {
      slug: "laylatul-qadr-night-power",
      titleEn: "Night of Power",
      titleAr: "ليلة القدر",
      occasionId: laylatul!.id,
      animationFile: "/animations/ramadan-crescent.json",
      bgImageUrl: "/images/cards/laylatul-qadr.svg",
      bgColor: "#0d0a1a",
      isPremium: false,
      sortOrder: 1,
    },
    {
      slug: "laylatul-qadr-thousand-months",
      titleEn: "Better Than a Thousand Months",
      titleAr: "خيرٌ من ألف شهر",
      occasionId: laylatul!.id,
      animationFile: "/animations/ramadan-crescent.json",
      bgImageUrl: "/images/cards/laylatul-qadr-2.svg",
      bgColor: "#1e1040",
      isPremium: true,
      sortOrder: 2,
    },
    // Mawlid — theme: mawlid (#071a0d forest deep)
    {
      slug: "mawlid-mercy-worlds",
      titleEn: "Mercy to All the Worlds",
      titleAr: "رحمةً للعالمين",
      occasionId: mawlid!.id,
      animationFile: "/animations/eid-geometric.json",
      bgImageUrl: "/images/cards/mawlid.svg",
      bgColor: "#071a0d",
      isPremium: false,
      sortOrder: 1,
    },
    {
      slug: "mawlid-nabi-mubarak",
      titleEn: "Mawlid Mubarak",
      titleAr: "مولد النبي مبارك",
      occasionId: mawlid!.id,
      animationFile: "/animations/eid-geometric.json",
      bgImageUrl: "/images/cards/mawlid-2.svg",
      bgColor: "#0f3320",
      isPremium: true,
      sortOrder: 2,
    },
    // Islamic New Year — theme: islamic-new-year (#051318 midnight teal)
    {
      slug: "islamic-new-year-hijri",
      titleEn: "Happy New Hijri Year",
      titleAr: "عام هجري سعيد",
      occasionId: islamicNewYear!.id,
      animationFile: "/animations/eid-geometric.json",
      bgImageUrl: "/images/cards/islamic-new-year.svg",
      bgColor: "#051318",
      isPremium: false,
      sortOrder: 1,
    },
    // Graduation — theme: graduation (#070d24 deep navy)
    {
      slug: "graduation-ilm-blessing",
      titleEn: "Mabrook on Your Graduation",
      titleAr: "مبروك تخرجك",
      occasionId: graduation!.id,
      animationFile: "/animations/eid-geometric.json",
      bgImageUrl: "/images/cards/graduation.svg",
      bgColor: "#070d24",
      isPremium: false,
      sortOrder: 1,
    },
    {
      slug: "graduation-seek-knowledge",
      titleEn: "Seek Knowledge",
      titleAr: "اطلب العلم",
      occasionId: graduation!.id,
      animationFile: "/animations/eid-geometric.json",
      bgImageUrl: "/images/cards/graduation-2.svg",
      bgColor: "#0f1a40",
      isPremium: true,
      sortOrder: 2,
    },
    // Aqiqah second variant — theme: aqiqah-soft (#150a24 deep plum)
    {
      slug: "aqiqah-soft-lavender",
      titleEn: "Blessed New Arrival",
      titleAr: "مبارك المولود",
      occasionId: (await prisma.occasion.findUnique({ where: { slug: "aqiqah" } }))!.id,
      animationFile: "/animations/aqiqah-stars.json",
      bgImageUrl: "/images/cards/aqiqah-lavender.svg",
      bgColor: "#150a24",
      isPremium: true,
      sortOrder: 2,
    },
  ];

  for (const template of templates) {
    const configuredTemplate = { ...template, animationStyle: "pageflip" as const };
    await prisma.cardTemplate.upsert({
      where: { slug: configuredTemplate.slug },
      update: {
        bgImageUrl: configuredTemplate.bgImageUrl,
        animationStyle: configuredTemplate.animationStyle,
      },
      create: configuredTemplate,
    });
  }

  console.log("Seeded card templates");

  // Seed 5 demo cards — one per animation style
  const animationCards = [
    {
      slug:           'eid-portal-demo',
      titleEn:        'Crescent Moon Eid',
      titleAr:        'عِيدٌ مُبَارَك',
      occasionSlug:   'eid-ul-fitr',
      animationStyle: 'pageflip',
      bgColor:        '#050210',
      animationFile:  '',
      bgImageUrl:     '/images/cards/eid-crescent-moon-front-photo.png',
      isPremium:      false,
      sortOrder:      1,
    },
    {
      slug:           'ramadan-lantern-demo',
      titleEn:        'Ramadan Kareem — may this blessed month bring you peace and light',
      titleAr:        'رَمَضَان كَرِيم',
      occasionSlug:   'ramadan',
      animationStyle: 'lantern',
      bgColor:        '#140820',
      animationFile:  '',
      bgImageUrl:     '',
      isPremium:      false,
      sortOrder:      2,
    },
    {
      slug:           'hajj-doors-demo',
      titleEn:        'May Allah accept your pilgrimage and grant you Jannatul Firdaus',
      titleAr:        'حَجٌّ مَبْرُور',
      occasionSlug:   'hajj',
      animationStyle: 'doors',
      bgColor:        '#080808',
      animationFile:  '',
      bgImageUrl:     '',
      isPremium:      false,
      sortOrder:      3,
    },
    {
      slug:           'mawlid-portal-demo',
      titleEn:        'Blessings upon the Prophet ﷺ on this most blessed day',
      titleAr:        'مَوْلِدٌ مُبَارَك',
      occasionSlug:   'mawlid',
      animationStyle: 'portal',
      bgColor:        '#040e08',
      animationFile:  '',
      bgImageUrl:     '',
      isPremium:      false,
      sortOrder:      4,
    },
    {
      slug:           'jumuah-envelope-demo',
      titleEn:        'May your Friday be filled with blessings, peace and answered duaas',
      titleAr:        'جُمُعَةٌ مُبَارَكَة',
      occasionSlug:   'jummah',
      animationStyle: 'envelope',
      bgColor:        '#040c10',
      animationFile:  '',
      bgImageUrl:     '',
      isPremium:      false,
      sortOrder:      5,
    },
  ];

  for (const card of animationCards) {
    const occasion = await prisma.occasion.findUnique({ where: { slug: card.occasionSlug } });
    if (!occasion) { console.warn(`Occasion not found: ${card.occasionSlug}`); continue; }
    const configuredAnimationStyle = 'pageflip' as const;

    await prisma.cardTemplate.upsert({
      where:  { slug: card.slug },
      update: { animationStyle: configuredAnimationStyle, status: 'published', isActive: true },
      create: {
        slug:           card.slug,
        titleEn:        card.titleEn,
        titleAr:        card.titleAr,
        occasionId:     occasion.id,
        animationFile:  card.animationFile,
        bgImageUrl:     card.bgImageUrl,
        bgColor:        card.bgColor,
        isPremium:      card.isPremium,
        isActive:       true,
        status:         'published',
        sortOrder:      card.sortOrder,
        animationStyle: configuredAnimationStyle,
      },
    });
    console.log(`✓ Seeded card: ${card.slug}`);
  }

  console.log("Database seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
