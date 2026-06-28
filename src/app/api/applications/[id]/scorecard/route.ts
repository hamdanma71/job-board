import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const RECS = ["STRONG_YES", "YES", "NO", "STRONG_NO"];

async function ownerOf(id: string, userId: string) {
  const app = await prisma.application.findUnique({ where: { id }, include: { job: { include: { company: true } } } });
  return app && app.job.company.userId === userId ? app : null;
}

// POST { rating, recommendation, strengths?, weaknesses? } — add an interview scorecard.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "EMPLOYER") return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  const app = await ownerOf(id, (session.user as any).id);
  if (!app) return NextResponse.json({ success: false, error: "غير موجود" }, { status: 404 });

  const { rating, recommendation, strengths, weaknesses } = await req.json();
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5 || !RECS.includes(recommendation)) {
    return NextResponse.json({ success: false, error: "بيانات التقييم غير صالحة" }, { status: 400 });
  }
  await prisma.scorecard.create({
    data: { applicationId: id, reviewerId: (session.user as any).id, rating: r, recommendation, strengths: strengths || null, weaknesses: weaknesses || null },
  });
  return NextResponse.json({ success: true }, { status: 201 });
}
