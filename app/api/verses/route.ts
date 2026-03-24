import {
  getVersesForOccasion,
  QURAN_VERSES,
  searchVerses,
} from "@/lib/verses/quran-data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const occasion = searchParams.get("occasion");
  const query = searchParams.get("q");

  if (query) {
    return NextResponse.json(searchVerses(query));
  }

  if (occasion) {
    return NextResponse.json(getVersesForOccasion(occasion));
  }

  return NextResponse.json(QURAN_VERSES);
}
