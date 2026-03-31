import CnyMicrosite from "./CnyMicrosite";

export default async function CnyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <main className="fixed inset-0 bg-[#ffa9a9] overflow-hidden flex items-center justify-center">
      <CnyMicrosite locale={locale} />
    </main>
  );
}
