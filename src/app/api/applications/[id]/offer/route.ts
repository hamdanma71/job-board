import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST { salary?, startDate?, notes? } — employer extends an offer; moves status to OFFER + notifies.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "EMPLOYER") return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  const userId = (session.user as any).id;

  const app = await prisma.application.findUnique({ where: { id }, include: { job: { include: { company: true } } } });
  if (!app || app.job.company.userId !== userId) return NextResponse.json({ success: false, error: "غير موجود" }, { status: 404 });

  const { salary, startDate, notes } = await req.json();
  const start = startDate ? new Date(startDate) : null;
  await prisma.offer.upsert({
    where: { applicationId: id },
    update: { salary: salary || null, startDate: start && !isNaN(start.getTime()) ? start : null, notes: notes || null, status: "SENT" },
    create: { applicationId: id, salary: salary || null, startDate: start && !isNaN(start.getTime()) ? start : null, notes: notes || null },
  });
  await prisma.application.update({ where: { id }, data: { status: "OFFER" } });
  await prisma.notification.create({
    data: { userId: app.candidateId, title: "عرض وظيفي 🎉", message: `تلقّيت عرضًا وظيفيًّا لوظيفة "${app.job.title}" من "${app.job.company.companyName}"` },
  }).catch(() => {});
  return NextResponse.json({ success: true }, { status: 201 });
}
