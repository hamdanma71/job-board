import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
    <main className="container animate-fade-in" style={{ padding: "4rem 1.5rem" }}>
      <header className="flex-between mb-8" style={{ background: "var(--surface)", padding: "2rem", borderRadius: "var(--radius-lg)", border: "var(--glass-border)", boxShadow: "var(--shadow-glass)" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", background: "linear-gradient(135deg, var(--primary), var(--secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>لوحة التحكم الذكية (Admin)</h1>
          <p className="text-muted" style={{ marginTop: "0.5rem" }}>نظرة شاملة على أداء المنصة وإدارة الشركات بصلاحيات مطلقة</p>
        </div>
        <Link href="/" className="btn btn-outline">العودة للرئيسية</Link>
      </header>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        <div className="card text-center" style={{ borderTop: "4px solid var(--primary)" }}>
          <span style={{ fontSize: "3rem", fontWeight: "900", color: "var(--primary)" }}>{usersCount}</span>
          <p style={{ color: "var(--text-muted)", fontWeight: "600", marginTop: "0.5rem" }}>إجمالي المستخدمين</p>
        </div>
        <div className="card text-center" style={{ borderTop: "4px solid var(--secondary)" }}>
          <span style={{ fontSize: "3rem", fontWeight: "900", color: "var(--secondary)" }}>{candidatesCount}</span>
          <p style={{ color: "var(--text-muted)", fontWeight: "600", marginTop: "0.5rem" }}>الباحثين عن عمل</p>
        </div>
        <div className="card text-center" style={{ borderTop: "4px solid var(--accent)" }}>
          <span style={{ fontSize: "3rem", fontWeight: "900", color: "var(--accent)" }}>{companiesCount}</span>
          <p style={{ color: "var(--text-muted)", fontWeight: "600", marginTop: "0.5rem" }}>الشركات المسجلة</p>
        </div>
        <div className="card text-center" style={{ borderTop: "4px solid #8b5cf6" }}>
          <span style={{ fontSize: "3rem", fontWeight: "900", color: "#8b5cf6" }}>{jobsCount}</span>
          <p style={{ color: "var(--text-muted)", fontWeight: "600", marginTop: "0.5rem" }}>الوظائف الفعالة</p>
        </div>
        <div className="card text-center" style={{ borderTop: "4px solid #14b8a6" }}>
          <span style={{ fontSize: "3rem", fontWeight: "900", color: "#14b8a6" }}>{applicationsCount}</span>
          <p style={{ color: "var(--text-muted)", fontWeight: "600", marginTop: "0.5rem" }}>عمليات التقديم</p>
        </div>
      </div>

      {/* Companies Management */}
      <div className="card" style={{ padding: "0" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-light)" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>إدارة وتوثيق الشركات 🏢</h2>
        </div>
        
        {companies.length === 0 ? (
          <p className="text-muted text-center" style={{ padding: "3rem" }}>لا توجد شركات مسجلة بعد.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "right", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "var(--surface-hover)" }}>
                <tr>
                  <th style={{ padding: "1.5rem 1rem", color: "var(--text-muted)" }}>اسم الشركة</th>
                  <th style={{ padding: "1.5rem 1rem", color: "var(--text-muted)" }}>البريد الإلكتروني</th>
                  <th style={{ padding: "1.5rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>الباقة الحالية</th>
                  <th style={{ padding: "1.5rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>حالة التوثيق</th>
                  <th style={{ padding: "1.5rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(company => (
                  <tr key={company.id} style={{ borderBottom: "1px solid var(--border-light)", transition: "background-color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
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
                    </td>
                    <td style={{ padding: "1.5rem 1rem", textAlign: "center" }}>
                      {company.isVerified ? (
                        <span style={{ color: "var(--secondary)", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          <span style={{ width: "8px", height: "8px", backgroundColor: "var(--secondary)", borderRadius: "50%" }}></span> موثقة
                        </span>
                      ) : (
                        <span style={{ color: "var(--accent)", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          <span style={{ width: "8px", height: "8px", backgroundColor: "var(--accent)", borderRadius: "50%" }}></span> بانتظار التوثيق
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "1.5rem 1rem", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        <form action={async () => {
                          "use server";
                          await prisma.companyProfile.update({
                            where: { id: company.id },
                            data: { isVerified: !company.isVerified }
                          });
                          revalidatePath('/admin');
                        }}>
                          <button type="submit" className="btn btn-outline" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", borderRadius: "var(--radius-full)" }}>
                            {company.isVerified ? "إلغاء التوثيق" : "توثيق الشركة"}
                          </button>
                        </form>
                        <form action={async () => {
                          "use server";
                          await prisma.companyProfile.delete({ where: { id: company.id } });
                          revalidatePath('/admin');
                        }}>
                          <button type="submit" className="btn" style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", borderRadius: "var(--radius-full)", background: "rgba(244, 63, 94, 0.1)", color: "var(--accent)" }}>
                            حذف
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
    </main>
  );
}
