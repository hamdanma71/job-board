import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CVUploadButton from "@/components/CVUploadButton";
import EditProfileModal from "@/components/EditProfileModal";
import NotificationBell from "@/components/NotificationBell";

export default async function CandidateDashboard() {
  const session = await getServerSession(authOptions);
  console.log("Candidate Dashboard Session:", JSON.stringify(session, null, 2));

  const role = session ? (session.user as any).role : null;
  if (!session || (role !== "CANDIDATE" && role !== "ADMIN")) {
    return (
      <main className="container text-center" style={{ padding: "5rem" }}>
        <h2>غير مصرح لك بالدخول. يرجى تسجيل الدخول كباحث عن عمل.</h2>
        <p className="text-muted mt-4">الدور الحالي: {session ? (session.user as any).role || 'غير محدد' : 'لا يوجد جلسة'}</p>
      </main>
    );
  }

  const userId = (session.user as any).id;
  const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
  
  let applications: any[] = [];
  try {
    applications = await prisma.application.findMany({
      where: { candidateId: userId },
      include: {
        job: {
          include: { company: true }
        }
      },
      orderBy: { appliedAt: "desc" }
    });
  } catch (error) {
    console.log("Database connection failed, showing empty state");
  }

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      <header className="flex-between mb-8">
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>مرحباً بك في لوحة التحكم</h1>
          <p className="text-muted">نحن هنا لمساعدتك في بناء مسيرتك المهنية</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <NotificationBell />
          <Link href="/jobs" className="btn btn-primary">تصفح الوظائف</Link>
          <Link href="/" className="btn btn-outline">الرئيسية</Link>
        </div>
      </header>

      <div className="grid-2">
        {/* Profile Summary */}
        <div className="card">
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem" }}>الملف الشخصي</h2>
          
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-light)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>الجنسية والتأشيرة</h3>
            <p>{profile?.nationality ? profile.nationality : "الجنسية غير محددة"} • {profile?.visaStatus ? profile.visaStatus : "حالة التأشيرة غير محددة"}</p>
          </div>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-light)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>التخصص والموقع</h3>
            <p>{profile?.specialization ? profile.specialization : "التخصص غير محدد"} • {profile?.location ? profile.location : "الموقع غير محدد"}</p>
          </div>

          <div style={{ marginBottom: "1.5rem", padding: "1rem" }}>
            <p className="text-muted" style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>النبذة التعريفية</p>
            <p>{profile?.bio || "قم برفع سيرتك الذاتية لتوليد النبذة التعريفية تلقائياً"}</p>
          </div>

          <div style={{ marginBottom: "1.5rem", padding: "0 1rem" }}>
            <p className="text-muted" style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>أهم المهارات المستخرجة</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {profile?.skills ? (
                (() => {
                  try {
                    const skillsArray = JSON.parse(profile.skills);
                    return Array.isArray(skillsArray) ? skillsArray.map((skill: string, index: number) => (
                      <span key={index} className="badge badge-primary">{skill}</span>
                    )) : <span className="badge badge-primary">{profile.skills}</span>;
                  } catch (e) {
                    return <span className="badge badge-primary">{profile.skills}</span>;
                  }
                })()
              ) : (
                <p className="text-muted" style={{ fontSize: "0.85rem" }}>لم يتم إضافة مهارات بعد</p>
              )}
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", padding: "0 1rem", marginBottom: "1.5rem" }}>
            <Link href="/jobs" className="btn btn-primary" style={{ padding: "0.5rem 1rem", textDecoration: "none" }}>
              البحث عن وظائف
            </Link>
            <Link href="/dashboard/candidate/alerts" className="btn btn-outline" style={{ padding: "0.5rem 1rem", textDecoration: "none" }}>
              إدارة التنبيهات 🔔
            </Link>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <EditProfileModal 
              initialName={(session.user as any).name || ""}
              initialBio={profile?.bio || ""}
              initialSkills={profile?.skills || ""}
              initialLocation={profile?.location || ""}
              initialExperience={profile?.experienceYears || 0}
              initialNationality={profile?.nationality || ""}
              initialVisaStatus={profile?.visaStatus || ""}
              initialSpecialization={profile?.specialization || ""}
            />
            <CVUploadButton />
          </div>
        </div>

        {/* Applications List */}
        <div className="card">
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem" }}>طلبات التوظيف الأخيرة</h2>
          <ul style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {applications.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: "2rem 0" }}>لم تقم بالتقديم على أي وظيفة بعد</p>
            ) : (
              applications.map((app) => (
                <li key={app.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)" }}>
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: "bold" }}>{app.job.title}</h3>
                    <span className="text-muted" style={{ fontSize: "0.85rem" }}>{app.job.company?.companyName} • {new Date(app.appliedAt).toLocaleDateString("ar-SA")}</span>
                  </div>
                  <span style={{ 
                    padding: "0.25rem 0.75rem", 
                    backgroundColor: app.status === "PENDING" ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)", 
                    color: app.status === "PENDING" ? "var(--accent)" : "var(--secondary)", 
                    borderRadius: "var(--radius-full)", 
                    fontSize: "0.85rem", 
                    fontWeight: "bold" 
                  }}>
                    {app.status === "PENDING" ? "قيد المراجعة" : app.status}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}
