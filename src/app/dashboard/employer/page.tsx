import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { jobTypeLabel } from "@/lib/jobType";
import { getLocale, getDictionary } from "@/lib/i18n";

export default async function EmployerDashboard() {
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!session || (role !== "EMPLOYER" && role !== "ADMIN")) {
    return (
      <main className="container text-center" style={{ padding: "5rem" }}>
        <h2>{t("empDash.unauthorized")}</h2>
      </main>
    );
  }

  const userId = (session.user as any).id;
  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  
  let jobs: any[] = [];
  if (company) {
    try {
      jobs = await prisma.job.findMany({
        where: { companyId: company.id },
        include: {
          applications: true
        },
        orderBy: { createdAt: "desc" },
        take: 5
      });
    } catch (error) {
      console.log("Database connection failed, showing empty state");
    }
  }

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      <header className="flex-between mb-8">
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>{t("empDash.title")}</h1>
          <p className="text-muted">{company ? company.companyName : t("empDash.noCompanyYet")}</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          {company?.subscriptionTier === "PRO" ? (
            <Link href="/dashboard/employer/post-job" className="btn btn-primary">
              {t("empDash.postNewJob")}
            </Link>
          ) : (
            <Link href="/pricing" className="btn btn-primary" style={{ background: "linear-gradient(135deg, var(--accent), #e11d48)", border: "none" }}>
              {t("empDash.upgradeToPost")}
            </Link>
          )}
          <Link href="/dashboard/employer/candidates" className="btn btn-outline">{t("empDash.searchCandidates")}</Link>
          <Link href="/dashboard/employer/analytics" className="btn btn-outline">{t("empDash.analytics")}</Link>
          <Link href="/" className="btn btn-outline">{t("empDash.home")}</Link>
        </div>
      </header>

      <div className="grid-2">
        {/* Quick Stats */}
        <div className="card">
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>{t("empDash.jobsOverview")}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ padding: "1.5rem", backgroundColor: "var(--surface-hover)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
              <span style={{ display: "block", fontSize: "2rem", fontWeight: "bold", color: "var(--primary)" }}>{jobs.length}</span>
              <span className="text-muted" style={{ fontSize: "0.9rem" }}>{t("empDash.activeJobs")}</span>
            </div>
            <div style={{ padding: "1.5rem", backgroundColor: "var(--surface-hover)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
              <span style={{ display: "block", fontSize: "2rem", fontWeight: "bold", color: "var(--secondary)" }}>
                {jobs.reduce((acc, job) => acc + job.applications.length, 0)}
              </span>
              <span className="text-muted" style={{ fontSize: "0.9rem" }}>{t("empDash.totalApplicants")}</span>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="card">
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>{t("empDash.subStatus")}</h2>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "1.5rem", backgroundColor: "var(--surface-hover)", borderRadius: "var(--radius-md)" }}>
            <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: company?.subscriptionTier === "PRO" ? "var(--primary)" : "var(--text-light)" }}>
              {company?.subscriptionTier === "PRO" ? t("empDash.tierPro") : t("empDash.tierFree")}
            </span>
            <p className="text-muted" style={{ marginTop: "0.5rem", fontSize: "0.9rem", textAlign: "center" }}>
              {company?.subscriptionTier === "PRO"
                ? t("empDash.proDesc")
                : t("empDash.freeDesc")}
            </p>
            <Link href="/pricing" className="btn btn-primary" style={{ marginTop: "1rem" }}>
              {t("empDash.manageSub")}
            </Link>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="card">
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>{t("empDash.latestJobs")}</h2>
          <ul style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {jobs.length === 0 ? (
              <p className="text-muted text-center">{t("empDash.noJobs")}</p>
            ) : (
              jobs.map((job) => (
                <li key={job.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)" }}>
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: "bold" }}>{job.title}</h3>
                    <span className="text-muted" style={{ fontSize: "0.85rem" }}>{job.location} • {t("jobType." + job.type)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontWeight: "bold", color: "var(--primary)" }}>{job.applications.length} {t("empDash.applicantWord")}</span>
                    <Link href={`/dashboard/employer/jobs/${job.id}`} className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>{t("empDash.manage")}</Link>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}
