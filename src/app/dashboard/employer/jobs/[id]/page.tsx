import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateMatchScore } from "@/lib/matching";
import { statusLabel, statusColor } from "@/lib/applicationStatus";
import CompareCandidatesButton from "@/components/CompareCandidatesButton";
import { getLocale, getDictionary } from "@/lib/i18n";

export default async function JobATSPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "EMPLOYER") {
    return <main className="container text-center" style={{ padding: "5rem" }}><h2>{t("atsPage.unauthorized")}</h2></main>;
  }

  const userId = (session.user as any).id;
  const company = await prisma.companyProfile.findUnique({ where: { userId } });

  if (!company) return <main className="container text-center" style={{ padding: "5rem" }}><h2>{t("atsPage.noCompany")}</h2></main>;

  const job = await prisma.job.findUnique({
    where: { id, companyId: company.id },
    include: {
      applications: {
        include: {
          candidate: {
            include: { candidateProfile: true }
          }
        }
      }
    }
  });

  if (!job) return <main className="container text-center" style={{ padding: "5rem" }}><h2>{t("atsPage.jobNotFound")}</h2></main>;

  // Calculate match scores and sort
  const applicationsWithScore = job.applications.map(app => {
    const profile = app.candidate.candidateProfile;
    const score = profile ? calculateMatchScore(
      { skills: profile.skills || "", experienceYears: profile.experienceYears || 0, specialization: profile.specialization },
      job
    ) : 0;
    return { ...app, score };
  });

  // Promoted applications (candidate paid to push up) first, then by match score.
  applicationsWithScore.sort((a, b) => (Number(b.promoted) - Number(a.promoted)) || (b.score - a.score));

  // Render status badge using the shared 7-stage map.
  const renderStatus = (status: string) => {
    const color = statusColor(status);
    return (
      <span style={{ padding: "0.25rem 0.75rem", backgroundColor: `${color}20`, color, borderRadius: "var(--radius-full)", fontSize: "0.85rem", fontWeight: "bold" }}>
        {t("appStatus." + status)}
      </span>
    );
  };

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      <header className="flex-between mb-8">
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>{t("atsPage.title")}</h1>
          <p className="text-muted">{t("atsPage.jobLabel")} {job.title} • {job.applications.length} {t("atsPage.applicantWord")}</p>
        </div>
        <Link href="/dashboard/employer" className="btn btn-outline">{t("atsPage.backToDash")}</Link>
      </header>

      {job.applications.length > 0 && (
        <div className="mb-8">
          <CompareCandidatesButton jobId={job.id} />
        </div>
      )}

      <div className="card">
        {applicationsWithScore.length === 0 ? (
          <p className="text-muted text-center" style={{ padding: "3rem" }}>{t("atsPage.noApplicants")}</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "start", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-light)" }}>
                  <th style={{ padding: "1rem" }}>{t("atsPage.colName")}</th>
                  <th style={{ padding: "1rem", textAlign: "center" }}>{t("atsPage.colMatch")}</th>
                  <th style={{ padding: "1rem" }}>{t("atsPage.colExpSpec")}</th>
                  <th style={{ padding: "1rem" }}>{t("atsPage.colStatus")}</th>
                  <th style={{ padding: "1rem", textAlign: "center" }}>{t("atsPage.colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {applicationsWithScore.map((app) => (
                  <tr key={app.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "1rem" }}>
                      <strong>{app.candidate.name}</strong>
                      {app.promoted && <span style={{ marginInlineStart: "0.4rem", fontSize: "0.68rem", padding: "0.1rem 0.45rem", background: "linear-gradient(135deg,var(--primary),var(--secondary))", color: "white", borderRadius: "var(--radius-full)" }}>{t("atsPage.promotedBadge")}</span>}
                      <br/>
                      <span className="text-muted" style={{ fontSize: "0.85rem" }}>{app.candidate.email}</span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <span style={{ 
                        display: "inline-block", 
                        padding: "0.4rem 0.8rem", 
                        backgroundColor: app.score > 75 ? "var(--secondary)20" : app.score > 40 ? "var(--accent)20" : "#ef444420", 
                        color: app.score > 75 ? "var(--secondary)" : app.score > 40 ? "var(--accent)" : "#ef4444", 
                        fontWeight: "bold", 
                        borderRadius: "var(--radius-md)" 
                      }}>
                        {app.score}%
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ fontSize: "0.9rem", display: "block" }}>{app.candidate.candidateProfile?.experienceYears || 0} {t("atsPage.yearsExp")}</span>
                      <span className="text-muted" style={{ fontSize: "0.85rem", display: "block" }}>{app.candidate.candidateProfile?.specialization || t("atsPage.unspecified")}</span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {renderStatus(app.status)}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <Link href={`/dashboard/employer/applications/${app.id}`} className="btn btn-outline" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}>
                        {t("atsPage.viewChangeStatus")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
