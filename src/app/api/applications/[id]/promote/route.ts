import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST — candidate toggles "Application Promotion" on their own application.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "CANDIDATE") {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }
  const candidateId = (session.user as any).id;

  const application = await prisma.application.findUnique({ where: { id }, select: { id: true, candidateId: true, promoted: true } });
  if (!application || application.candidateId !== candidateId) {
    return NextResponse.json({ success: false, error: "غير موجود" }, { status: 404 });
  }

  const updated = await prisma.application.update({ where: { id }, data: { promoted: !application.promoted } });
  return NextResponse.json({ success: true, promoted: updated.promoted });
}
