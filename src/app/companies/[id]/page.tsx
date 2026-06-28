import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ApplyButton from "@/components/ApplyButton";
import ReviewForm from "@/components/ReviewForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FollowButton from "@/components/FollowButton";
import InterviewReviewForm from "@/components/InterviewReviewForm";
import CompanyProfileEditor from "@/components/CompanyProfileEditor";
import { getLocale, getDictionary } from "@/lib/i18n";

export default async function CompanyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const company = await prisma.companyProfile.findUnique({
    where: { id },
    include: {
      jobs: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" }
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: {
          reviewer: true
        }
      },
      interviewReviews: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { author: { select: { name: true } } }
      },
      _count: { select: { followers: true } }
    }
  });

  if (!company) {
    return <main className="container text-center" style={{ padding: "5rem" }}><h2>{t("companyDetail.notFound")}</h2></main>;
  }

  const isOwner = Boolean(session && company.userId === (session.user as any).id);
  const isCandidate = Boolean(session && (session.user as any).role === "CANDIDATE");

  // Does the current user already follow this company?
  let isFollowing = false;
  if (session) {
    const f = await prisma.companyFollow.findUnique({
      where: { userId_companyId: { userId: (session.user as any).id, companyId: company.id } },
    });
    isFollowing = Boolean(f);
  }

  let avgRating = 0;
  if (company.reviews.length > 0) {
    avgRating = company.reviews.reduce((acc, r) => acc + r.rating, 0) / company.reviews.length;
  }

  // 7-criteria averages (only over reviews that provided each criterion).
  const CRITERIA: { key: keyof typeof company.reviews[number]; label: string }[] = [
    { key: "ratingWorkEnv", label: t("companyDetail.criteriaWorkEnv") },
    { key: "ratingManagement", label: t("companyDetail.criteriaManagement") },
    { key: "ratingSalary", label: t("companyDetail.criteriaSalary") },
    { key: "ratingBenefits", label: t("companyDetail.criteriaBenefits") },
    { key: "ratingGrowth", label: t("companyDetail.criteriaGrowth") },
    { key: "ratingCulture", label: t("companyDetail.criteriaCulture") },
    { key: "ratingStability", label: t("companyDetail.criteriaStability") },
  ];
  const criteriaAverages = CRITERIA.map((c) => {
    const vals = company.reviews.map((r) => r[c.key] as number | null).filter((v): v is number => v != null);
    return { label: c.label, avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0, count: vals.length };
  });

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      {/* Company Header */}
      <header className="card mb-8" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        <div style={{ width: "100px", height: "100px", backgroundColor: "var(--surface-hover)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "2rem", color: "var(--primary)" }}>
          {company.companyName.substring(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            {company.companyName}
            {company.isStartup && <span style={{ marginInlineStart: "0.6rem", fontSize: "0.8rem", padding: "0.2rem 0.6rem", background: "linear-gradient(135deg,var(--primary),var(--secondary))", color: "white", borderRadius: "var(--radius-full)", verticalAlign: "middle" }}>🚀 {t("companyDetail.startupBadge")}</span>}
          </h1>
          <div style={{ display: "flex", gap: "1rem", color: "var(--text-light)", flexWrap: "wrap" }}>
            <span>🏢 {company.industry || t("companyDetail.industryUnknown")}</span>
            <span>📍 {company.location || t("companyDetail.locationUnknown")}</span>
            <span style={{ color: "var(--accent)", fontWeight: "bold" }}>⭐ {avgRating.toFixed(1)} ({company.reviews.length} {t("companyDetail.reviewWord")})</span>
            {company.isStartup && company.stage && <span>📈 {company.stage}</span>}
            {company.isStartup && company.fundingRaised && <span>💰 {company.fundingRaised}</span>}
            {company.isStartup && company.teamSize && <span>👥 {company.teamSize}</span>}
          </div>
        </div>
        <FollowButton companyId={company.id} initialFollowing={isFollowing} initialCount={company._count.followers} isLoggedIn={Boolean(session)} />
      </header>

      <div className="grid-2">
        {/* Left Column: Details & Reviews */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div className="card">
            <h2 style={{ fontSize: "1.25rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>{t("companyDetail.aboutTitle")}</h2>
            <p style={{ lineHeight: "1.8" }}>{company.description || t("companyDetail.noDescription")}</p>
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "1rem", color: "var(--primary)" }}>
                {t("companyDetail.visitWebsite")} 🔗
              </a>
            )}
            {isOwner && (
              <div style={{ marginTop: "1rem" }}>
                <CompanyProfileEditor company={{ companyName: company.companyName, industry: company.industry, description: company.description, location: company.location, website: company.website, isStartup: company.isStartup, stage: company.stage, fundingRaised: company.fundingRaised, teamSize: company.teamSize }} />
              </div>
            )}
          </div>

          {company.reviews.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: "1.25rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>{t("companyDetail.ratingsByCriteria")}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {criteriaAverages.map((c) => (
                  <div key={c.label}>
                    <div className="flex-between" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                      <span>{c.label}</span>
                      <span style={{ fontWeight: "bold" }}>{c.count ? c.avg.toFixed(1) : "—"}</span>
                    </div>
                    <div style={{ height: "8px", background: "var(--surface-hover)", borderRadius: "var(--radius-full)" }}>
                      <div style={{ height: "100%", width: `${(c.avg / 5) * 100}%`, background: "linear-gradient(90deg, var(--primary), var(--secondary))", borderRadius: "var(--radius-full)" }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Glassdoor-style interview reviews */}
          <div className="card">
            <h2 style={{ fontSize: "1.25rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>{t("companyDetail.interviewExperiences")} 🎤</h2>
            {company.interviewReviews.length === 0 ? (
              <p className="text-muted" style={{ fontSize: "0.9rem" }}>{t("companyDetail.noInterviews")}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {company.interviewReviews.map((ir: any) => (
                  <div key={ir.id} style={{ padding: "0.75rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)" }}>
                    <div className="flex-between" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                      <strong>{ir.position || t("companyDetail.interviewDefault")}</strong>
                      <span className="text-muted">{ir.isAnonymous ? t("companyDetail.anonymous") : ir.author?.name} {ir.difficulty ? `· ${t("companyDetail.difficulty")} ${ir.difficulty}/5` : ""}</span>
                    </div>
                    {ir.questions && <p style={{ fontSize: "0.83rem", margin: "0.2rem 0" }}>❓ {ir.questions}</p>}
                    <p style={{ fontSize: "0.88rem", lineHeight: 1.6 }}>{ir.experience}</p>
                    {ir.outcome && <span className="text-muted" style={{ fontSize: "0.75rem" }}>{t("companyDetail.outcomeLabel")}: {ir.outcome === "OFFER" ? t("companyDetail.outcomeOffer") : ir.outcome === "REJECTED" ? t("companyDetail.outcomeRejected") : ir.outcome === "NO_RESPONSE" ? t("companyDetail.outcomeNoResponse") : t("companyDetail.outcomePending")}</span>}
                  </div>
                ))}
              </div>
            )}
            {isCandidate && <div style={{ marginTop: "1rem" }}><InterviewReviewForm companyId={company.id} /></div>}
          </div>

          <div className="card">
            <div className="flex-between mb-4" style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem" }}>
              <h2 style={{ fontSize: "1.25rem" }}>{t("companyDetail.reviewsAndSalaries")}</h2>
            </div>
            
            {session && (session.user as any).role === "CANDIDATE" && (
              <ReviewForm companyId={company.id} />
            )}
            
            {!session && (
              <div className="text-center" style={{ padding: "1rem", backgroundColor: "var(--surface-hover)", borderRadius: "var(--radius-md)", marginBottom: "1.5rem" }}>
                <p>{t("companyDetail.loginPrompt1")} <Link href="/login" style={{ color: "var(--primary)" }}>{t("companyDetail.loginLink")}</Link> {t("companyDetail.loginPrompt2")}</p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem" }}>
              {company.reviews.length === 0 ? (
                <p className="text-muted text-center">{t("companyDetail.noReviews")}</p>
              ) : (
                company.reviews.map(review => (
                  <div key={review.id} style={{ padding: "1rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)" }}>
                    <div className="flex-between mb-2">
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ color: "var(--accent)" }}>{"⭐".repeat(review.rating)}</span>
                        <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                          {review.isAnonymous ? t("companyDetail.anonymousEmployee") : review.reviewer.name}
                        </span>
                      </div>
                      <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                        {new Date(review.createdAt).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                    {review.position && (
                      <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>{t("companyDetail.jobTitle")}: {review.position}</p>
                    )}
                    <p style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>{review.comment}</p>
                    {review.salary && (
                      <div style={{ marginTop: "1rem", padding: "0.5rem", backgroundColor: "var(--secondary)20", color: "var(--secondary)", borderRadius: "var(--radius-sm)", display: "inline-block", fontSize: "0.85rem" }}>
                        الراتب المشترك: {review.salary}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Jobs */}
        <div className="card" style={{ alignSelf: "start" }}>
          <h2 style={{ fontSize: "1.25rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>الوظائف المتاحة ({company.jobs.length})</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {company.jobs.length === 0 ? (
              <p className="text-muted text-center">لا توجد وظائف متاحة حالياً.</p>
            ) : (
              company.jobs.map(job => (
                <div key={job.id} style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "1rem", marginBottom: "0.5rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{job.title}</h3>
                  <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>{job.location} • {job.type}</p>
                  
                  {job.externalUrl ? (
                    <a href={job.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}>
                      تقديم عبر {job.source}
                    </a>
                  ) : (
                    <ApplyButton jobId={job.id} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
