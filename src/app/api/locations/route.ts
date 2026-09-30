import { NextRequest, NextResponse } from "next/server";
import { searchAirports } from "@/lib/airports/search";

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get("keyword") ?? "";
  const results = searchAirports(keyword);
  return NextResponse.json({ results });
}