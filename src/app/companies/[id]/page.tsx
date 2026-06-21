import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ApplyButton from "@/components/ApplyButton";
import ReviewForm from "@/components/ReviewForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function CompanyDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  const company = await prisma.companyProfile.findUnique({
    where: { id: params.id },
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
      }
    }
  });

  if (!company) {
    return <main className="container text-center" style={{ padding: "5rem" }}><h2>الشركة غير موجودة</h2></main>;
  }

  let avgRating = 0;
  if (company.reviews.length > 0) {
    avgRating = company.reviews.reduce((acc, r) => acc + r.rating, 0) / company.reviews.length;
  }

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      {/* Company Header */}
      <header className="card mb-8" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        <div style={{ width: "100px", height: "100px", backgroundColor: "var(--surface-hover)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "2rem", color: "var(--primary)" }}>
          {company.companyName.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{company.companyName}</h1>
          <div style={{ display: "flex", gap: "1rem", color: "var(--text-light)" }}>
            <span>🏢 {company.industry || "قطاع غير محدد"}</span>
            <span>📍 {company.location || "موقع غير محدد"}</span>
            <span style={{ color: "var(--accent)", fontWeight: "bold" }}>⭐ {avgRating.toFixed(1)} ({company.reviews.length} تقييم)</span>
          </div>
        </div>
      </header>

      <div className="grid-2">
        {/* Left Column: Details & Reviews */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div className="card">
            <h2 style={{ fontSize: "1.25rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>عن الشركة</h2>
            <p style={{ lineHeight: "1.8" }}>{company.description || "لم تقم الشركة بإضافة نبذة تعريفية بعد."}</p>
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "1rem", color: "var(--primary)" }}>
                زيارة الموقع الإلكتروني 🔗
              </a>
            )}
          </div>

          <div className="card">
            <div className="flex-between mb-4" style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem" }}>
              <h2 style={{ fontSize: "1.25rem" }}>التقييمات والرواتب</h2>
            </div>
            
            {session && (session.user as any).role === "CANDIDATE" && (
              <ReviewForm companyId={company.id} />
            )}
            
            {!session && (
              <div className="text-center" style={{ padding: "1rem", backgroundColor: "var(--surface-hover)", borderRadius: "var(--radius-md)", marginBottom: "1.5rem" }}>
                <p>قم <Link href="/login" style={{ color: "var(--primary)" }}>بتسجيل الدخول</Link> لمشاركة تجربتك أو تقييمك لهذه الشركة.</p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem" }}>
              {company.reviews.length === 0 ? (
                <p className="text-muted text-center">لا توجد تقييمات حتى الآن. كن أول من يشارك تجربته!</p>
              ) : (
                company.reviews.map(review => (
                  <div key={review.id} style={{ padding: "1rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)" }}>
                    <div className="flex-between mb-2">
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ color: "var(--accent)" }}>{"⭐".repeat(review.rating)}</span>
                        <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                          {review.isAnonymous ? "موظف مجهول" : review.reviewer.name}
                        </span>
                      </div>
                      <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                        {new Date(review.createdAt).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                    {review.position && (
                      <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>المسمى الوظيفي: {review.position}</p>
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
