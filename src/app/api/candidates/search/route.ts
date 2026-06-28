import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";

// GET /api/candidates/search — recruiter CV search. PRO employers only.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "EMPLOYER") {
    return NextResponse.json({ success: false, error: "Unauthorized. Employers only." }, { status: 403 });
  }
  const company = await prisma.companyProfile.findUnique({ where: { userId: (session.user as any).id } });
  if (!company || !hasActiveSubscription(company)) {
    return NextResponse.json({ success: false, error: "بحث المرشّحين متاح لباقة المحترفين (PRO) فقط" }, { status: 402 });
  }

  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim();
  const nationality = (sp.get("nationality") || "").trim();
  const location = (sp.get("location") || "").trim();
  const specialization = (sp.get("specialization") || "").trim();
  const minExp = parseInt(sp.get("minExp") || "");

  const where: any = { isSearchable: true };
  if (nationality) where.nationality = { contains: nationality };
  if (location) where.location = { contains: location };
  if (specialization) where.specialization = { contains: specialization };
  if (!isNaN(minExp)) where.experienceYears = { gte: minExp };
  if (q) {
    where.OR = [
      { skills: { contains: q } },
      { bio: { contains: q } },
      { specialization: { contains: q } },
    ];
  }

  // Fetch a bounded pool, then order by Rank Booster + freshness in JS (robust across DBs).
  const rows = await prisma.candidateProfile.findMany({
    where,
    take: 100,
    include: { user: { select: { name: true } } },
  });

  const now = Date.now();
  const ranked = rows
    .map((r) => ({
      userId: r.userId,
      name: r.user?.name || "مرشّح",
      specialization: r.specialization,
      experienceYears: r.experienceYears ?? 0,
      location: r.location,
      nationality: r.nationality,
      skills: r.skills,
      bio: r.bio,
      hasResume: Boolean(r.resumeUrl),
      boosted: r.rankBoostedUntil ? new Date(r.rankBoostedUntil).getTime() > now : false,
      freshness: r.lastRefreshedAt ? new Date(r.lastRefreshedAt).getTime() : new Date(r.updatedAt).getTime(),
    }))
    .sort((a, b) => (Number(b.boosted) - Number(a.boosted)) || (b.freshness - a.freshness))
    .slice(0, 30);

  return NextResponse.json({ success: true, candidates: ranked });
}
