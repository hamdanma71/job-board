import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PATCH { action: "accept" | "decline" } — candidate responds to an offer.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "CANDIDATE") return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  const candidateId = (session.user as any).id;

  const offer = await prisma.offer.findUnique({
    where: { id },
    include: { application: { include: { job: { include: { company: true } } } } },
  });
  if (!offer || offer.application.candidateId !== candidateId) return NextResponse.json({ success: false, error: "غير موجود" }, { status: 404 });

  const { action } = await req.json();
  if (action !== "accept" && action !== "decline") return NextResponse.json({ success: false, error: "إجراء غير صالح" }, { status: 400 });

  const accepted = action === "accept";
  await prisma.offer.update({ where: { id }, data: { status: accepted ? "ACCEPTED" : "DECLINED" } });
  await prisma.application.update({ where: { id: offer.applicationId }, data: { status: accepted ? "HIRED" : "REJECTED" } });
  // Notify the employer.
  await prisma.notification.create({
    data: {
      userId: offer.application.job.company.userId,
      title: accepted ? "تم قبول العرض ✅" : "تم رفض العرض",
      message: `${accepted ? "قَبِل" : "رفض"} المرشّح العرض لوظيفة "${offer.application.job.title}"`,
    },
  }).catch(() => {});
  return NextResponse.json({ success: true, status: accepted ? "ACCEPTED" : "DECLINED" });
}
