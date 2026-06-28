import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCategory, CATEGORIES } from "@/lib/categories";
import { jobTypeLabel } from "@/lib/jobType";
import { getLocale, getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) return { title: "تصنيف غير موجود | JobMatch" };
  return {
    title: `وظائف ${cat.name} | JobMatch`,
    description: `أحدث الوظائف الشاغرة في مجال ${cat.name}. تصفّح الفرص وتقدّم الآن عبر JobMatch.`,
    alternates: { canonical: `/jobs/category/${slug}` },
  };
}

export default async function CategoryLanding({ params }: { params: Promise<{ slug: string }> }) {
  const dict = getDictionary(await getLocale()); const t = (k: string) => dict[k] ?? k;
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) {
    return (
      <main className="container text-center" style={{ padding: "5rem" }}>
        <h1>{t("jobCategory.notFound")}</h1>
        <Link href="/categories" className="btn btn-outline mt-4">{t("jobCategory.allCategories")}</Link>
      </main>
    );
  }

  // Match jobs whose title/description contains any of the category keywords.
  const where = {
    isActive: true,
    OR: cat.keywords.flatMap((k) => [{ title: { contains: k } }, { description: { contains: k } }]),
  };
  let jobs: any[] = [];
  let count = 0;
  try {
    [jobs, count] = await Promise.all([
      prisma.job.findMany({ where, include: { company: true }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: 30 }),
      prisma.job.count({ where }),
    ]);
  } catch { /* empty state */ }

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      <nav style={{ fontSize: "0.85rem", marginBottom: "1rem" }} className="text-muted">
        <Link href="/categories" style={{ color: "var(--primary)" }}>{t("jobCategory.breadcrumbCategories")}</Link> ← {t("category." + cat.slug)}
      </nav>

      <header style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <span style={{ fontSize: "3rem" }}>{cat.icon}</span>
        <div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: "bold" }}>{t("jobCategory.jobsIn")} {t("category." + cat.slug)}</h1>
          <p className="text-muted">{count} {t("jobCategory.activeJobsInField")}</p>
        </div>
      </header>

      {jobs.length === 0 ? (
        <div className="card text-center" style={{ padding: "3rem" }}>
          <p className="text-muted">{t("jobCategory.emptyState")}</p>
          <Link href="/jobs" className="btn btn-outline mt-4">{t("jobCategory.browseAllJobs")}</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {jobs.map((job) => (
            <div key={job.id} className="card flex-between" style={{ gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <h2 style={{ fontSize: "1.15rem", fontWeight: "bold" }}>
                  <Link href={`/jobs/${job.id}`} style={{ color: "inherit" }}>{job.title}</Link>
                  {job.featured && <span style={{ marginInlineStart: "0.5rem", fontSize: "0.7rem", padding: "0.15rem 0.5rem", background: "linear-gradient(135deg,var(--primary),var(--secondary))", color: "white", borderRadius: "var(--radius-full)" }}>⭐ {t("jobCategory.featured")}</span>}
                </h2>
                <p className="text-muted" style={{ fontSize: "0.88rem" }}>{job.company?.companyName} • {job.location} • {t("jobType." + job.type)}</p>
              </div>
              <Link href={`/jobs/${job.id}`} className="btn btn-outline">{t("jobCategory.details")}</Link>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "2.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "0.75rem" }}>{t("jobCategory.otherCategories")}</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {CATEGORIES.filter((c) => c.slug !== slug).map((c) => (
            <Link key={c.slug} href={`/jobs/category/${c.slug}`} className="btn btn-outline" style={{ fontSize: "0.82rem", padding: "0.35rem 0.8rem" }}>
              {c.icon} {t("category." + c.slug)}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
