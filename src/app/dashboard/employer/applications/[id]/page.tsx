import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ApplicationStatusUpdater from "@/components/ApplicationStatusUpdater";

export default async function ApplicationDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "EMPLOYER") {
    return <main className="container text-center" style={{ padding: "5rem" }}><h2>غير مصرح</h2></main>;
  }

  const userId = (session.user as any).id;
  const company = await prisma.companyProfile.findUnique({ where: { userId } });

  if (!company) return <main className="container text-center" style={{ padding: "5rem" }}><h2>ملف الشركة غير موجود</h2></main>;

  const application = await prisma.application.findUnique({
    where: { id: params.id },
    include: {
      job: true,
      candidate: {
        include: { candidateProfile: true }
      }
    }
  });

  if (!application || application.job.companyId !== company.id) {
    return <main className="container text-center" style={{ padding: "5rem" }}><h2>طلب التوظيف غير موجود أو لا تملك صلاحية الوصول</h2></main>;
  }

  const profile = application.candidate.candidateProfile;

  return (
    <main className="container" style={{ padding: "3rem 1.5rem", maxWidth: "900px" }}>
      <header className="flex-between mb-8">
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>تفاصيل المرشح</h1>
          <p className="text-muted">متقدم لوظيفة: {application.job.title}</p>
        </div>
        <Link href={`/dashboard/employer/jobs/${application.jobId}`} className="btn btn-outline">العودة لقائمة المتقدمين</Link>
      </header>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: "1.25rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>المعلومات الأساسية</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>الاسم الكامل</p>
              <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{application.candidate.name}</p>
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>البريد الإلكتروني</p>
              <p>{application.candidate.email}</p>
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>المدينة / الدولة</p>
              <p>{profile?.location || "غير محدد"}</p>
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>سنوات الخبرة</p>
              <p>{profile?.experienceYears || 0} سنوات</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: "1.25rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>تحديث حالة الطلب (ATS)</h2>
          <ApplicationStatusUpdater applicationId={application.id} currentStatus={application.status} />
        </div>
      </div>

      <div className="card mt-8">
        <h2 style={{ fontSize: "1.25rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>النبذة والمهارات المستخرجة (AI)</h2>
        
        <div style={{ marginBottom: "1.5rem" }}>
          <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>النبذة التعريفية</p>
          <p style={{ lineHeight: "1.6" }}>{profile?.bio || "لا توجد نبذة"}</p>
        </div>

        <div>
          <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>المهارات المذكورة</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {profile?.skills ? (
              (() => {
                try {
                  const arr = JSON.parse(profile.skills);
                  if (Array.isArray(arr)) return arr.map((s, i) => <span key={i} className="badge badge-primary">{s}</span>);
                  return <span className="badge badge-primary">{profile.skills}</span>;
                } catch(e) {
                  return <span className="badge badge-primary">{profile.skills}</span>;
                }
              })()
            ) : <p className="text-muted">لا توجد مهارات</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
