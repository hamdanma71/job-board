import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET — recent feed posts
export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { author: { select: { name: true, role: true } } },
  });
  return NextResponse.json({ success: true, posts });
}

// POST — create a post
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "يجب تسجيل الدخول للنشر" }, { status: 401 });
  const { content } = await req.json();
  if (!content || !content.trim()) {
    return NextResponse.json({ success: false, error: "المحتوى مطلوب" }, { status: 400 });
  }
  const post = await prisma.post.create({
    data: { content: content.trim().slice(0, 2000), authorId: (session.user as any).id },
  });
  return NextResponse.json({ success: true, post }, { status: 201 });
}
