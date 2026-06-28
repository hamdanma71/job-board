import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST { candidateId, skill } — toggle a skill endorsement for a candidate.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  const endorserId = (session.user as any).id;
  const { candidateId, skill } = await req.json();
  if (!candidateId || !skill?.trim()) return NextResponse.json({ success: false, error: "بيانات ناقصة" }, { status: 400 });
  if (candidateId === endorserId) return NextResponse.json({ success: false, error: "لا يمكنك تزكية نفسك" }, { status: 400 });

  const s = skill.trim();
  const existing = await prisma.endorsement.findUnique({ where: { endorserId_candidateId_skill: { endorserId, candidateId, skill: s } } });
  if (existing) {
    await prisma.endorsement.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true, endorsed: false });
  }
  await prisma.endorsement.create({ data: { endorserId, candidateId, skill: s } });
  return NextResponse.json({ success: true, endorsed: true });
}
