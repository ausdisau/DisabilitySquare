import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");
  
  const posts = await storage.listPosts(groupId ? Number(groupId) : undefined);
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  const body = await request.json();
  const post = await storage.createPost({
    ...body,
    authorId: user.id,
  });
  
  return NextResponse.json(post, { status: 201 });
}
