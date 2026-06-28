import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST — toggle a like on a post.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  const userId = (session.user as any).id;

  const existing = await prisma.postReaction.findUnique({ where: { postId_userId: { postId: id, userId } } });
  if (existing) {
    await prisma.postReaction.delete({ where: { id: existing.id } });
  } else {
    const post = await prisma.post.findUnique({ where: { id }, select: { id: true } });
    if (!post) return NextResponse.json({ success: false, error: "غير موجود" }, { status: 404 });
    await prisma.postReaction.create({ data: { postId: id, userId } });
  }
  const count = await prisma.postReaction.count({ where: { postId: id } });
  return NextResponse.json({ success: true, liked: !existing, count });
}
