import Link from "next/link";
import { getLocale, getDictionary } from "@/lib/i18n";

export default async function Home() {
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;

  return (
    <main>
      {/* Hero Section */}
      <section style={{
        padding: "8rem 1.5rem",
        textAlign: "center",
        minHeight: "85vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative"
      }}>
        <div className="container animate-fade-in" style={{ position: "relative", zIndex: 10 }}>
          <div style={{
            display: "inline-block",
            padding: "0.5rem 1rem",
            backgroundColor: "rgba(79, 70, 229, 0.1)",
            border: "1px solid rgba(79, 70, 229, 0.2)",
            borderRadius: "var(--radius-full)",
            color: "var(--primary)",
            fontWeight: "bold",
            marginBottom: "2rem",
            fontSize: "0.9rem"
          }}>
            🚀 {t("home.heroBadge")}
          </div>

          <h1 style={{
            fontSize: "clamp(3rem, 6vw, 4.5rem)",
            fontWeight: 900,
            marginBottom: "1.5rem",
            lineHeight: 1.1,
            letterSpacing: "-1px",
            background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            {t("home.heroTitle")}
          </h1>
          <p style={{
            fontSize: "clamp(1.1rem, 2vw, 1.3rem)",
            color: "var(--text-muted)",
            maxWidth: "700px",
            margin: "0 auto 3rem auto",
            lineHeight: 1.8
          }}>
            {t("home.heroSubtitle")}
          </p>

          {/* Glass Search Box */}
          <form action="/jobs" method="GET" style={{
            background: "var(--surface)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "var(--glass-border)",
            maxWidth: "850px",
            margin: "0 auto",
            padding: "0.75rem",
            borderRadius: "var(--radius-full)",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            boxShadow: "var(--shadow-glass)"
          }}>
            <input
              name="search"
              type="text"
              placeholder={t("home.searchJobPlaceholder")}
              className="input-field"
              style={{ flex: "1 1 250px", border: "none", boxShadow: "none", backgroundColor: "transparent", fontSize: "1.05rem" }}
            />
            <input
              name="location"
              type="text"
              placeholder={t("home.searchLocationPlaceholder")}
              className="input-field"
              style={{ flex: "1 1 200px", border: "none", boxShadow: "none", backgroundColor: "transparent", fontSize: "1.05rem", fontWeight: "bold", color: "var(--primary)" }}
            />
            <button type="submit" className="btn btn-primary" style={{ flex: "0 0 auto", borderRadius: "var(--radius-full)", padding: "1rem 2.5rem", fontSize: "1.05rem" }}>
              {t("home.searchButton")}
            </button>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "6rem 0", position: "relative" }}>
        <div className="container">
          <div className="text-center mb-8">
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>{t("home.whyTitle")}</h2>
          </div>

          <div className="grid-2 mt-8">
            <div className="card text-center">
              <div style={{ width: "80px", height: "80px", background: "linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(79, 70, 229, 0.05))", borderRadius: "24px", margin: "0 auto 1.5rem auto", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontSize: "2rem" }}>✨</div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>{t("home.feature1Title")}</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>{t("home.feature1Desc")}</p>
            </div>
            <div className="card text-center">
              <div style={{ width: "80px", height: "80px", background: "linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(14, 165, 233, 0.05))", borderRadius: "24px", margin: "0 auto 1.5rem auto", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--secondary)", fontSize: "2rem" }}>📄</div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>{t("home.feature2Title")}</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>{t("home.feature2Desc")}</p>
            </div>
            <div className="card text-center">
              <div style={{ width: "80px", height: "80px", background: "linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(244, 63, 94, 0.05))", borderRadius: "24px", margin: "0 auto 1.5rem auto", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", fontSize: "2rem" }}>💰</div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>{t("home.feature3Title")}</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>{t("home.feature3Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: "6rem 1.5rem", textAlign: "center" }}>
        <div className="card animate-fade-in" style={{ maxWidth: "900px", margin: "0 auto", background: "linear-gradient(135deg, var(--primary), var(--secondary))", color: "white", border: "none" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1.5rem" }}>{t("home.ctaTitle")}</h2>
          <p style={{ fontSize: "1.2rem", opacity: 0.9, marginBottom: "2.5rem", maxWidth: "600px", margin: "0 auto 2.5rem auto" }}>
            {t("home.ctaSubtitle")}
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn" style={{ background: "white", color: "var(--primary)", padding: "1rem 3rem", fontSize: "1.1rem" }}>
              {t("home.ctaCandidate")}
            </Link>
            <Link href="/employers" className="btn" style={{ background: "transparent", border: "2px solid white", color: "white", padding: "1rem 3rem", fontSize: "1.1rem" }}>
              {t("home.ctaEmployer")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
