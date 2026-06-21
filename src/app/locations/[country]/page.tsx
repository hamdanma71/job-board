import Link from "next/link";
import { prisma } from "@/lib/prisma";

const countryData: Record<string, { name: string, flag: string, color: string }> = {
  "saudi-arabia": { name: "السعودية", flag: "🇸🇦", color: "#006C35" },
  "uae": { name: "الإمارات", flag: "🇦🇪", color: "#FF0000" },
  "egypt": { name: "مصر", flag: "🇪🇬", color: "#CE1126" },
  "qatar": { name: "قطر", flag: "🇶🇦", color: "#8A1538" },
};

export default async function CountryHub({ params }: { params: Promise<{ country: string }> }) {
  const { country: countryParam } = await params;
  const country = countryData[countryParam];
  
  if (!country) {
    return (
      <main className="container text-center" style={{ padding: "5rem" }}>
        <h1>الدولة غير مدعومة حالياً</h1>
        <Link href="/locations" className="btn btn-outline mt-4">العودة لدليل الدول</Link>
      </main>
    );
  }

  let latestJobs: any[] = [];
  try {
    latestJobs = await prisma.job.findMany({
      where: {
        location: { contains: country.name }
      },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { company: true }
    });
  } catch (error) {
    console.error(error);
  }

  return (
    <main>
      {/* Country Hero */}
      <section style={{ 
        backgroundColor: "var(--surface)", 
        padding: "4rem 1.5rem", 
        borderBottom: `4px solid ${country.color}`
      }}>
        <div className="container flex-between">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "4rem" }}>{country.flag}</span>
              <h1 style={{ fontSize: "3rem", fontWeight: "bold" }}>وظائف في {country.name}</h1>
            </div>
            <p className="text-muted" style={{ fontSize: "1.2rem", maxWidth: "600px" }}>
              استكشف أحدث الفرص الوظيفية في سوق العمل المتنامي في {country.name}. نوفر لك تحليلات الرواتب وأهم الشركات الباحثة عن مواهب.
            </p>
          </div>
          <div className="card" style={{ padding: "2rem", textAlign: "center", minWidth: "250px" }}>
            <span style={{ display: "block", fontSize: "2.5rem", fontWeight: "bold", color: "var(--primary)" }}>+2,000</span>
            <span className="text-muted">وظيفة نشطة هذا الشهر</span>
            <Link href={`/jobs?location=${country.name}`} className="btn btn-primary mt-4" style={{ width: "100%" }}>
              تصفح كل الوظائف
            </Link>
          </div>
        </div>
      </section>

      <div className="container" style={{ padding: "4rem 1.5rem", display: "grid", gridTemplateColumns: "2fr 1fr", gap: "3rem" }}>
        
        {/* Main Content */}
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>أحدث الوظائف المضافة</h2>
          
          {latestJobs.length === 0 ? (
            <div className="card text-center" style={{ padding: "3rem" }}>
              <p className="text-muted">لا توجد وظائف معلنة حالياً في {country.name}</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {latestJobs.map(job => (
                <div key={job.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.25rem" }}>{job.title}</h3>
                    <p className="text-muted" style={{ fontSize: "0.9rem" }}>{job.company?.companyName} • {job.location}</p>
                  </div>
                  <Link href={`/jobs/${job.id}`} className="btn btn-outline">التفاصيل</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar / Market Insights */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          <div className="card">
            <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1rem" }}>رؤى سوق العمل (Market Insights)</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
              <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem" }}>
                <span className="text-muted">متوسط الرواتب (التقنية)</span>
                <span style={{ fontWeight: "bold" }}>$4,500</span>
              </li>
              <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem" }}>
                <span className="text-muted">أعلى طلب</span>
                <span style={{ fontWeight: "bold" }}>مطور برمجيات</span>
              </li>
              <li style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="text-muted">نظام العمل الشائع</span>
                <span style={{ fontWeight: "bold" }}>هجين (Hybrid)</span>
              </li>
            </ul>
            <Link href="/salaries" className="btn btn-outline mt-4" style={{ width: "100%" }}>
              تقرير الرواتب الكامل
            </Link>
          </div>

          <div className="card" style={{ backgroundColor: "var(--surface-hover)" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>هل توظف في {country.name}؟</h3>
            <p className="text-muted" style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
              الوصول إلى آلاف المرشحين المؤهلين والمحليين بأسرع وقت.
            </p>
            <Link href="/register" className="btn btn-primary" style={{ width: "100%" }}>
              سجل شركتك الآن
            </Link>
          </div>

        </div>

      </div>
    </main>
  );
}
