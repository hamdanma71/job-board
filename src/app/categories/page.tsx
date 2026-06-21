import Link from "next/link";
import { prisma } from "@/lib/prisma";

const categoriesList = [
  { id: "tech", name: "التقنية والبرمجة", icon: "💻", count: 1240 },
  { id: "health", name: "الطب والرعاية الصحية", icon: "🏥", count: 850 },
  { id: "engineering", name: "الهندسة والمقاولات", icon: "🏗️", count: 720 },
  { id: "finance", name: "المحاسبة والمالية", icon: "📊", count: 650 },
  { id: "sales", name: "المبيعات والتسويق", icon: "📈", count: 1500 },
  { id: "design", name: "التصميم والفنون", icon: "🎨", count: 430 },
  { id: "education", name: "التعليم والتدريب", icon: "📚", count: 320 },
  { id: "hr", name: "الموارد البشرية", icon: "🤝", count: 280 },
  { id: "legal", name: "الشؤون القانونية", icon: "⚖️", count: 150 },
  { id: "customer-service", name: "خدمة العملاء", icon: "🎧", count: 980 },
  { id: "logistics", name: "الخدمات اللوجستية", icon: "🚚", count: 410 },
  { id: "management", name: "الإدارة والأعمال", icon: "💼", count: 620 },
];

export default function CategoriesHub() {
  return (
    <main className="container" style={{ padding: "4rem 1.5rem" }}>
      
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem" }}>استكشف الوظائف حسب القطاع</h1>
        <p className="text-muted" style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}>
          اختر مجالك المهني واكتشف مئات الفرص الوظيفية المتاحة في أفضل الشركات.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {categoriesList.map((category) => (
          <Link key={category.id} href={`/jobs?search=${category.name}`} style={{ textDecoration: "none" }}>
            <div className="card hover-scale" style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.5rem" }}>
              <div style={{ fontSize: "2.5rem", width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--surface-hover)", borderRadius: "12px" }}>
                {category.icon}
              </div>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-main)", marginBottom: "0.25rem" }}>
                  {category.name}
                </h2>
                <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  {category.count} وظيفة متاحة
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: "5rem", textAlign: "center", padding: "3rem", backgroundColor: "var(--surface-hover)", borderRadius: "12px" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>لم تجد تخصصك؟</h2>
        <p className="text-muted mb-4">استخدم محرك البحث المتقدم للوصول إلى المسمى الوظيفي الدقيق الذي تبحث عنه.</p>
        <Link href="/jobs" className="btn btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem" }}>
          الذهاب للبحث المتقدم
        </Link>
      </div>

    </main>
  );
}
