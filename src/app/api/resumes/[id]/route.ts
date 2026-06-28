import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function ownResume(id: string, userId: string) {
  const r = await prisma.resume.findUnique({ where: { id } });
  return r && r.userId === userId ? r : null;
}

// PATCH { setPrimary: true } — make this the primary resume.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  const userId = (session.user as any).id;
  const r = await ownResume(id, userId);
  if (!r) return NextResponse.json({ success: false, error: "غير موجود" }, { status: 404 });

  await prisma.$transaction([
    prisma.resume.updateMany({ where: { userId }, data: { isPrimary: false } }),
    prisma.resume.update({ where: { id }, data: { isPrimary: true } }),
    // mirror primary resume into the profile so CV-search/applicants see it
    prisma.candidateProfile.updateMany({ where: { userId }, data: { resumeUrl: `/api/resumes/${id}/file` } }),
  ]);
  return NextResponse.json({ success: true });
}

// DELETE — remove a resume entry (file is left on disk; harmless).
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  const userId = (session.user as any).id;
  const r = await ownResume(id, userId);
  if (!r) return NextResponse.json({ success: false, error: "غير موجود" }, { status: 404 });
  await prisma.resume.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
