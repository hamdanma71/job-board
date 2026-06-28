import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const OUTCOMES = ["OFFER", "REJECTED", "NO_RESPONSE", "PENDING"];

// POST { position?, difficulty?, outcome?, questions?, experience, isAnonymous? }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: companyId } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "CANDIDATE") return NextResponse.json({ success: false, error: "متاح للباحثين عن عمل فقط" }, { status: 403 });

  const company = await prisma.companyProfile.findUnique({ where: { id: companyId }, select: { id: true } });
  if (!company) return NextResponse.json({ success: false, error: "الشركة غير موجودة" }, { status: 404 });

  const { position, difficulty, outcome, questions, experience, isAnonymous } = await req.json();
  if (!experience?.trim()) return NextResponse.json({ success: false, error: "وصف التجربة مطلوب" }, { status: 400 });
  const diff = Number(difficulty);

  await prisma.interviewReview.create({
    data: {
      companyId,
      authorId: (session.user as any).id,
      position: position || null,
      difficulty: Number.isInteger(diff) && diff >= 1 && diff <= 5 ? diff : null,
      outcome: OUTCOMES.includes(outcome) ? outcome : null,
      questions: questions || null,
      experience: experience.trim().slice(0, 4000),
      isAnonymous: Boolean(isAnonymous),
    },
  });
  return NextResponse.json({ success: true }, { status: 201 });
}
