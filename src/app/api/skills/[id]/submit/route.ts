import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST { answers: number[] } — score the test and store the result.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "يجب تسجيل الدخول" }, { status: 401 });

  const test = await prisma.skillTest.findUnique({ where: { id } });
  if (!test) return NextResponse.json({ success: false, error: "الاختبار غير موجود" }, { status: 404 });

  const { answers } = await req.json();
  let questions: { answer: number }[] = [];
  try { questions = JSON.parse(test.questions); } catch { /* ignore */ }
  if (!Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ success: false, error: "الاختبار غير صالح" }, { status: 400 });
  }
  if (!Array.isArray(answers) || answers.length !== questions.length) {
    return NextResponse.json({ success: false, error: "إجابات غير مكتملة" }, { status: 400 });
  }

  const correct = questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= 60;

  await prisma.skillTestResult.create({
    data: { userId: (session.user as any).id, testId: id, score, passed },
  });

  return NextResponse.json({ success: true, data: { score, passed, correct, total: questions.length } });
}
