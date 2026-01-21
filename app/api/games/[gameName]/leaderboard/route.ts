import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: { gameName: string } }
) {
  const leaderboard = await storage.getLeaderboard(params.gameName);
  return NextResponse.json(leaderboard);
}
