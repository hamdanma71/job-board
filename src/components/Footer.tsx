import Link from "next/link";
import { getLocale, getDictionary } from "@/lib/i18n";

export default async function Footer() {
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  return (
    <footer style={{ 
      backgroundColor: "#001a33", 
      color: "#e2e8f0", 
      padding: "5rem 1.5rem 2rem 1.5rem",
      marginTop: "4rem",
      fontFamily: "var(--font-inter), var(--font-cairo), sans-serif",
      borderTop: "1px solid var(--border-light)"
    }}>
      <div className="container">
        
        {/* Main Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "3rem", marginBottom: "4rem" }}>
          
          {/* Brand & Newsletter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <div style={{ fontSize: "2rem", fontWeight: "900", color: "white", letterSpacing: "-0.5px" }}>
                Job<span style={{ opacity: 0.8, color: "var(--primary)" }}>Match</span>
              </div>
            </Link>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem", lineHeight: "1.6" }}>
              {t("footer.tagline")}
            </p>
            <form style={{ display: "flex", marginTop: "1rem", borderRadius: "4px", overflow: "hidden" }}>
              <input
                type="email"
                placeholder={t("footer.newsletter")}
                style={{ flex: 1, padding: "0.75rem", border: "none", outline: "none", backgroundColor: "rgba(255,255,255,0.1)", color: "white" }}
              />
              <button type="submit" style={{ padding: "0.75rem 1.5rem", backgroundColor: "var(--primary)", color: "white", border: "none", fontWeight: "bold", cursor: "pointer" }}>
                {t("footer.subscribe")}
              </button>
            </form>
          </div>

          {/* Jobs Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ color: "white", fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("footer.jobsCol")}</h3>
            <Link href="/jobs" className="footer-link">{t("footer.allJobs")}</Link>
            <Link href="/jobs/remote" className="footer-link">{t("footer.remote")}</Link>
            <Link href="/jobs/executive" className="footer-link">{t("footer.executive")}</Link>
            <Link href="/locations" className="footer-link">{t("footer.locations")}</Link>
          </div>

          {/* Insights Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ color: "white", fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("footer.resourcesCol")}</h3>
            <Link href="/salaries" className="footer-link">{t("footer.salaries")}</Link>
            <Link href="/companies" className="footer-link">{t("footer.companies")}</Link>
            <Link href="/blog" className="footer-link">{t("footer.blog")}</Link>
            <Link href="/podcasts" className="footer-link">{t("footer.podcasts")}</Link>
          </div>

          {/* For Employers Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ color: "white", fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("footer.employersCol")}</h3>
            <Link href="/employers" className="footer-link">{t("footer.whyUs")}</Link>
            <Link href="/pricing" className="footer-link">{t("footer.pricing")}</Link>
            <Link href="/register" className="footer-link">{t("footer.registerCompany")}</Link>
            <Link href="/login" className="footer-link">{t("footer.companyLogin")}</Link>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{ 
          borderTop: "1px solid rgba(255,255,255,0.1)", 
          paddingTop: "2rem", 
          display: "flex", 
          flexWrap: "wrap", 
          justifyContent: "space-between", 
          alignItems: "center",
          gap: "1rem",
          fontSize: "0.85rem",
          color: "rgba(255,255,255,0.5)"
        }}>
          <p>© 2026 JobMatch — {t("footer.rights")}</p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link href="#" className="footer-link">{t("footer.terms")}</Link>
            <Link href="#" className="footer-link">{t("footer.privacy")}</Link>
            <Link href="#" className="footer-link">{t("footer.contact")}</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
