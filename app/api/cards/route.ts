import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const occasion = searchParams.get("occasion");
  const premiumOnly = searchParams.get("premium") === "true";

  const templates = await prisma.cardTemplate.findMany({
    where: {
      isActive: true,
      ...(occasion ? { occasion: { slug: occasion } } : {}),
      ...(premiumOnly ? { isPremium: true } : {}),
    },
    include: { occasion: true },
    orderBy: [{ isPremium: "asc" }, { sortOrder: "asc" }],
  });

  return NextResponse.json(templates);
}
