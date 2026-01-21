import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  const body = await request.json();
  const score = await storage.createGameScore({
    ...body,
    userId: user.id,
  });
  
  return NextResponse.json(score, { status: 201 });
}
