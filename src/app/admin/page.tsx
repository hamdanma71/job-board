import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    return (
      <main className="container text-center" style={{ padding: "5rem" }}>
        <h2>غير مصرح لك بالوصول إلى لوحة الإدارة</h2>
        <Link href="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>العودة للرئيسية</Link>
      </main>
    );
  }

  // Fetch Stats
  const usersCount = await prisma.user.count();
  const candidatesCount = await prisma.candidateProfile.count();
  const companiesCount = await prisma.companyProfile.count();
  const jobsCount = await prisma.job.count();
  const applicationsCount = await prisma.application.count();

  // Fetch Companies for verification management
  const companies = await prisma.companyProfile.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      <header className="flex-between mb-8">
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>لوحة تحكم الإدارة (Admin)</h1>
          <p className="text-muted">نظرة عامة على أداء المنصة وإدارة الشركات</p>
        </div>
        <Link href="/" className="btn btn-outline">الرئيسية</Link>
      </header>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        <div className="card text-center">
          <span style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--primary)" }}>{usersCount}</span>
          <p className="text-muted">إجمالي المستخدمين</p>
        </div>
        <div className="card text-center">
          <span style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--secondary)" }}>{candidatesCount}</span>
          <p className="text-muted">الباحثين عن عمل</p>
        </div>
        <div className="card text-center">
          <span style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--accent)" }}>{companiesCount}</span>
          <p className="text-muted">الشركات المسجلة</p>
        </div>
        <div className="card text-center">
          <span style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#3b82f6" }}>{jobsCount}</span>
          <p className="text-muted">الوظائف المنشورة</p>
        </div>
        <div className="card text-center">
          <span style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#8b5cf6" }}>{applicationsCount}</span>
          <p className="text-muted">الطلبات المقدمة</p>
        </div>
      </div>

      {/* Companies Management */}
      <div className="card">
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>إدارة وتوثيق الشركات</h2>
        
        {companies.length === 0 ? (
          <p className="text-muted text-center">لا توجد شركات مسجلة بعد.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "right", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-light)" }}>
                  <th style={{ padding: "1rem" }}>اسم الشركة</th>
                  <th style={{ padding: "1rem" }}>البريد الإلكتروني</th>
                  <th style={{ padding: "1rem", textAlign: "center" }}>الباقة الحالية</th>
                  <th style={{ padding: "1rem", textAlign: "center" }}>حالة التوثيق</th>
                  <th style={{ padding: "1rem", textAlign: "center" }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(company => (
                  <tr key={company.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "1rem", fontWeight: "bold" }}>{company.companyName}</td>
                    <td style={{ padding: "1rem" }}>{company.user?.email}</td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <span style={{ padding: "0.2rem 0.6rem", backgroundColor: company.subscriptionTier === "PRO" ? "var(--primary)20" : "var(--surface-hover)", color: company.subscriptionTier === "PRO" ? "var(--primary)" : "var(--text)", borderRadius: "var(--radius-full)", fontSize: "0.85rem" }}>
                        {company.subscriptionTier}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      {company.isVerified ? (
                        <span style={{ color: "var(--secondary)", fontWeight: "bold" }}>✔️ موثقة</span>
                      ) : (
                        <span className="text-muted">غير موثقة</span>
                      )}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <form action={async () => {
                        "use server";
                        await prisma.companyProfile.update({
                          where: { id: company.id },
                          data: { isVerified: !company.isVerified }
                        });
                      }}>
                        <button type="submit" className="btn btn-outline" style={{ padding: "0.3rem 0.6rem", fontSize: "0.85rem" }}>
                          {company.isVerified ? "إلغاء التوثيق" : "توثيق الشركة"}
                        </button>
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
