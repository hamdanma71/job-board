import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET — list comments on a post.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = await prisma.postComment.findMany({
    where: { postId: id },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: { author: { select: { name: true } } },
  });
  return NextResponse.json({ success: true, comments: comments.map((c) => ({ id: c.id, body: c.body, author: c.author?.name || "عضو", createdAt: c.createdAt })) });
}

// POST { body } — add a comment.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ success: false, error: "النص مطلوب" }, { status: 400 });
  const post = await prisma.post.findUnique({ where: { id }, select: { id: true } });
  if (!post) return NextResponse.json({ success: false, error: "غير موجود" }, { status: 404 });
  await prisma.postComment.create({ data: { postId: id, authorId: (session.user as any).id, body: body.trim().slice(0, 1000) } });
  const count = await prisma.postComment.count({ where: { postId: id } });
  return NextResponse.json({ success: true, count }, { status: 201 });
}
