import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";

// POST { candidateId, jobId?, message? } — employer invites a candidate to apply.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "EMPLOYER") return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  const employerId = (session.user as any).id;

  const company = await prisma.companyProfile.findUnique({ where: { userId: employerId } });
  if (!company || !hasActiveSubscription(company)) {
    return NextResponse.json({ success: false, error: "الدعوة متاحة لباقة المحترفين (PRO)" }, { status: 402 });
  }

  const { candidateId, jobId, message } = await req.json();
  if (!candidateId) return NextResponse.json({ success: false, error: "candidateId مطلوب" }, { status: 400 });

  const cand = await prisma.user.findUnique({ where: { id: candidateId }, select: { id: true } });
  if (!cand) return NextResponse.json({ success: false, error: "المرشّح غير موجود" }, { status: 404 });

  // If a job is specified, ensure it belongs to this employer.
  let safeJobId: string | null = null;
  if (jobId) {
    const job = await prisma.job.findFirst({ where: { id: jobId, companyId: company.id }, select: { id: true } });
    safeJobId = job?.id ?? null;
  }

  await prisma.invitation.create({
    data: { employerId, candidateId, jobId: safeJobId, message: message || null },
  });
  await prisma.notification.create({
    data: { userId: candidateId, title: "دعوة للتقديم 📨", message: `دعتك "${company.companyName}" للتقديم${message ? `: ${String(message).slice(0, 80)}` : ""}` },
  }).catch(() => {});

  return NextResponse.json({ success: true }, { status: 201 });
}
