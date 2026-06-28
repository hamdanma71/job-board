import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLocale, getDictionary } from "@/lib/i18n";
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "وظائف تنفيذية ومناصب قيادية | JobMatch",
  description: "فرص للمناصب العليا والمدراء التنفيذيين (C-Level) بسرّية واحترافية.",
};

export default async function ExecutiveJobsPage() {
  const dict = getDictionary(await getLocale()); const t = (k: string) => dict[k] ?? k;
  let executiveJobs: any[] = [];
  try {
    // For demonstration, we just fetch jobs that might be full-time. In a real app we'd have a level/seniority field.
    executiveJobs = await prisma.job.findMany({
      where: { type: "FULL_TIME" },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { company: true }
    });
  } catch (e) {
    console.error(e);
  }

  return (
    <main style={{ backgroundColor: "#0b1120", color: "#f8fafc", minHeight: "100vh" }}>
      {/* Hero Section */}
      <section style={{ 
        padding: "6rem 1.5rem", 
        textAlign: "center",
        backgroundImage: "radial-gradient(circle at 50% 0%, #1e293b 0%, #0b1120 70%)"
      }}>
        <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", padding: "0.5rem 1.5rem", border: "1px solid rgba(255,215,0,0.3)", backgroundColor: "rgba(255,215,0,0.05)", color: "#fbbf24", borderRadius: "var(--radius-full)", fontWeight: "bold", marginBottom: "1.5rem", letterSpacing: "1px" }}>
            C-LEVEL & EXECUTIVE ROLES
          </div>
          <h1 style={{ 
            fontSize: "3.5rem", 
            fontWeight: "900", 
            lineHeight: "1.2",
            marginBottom: "1.5rem",
            color: "white"
          }}>
            {t("execJobs.heroTitle")}
          </h1>
          <p style={{ fontSize: "1.2rem", color: "#94a3b8", marginBottom: "3rem", lineHeight: "1.6" }}>
            {t("execJobs.heroSubtitle")}
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem", backgroundColor: "#fbbf24", color: "#000", fontWeight: "bold", borderRadius: "4px", textDecoration: "none" }}>
              {t("execJobs.joinEliteBtn")}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="container" style={{ padding: "5rem 1.5rem" }}>
        <div className="flex-between mb-8">
          <div>
            <h2 style={{ fontSize: "2rem", fontWeight: "bold", color: "white" }}>{t("execJobs.latestRolesTitle")}</h2>
            <p style={{ color: "#64748b" }}>{t("execJobs.latestRolesSubtitle")}</p>
          </div>
        </div>

        {executiveJobs.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", backgroundColor: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}>
            <p style={{ color: "#94a3b8" }}>{t("execJobs.emptyState")}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {executiveJobs.map((job) => (
              <div key={job.id} className="lift-hover" style={{ backgroundColor: "#1e293b", border: "1px solid #334155", padding: "1.5rem", borderRadius: "8px", display: "flex", flexDirection: "column", transition: "transform 0.2s", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <span style={{ backgroundColor: "rgba(255,215,0,0.1)", color: "#fbbf24", padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold" }}>{t("execJobs.badgeExecutive")}</span>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                    {new Date(job.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "white", marginBottom: "0.5rem" }}>{job.title}</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginBottom: "1.5rem", flex: 1 }}>
                  {job.company?.companyName || t("execJobs.unknownCompany")} • {job.location}
                </p>
                <Link href={`/jobs/${job.id}`} style={{ width: "100%", textAlign: "center", padding: "0.75rem", border: "1px solid #475569", color: "white", borderRadius: "4px", textDecoration: "none", fontWeight: "bold" }}>
                  {t("execJobs.confidentialApplyBtn")}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trust Section */}
      <section style={{ backgroundColor: "#0f172a", padding: "5rem 1.5rem", borderTop: "1px solid #1e293b" }}>
        <div className="container text-center">
          <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "white", marginBottom: "1rem" }}>{t("execJobs.trustTitle")}</h2>
          <p style={{ color: "#94a3b8", maxWidth: "600px", margin: "0 auto 3rem auto", fontSize: "1.1rem" }}>
            {t("execJobs.trustSubtitle")}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
            <div style={{ padding: "2rem", backgroundColor: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔒</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "white", marginBottom: "0.5rem" }}>{t("execJobs.feature1Title")}</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{t("execJobs.feature1Desc")}</p>
            </div>
            <div style={{ padding: "2rem", backgroundColor: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🤝</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "white", marginBottom: "0.5rem" }}>{t("execJobs.feature2Title")}</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{t("execJobs.feature2Desc")}</p>
            </div>
            <div style={{ padding: "2rem", backgroundColor: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📈</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "white", marginBottom: "0.5rem" }}>{t("execJobs.feature3Title")}</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{t("execJobs.feature3Desc")}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
