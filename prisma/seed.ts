import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  const general = await prisma.occasion.findUnique({
    where: { slug: "general" },
  });

  const templates = [
    // Eid ul-Fitr
    {
      slug: "eid-fitr-gold-geometric",
      titleEn: "Golden Geometric Eid",
      titleAr: "عيد الفطر الذهبي",
      occasionId: eidFitr!.id,
      animationFile: "/animations/eid-geometric.json",
      bgImageUrl: "/images/cards/eid-gold-geometric.jpg",
      bgColor: "#2d1b0e",
      isPremium: false,
      sortOrder: 1,
    },
    {
      slug: "eid-fitr-crescent-moon",
      titleEn: "Crescent Moon Eid",
      titleAr: "عيد الهلال",
      occasionId: eidFitr!.id,
      animationFile: "/animations/eid-geometric.json",
      bgImageUrl: "/images/cards/eid-crescent.jpg",
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
      bgImageUrl: "/images/cards/eid-arabesque.jpg",
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
      bgImageUrl: "/images/cards/eid-adha.jpg",
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
      bgImageUrl: "/images/cards/eid-adha-kaaba.jpg",
      bgColor: "#0d1a0d",
      isPremium: true,
      sortOrder: 2,
    },
    // Ramadan
    {
      slug: "ramadan-mubarak-lantern",
      titleEn: "Ramadan Lantern",
      titleAr: "فانوس رمضان",
      occasionId: ramadan!.id,
      animationFile: "/animations/ramadan-crescent.json",
      bgImageUrl: "/images/cards/ramadan-lantern.jpg",
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
      bgImageUrl: "/images/cards/ramadan-mosque.jpg",
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
      bgImageUrl: "/images/cards/ramadan-pattern.jpg",
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
      bgImageUrl: "/images/cards/nikah-gold.jpg",
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
      bgImageUrl: "/images/cards/nikah-white.jpg",
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
      bgImageUrl: "/images/cards/jummah-mosque.jpg",
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
      bgImageUrl: "/images/cards/jummah-green.jpg",
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
      bgImageUrl: "/images/cards/aqiqah-stars.jpg",
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
      bgImageUrl: "/images/cards/hajj-kaaba.jpg",
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
      bgImageUrl: "/images/cards/general-dua.jpg",
      bgColor: "#1a1a0a",
      isPremium: false,
      sortOrder: 1,
    },
  ];

  for (const template of templates) {
    await prisma.cardTemplate.upsert({
      where: { slug: template.slug },
      update: {},
      create: template,
    });
  }

  console.log("Seeded card templates");
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
