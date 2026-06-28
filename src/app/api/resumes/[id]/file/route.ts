import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";

const RESUME_DIR = path.join(process.cwd(), "private_uploads", "resumes");

// GET — stream a resume file (owner, admin, or a PRO employer for a searchable candidate).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9-]+$/i.test(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resume = await prisma.resume.findUnique({ where: { id }, select: { userId: true } });
  if (!resume) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  const viewerId = (session.user as any).id;
  const viewerRole = (session.user as any).role;
  let allowed = viewerId === resume.userId || viewerRole === "ADMIN";
  if (!allowed && viewerRole === "EMPLOYER") {
    const [company, profile] = await Promise.all([
      prisma.companyProfile.findUnique({ where: { userId: viewerId }, select: { subscriptionTier: true, subscriptionEndsAt: true } }),
      prisma.candidateProfile.findUnique({ where: { userId: resume.userId }, select: { isSearchable: true } }),
    ]);
    const pro = company?.subscriptionTier === "PRO" && (!company.subscriptionEndsAt || new Date(company.subscriptionEndsAt) > new Date());
    allowed = Boolean(pro && profile?.isSearchable);
  }
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const buf = await readFile(path.join(RESUME_DIR, resume.userId, `${id}.pdf`));
    return new NextResponse(new Uint8Array(buf), {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="resume-${id}.pdf"` },
    });
  } catch {
    return NextResponse.json({ error: "الملف غير موجود" }, { status: 404 });
  }
}
