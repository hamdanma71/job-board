import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST { body } — internal team comment on an application (owning employer/admin).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "EMPLOYER") return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  const userId = (session.user as any).id;

  const app = await prisma.application.findUnique({ where: { id }, include: { job: { include: { company: true } } } });
  if (!app || app.job.company.userId !== userId) return NextResponse.json({ success: false, error: "غير موجود" }, { status: 404 });

  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ success: false, error: "النص مطلوب" }, { status: 400 });
  await prisma.candidateComment.create({ data: { applicationId: id, authorId: userId, body: body.trim().slice(0, 2000) } });
  return NextResponse.json({ success: true }, { status: 201 });
}
