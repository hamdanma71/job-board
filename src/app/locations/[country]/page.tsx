import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import countriesData from "@/data/countries.json";
import { getLocale, getDictionary } from "@/lib/i18n";

type Country = { id: string; name: string; flag: string; jobCount?: number };

// Featured countries get a themed accent border; all others fall back to primary.
const accentById: Record<string, string> = {
  sa: "#006C35",
  ae: "#FF0000",
  eg: "#CE1126",
  qa: "#8A1538",
};

function findCountry(id: string): Country | undefined {
  return (countriesData as Country[]).find((c) => c.id === id);
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country: id } = await params;
  const country = findCountry(id);
  if (!country) return { title: "الدولة غير موجودة | JobMatch" };
  return {
    title: `وظائف في ${country.name} | JobMatch`,
    description: `استكشف أحدث الفرص الوظيفية والرواتب وأهم الشركات الباحثة عن المواهب في ${country.name}.`,
  };
}

export default async function CountryHub({ params }: { params: Promise<{ country: string }> }) {
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  const { country: countryParam } = await params;
  const country = findCountry(countryParam);

  if (!country) {
    return (
      <main className="container text-center" style={{ padding: "5rem" }}>
        <h1>{t("countryHub.notFound")}</h1>
        <Link href="/locations" className="btn btn-outline mt-4">{t("countryHub.backToDirectory")}</Link>
      </main>
    );
  }

  const accent = accentById[country.id] || "var(--primary)";

  let latestJobs: any[] = [];
  let activeCount = 0;
  try {
    const where = { isActive: true, location: { contains: country.name } };
    [latestJobs, activeCount] = await Promise.all([
      prisma.job.findMany({ where, take: 4, orderBy: { createdAt: "desc" }, include: { company: true } }),
      prisma.job.count({ where }),
    ]);
  } catch (error) {
    console.error(error);
  }

  return (
    <main>
      {/* Country Hero */}
      <section style={{ backgroundColor: "var(--surface)", padding: "4rem 1.5rem", borderBottom: `4px solid ${accent}` }}>
        <div className="container flex-between">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "4rem" }}>{country.flag}</span>
              <h1 style={{ fontSize: "3rem", fontWeight: "bold" }}>{t("countryHub.jobsIn")} {country.name}</h1>
            </div>
            <p className="text-muted" style={{ fontSize: "1.2rem", maxWidth: "600px" }}>
              {t("countryHub.heroSubtitlePrefix")}{country.name}{t("countryHub.heroSubtitleSuffix")}
            </p>
          </div>
          <div className="card" style={{ padding: "2rem", textAlign: "center", minWidth: "250px" }}>
            <span style={{ display: "block", fontSize: "2.5rem", fontWeight: "bold", color: "var(--primary)" }}>{activeCount}</span>
            <span className="text-muted">{t("countryHub.activeJobsNow")}</span>
            <Link href={`/jobs?location=${encodeURIComponent(country.name)}`} className="btn btn-primary mt-4" style={{ width: "100%" }}>
              {t("countryHub.browseAllJobs")}
            </Link>
          </div>
        </div>
      </section>

      <div className="container" style={{ padding: "4rem 1.5rem", display: "grid", gridTemplateColumns: "2fr 1fr", gap: "3rem" }}>
        {/* Main Content */}
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>{t("countryHub.latestJobs")}</h2>

          {latestJobs.length === 0 ? (
            <div className="card text-center" style={{ padding: "3rem" }}>
              <p className="text-muted">{t("countryHub.noJobsPrefix")}{country.name}</p>
              <Link href="/jobs" className="btn btn-outline mt-4">{t("countryHub.browseAllJobs")}</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {latestJobs.map((job) => (
                <div key={job.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.25rem" }}>{job.title}</h3>
                    <p className="text-muted" style={{ fontSize: "0.9rem" }}>{job.company?.companyName} • {job.location}</p>
                  </div>
                  <Link href={`/jobs/${job.id}`} className="btn btn-outline">{t("countryHub.details")}</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar / Market Insights */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div className="card">
            <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1rem" }}>{t("countryHub.marketInsights")}</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
              <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem" }}>
                <span className="text-muted">{t("countryHub.activeJobs")}</span>
                <span style={{ fontWeight: "bold" }}>{activeCount}</span>
              </li>
              <li style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="text-muted">{t("countryHub.salaryComparison")}</span>
                <Link href="/salaries" style={{ fontWeight: "bold", color: "var(--primary)" }}>{t("countryHub.viewReport")}</Link>
              </li>
            </ul>
            <Link href="/salaries" className="btn btn-outline mt-4" style={{ width: "100%" }}>
              {t("countryHub.fullSalaryReport")}
            </Link>
          </div>

          <div className="card" style={{ backgroundColor: "var(--surface-hover)" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("countryHub.hiringPrefix")}{country.name}{t("countryHub.hiringSuffix")}</h3>
            <p className="text-muted" style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
              {t("countryHub.hiringDesc")}
            </p>
            <Link href="/register" className="btn btn-primary" style={{ width: "100%" }}>
              {t("countryHub.registerCompany")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
