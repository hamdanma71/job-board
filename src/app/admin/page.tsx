import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getLocale, getDictionary, LOCALES } from "@/lib/i18n";
import { getEnabledLocales, setEnabledLocales } from "@/lib/settings";

export default async function AdminDashboard() {
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    return (
      <main className="container text-center" style={{ padding: "5rem" }}>
        <h2>{t("admin.unauthorized")}</h2>
        <Link href="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>{t("admin.backHome")}</Link>
      </main>
    );
  }

  // Re-verify ADMIN inside every mutating server action (don't trust page gate alone).
  async function assertAdmin() {
    "use server";
    const s = await getServerSession(authOptions);
    if (!s || (s.user as any).role !== "ADMIN") throw new Error("Unauthorized");
  }

  // Fetch Stats
  const usersCount = await prisma.user.count();
  const candidatesCount = await prisma.candidateProfile.count();
  const companiesCount = await prisma.companyProfile.count();
  const jobsCount = await prisma.job.count();
  const applicationsCount = await prisma.application.count();

  // Revenue: total via SQL aggregate; only last-6-months rows fetched for the chart.
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const [{ _sum }, proCount, recentPayments] = await Promise.all([
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.companyProfile.count({ where: { subscriptionTier: "PRO" } }),
    prisma.payment.findMany({ where: { createdAt: { gte: sixMonthsAgo } }, select: { amount: true, createdAt: true } }),
  ]);
  const totalRevenue = _sum.amount ?? 0; // smallest unit
  const paymentsCount = recentPayments.length;

  // Build last-6-months revenue buckets (rendered as a CSS bar chart).
  const months: { key: string; label: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("ar", { month: "short" }), total: 0 });
  }
  for (const p of recentPayments) {
    const d = new Date(p.createdAt);
    const bucket = months.find((m) => m.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (bucket) bucket.total += p.amount;
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.total));

  // Fetch Companies for verification management (most recent; bounded)
  const companies = await prisma.companyProfile.findMany({
    include: { user: true },
    take: 100,
    orderBy: { createdAt: 'desc' }
  });

  // Fetch candidate profiles for individual-plan management
  const candidates = await prisma.candidateProfile.findMany({
    include: { user: { select: { name: true, email: true } } },
    take: 100,
    orderBy: { createdAt: 'desc' }
  });

  // Enabled UI languages (admin-controlled).
  const enabledLocales = await getEnabledLocales();

  // Server action: save which languages appear in the public language switcher.
  async function saveLocales(formData: FormData) {
    "use server";
    await assertAdmin();
    const codes = LOCALES.map((l) => l.code).filter((c) => formData.get(`loc_${c}`) === "on");
    try {
      await setEnabledLocales(codes);
      revalidatePath("/", "layout");
      revalidatePath("/admin");
    } catch (e) {
      // Never crash the admin page on a transient DB error; log and keep current settings.
      console.error("saveLocales failed:", e);
    }
  }

  // Server action: change a COMPANY subscription tier (FREE/PRO).
  async function changeCompanyTier(formData: FormData) {
    "use server";
    await assertAdmin();
    const id = String(formData.get("id"));
    const tier = String(formData.get("tier"));
    if (!["FREE", "PRO"].includes(tier)) return;
    const endsAt = tier === "PRO" ? new Date(new Date().setFullYear(new Date().getFullYear() + 1)) : null;
    await prisma.companyProfile.update({ where: { id }, data: { subscriptionTier: tier, subscriptionEndsAt: endsAt } });
    revalidatePath('/admin');
  }

  // Server action: change an INDIVIDUAL (candidate) plan (FREE/PREMIUM).
  async function changeCandidatePlan(formData: FormData) {
    "use server";
    await assertAdmin();
    const userId = String(formData.get("userId"));
    const plan = String(formData.get("plan"));
    if (!["FREE", "PREMIUM"].includes(plan)) return;
    const premium = plan === "PREMIUM";
    const until = premium ? new Date(new Date().setFullYear(new Date().getFullYear() + 1)) : null;
    // PREMIUM also grants boosted CV-search ranking; FREE clears it.
    await prisma.candidateProfile.update({ where: { userId }, data: { plan, planEndsAt: until, rankBoostedUntil: until } });
    revalidatePath('/admin');
  }

  return (
    <main className="container animate-fade-in" style={{ padding: "4rem 1.5rem" }}>
      <header className="flex-between mb-8" style={{ background: "var(--surface)", padding: "2rem", borderRadius: "var(--radius-lg)", border: "var(--glass-border)", boxShadow: "var(--shadow-glass)" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", background: "linear-gradient(135deg, var(--primary), var(--secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t("admin.title")}</h1>
          <p className="text-muted" style={{ marginTop: "0.5rem" }}>{t("admin.subtitle")}</p>
        </div>
        <Link href="/" className="btn btn-outline">{t("admin.backHome")}</Link>
      </header>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        <div className="card text-center" style={{ borderTop: "4px solid var(--primary)" }}>
          <span style={{ fontSize: "3rem", fontWeight: "900", color: "var(--primary)" }}>{usersCount}</span>
          <p style={{ color: "var(--text-muted)", fontWeight: "600", marginTop: "0.5rem" }}>{t("admin.totalUsers")}</p>
        </div>
        <div className="card text-center" style={{ borderTop: "4px solid var(--secondary)" }}>
          <span style={{ fontSize: "3rem", fontWeight: "900", color: "var(--secondary)" }}>{candidatesCount}</span>
          <p style={{ color: "var(--text-muted)", fontWeight: "600", marginTop: "0.5rem" }}>{t("admin.jobSeekers")}</p>
        </div>
        <div className="card text-center" style={{ borderTop: "4px solid var(--accent)" }}>
          <span style={{ fontSize: "3rem", fontWeight: "900", color: "var(--accent)" }}>{companiesCount}</span>
          <p style={{ color: "var(--text-muted)", fontWeight: "600", marginTop: "0.5rem" }}>{t("admin.registeredCompanies")}</p>
        </div>
        <div className="card text-center" style={{ borderTop: "4px solid #8b5cf6" }}>
          <span style={{ fontSize: "3rem", fontWeight: "900", color: "#8b5cf6" }}>{jobsCount}</span>
          <p style={{ color: "var(--text-muted)", fontWeight: "600", marginTop: "0.5rem" }}>{t("admin.activeJobs")}</p>
        </div>
        <div className="card text-center" style={{ borderTop: "4px solid #14b8a6" }}>
          <span style={{ fontSize: "3rem", fontWeight: "900", color: "#14b8a6" }}>{applicationsCount}</span>
          <p style={{ color: "var(--text-muted)", fontWeight: "600", marginTop: "0.5rem" }}>{t("admin.applications")}</p>
        </div>
        <div className="card text-center" style={{ borderTop: "4px solid #16a34a" }}>
          <span style={{ fontSize: "3rem", fontWeight: "900", color: "#16a34a" }}>{(totalRevenue / 100).toLocaleString("ar")}</span>
          <p style={{ color: "var(--text-muted)", fontWeight: "600", marginTop: "0.5rem" }}>{t("admin.totalRevenue")}</p>
        </div>
      </div>

      {/* Revenue chart + subscription split */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "3rem" }}>
        <div className="card">
          <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1.5rem" }}>{t("admin.revenue6mo")}</h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem", height: "180px" }}>
            {months.map((m) => (
              <div key={m.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", height: "100%", justifyContent: "flex-end" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{(m.total / 100).toLocaleString("ar")}</span>
                <div style={{ width: "100%", height: `${(m.total / maxMonth) * 100}%`, minHeight: m.total > 0 ? "4px" : "0", background: "linear-gradient(180deg, var(--primary), var(--secondary))", borderRadius: "var(--radius-sm) var(--radius-sm) 0 0", transition: "height var(--transition-normal)" }}></div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{m.label}</span>
              </div>
            ))}
          </div>
          {totalRevenue === 0 && <p className="text-muted text-center" style={{ marginTop: "1rem", fontSize: "0.85rem" }}>{t("admin.noPayments")}</p>}
        </div>

        <div className="card">
          <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1.5rem" }}>{t("admin.subscriptions")}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div className="flex-between" style={{ marginBottom: "0.3rem", fontSize: "0.9rem" }}><span>PRO</span><span style={{ fontWeight: "bold" }}>{proCount}</span></div>
              <div style={{ height: "10px", background: "var(--surface-hover)", borderRadius: "var(--radius-full)" }}>
                <div style={{ height: "100%", width: `${companiesCount ? (proCount / companiesCount) * 100 : 0}%`, background: "var(--primary)", borderRadius: "var(--radius-full)" }}></div>
              </div>
            </div>
            <div>
              <div className="flex-between" style={{ marginBottom: "0.3rem", fontSize: "0.9rem" }}><span>FREE</span><span style={{ fontWeight: "bold" }}>{companiesCount - proCount}</span></div>
              <div style={{ height: "10px", background: "var(--surface-hover)", borderRadius: "var(--radius-full)" }}>
                <div style={{ height: "100%", width: `${companiesCount ? ((companiesCount - proCount) / companiesCount) * 100 : 0}%`, background: "var(--text-light)", borderRadius: "var(--radius-full)" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Companies Management */}
      <div className="card" style={{ padding: "0" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-light)" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{t("admin.companiesMgmt")}</h2>
        </div>

        {companies.length === 0 ? (
          <p className="text-muted text-center" style={{ padding: "3rem" }}>{t("admin.noCompanies")}</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "start", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "var(--surface-hover)" }}>
                <tr>
                  <th style={{ padding: "1.5rem 1rem", color: "var(--text-muted)" }}>{t("admin.colCompany")}</th>
                  <th style={{ padding: "1.5rem 1rem", color: "var(--text-muted)" }}>{t("admin.colEmail")}</th>
                  <th style={{ padding: "1.5rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>{t("admin.colCurrentPlan")}</th>
                  <th style={{ padding: "1.5rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>{t("admin.colVerification")}</th>
                  <th style={{ padding: "1.5rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>{t("admin.colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(company => (
                  <tr key={company.id} className="row-hover" style={{ borderBottom: "1px solid var(--border-light)", transition: "background-color 0.2s" }}>
                    <td style={{ padding: "1.5rem 1rem", fontWeight: "bold" }}>{company.companyName}</td>
                    <td style={{ padding: "1.5rem 1rem", color: "var(--text-muted)" }}>{company.user?.email}</td>
                    <td style={{ padding: "1.5rem 1rem", textAlign: "center" }}>
                      <span style={{ 
                        padding: "0.4rem 0.8rem", 
                        backgroundColor: company.subscriptionTier === "PRO" ? "rgba(79, 70, 229, 0.1)" : "rgba(100, 116, 139, 0.1)", 
                        color: company.subscriptionTier === "PRO" ? "var(--primary)" : "var(--text-muted)", 
                        borderRadius: "var(--radius-full)", 
                        fontWeight: "bold",
                        fontSize: "0.85rem"
                      }}>
                        {company.subscriptionTier}
                      </span>
                      <form action={changeCompanyTier} style={{ display: "flex", gap: "0.3rem", justifyContent: "center", marginTop: "0.5rem" }}>
                        <input type="hidden" name="id" value={company.id} />
                        <select name="tier" defaultValue={company.subscriptionTier} className="input-field" style={{ padding: "0.25rem 0.4rem", fontSize: "0.78rem", width: "auto" }}>
                          <option value="FREE">FREE</option>
                          <option value="PRO">PRO</option>
                        </select>
                        <button type="submit" className="btn btn-outline" style={{ padding: "0.25rem 0.6rem", fontSize: "0.72rem" }}>{t("admin.change")}</button>
                      </form>
                    </td>
                    <td style={{ padding: "1.5rem 1rem", textAlign: "center" }}>
                      {company.isVerified ? (
                        <span style={{ color: "var(--secondary)", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          <span style={{ width: "8px", height: "8px", backgroundColor: "var(--secondary)", borderRadius: "50%" }}></span> {t("admin.verified")}
                        </span>
                      ) : (
                        <span style={{ color: "var(--accent)", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          <span style={{ width: "8px", height: "8px", backgroundColor: "var(--accent)", borderRadius: "50%" }}></span> {t("admin.pendingVerification")}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "1.5rem 1rem", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <form action={async () => {
                          "use server";
                          await assertAdmin();
                          await prisma.companyProfile.update({
                            where: { id: company.id },
                            data: { isVerified: !company.isVerified }
                          });
                          revalidatePath('/admin');
                        }}>
                          <button type="submit" className="btn btn-outline" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", borderRadius: "var(--radius-full)" }}>
                            {company.isVerified ? t("admin.unverify") : t("admin.verifyCompany")}
                          </button>
                        </form>
                        <form action={async () => {
                          "use server";
                          await assertAdmin();
                          await prisma.companyProfile.update({
                            where: { id: company.id },
                            data: { isBanned: !company.isBanned }
                          });
                          revalidatePath('/admin');
                        }}>
                          <button type="submit" className="btn" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", borderRadius: "var(--radius-full)", background: company.isBanned ? "rgba(22,163,74,0.1)" : "rgba(245,158,11,0.12)", color: company.isBanned ? "#16a34a" : "#b45309" }}>
                            {company.isBanned ? t("admin.unban") : t("admin.ban")}
                          </button>
                        </form>
                        <form action={async () => {
                          "use server";
                          await assertAdmin();
                          await prisma.companyProfile.delete({ where: { id: company.id } });
                          revalidatePath('/admin');
                        }}>
                          <button type="submit" className="btn" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", borderRadius: "var(--radius-full)", background: "rgba(244, 63, 94, 0.1)", color: "var(--accent)" }}>
                            {t("admin.delete")}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Language management */}
      <div className="card" style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("admin.languagesTitle")}</h2>
        <p className="text-muted" style={{ marginBottom: "1.5rem", fontSize: "0.9rem" }}>{t("admin.languagesDesc")}</p>
        <form action={saveLocales}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {LOCALES.map((l) => {
              const isDefault = l.code === "ar";
              const on = enabledLocales.includes(l.code);
              return (
                <label key={l.code} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1rem", border: `1px solid ${on ? "var(--primary)" : "var(--border-light)"}`, borderRadius: "var(--radius-md)", background: on ? "rgba(79,70,229,0.06)" : "transparent", cursor: isDefault ? "not-allowed" : "pointer" }}>
                  <input type="checkbox" name={`loc_${l.code}`} defaultChecked={on || isDefault} disabled={isDefault} />
                  <span style={{ fontWeight: "bold" }}>{l.label}</span>
                  <span className="text-muted" style={{ fontSize: "0.75rem", marginInlineStart: "auto" }}>{l.code}{isDefault ? ` · ${t("admin.langDefault")}` : ""}</span>
                </label>
              );
            })}
          </div>
          <button type="submit" className="btn btn-primary">{t("admin.saveLanguages")}</button>
        </form>
      </div>

      {/* Individuals (candidates) plan management */}
      <div className="card" style={{ padding: "0", marginTop: "2rem" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-light)" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{t("admin.individualsMgmt")}</h2>
        </div>
        {candidates.length === 0 ? (
          <p className="text-muted text-center" style={{ padding: "3rem" }}>{t("admin.noCandidates")}</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "start", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "var(--surface-hover)" }}>
                <tr>
                  <th style={{ padding: "1.25rem 1rem", color: "var(--text-muted)" }}>{t("admin.colName")}</th>
                  <th style={{ padding: "1.25rem 1rem", color: "var(--text-muted)" }}>{t("admin.colEmail")}</th>
                  <th style={{ padding: "1.25rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>{t("admin.colCurrentPlan")}</th>
                  <th style={{ padding: "1.25rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>{t("admin.colChangePlan")}</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((cand) => (
                  <tr key={cand.id} className="row-hover" style={{ borderBottom: "1px solid var(--border-light)", transition: "background-color 0.2s" }}>
                    <td style={{ padding: "1.25rem 1rem", fontWeight: "bold" }}>{cand.user?.name}</td>
                    <td style={{ padding: "1.25rem 1rem", color: "var(--text-muted)" }}>{cand.user?.email}</td>
                    <td style={{ padding: "1.25rem 1rem", textAlign: "center" }}>
                      <span style={{ padding: "0.4rem 0.8rem", backgroundColor: cand.plan === "PREMIUM" ? "rgba(79,70,229,0.1)" : "rgba(100,116,139,0.1)", color: cand.plan === "PREMIUM" ? "var(--primary)" : "var(--text-muted)", borderRadius: "var(--radius-full)", fontWeight: "bold", fontSize: "0.85rem" }}>
                        {cand.plan}
                      </span>
                    </td>
                    <td style={{ padding: "1.25rem 1rem", textAlign: "center" }}>
                      <form action={changeCandidatePlan} style={{ display: "flex", gap: "0.3rem", justifyContent: "center" }}>
                        <input type="hidden" name="userId" value={cand.userId} />
                        <select name="plan" defaultValue={cand.plan} className="input-field" style={{ padding: "0.25rem 0.4rem", fontSize: "0.78rem", width: "auto" }}>
                          <option value="FREE">FREE</option>
                          <option value="PREMIUM">PREMIUM</option>
                        </select>
                        <button type="submit" className="btn btn-outline" style={{ padding: "0.25rem 0.6rem", fontSize: "0.72rem" }}>{t("admin.change")}</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
