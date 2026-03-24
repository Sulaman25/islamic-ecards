import { Navbar } from "@/components/layout/Navbar";
import { CardGrid } from "@/components/cards/CardGrid";
import { prisma } from "@/lib/db/prisma";

const CATEGORY_SLUGS: Record<string, string[]> = {
  eid: ["eid-ul-fitr", "eid-ul-adha"],
  ramadan: ["ramadan", "laylatul-qadr"],
  "life-events": ["nikah", "aqiqah", "hajj", "graduation"],
  weekly: ["jummah", "islamic-new-year", "mawlid"],
  general: ["general"],
};

interface Props {
  searchParams: Promise<{ occasion?: string }>;
}

export default async function CardsPage({ searchParams }: Props) {
  const { occasion } = await searchParams;

  const slugsToQuery = occasion && CATEGORY_SLUGS[occasion]
    ? CATEGORY_SLUGS[occasion]
    : undefined;

  const templates = await prisma.cardTemplate.findMany({
    where: {
      isActive: true,
      ...(slugsToQuery
        ? { occasion: { slug: { in: slugsToQuery } } }
        : {}),
    },
    include: { occasion: true },
    orderBy: [{ isPremium: "asc" }, { sortOrder: "asc" }],
  });

  const occasions = await prisma.occasion.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const filters = [
    { slug: "", label: "All Cards" },
    { slug: "eid", label: "Eid" },
    { slug: "ramadan", label: "Ramadan" },
    { slug: "life-events", label: "Life Events" },
    { slug: "weekly", label: "Weekly" },
    { slug: "general", label: "General" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">
          Islamic Greeting Cards
        </h1>
        <p className="text-stone-500 mb-8">
          {templates.length} cards available — choose one to personalise
        </p>

        {/* Occasion filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map((f) => (
            <a
              key={f.slug}
              href={f.slug ? `/cards?occasion=${f.slug}` : "/cards"}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                occasion === f.slug || (!occasion && f.slug === "")
                  ? "bg-amber-700 text-white border-amber-700"
                  : "bg-white text-stone-600 border-stone-200 hover:border-amber-400 hover:text-amber-700"
              }`}
            >
              {f.label}
            </a>
          ))}
        </div>

        <CardGrid templates={templates} />
      </main>
    </div>
  );
}
