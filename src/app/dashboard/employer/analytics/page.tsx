import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { statusLabel, statusColor, APPLICATION_STATUSES } from "@/lib/applicationStatus";
import { getLocale, getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata = { title: "تحليلات التوظيف | JobMatch" };

export default async function AnalyticsPage() {
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!session || (role !== "EMPLOYER" && role !== "ADMIN")) {
    return <main className="container text-center" style={{ padding: "5rem" }}><h2>{t("analytics.unauthorized")}</h2></main>;
  }
  const userId = (session.user as any).id;
  const company = await prisma.companyProfile.findUnique({ where: { userId } });

  let grouped: any[] = [];
  let hired: { appliedAt: Date; updatedAt: Date }[] = [];
  let jobsCount = 0;
  if (company) {
    const where = { job: { companyId: company.id } };
    [grouped, hired, jobsCount] = await Promise.all([
      prisma.application.groupBy({ by: ["status"], where, _count: { _all: true } }),
      prisma.application.findMany({ where: { ...where, status: "HIRED" }, select: { appliedAt: true, updatedAt: true } }),
      prisma.job.count({ where: { companyId: company.id } }),
    ]);
  }

  const countOf = (s: string) => grouped.find((g) => g.status === s)?._count._all ?? 0;
  const total = grouped.reduce((a, g) => a + g._count._all, 0);
  const hiredCount = countOf("HIRED");
  const conversion = total ? Math.round((hiredCount / total) * 100) : 0;
  const avgDays = hired.length
    ? Math.round(hired.reduce((a, h) => a + (new Date(h.updatedAt).getTime() - new Date(h.appliedAt).getTime()), 0) / hired.length / 86400000)
    : null;
  const maxCount = Math.max(1, ...APPLICATION_STATUSES.map((s) => countOf(s)));

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      <header className="flex-between mb-8">
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>{t("analytics.title")}</h1>
          <p className="text-muted">{t("analytics.subtitle")}</p>
        </div>
        <Link href="/dashboard/employer" className="btn btn-outline">{t("analytics.dashboard")}</Link>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[[t("analytics.jobs"), jobsCount], [t("analytics.totalApplicants"), total], [t("analytics.hired"), hiredCount], [t("analytics.conversion"), `${conversion}%`], [t("analytics.avgTime"), avgDays != null ? `${avgDays} ${t("analytics.dayWord")}` : "—"]].map(([label, val]) => (
          <div key={label as string} className="card text-center">
            <span style={{ fontSize: "2rem", fontWeight: "900", color: "var(--primary)" }}>{val}</span>
            <p className="text-muted" style={{ fontSize: "0.85rem", marginTop: "0.4rem" }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1.5rem" }}>{t("analytics.funnel")}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {APPLICATION_STATUSES.map((s) => {
            const c = countOf(s);
            return (
              <div key={s}>
                <div className="flex-between" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                  <span>{t("appStatus." + s)}</span><span style={{ fontWeight: "bold" }}>{c}</span>
                </div>
                <div style={{ height: "12px", background: "var(--surface-hover)", borderRadius: "var(--radius-full)" }}>
                  <div style={{ height: "100%", width: `${(c / maxCount) * 100}%`, minWidth: c > 0 ? "6px" : "0", background: statusColor(s), borderRadius: "var(--radius-full)" }}></div>
                </div>
              </div>
            );
          })}
        </div>
        {total === 0 && <p className="text-muted text-center" style={{ marginTop: "1rem", fontSize: "0.85rem" }}>{t("analytics.noApplications")}</p>}
      </div>
    </main>
  );
}
