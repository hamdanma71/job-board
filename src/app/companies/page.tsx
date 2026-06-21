import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CompaniesDirectory() {
  const companies = await prisma.companyProfile.findMany({
    include: {
      jobs: {
        where: { isActive: true }
      },
      reviews: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Calculate rating for each company
  const companiesWithStats = companies.map(c => {
    let avgRating = 0;
    if (c.reviews.length > 0) {
      avgRating = c.reviews.reduce((acc, r) => acc + r.rating, 0) / c.reviews.length;
    }
    return {
      ...c,
      avgRating: avgRating.toFixed(1),
      reviewCount: c.reviews.length,
      activeJobs: c.jobs.length
    };
  });

  return (
    <main style={{ backgroundColor: "var(--surface)", minHeight: "100vh" }}>
      
      {/* Hero Section */}
      <section style={{ 
        backgroundColor: "var(--surface-hover)", 
        padding: "5rem 1.5rem", 
        textAlign: "center",
        borderBottom: "1px solid var(--border-light)"
      }}>
        <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ 
            fontSize: "3.5rem", 
            fontWeight: "900", 
            lineHeight: "1.2",
            marginBottom: "1.5rem",
            color: "var(--text-main)"
          }}>
            اكتشف أفضل بيئات العمل
          </h1>
          <p style={{ fontSize: "1.2rem", color: "var(--text-muted)", marginBottom: "2.5rem", lineHeight: "1.6" }}>
            تصفح آلاف الشركات، اقرأ تقييمات الموظفين الحقيقية، وقارن الرواتب والمزايا قبل اتخاذ قرار الانضمام.
          </p>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", maxWidth: "600px", margin: "0 auto" }}>
            <input 
              type="text" 
              placeholder="ابحث عن شركة (مثال: أرامكو، جوجل)" 
              style={{ flex: 1, padding: "1rem 1.5rem", borderRadius: "var(--radius-full)", border: "1px solid var(--border-light)", fontSize: "1.1rem", outline: "none" }}
            />
            <button className="btn btn-primary" style={{ padding: "1rem 2rem", borderRadius: "var(--radius-full)", fontWeight: "bold" }}>بحث</button>
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <section className="container" style={{ padding: "4rem 1.5rem" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>الشركات المتميزة هذا الشهر</h2>
          <select style={{ padding: "0.5rem 1rem", borderRadius: "4px", border: "1px solid var(--border-light)", backgroundColor: "var(--surface)" }}>
            <option>ترتيب حسب التقييم</option>
            <option>الأكثر وظائف</option>
            <option>الأحدث</option>
          </select>
        </div>

        {companiesWithStats.length === 0 ? (
          <div className="card text-center" style={{ padding: "4rem" }}>
            <p className="text-muted">لا توجد شركات مسجلة حالياً.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
            {companiesWithStats.map(company => (
              <Link href={`/companies/${company.id}`} key={company.id} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="card hover-scale" style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", padding: "0", overflow: "hidden", border: "1px solid var(--border-light)" }}>
                  
                  {/* Banner */}
                  <div style={{ height: "100px", backgroundColor: "var(--surface-hover)", backgroundImage: "linear-gradient(45deg, var(--surface-hover), var(--border-light))" }}></div>
                  
                  <div style={{ padding: "0 1.5rem 1.5rem 1.5rem", marginTop: "-30px" }}>
                    {/* Logo */}
                    <div style={{ width: "70px", height: "70px", backgroundColor: "white", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.5rem", color: "var(--primary)", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", marginBottom: "1rem", border: "1px solid var(--border-light)" }}>
                      {company.companyName.substring(0, 2).toUpperCase()}
                    </div>
                    
                    <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {company.companyName}
                      {Number(company.avgRating) >= 4.5 && (
                        <span title="شركة موثقة ومتميزة" style={{ color: "#10b981", fontSize: "1rem" }}>✔️</span>
                      )}
                    </h2>
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                      <span className="badge badge-outline" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}>{company.industry || "قطاع عام"}</span>
                      {Number(company.avgRating) >= 4.5 && <span className="badge" style={{ backgroundColor: "rgba(251, 191, 36, 0.1)", color: "#d97706", fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}>أفضل بيئة عمل 🏆</span>}
                    </div>
                    
                    <p className="text-muted" style={{ fontSize: "0.95rem", marginBottom: "1.5rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.5" }}>
                      {company.description || "لا يوجد وصف متوفر لهذه الشركة. يتم تحديث الملف الشخصي لاحقاً."}
                    </p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--surface-hover)", padding: "1rem 1.5rem", borderTop: "1px solid var(--border-light)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ color: "var(--accent)", fontWeight: "bold" }}>⭐ {company.avgRating}</span>
                      <span className="text-muted" style={{ fontSize: "0.85rem" }}>({company.reviewCount})</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)", fontWeight: "bold", fontSize: "0.9rem" }}>
                      <span>{company.activeJobs} وظيفة</span>
                      <span style={{ fontSize: "1.2rem", lineHeight: 0 }}>›</span>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
