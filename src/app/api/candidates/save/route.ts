import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST { candidateId, folder?, note? } — toggle saving a candidate to the employer's shortlist.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "EMPLOYER") {
    return NextResponse.json({ success: false, error: "Unauthorized. Employers only." }, { status: 403 });
  }
  const employerId = (session.user as any).id;
  const { candidateId, folder, note } = await req.json();
  if (!candidateId) return NextResponse.json({ success: false, error: "candidateId مطلوب" }, { status: 400 });

  const existing = await prisma.savedCandidate.findUnique({
    where: { employerId_candidateId: { employerId, candidateId } },
  });
  if (existing) {
    await prisma.savedCandidate.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true, saved: false });
  }

  // Confirm the candidate exists (clean error instead of FK 500).
  const cand = await prisma.user.findUnique({ where: { id: candidateId }, select: { id: true } });
  if (!cand) return NextResponse.json({ success: false, error: "المرشّح غير موجود" }, { status: 404 });

  await prisma.savedCandidate.create({
    data: { employerId, candidateId, folder: folder || "عام", note: note || null },
  });
  return NextResponse.json({ success: true, saved: true });
}
