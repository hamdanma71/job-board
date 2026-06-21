import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function RemoteJobsPage() {
  let remoteJobs: any[] = [];
  try {
    remoteJobs = await prisma.job.findMany({
      where: { type: "REMOTE" },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { company: true }
    });
  } catch (e) {
    console.error(e);
  }

  return (
    <main>
      {/* Hero Section */}
      <section style={{ 
        backgroundColor: "var(--surface-hover)", 
        padding: "5rem 1.5rem", 
        textAlign: "center",
        borderBottom: "1px solid var(--border-light)"
      }}>
        <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", padding: "0.5rem 1rem", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--secondary)", borderRadius: "var(--radius-full)", fontWeight: "bold", marginBottom: "1.5rem" }}>
            🌍 العمل من أي مكان
          </div>
          <h1 style={{ 
            fontSize: "3rem", 
            fontWeight: "900", 
            lineHeight: "1.2",
            marginBottom: "1.5rem",
            color: "var(--text-main)"
          }}>
            وظائف عن بُعد لأفضل المواهب
          </h1>
          <p style={{ fontSize: "1.2rem", color: "var(--text-muted)", marginBottom: "2.5rem", lineHeight: "1.6" }}>
            وداعاً للتنقل اليومي وازدحام المرور. اكتشف مئات الفرص الوظيفية التي تتيح لك العمل بحرية من منزلك أو من أي مكان في العالم.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/jobs?search=&location=Remote" className="btn btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem" }}>
              تصفح جميع الوظائف عن بعد
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="container" style={{ padding: "5rem 1.5rem" }}>
        <div className="flex-between mb-8">
          <div>
            <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>أحدث الفرص المتاحة</h2>
            <p className="text-muted">وظائف جديدة تضاف يومياً</p>
          </div>
        </div>

        {remoteJobs.length === 0 ? (
          <div className="card text-center" style={{ padding: "3rem" }}>
            <p className="text-muted">لا توجد وظائف عن بعد منشورة حالياً.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {remoteJobs.map((job) => (
              <div key={job.id} className="card hover-scale" style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <span className="badge badge-secondary">عن بعد</span>
                  <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                    {new Date(job.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{job.title}</h3>
                <p className="text-muted" style={{ fontSize: "0.95rem", marginBottom: "1.5rem", flex: 1 }}>
                  {job.company?.companyName || "شركة غير محددة"}
                </p>
                <Link href={`/jobs/${job.id}`} className="btn btn-outline" style={{ width: "100%", textAlign: "center" }}>
                  التفاصيل والتقديم
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Benefits Section */}
      <section style={{ backgroundColor: "var(--surface)", padding: "5rem 1.5rem", borderTop: "1px solid var(--border-light)" }}>
        <div className="container text-center">
          <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "3rem" }}>لماذا تختار العمل عن بعد؟</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
            <div className="card" style={{ padding: "2rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>مرونة في الوقت</h3>
              <p className="text-muted">أنجز مهامك في الأوقات التي تكون فيها بأعلى مستويات الإنتاجية.</p>
            </div>
            <div className="card" style={{ padding: "2rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✈️</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>حرية الموقع</h3>
              <p className="text-muted">سافر واعمل من أي مدينة أو مقهى مفضل لديك حول العالم.</p>
            </div>
            <div className="card" style={{ padding: "2rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💰</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>توفير النفقات</h3>
              <p className="text-muted">وفر أموال المواصلات وتكاليف الطعام خارج المنزل يومياً.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
