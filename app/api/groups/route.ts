import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("search") || undefined;
  
  const groups = await storage.listGroups(category, search);
  return NextResponse.json(groups);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  const body = await request.json();
  const group = await storage.createGroup({
    ...body,
    createdById: user.id,
  });
  
  return NextResponse.json(group, { status: 201 });
}
