import { prisma } from "@/lib/prisma";
import { getLocale, getDictionary } from "@/lib/i18n";

export const metadata = {
  title: "استكشف الوظائف المتاحة | JobMatch",
  description: "آلاف الوظائف الشاغرة — ابحث وفلتر حسب الموقع والنوع والراتب وتاريخ النشر وتقدّم بسرعة.",
};
import ApplyButton from "@/components/ApplyButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateMatchScore } from "@/lib/matching";
import { jobTypeLabel } from "@/lib/jobType";

export default async function JobBoard({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; location?: string; type?: string; datePosted?: string; minSalary?: string; maxExp?: string }>
}) {
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  const sp = await searchParams;
  const search = sp?.search || "";
  const location = sp?.location || "";
  const type = sp?.type || "";
  const datePosted = sp?.datePosted || "";
  const minSalary = sp?.minSalary || "";
  const maxExp = sp?.maxExp || "";

  // Build the query
  const query: any = {
    where: { isActive: true },
    include: { company: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }], // sponsored jobs first
  };

  // SQLite `contains` is case-insensitive for ASCII; `mode` is unsupported there.
  // Search now spans title + description + company name (not title only).
  if (search) {
    query.where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { company: { is: { companyName: { contains: search } } } },
    ];
  }
  if (location) {
    query.where.location = { contains: location };
  }
  if (type) {
    query.where.type = type;
  }
  // Advanced facets: date posted, minimum salary, maximum required experience.
  const days = parseInt(datePosted);
  if (Number.isFinite(days) && days > 0) {
    query.where.createdAt = { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
  }
  const minSal = parseInt(minSalary);
  if (Number.isFinite(minSal) && minSal > 0) {
    query.where.salaryMax = { gte: minSal };
  }
  const maxExpYears = parseInt(maxExp);
  if (Number.isFinite(maxExpYears) && maxExpYears >= 0) {
    query.where.experienceMin = { lte: maxExpYears };
  }

  // Fetch from DB
  let jobs: any[] = [];
  try {
    jobs = await prisma.job.findMany(query);
  } catch (error) {
    console.log("Database connection failed, showing empty state");
  }

  // Fetch candidate profile to calculate match score
  const session = await getServerSession(authOptions);
  let candidateProfile = null;
  if (session && (session.user as any).role === "CANDIDATE") {
    candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId: (session.user as any).id }
    });
  }

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      <header className="mb-8">
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("jobsList.title")}</h1>
        <p className="text-muted">{t("jobsList.subtitle")}</p>
      </header>

      {/* Horizontal Advanced Filters Bar */}
      <div className="card" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
        <form method="GET" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="input-group" style={{ flex: "1 1 250px", margin: 0 }}>
            <label className="input-label">{t("jobsList.searchLabel")}</label>
            <input name="search" defaultValue={search} placeholder={t("jobsList.searchPlaceholder")} className="input-field" />
          </div>

          <div className="input-group" style={{ flex: "1 1 200px", margin: 0 }}>
            <label className="input-label">{t("jobsList.locationLabel")}</label>
            <select name="location" defaultValue={location} className="input-field">
              <option value="">{t("jobsList.locationAll")}</option>
              <option value="الرياض">{t("jobsList.locationRiyadh")}</option>
              <option value="جدة">{t("jobsList.locationJeddah")}</option>
              <option value="دبي">{t("jobsList.locationDubai")}</option>
              <option value="القاهرة">{t("jobsList.locationCairo")}</option>
              <option value="عن بعد">{t("jobsList.locationRemote")}</option>
            </select>
          </div>

          <div className="input-group" style={{ flex: "1 1 160px", margin: 0 }}>
            <label className="input-label">{t("jobsList.typeLabel")}</label>
            <select name="type" defaultValue={type} className="input-field">
              <option value="">{t("jobsList.typeAll")}</option>
              <option value="FULL_TIME">{t("jobsList.typeFullTime")}</option>
              <option value="PART_TIME">{t("jobsList.typePartTime")}</option>
              <option value="CONTRACT">{t("jobsList.typeContract")}</option>
              <option value="REMOTE">{t("jobsList.typeRemote")}</option>
              <option value="INTERNSHIP">{t("jobsList.typeInternship")}</option>
            </select>
          </div>

          <div className="input-group" style={{ flex: "1 1 150px", margin: 0 }}>
            <label className="input-label">{t("jobsList.dateLabel")}</label>
            <select name="datePosted" defaultValue={datePosted} className="input-field">
              <option value="">{t("jobsList.dateAny")}</option>
              <option value="1">{t("jobsList.dateLast24h")}</option>
              <option value="7">{t("jobsList.dateLast7d")}</option>
              <option value="30">{t("jobsList.dateLast30d")}</option>
            </select>
          </div>

          <div className="input-group" style={{ flex: "1 1 130px", margin: 0 }}>
            <label className="input-label">{t("jobsList.minSalaryLabel")}</label>
            <input name="minSalary" type="number" min="0" defaultValue={minSalary} placeholder={t("jobsList.minSalaryPlaceholder")} className="input-field" />
          </div>

          <div className="input-group" style={{ flex: "1 1 130px", margin: 0 }}>
            <label className="input-label">{t("jobsList.maxExpLabel")}</label>
            <input name="maxExp" type="number" min="0" defaultValue={maxExp} placeholder={t("jobsList.maxExpPlaceholder")} className="input-field" />
          </div>

          <button type="submit" className="btn btn-primary hover-scale" style={{ flex: "0 0 auto", height: "46px", padding: "0 2rem" }}>
            {t("jobsList.searchBtn")} 🔍
          </button>
        </form>
      </div>

      <div>
        {/* Jobs List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {jobs.length === 0 ? (
            <div className="card text-center" style={{ padding: "3rem" }}>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{t("jobsList.emptyTitle")}</h3>
              <p className="text-muted">{t("jobsList.emptyDesc")}</p>
            </div>
          ) : (
            jobs.map((job) => {
              // Calculate score if profile exists
              let score = null;
              if (candidateProfile) {
                score = calculateMatchScore({
                  skills: candidateProfile.skills || "",
                  experienceYears: candidateProfile.experienceYears || 0,
                  specialization: candidateProfile.specialization
                }, job);
              }

              return (
              <div key={job.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                  <div style={{ width: "64px", height: "64px", backgroundColor: "var(--surface-hover)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.25rem", color: "var(--primary)" }}>
                    {job.company.companyName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <a href={`/jobs/${job.id}`} style={{ color: "inherit" }}>{job.title}</a>
                      {job.featured && (
                        <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", background: "linear-gradient(135deg, var(--primary), var(--secondary))", color: "white", borderRadius: "var(--radius-full)" }}>
                          ⭐ {t("jobsList.featuredBadge")}
                        </span>
                      )}
                      {job.source !== "INTERNAL" && (
                        <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", backgroundColor: "var(--accent)20", color: "var(--accent)", borderRadius: "var(--radius-full)" }}>
                          {t("jobsList.sourceFrom")} {job.source}
                        </span>
                      )}
                      {score !== null && (
                        <span style={{ fontSize: "0.8rem", padding: "0.2rem 0.5rem", backgroundColor: score > 75 ? "var(--secondary)20" : score > 40 ? "var(--accent)20" : "#ef444420", color: score > 75 ? "var(--secondary)" : score > 40 ? "var(--accent)" : "#ef4444", borderRadius: "var(--radius-full)" }}>
                          {t("jobsList.matchScore")}: %{score}
                        </span>
                      )}
                    </h3>
                    <p className="text-muted" style={{ marginBottom: "0.5rem" }}>{job.company.companyName}</p>
                    <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "var(--text-light)" }}>
                      <span>📍 {job.location}</span>
                      {job.salary && <span>💰 {job.salary}</span>}
                      <span>💼 {t("jobType." + job.type)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  {job.externalUrl ? (
                    <a href={job.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ textDecoration: "none" }}>
                      {t("jobsList.applyExternal")} 🔗
                    </a>
                  ) : (
                    <ApplyButton jobId={job.id} />
                  )}
                </div>
              </div>
            )})
          )}

        </div>
      </div>
    </main>
  );
}
