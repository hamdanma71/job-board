import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLocale, getDictionary } from "@/lib/i18n";

export const metadata = {
  title: "الخدمات المميّزة | JobMatch",
  description: "ميزات مدفوعة للباحثين والشركات: تعزيز الظهور، تحليلات، وأدوات ذكاء اصطناعي.",
};

export default async function PremiumPage() {
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;

  return (
    <main className="container" style={{ padding: "4rem 1.5rem" }}>
      <header className="mb-12 text-center">
        <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem" }}>{t("premiumPage.title")}</h1>
        <p className="text-muted" style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}>
          {t("premiumPage.subtitle")}
        </p>
      </header>

      {/* Toggle if user is guest, or just show depending on role */}
      {(!role || role === "CANDIDATE") && (
        <div style={{ marginBottom: "5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "2rem", textAlign: "center" }}>{t("premiumPage.candidatePlans")}</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", maxWidth: "900px", margin: "0 auto" }}>

            {/* Free Tier */}
            <div className="card hover-scale" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{t("premiumPage.freeName")}</h3>
                <p className="text-muted">{t("premiumPage.freeTagline")}</p>
                <p style={{ fontSize: "2.5rem", fontWeight: "bold", marginTop: "1rem", color: "var(--text-main)" }}>{t("premiumPage.freePrice")}</p>
              </div>
              <ul style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> {t("premiumPage.freeFeat1")}</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> {t("premiumPage.freeFeat2")}</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> {t("premiumPage.freeFeat3")}</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: 0.5 }}><span>❌</span> {t("premiumPage.freeFeat4")}</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: 0.5 }}><span>❌</span> {t("premiumPage.freeFeat5")}</li>
              </ul>
              <Link href="/register" className="btn btn-outline" style={{ width: "100%", textAlign: "center" }}>{t("premiumPage.freeCta")}</Link>
            </div>

            {/* Pro Tier */}
            <div className="card hover-scale" style={{ display: "flex", flexDirection: "column", border: "2px solid var(--primary)", position: "relative" }}>
              <div style={{ position: "absolute", top: "-15px", left: "50%", transform: "translateX(-50%)", backgroundColor: "var(--primary)", color: "white", padding: "0.25rem 1rem", borderRadius: "var(--radius-full)", fontSize: "0.85rem", fontWeight: "bold" }}>{t("premiumPage.mostPopular")}</div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{t("premiumPage.proName")}</h3>
                <p className="text-muted">{t("premiumPage.proTagline")}</p>
                <p style={{ fontSize: "2.5rem", fontWeight: "bold", marginTop: "1rem", color: "var(--primary)" }}>9<span style={{ fontSize: "1rem" }}>{t("premiumPage.perMonth")}</span></p>
              </div>
              <ul style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> {t("premiumPage.proFeat1")}</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> <strong style={{color: "var(--primary)"}}>{t("premiumPage.proFeat2")}</strong></li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> {t("premiumPage.proFeat3")}</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> {t("premiumPage.proFeat4")}</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> {t("premiumPage.proFeat5")}</li>
              </ul>
              <button className="btn btn-primary" style={{ width: "100%", textAlign: "center" }}>{t("premiumPage.upgradeNow")}</button>
            </div>

          </div>
        </div>
      )}

      {/* Employer Plans */}
      {(!role || role === "EMPLOYER") && (
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "2rem", textAlign: "center" }}>{t("premiumPage.employerPlans")}</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", maxWidth: "900px", margin: "0 auto" }}>

            <div className="card hover-scale" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{t("premiumPage.startupName")}</h3>
                <p className="text-muted">{t("premiumPage.startupTagline")}</p>
                <p style={{ fontSize: "2.5rem", fontWeight: "bold", marginTop: "1rem", color: "var(--text-main)" }}>49<span style={{ fontSize: "1rem" }}>{t("premiumPage.perMonth")}</span></p>
              </div>
              <ul style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> {t("premiumPage.startupFeat1")}</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> {t("premiumPage.startupFeat2")}</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> {t("premiumPage.startupFeat3")}</li>
              </ul>
              <button className="btn btn-outline" style={{ width: "100%", textAlign: "center" }}>{t("premiumPage.subscribeNow")}</button>
            </div>

            <div className="card hover-scale" style={{ display: "flex", flexDirection: "column", backgroundColor: "var(--surface-hover)" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{t("premiumPage.enterpriseName")}</h3>
                <p className="text-muted">{t("premiumPage.enterpriseTagline")}</p>
                <p style={{ fontSize: "2.5rem", fontWeight: "bold", marginTop: "1rem", color: "var(--accent)" }}>199<span style={{ fontSize: "1rem" }}>{t("premiumPage.perMonth")}</span></p>
              </div>
              <ul style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> {t("premiumPage.enterpriseFeat1")}</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> {t("premiumPage.enterpriseFeat2")}</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> {t("premiumPage.enterpriseFeat3")}</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> {t("premiumPage.enterpriseFeat4")}</li>
              </ul>
              <button className="btn btn-primary" style={{ width: "100%", textAlign: "center", backgroundColor: "var(--accent)", color: "black" }}>{t("premiumPage.contactSales")}</button>
            </div>

          </div>
        </div>
      )}

      {/* Stripe / Payments Security Banner */}
      <div style={{ marginTop: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
        <p style={{ fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          {t("premiumPage.securityNote")}
        </p>
      </div>

    </main>
  );
}
