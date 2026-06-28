import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PATCH { action: "accept" | "decline" } — candidate responds to an invitation.
// On accept with a job, auto-creates an application.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "CANDIDATE") return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  const candidateId = (session.user as any).id;

  const inv = await prisma.invitation.findUnique({ where: { id }, include: { employer: { include: { companyProfile: true } } } });
  if (!inv || inv.candidateId !== candidateId) return NextResponse.json({ success: false, error: "غير موجود" }, { status: 404 });

  const { action } = await req.json();
  if (action !== "accept" && action !== "decline") return NextResponse.json({ success: false, error: "إجراء غير صالح" }, { status: 400 });

  await prisma.invitation.update({ where: { id }, data: { status: action === "accept" ? "ACCEPTED" : "DECLINED" } });

  if (action === "accept" && inv.jobId) {
    // Auto-apply (ignore if already applied).
    await prisma.application.upsert({
      where: { jobId_candidateId: { jobId: inv.jobId, candidateId } },
      update: {},
      create: { jobId: inv.jobId, candidateId, status: "PENDING" },
    }).catch(() => {});
  }
  // Notify employer.
  await prisma.notification.create({
    data: { userId: inv.employerId, title: action === "accept" ? "تم قبول دعوتك ✅" : "تم رفض الدعوة", message: action === "accept" ? "قبِل المرشّح دعوتك للتقديم" : "اعتذر المرشّح عن الدعوة" },
  }).catch(() => {});

  return NextResponse.json({ success: true, status: action === "accept" ? "ACCEPTED" : "DECLINED" });
}
