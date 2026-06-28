import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST { scheduledAt, mode, location?, note? } — schedule/reschedule an interview
// for an application (owning employer only). Moves status to INTERVIEW + notifies.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "EMPLOYER") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }
  const userId = (session.user as any).id;

  const application = await prisma.application.findUnique({
    where: { id },
    include: { job: { include: { company: true } } },
  });
  if (!application || application.job.company.userId !== userId) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const { scheduledAt, mode, location, note } = await req.json();
  const when = new Date(scheduledAt);
  if (!scheduledAt || isNaN(when.getTime())) {
    return NextResponse.json({ success: false, error: "موعد غير صالح" }, { status: 400 });
  }
  const validMode = ["ONLINE", "ONSITE", "PHONE"].includes(mode) ? mode : "ONLINE";

  await prisma.interview.upsert({
    where: { applicationId: id },
    update: { scheduledAt: when, mode: validMode, location: location || null, note: note || null },
    create: { applicationId: id, scheduledAt: when, mode: validMode, location: location || null, note: note || null },
  });

  // Move the pipeline forward + notify the candidate.
  await prisma.application.update({ where: { id }, data: { status: "INTERVIEW" } });
  const modeLabel = validMode === "ONLINE" ? "عن بُعد" : validMode === "ONSITE" ? "في المقر" : "هاتفية";
  await prisma.notification.create({
    data: {
      userId: application.candidateId,
      title: "تمت دعوتك لمقابلة",
      message: `مقابلة (${modeLabel}) لوظيفة "${application.job.title}" بتاريخ ${when.toLocaleString("ar")}${location ? ` — ${location}` : ""}`,
    },
  });

  return NextResponse.json({ success: true });
}
