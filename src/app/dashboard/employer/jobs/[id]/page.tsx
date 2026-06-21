import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateMatchScore } from "@/lib/matching";

export default async function JobATSPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "EMPLOYER") {
    return <main className="container text-center" style={{ padding: "5rem" }}><h2>غير مصرح</h2></main>;
  }

  const userId = (session.user as any).id;
  const company = await prisma.companyProfile.findUnique({ where: { userId } });

  if (!company) return <main className="container text-center" style={{ padding: "5rem" }}><h2>ملف الشركة غير موجود</h2></main>;

  const job = await prisma.job.findUnique({
    where: { id: params.id, companyId: company.id },
    include: {
      applications: {
        include: {
          candidate: {
            include: { candidateProfile: true }
          }
        }
      }
    }
  });

  if (!job) return <main className="container text-center" style={{ padding: "5rem" }}><h2>الوظيفة غير موجودة أو لا تملك صلاحية الوصول</h2></main>;

  // Calculate match scores and sort
  const applicationsWithScore = job.applications.map(app => {
    const profile = app.candidate.candidateProfile;
    const score = profile ? calculateMatchScore(
      { skills: profile.skills || "", experienceYears: profile.experienceYears || 0, specialization: profile.specialization },
      job
    ) : 0;
    return { ...app, score };
  });

  applicationsWithScore.sort((a, b) => b.score - a.score);

  // Function to render status badge
  const renderStatus = (status: string) => {
    const colors: Record<string, string> = {
      "PENDING": "var(--accent)", // Orange/yellow
      "REVIEWED": "#3b82f6", // Blue
      "INTERVIEW": "#8b5cf6", // Purple
      "ACCEPTED": "var(--secondary)", // Green
      "REJECTED": "#ef4444" // Red
    };
    const labels: Record<string, string> = {
      "PENDING": "مرشح جديد",
      "REVIEWED": "تمت المراجعة",
      "INTERVIEW": "مقابلة",
      "ACCEPTED": "عرض وظيفي",
      "REJECTED": "مرفوض"
    };

    return (
      <span style={{ padding: "0.25rem 0.75rem", backgroundColor: `${colors[status]}20`, color: colors[status], borderRadius: "var(--radius-full)", fontSize: "0.85rem", fontWeight: "bold" }}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      <header className="flex-between mb-8">
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>إدارة المتقدمين (ATS)</h1>
          <p className="text-muted">الوظيفة: {job.title} • {job.applications.length} متقدم</p>
        </div>
        <Link href="/dashboard/employer" className="btn btn-outline">العودة للوحة التحكم</Link>
      </header>

      <div className="card">
        {applicationsWithScore.length === 0 ? (
          <p className="text-muted text-center" style={{ padding: "3rem" }}>لا يوجد متقدمين لهذه الوظيفة حتى الآن.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "right", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-light)" }}>
                  <th style={{ padding: "1rem" }}>اسم المرشح</th>
                  <th style={{ padding: "1rem", textAlign: "center" }}>نسبة التوافق</th>
                  <th style={{ padding: "1rem" }}>الخبرة والتخصص</th>
                  <th style={{ padding: "1rem" }}>الحالة الحالية</th>
                  <th style={{ padding: "1rem", textAlign: "center" }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {applicationsWithScore.map((app) => (
                  <tr key={app.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "1rem" }}>
                      <strong>{app.candidate.name}</strong><br/>
                      <span className="text-muted" style={{ fontSize: "0.85rem" }}>{app.candidate.email}</span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <span style={{ 
                        display: "inline-block", 
                        padding: "0.4rem 0.8rem", 
                        backgroundColor: app.score > 75 ? "var(--secondary)20" : app.score > 40 ? "var(--accent)20" : "#ef444420", 
                        color: app.score > 75 ? "var(--secondary)" : app.score > 40 ? "var(--accent)" : "#ef4444", 
                        fontWeight: "bold", 
                        borderRadius: "var(--radius-md)" 
                      }}>
                        {app.score}%
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ fontSize: "0.9rem", display: "block" }}>{app.candidate.candidateProfile?.experienceYears || 0} سنوات خبرة</span>
                      <span className="text-muted" style={{ fontSize: "0.85rem", display: "block" }}>{app.candidate.candidateProfile?.specialization || "غير محدد"}</span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {renderStatus(app.status)}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <Link href={`/dashboard/employer/applications/${app.id}`} className="btn btn-outline" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}>
                        عرض وتغيير الحالة
                      </Link>
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
