import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CandidateNotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "CANDIDATE") {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="container animate-fade-in" style={{ padding: "3rem 1.5rem" }}>
      <header className="mb-8 flex-between">
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>مركز الإشعارات 🔔</h1>
          <p className="text-muted" style={{ marginTop: "0.5rem" }}>تتبع جميع تحديثات طلباتك والتنبيهات الخاصة بك</p>
        </div>
        <Link href="/dashboard/candidate" className="btn btn-outline" style={{ borderRadius: "var(--radius-full)" }}>
          العودة للوحة التحكم
        </Link>
      </header>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {notifications.length === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>📭</div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>لا توجد إشعارات بعد</h3>
            <p className="text-muted">سنقوم بتنبيهك فور وجود أي تحديثات على طلبات التوظيف الخاصة بك.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {notifications.map(n => (
              <div key={n.id} style={{ 
                padding: "1.5rem", 
                borderBottom: "1px solid var(--border-light)",
                backgroundColor: n.isRead ? "transparent" : "rgba(79, 70, 229, 0.03)",
                display: "flex",
                gap: "1.5rem",
                alignItems: "flex-start"
              }}>
                <div style={{ 
                  width: "48px", height: "48px", 
                  borderRadius: "50%", 
                  backgroundColor: n.isRead ? "var(--surface-hover)" : "rgba(79, 70, 229, 0.1)",
                  color: n.isRead ? "var(--text-muted)" : "var(--primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.2rem",
                  flexShrink: 0
                }}>
                  {n.title.includes("طلب التوظيف") ? "💼" : "🔔"}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div className="flex-between mb-2">
                    <h3 style={{ fontSize: "1.1rem", fontWeight: n.isRead ? "600" : "bold", color: n.isRead ? "var(--text-main)" : "var(--primary)" }}>
                      {n.title}
                    </h3>
                    <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                      {new Date(n.createdAt).toLocaleDateString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
