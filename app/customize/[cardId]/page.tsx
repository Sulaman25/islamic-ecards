import { Navbar } from "@/components/layout/Navbar";
import { CustomiseStudio } from "@/components/customise/CustomiseStudio";
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { getVersesForOccasion } from "@/lib/verses/quran-data";

interface Props {
  params: Promise<{ cardId: string }>;
}

export default async function CustomisePage({ params }: Props) {
  const { cardId } = await params;

  const template = await prisma.cardTemplate.findUnique({
    where: { id: cardId },
    include: { occasion: true },
  });

  if (!template) notFound();

  const verses = getVersesForOccasion(template.occasion.slug);

  return (
    <div className="min-h-screen flex flex-col bg-stone-100">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-stone-800 mb-1">
            Personalise Your Card
          </h1>
          <p className="text-stone-500 mb-6">
            {template.titleEn} — {template.occasion.nameEn}
          </p>
          <CustomiseStudio template={template} verses={verses} />
        </div>
      </main>
    </div>
  );
}
