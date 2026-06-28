import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLocale, getDictionary } from "@/lib/i18n";
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "وظائف العمل عن بُعد | JobMatch",
  description: "أحدث وظائف العمل عن بُعد والعمل المرن في الخليج والعالم — تقدّم من أي مكان.",
};

export default async function RemoteJobsPage() {
  const dict = getDictionary(await getLocale()); const t = (k: string) => dict[k] ?? k;
  let remoteJobs: any[] = [];
  try {
    remoteJobs = await prisma.job.findMany({
      where: { type: "REMOTE" },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { company: true }
    });
  } catch (e) {
    console.error(e);
  }

  return (
    <main>
      {/* Hero Section */}
      <section style={{ 
        backgroundColor: "var(--surface-hover)", 
        padding: "5rem 1.5rem", 
        textAlign: "center",
        borderBottom: "1px solid var(--border-light)"
      }}>
        <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", padding: "0.5rem 1rem", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--secondary)", borderRadius: "var(--radius-full)", fontWeight: "bold", marginBottom: "1.5rem" }}>
            🌍 {t("remoteJobs.heroBadge")}
          </div>
          <h1 style={{ 
            fontSize: "3rem", 
            fontWeight: "900", 
            lineHeight: "1.2",
            marginBottom: "1.5rem",
            color: "var(--text-main)"
          }}>
            {t("remoteJobs.heroTitle")}
          </h1>
          <p style={{ fontSize: "1.2rem", color: "var(--text-muted)", marginBottom: "2.5rem", lineHeight: "1.6" }}>
            {t("remoteJobs.heroSubtitle")}
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/jobs?search=&location=Remote" className="btn btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem" }}>
              {t("remoteJobs.browseAllBtn")}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="container" style={{ padding: "5rem 1.5rem" }}>
        <div className="flex-between mb-8">
          <div>
            <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>{t("remoteJobs.latestTitle")}</h2>
            <p className="text-muted">{t("remoteJobs.latestSubtitle")}</p>
          </div>
        </div>

        {remoteJobs.length === 0 ? (
          <div className="card text-center" style={{ padding: "3rem" }}>
            <p className="text-muted">{t("remoteJobs.emptyState")}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {remoteJobs.map((job) => (
              <div key={job.id} className="card hover-scale" style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <span className="badge badge-secondary">{t("remoteJobs.remoteBadge")}</span>
                  <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                    {new Date(job.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{job.title}</h3>
                <p className="text-muted" style={{ fontSize: "0.95rem", marginBottom: "1.5rem", flex: 1 }}>
                  {job.company?.companyName || t("remoteJobs.unknownCompany")}
                </p>
                <Link href={`/jobs/${job.id}`} className="btn btn-outline" style={{ width: "100%", textAlign: "center" }}>
                  {t("remoteJobs.detailsAndApply")}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Benefits Section */}
      <section style={{ backgroundColor: "var(--surface)", padding: "5rem 1.5rem", borderTop: "1px solid var(--border-light)" }}>
        <div className="container text-center">
          <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "3rem" }}>{t("remoteJobs.benefitsTitle")}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
            <div className="card" style={{ padding: "2rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("remoteJobs.benefit1Title")}</h3>
              <p className="text-muted">{t("remoteJobs.benefit1Desc")}</p>
            </div>
            <div className="card" style={{ padding: "2rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✈️</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("remoteJobs.benefit2Title")}</h3>
              <p className="text-muted">{t("remoteJobs.benefit2Desc")}</p>
            </div>
            <div className="card" style={{ padding: "2rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💰</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("remoteJobs.benefit3Title")}</h3>
              <p className="text-muted">{t("remoteJobs.benefit3Desc")}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
