import { prisma } from "@/lib/prisma";
import ApplyButton from "@/components/ApplyButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateMatchScore } from "@/lib/matching";

export default async function JobBoard({
  searchParams,
}: {
  searchParams: { search?: string; location?: string }
}) {
  const search = searchParams?.search || "";
  const location = searchParams?.location || "";
  const type = searchParams?.type || "";

  // Build the query
  const query: any = {
    where: { isActive: true },
    include: { company: true },
    orderBy: { createdAt: "desc" },
  };

  if (search) {
    query.where.title = { contains: search, mode: "insensitive" };
  }
  if (location) {
    query.where.location = { contains: location, mode: "insensitive" };
  }
  if (type) {
    query.where.type = type;
  }

  // Fetch from DB
  let jobs: any[] = [];
  try {
    jobs = await prisma.job.findMany(query);
  } catch (error) {
    console.log("Database connection failed, showing empty state");
  }

  // Fetch candidate profile to calculate match score
  const session = await getServerSession(authOptions);
  let candidateProfile = null;
  if (session && (session.user as any).role === "CANDIDATE") {
    candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId: (session.user as any).id }
    });
  }

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      <header className="mb-8">
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>استكشف الوظائف المتاحة</h1>
        <p className="text-muted">آلاف الفرص الوظيفية بانتظارك، قم بتصفية النتائج لتجد ما يناسبك</p>
      </header>

      {/* Horizontal Advanced Filters Bar */}
      <div className="card" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
        <form method="GET" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="input-group" style={{ flex: "1 1 250px", margin: 0 }}>
            <label className="input-label">ماذا تبحث عنه؟</label>
            <input name="search" defaultValue={search} placeholder="المسمى الوظيفي، الكلمات المفتاحية" className="input-field" />
          </div>

          <div className="input-group" style={{ flex: "1 1 200px", margin: 0 }}>
            <label className="input-label">المكان</label>
            <select name="location" defaultValue={location} className="input-field">
              <option value="">كل المناطق</option>
              <option value="الرياض">الرياض</option>
              <option value="جدة">جدة</option>
              <option value="دبي">دبي</option>
              <option value="القاهرة">القاهرة</option>
              <option value="عن بعد">عن بعد</option>
            </select>
          </div>

          <div className="input-group" style={{ flex: "1 1 200px", margin: 0 }}>
            <label className="input-label">نوع العمل</label>
            <select name="type" defaultValue={type} className="input-field">
              <option value="">جميع الأنواع</option>
              <option value="FULL_TIME">دوام كامل</option>
              <option value="PART_TIME">دوام جزئي</option>
              <option value="REMOTE">عن بعد</option>
            </select>
          </div>
          
          <button type="submit" className="btn btn-primary hover-scale" style={{ flex: "0 0 auto", height: "46px", padding: "0 2rem" }}>
            بحث 🔍
          </button>
        </form>
      </div>

      <div>
        {/* Jobs List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {jobs.length === 0 ? (
            <div className="card text-center" style={{ padding: "3rem" }}>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>لا توجد وظائف مطابقة</h3>
              <p className="text-muted">جرب تغيير كلمات البحث أو الفلاتر</p>
            </div>
          ) : (
            jobs.map((job) => {
              // Calculate score if profile exists
              let score = null;
              if (candidateProfile) {
                score = calculateMatchScore({
                  skills: candidateProfile.skills || "",
                  experienceYears: candidateProfile.experienceYears || 0,
                  specialization: candidateProfile.specialization
                }, job);
              }

              return (
              <div key={job.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                  <div style={{ width: "64px", height: "64px", backgroundColor: "var(--surface-hover)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.25rem", color: "var(--primary)" }}>
                    {job.company.companyName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {job.title}
                      {job.source !== "INTERNAL" && (
                        <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", backgroundColor: "var(--accent)20", color: "var(--accent)", borderRadius: "var(--radius-full)" }}>
                          من {job.source}
                        </span>
                      )}
                      {score !== null && (
                        <span style={{ fontSize: "0.8rem", padding: "0.2rem 0.5rem", backgroundColor: score > 75 ? "var(--secondary)20" : score > 40 ? "var(--accent)20" : "#ef444420", color: score > 75 ? "var(--secondary)" : score > 40 ? "var(--accent)" : "#ef4444", borderRadius: "var(--radius-full)" }}>
                          نسبة التوافق: %{score}
                        </span>
                      )}
                    </h3>
                    <p className="text-muted" style={{ marginBottom: "0.5rem" }}>{job.company.companyName}</p>
                    <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "var(--text-light)" }}>
                      <span>📍 {job.location}</span>
                      {job.salary && <span>💰 {job.salary}</span>}
                      <span>💼 {job.type === "FULL_TIME" ? "دوام كامل" : job.type === "REMOTE" ? "عن بعد" : job.type}</span>
                    </div>
                  </div>
                </div>
                <div>
                  {job.externalUrl ? (
                    <a href={job.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ textDecoration: "none" }}>
                      التقديم في الموقع الأصلي 🔗
                    </a>
                  ) : (
                    <ApplyButton jobId={job.id} />
                  )}
                </div>
              </div>
            )})
          )}

        </div>
      </div>
    </main>
  );
}
