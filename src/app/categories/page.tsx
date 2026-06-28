import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";
import { getLocale, getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تصفّح الوظائف حسب القطاع | JobMatch",
  description: "استكشف الفرص الوظيفية في التقنية والطب والهندسة والمالية والمبيعات وغيرها عبر JobMatch.",
};

export default async function CategoriesHub() {
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  // Live count per category (one grouped pass would need raw SQL on keyword OR; counts are cheap here).
  const counts = await Promise.all(
    CATEGORIES.map((c) =>
      prisma.job
        .count({ where: { isActive: true, OR: c.keywords.flatMap((k) => [{ title: { contains: k } }, { description: { contains: k } }]) } })
        .catch(() => 0)
    )
  );

  return (
    <main className="container" style={{ padding: "4rem 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem" }}>{t("categoriesPage.title")}</h1>
        <p className="text-muted" style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}>
          {t("categoriesPage.subtitle")}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {CATEGORIES.map((category, i) => (
          <Link key={category.slug} href={`/jobs/category/${category.slug}`} style={{ textDecoration: "none" }}>
            <div className="card hover-scale" style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.5rem" }}>
              <div style={{ fontSize: "2.5rem", width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--surface-hover)", borderRadius: "12px" }}>
                {category.icon}
              </div>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-main)", marginBottom: "0.25rem" }}>{t("category." + category.slug)}</h2>
                <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{counts[i]} {t("categoriesPage.jobsAvailable")}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: "5rem", textAlign: "center", padding: "3rem", backgroundColor: "var(--surface-hover)", borderRadius: "12px" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>{t("categoriesPage.notFoundTitle")}</h2>
        <p className="text-muted mb-4">{t("categoriesPage.notFoundText")}</p>
        <Link href="/jobs" className="btn btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem" }}>{t("categoriesPage.advancedSearchBtn")}</Link>
      </div>
    </main>
  );
}
