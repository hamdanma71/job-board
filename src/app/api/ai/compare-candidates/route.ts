import { NextRequest, NextResponse } from "next/server";
import { compareCandidates } from "@/lib/ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST { jobId } — compare/rank all applicants of a job (owning employer only).
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "EMPLOYER") {
    return NextResponse.json({ success: false, error: "Unauthorized. Employers only." }, { status: 403 });
  }
  const { jobId } = await req.json();
  if (!jobId) return NextResponse.json({ success: false, error: "jobId is required" }, { status: 400 });

  const userId = (session.user as any).id;
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { company: true, applications: { include: { candidate: { include: { candidateProfile: true } } } } },
  });
  if (!job || job.company.userId !== userId) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const candidates = job.applications.map((a) => {
    const p = a.candidate.candidateProfile;
    return {
      name: a.candidate.name,
      profile: [p?.specialization, p?.experienceYears != null ? `${p.experienceYears} سنوات خبرة` : "", p?.skills].filter(Boolean).join(" · ") || "بلا ملف",
    };
  });
  if (candidates.length === 0) {
    return NextResponse.json({ success: false, error: "لا يوجد متقدّمون للمقارنة" }, { status: 400 });
  }

  const data = await compareCandidates(candidates, `${job.title}\n${job.description}`);
  return NextResponse.json({ success: true, data });
}
