import { prisma } from "@/lib/prisma";

export default async function SalariesPage() {
  // Fetch reviews with salary and position
  const reviews = await prisma.review.findMany({
    where: { 
      salary: { not: null },
      position: { not: null }
    },
    include: {
      company: true
    }
  });

  // Group by position
  const salaryData: Record<string, { min: number, max: number, avg: number, count: number, samples: any[] }> = {};

  reviews.forEach(review => {
    if (!review.position || !review.salary) return;
    
    // Attempt to parse salary number. E.g., "15000", "15,000", "15k"
    const parsed = review.salary.replace(/[^0-9]/g, "");
    const salaryNum = parseInt(parsed);
    
    if (isNaN(salaryNum) || salaryNum < 1000) return; // ignore invalid or very small numbers

    const pos = review.position.trim().toLowerCase();
    
    if (!salaryData[pos]) {
      salaryData[pos] = { min: salaryNum, max: salaryNum, avg: 0, count: 0, samples: [] };
    }

    salaryData[pos].count++;
    salaryData[pos].min = Math.min(salaryData[pos].min, salaryNum);
    salaryData[pos].max = Math.max(salaryData[pos].max, salaryNum);
    salaryData[pos].samples.push(salaryNum);
  });

  // Calculate averages
  Object.keys(salaryData).forEach(pos => {
    const total = salaryData[pos].samples.reduce((a, b) => a + b, 0);
    salaryData[pos].avg = Math.round(total / salaryData[pos].count);
  });

  // Convert to array and sort by count (most popular)
  const salaryList = Object.keys(salaryData)
    .map(pos => ({ position: pos, ...salaryData[pos] }))
    .sort((a, b) => b.count - a.count);

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      <header className="mb-8 text-center">
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>استكشاف الرواتب</h1>
        <p className="text-muted">تعرف على متوسط الرواتب في السوق للمسميات الوظيفية المختلفة بناءً على تقييمات الموظفين الحقيقية</p>
      </header>

      <div className="card">
        {salaryList.length === 0 ? (
          <div className="text-center" style={{ padding: "3rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>لا توجد بيانات كافية</h2>
            <p className="text-muted">لم يقم الموظفون بمشاركة رواتبهم بعد. كن أول من يشارك عبر تقييم شركتك!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem", padding: "1rem 0" }}>
            {salaryList.map((item, idx) => (
              <div key={idx} className="card hover-scale" style={{ border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", textTransform: "capitalize", margin: 0 }}>{item.position}</h3>
                  <span style={{ backgroundColor: "var(--surface-hover)", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", fontSize: "0.8rem", color: "var(--text-light)" }}>
                    {item.count} مشاركات
                  </span>
                </div>
                
                <div style={{ textAlign: "center", padding: "1rem 0", borderBottom: "1px solid var(--border-light)" }}>
                  <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.3rem" }}>متوسط الراتب</p>
                  <p style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary)", margin: 0 }}>
                    {item.avg.toLocaleString()} <span style={{ fontSize: "1rem", color: "var(--text-light)" }}>ريال</span>
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9rem" }}>
                  <div style={{ textAlign: "right" }}>
                    <p className="text-muted" style={{ fontSize: "0.75rem", margin: 0 }}>الحد الأدنى</p>
                    <p style={{ color: "#ef4444", fontWeight: "bold", margin: 0 }}>{item.min.toLocaleString()}</p>
                  </div>
                  
                  {/* Progress bar visualizer */}
                  <div style={{ flex: "1", height: "8px", backgroundColor: "var(--surface-hover)", margin: "0 1rem", borderRadius: "var(--radius-full)", position: "relative", overflow: "hidden" }}>
                     <div style={{ position: "absolute", left: "20%", right: "20%", top: 0, bottom: 0, backgroundColor: "var(--primary)40", borderRadius: "var(--radius-full)" }}></div>
                     <div style={{ position: "absolute", left: "50%", top: "-2px", bottom: "-2px", width: "4px", backgroundColor: "var(--primary)", borderRadius: "var(--radius-full)", transform: "translateX(-50%)" }}></div>
                  </div>

                  <div style={{ textAlign: "left" }}>
                    <p className="text-muted" style={{ fontSize: "0.75rem", margin: 0 }}>الحد الأعلى</p>
                    <p style={{ color: "var(--secondary)", fontWeight: "bold", margin: 0 }}>{item.max.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
