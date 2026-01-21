import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  const body = await request.json();
  const comment = await storage.createComment({
    ...body,
    authorId: user.id,
  });
  
  return NextResponse.json(comment, { status: 201 });
}
