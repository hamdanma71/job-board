import Link from "next/link";
import { getLocale, getDictionary } from "@/lib/i18n";

export const metadata = {
  title: "المدوّنة المهنية | JobMatch",
  description: "مقالات ونصائح في كتابة السيرة الذاتية والمقابلات والتطوّر المهني.",
};

export default async function BlogHub() {
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;

  const blogPosts = [
    { id: 1, title: t("blog.post1Title"), category: t("blog.catCareer"), date: t("blog.post1Date"), readTime: t("blog.post1Read"), image: "🤖", excerpt: t("blog.post1Excerpt") },
    { id: 2, title: t("blog.post2Title"), category: t("blog.catMarket"), date: t("blog.post2Date"), readTime: t("blog.post2Read"), image: "📈", excerpt: t("blog.post2Excerpt") },
    { id: 3, title: t("blog.post3Title"), category: t("blog.catWorkplace"), date: t("blog.post3Date"), readTime: t("blog.post3Read"), image: "🏡", excerpt: t("blog.post3Excerpt") },
    { id: 4, title: t("blog.post4Title"), category: t("blog.catLeadership"), date: t("blog.post4Date"), readTime: t("blog.post4Read"), image: "👔", excerpt: t("blog.post4Excerpt") },
  ];

  return (
    <main>
      <section style={{ backgroundColor: "var(--surface-hover)", padding: "5rem 1.5rem", borderBottom: "1px solid var(--border-light)" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: "800px" }}>
          <h1 style={{ fontSize: "3.5rem", fontWeight: "bold", marginBottom: "1rem" }}>{t("blog.heroTitle")}</h1>
          <p className="text-muted" style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>
            {t("blog.heroSubtitle")}
          </p>

          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "2rem", flexWrap: "wrap" }}>
            <span className="badge badge-primary" style={{ padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer" }}>{t("blog.filterAll")}</span>
            <span className="badge badge-outline" style={{ padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer" }}>{t("blog.catCareer")}</span>
            <span className="badge badge-outline" style={{ padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer" }}>{t("blog.catMarket")}</span>
            <span className="badge badge-outline" style={{ padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer" }}>{t("blog.catWorkplace")}</span>
            <span className="badge badge-outline" style={{ padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer" }}>{t("blog.catLeadership")}</span>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: "5rem 1.5rem" }}>

        {/* Featured Post */}
        <div className="card hover-scale" style={{ display: "flex", flexWrap: "wrap", gap: "2rem", padding: "0", overflow: "hidden", marginBottom: "4rem" }}>
          <div style={{ flex: "1 1 400px", backgroundColor: "rgba(37, 99, 235, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px", fontSize: "6rem" }}>
            🚀
          </div>
          <div style={{ flex: "1 1 400px", padding: "3rem 2rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span style={{ color: "var(--primary)", fontWeight: "bold", marginBottom: "1rem" }}>{t("blog.featuredLabel")}</span>
            <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem", lineHeight: "1.4" }}>{t("blog.featuredTitle")}</h2>
            <p className="text-muted" style={{ fontSize: "1.1rem", marginBottom: "2rem", lineHeight: "1.6" }}>
              {t("blog.featuredExcerpt")}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--surface-hover)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>A</div>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{t("blog.authorName")}</div>
                <div className="text-muted" style={{ fontSize: "0.8rem" }}>{t("blog.authorTitle")}</div>
              </div>
            </div>
            <Link href="#" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>{t("blog.readFull")}</Link>
          </div>
        </div>

        {/* Post Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
          {blogPosts.map(post => (
            <div key={post.id} className="card hover-scale" style={{ display: "flex", flexDirection: "column", padding: "0", overflow: "hidden" }}>
              <div style={{ height: "200px", backgroundColor: "var(--surface-hover)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>
                {post.image}
              </div>
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <span style={{ color: "var(--primary)", fontSize: "0.85rem", fontWeight: "bold" }}>{post.category}</span>
                  <span className="text-muted" style={{ fontSize: "0.85rem" }}>{post.readTime} {t("blog.readSuffix")}</span>
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem", lineHeight: "1.4" }}>
                  {post.title}
                </h3>
                <p className="text-muted" style={{ fontSize: "0.95rem", marginBottom: "1.5rem", flex: 1, lineHeight: "1.6" }}>
                  {post.excerpt}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: "1rem" }}>
                  <span className="text-muted" style={{ fontSize: "0.85rem" }}>{post.date}</span>
                  <Link href="#" style={{ color: "var(--primary)", fontWeight: "bold", textDecoration: "none" }}>{t("blog.readMore")}</Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>
    </main>
  );
}
