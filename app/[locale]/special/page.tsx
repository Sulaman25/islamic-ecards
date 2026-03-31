import CinematicEidClient from "./CinematicEidClient";

export default async function CinematicPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <main className="bg-[#061a10] min-h-screen overflow-x-hidden">
      <CinematicEidClient locale={locale} />
    </main>
  );
}
