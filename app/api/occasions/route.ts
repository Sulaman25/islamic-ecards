import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const occasions = await prisma.occasion.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { templates: { where: { isActive: true } } } },
    },
  });
  return NextResponse.json(occasions);
}
