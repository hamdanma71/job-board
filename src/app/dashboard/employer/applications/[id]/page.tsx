import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ApplicationStatusUpdater from "@/components/ApplicationStatusUpdater";
import AiApplicantTools from "@/components/AiApplicantTools";
import InterviewScheduler from "@/components/InterviewScheduler";
import AtsCollaboration from "@/components/AtsCollaboration";
import EndorseSkills from "@/components/EndorseSkills";
import { parseSkills } from "@/lib/skills";
import { getLocale, getDictionary } from "@/lib/i18n";

export default async function ApplicationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "EMPLOYER") {
    return <main className="container text-center" style={{ padding: "5rem" }}><h2>{t("appDetail.unauthorized")}</h2></main>;
  }

  const userId = (session.user as any).id;
  const company = await prisma.companyProfile.findUnique({ where: { userId } });

  if (!company) return <main className="container text-center" style={{ padding: "5rem" }}><h2>{t("appDetail.noCompany")}</h2></main>;

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      job: true,
      candidate: {
        include: { candidateProfile: true }
      },
      interview: true,
      scorecards: { include: { reviewer: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      comments: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      offer: true
    }
  });

  if (!application || application.job.companyId !== company.id) {
    return <main className="container text-center" style={{ padding: "5rem" }}><h2>{t("appDetail.notFound")}</h2></main>;
  }

  const myEndorsements = await prisma.endorsement.findMany({
    where: { endorserId: userId, candidateId: application.candidateId },
    select: { skill: true },
  });

  const profile = application.candidate.candidateProfile;

  return (
    <main className="container" style={{ padding: "3rem 1.5rem", maxWidth: "900px" }}>
      <header className="flex-between mb-8">
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>{t("appDetail.title")}</h1>
          <p className="text-muted">{t("appDetail.appliedFor")} {application.job.title}</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href={`/messages?to=${application.candidateId}`} className="btn btn-primary">{t("appDetail.messageCandidate")}</Link>
          <Link href={`/dashboard/employer/jobs/${application.jobId}`} className="btn btn-outline">{t("appDetail.backToList")}</Link>
        </div>
      </header>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: "1.25rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>{t("appDetail.basicInfo")}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>{t("appDetail.fullName")}</p>
              <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{application.candidate.name}</p>
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>{t("appDetail.email")}</p>
              <p>{application.candidate.email}</p>
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>{t("appDetail.cityCountry")}</p>
              <p>{profile?.location || t("appDetail.unspecified")}</p>
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>{t("appDetail.expYears")}</p>
              <p>{profile?.experienceYears || 0} {t("appDetail.yearsWord")}</p>
            </div>
            {profile?.resumeUrl && (
              <div>
                <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>{t("appDetail.resume")}</p>
                <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: "0.85rem", padding: "0.4rem 1rem" }}>
                  {t("appDetail.viewPdf")}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: "1.25rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>{t("appDetail.updateStatus")}</h2>
          <ApplicationStatusUpdater applicationId={application.id} currentStatus={application.status} />
        </div>
      </div>

      <div className="card mt-8">
        <h2 style={{ fontSize: "1.25rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>{t("appDetail.bioSkillsAi")}</h2>
        
        <div style={{ marginBottom: "1.5rem" }}>
          <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>{t("appDetail.bio")}</p>
          <p style={{ lineHeight: "1.6" }}>{profile?.bio || t("appDetail.noBio")}</p>
        </div>

        <div>
          <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>{t("appDetail.skillsClickEndorse")}</p>
          <EndorseSkills candidateId={application.candidateId} skills={parseSkills(profile?.skills)} initiallyEndorsed={myEndorsements.map((e) => e.skill)} />
        </div>
      </div>

      <AiApplicantTools applicationId={application.id} jobTitle={application.job.title} jobDescription={application.job.description} />

      <InterviewScheduler
        applicationId={application.id}
        existing={application.interview ? {
          scheduledAt: new Date(application.interview.scheduledAt).toISOString(),
          mode: application.interview.mode,
          location: application.interview.location,
          note: application.interview.note,
        } : null}
      />

      <AtsCollaboration
        applicationId={application.id}
        scorecards={application.scorecards.map((s: any) => ({ id: s.id, rating: s.rating, recommendation: s.recommendation, strengths: s.strengths, weaknesses: s.weaknesses, reviewer: s.reviewer }))}
        comments={application.comments.map((c: any) => ({ id: c.id, body: c.body, createdAt: new Date(c.createdAt).toISOString(), author: c.author }))}
        offer={application.offer ? { salary: application.offer.salary, status: application.offer.status, notes: application.offer.notes } : null}
      />
    </main>
  );
}
