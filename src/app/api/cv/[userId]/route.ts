import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";

const CV_DIR = path.join(process.cwd(), "private_uploads", "cvs");

// GET /api/cv/[userId] — stream a candidate's stored CV (access-controlled).
export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  // Defense-in-depth: the id is interpolated into a filesystem path; reject anything
  // that isn't a plain id so a future authz change can't enable path traversal.
  if (!/^[a-z0-9-]+$/i.test(userId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const viewerId = (session.user as any).id;
  const viewerRole = (session.user as any).role;

  // Allowed: the owner, an admin, an employer who received this candidate's
  // application, OR a PRO employer viewing a searchable candidate (CV search).
  let allowed = viewerId === userId || viewerRole === "ADMIN";
  if (!allowed && viewerRole === "EMPLOYER") {
    const app = await prisma.application.findFirst({
      where: { candidateId: userId, job: { company: { userId: viewerId } } },
      select: { id: true },
    });
    allowed = Boolean(app);
    if (!allowed) {
      const [company, profile] = await Promise.all([
        prisma.companyProfile.findUnique({ where: { userId: viewerId }, select: { subscriptionTier: true, subscriptionEndsAt: true } }),
        prisma.candidateProfile.findUnique({ where: { userId }, select: { isSearchable: true } }),
      ]);
      const pro = company?.subscriptionTier === "PRO" && (!company.subscriptionEndsAt || new Date(company.subscriptionEndsAt) > new Date());
      allowed = Boolean(pro && profile?.isSearchable);
    }
  }
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const file = await readFile(path.join(CV_DIR, `${userId}.pdf`));
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="cv-${userId}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "السيرة الذاتية غير موجودة" }, { status: 404 });
  }
}
