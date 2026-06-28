import { NextRequest, NextResponse } from "next/server";
import { screenApplicant } from "@/lib/ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST { applicationId } — smart screening (qualified? spam?) for the owning employer.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "EMPLOYER") {
    return NextResponse.json({ success: false, error: "Unauthorized. Employers only." }, { status: 403 });
  }
  const { applicationId } = await req.json();
  if (!applicationId) return NextResponse.json({ success: false, error: "applicationId is required" }, { status: 400 });

  const userId = (session.user as any).id;
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: { include: { company: true } }, candidate: { include: { candidateProfile: true } } },
  });
  if (!application || application.job.company.userId !== userId) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const p = application.candidate.candidateProfile;
  const profileText = [
    `الاسم: ${application.candidate.name}`,
    p?.specialization ? `التخصص: ${p.specialization}` : "",
    p?.experienceYears != null ? `سنوات الخبرة: ${p.experienceYears}` : "",
    p?.skills ? `المهارات: ${p.skills}` : "",
    p?.bio ? `نبذة: ${p.bio}` : "",
  ].filter(Boolean).join("\n");
  const jobText = `${application.job.title}\n${application.job.description}`;

  const data = await screenApplicant(profileText || application.candidate.name, jobText);
  return NextResponse.json({ success: true, data });
}
