import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function PremiumPage() {
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;

  return (
    <main className="container" style={{ padding: "4rem 1.5rem" }}>
      <header className="mb-12 text-center">
        <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem" }}>استثمر في مستقبلك المهني</h1>
        <p className="text-muted" style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}>
          اختر الباقة المناسبة لاحتياجاتك سواء كنت باحثاً عن عمل يطمح لأفضل الفرص، أو شركة تبحث عن أفضل الكفاءات.
        </p>
      </header>

      {/* Toggle if user is guest, or just show depending on role */}
      {(!role || role === "CANDIDATE") && (
        <div style={{ marginBottom: "5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "2rem", textAlign: "center" }}>باقات الباحثين عن عمل</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", maxWidth: "900px", margin: "0 auto" }}>
            
            {/* Free Tier */}
            <div className="card hover-scale" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>الأساسية</h3>
                <p className="text-muted">لبدء مسيرتك المهنية</p>
                <p style={{ fontSize: "2.5rem", fontWeight: "bold", marginTop: "1rem", color: "var(--text-main)" }}>مجاناً</p>
              </div>
              <ul style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> إنشاء ملف شخصي</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> التقديم على الوظائف</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> تنبيهات بريدية أسبوعية</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: 0.5 }}><span>❌</span> تحليل السيرة بالذكاء الاصطناعي</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: 0.5 }}><span>❌</span> أولوية الظهور للشركات</li>
              </ul>
              <Link href="/register" className="btn btn-outline" style={{ width: "100%", textAlign: "center" }}>البدء مجاناً</Link>
            </div>

            {/* Pro Tier */}
            <div className="card hover-scale" style={{ display: "flex", flexDirection: "column", border: "2px solid var(--primary)", position: "relative" }}>
              <div style={{ position: "absolute", top: "-15px", left: "50%", transform: "translateX(-50%)", backgroundColor: "var(--primary)", color: "white", padding: "0.25rem 1rem", borderRadius: "var(--radius-full)", fontSize: "0.85rem", fontWeight: "bold" }}>الأكثر طلباً</div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>الاحترافية (Pro)</h3>
                <p className="text-muted">لمضاعفة فرص قبولك</p>
                <p style={{ fontSize: "2.5rem", fontWeight: "bold", marginTop: "1rem", color: "var(--primary)" }}>9<span style={{ fontSize: "1rem" }}>$/شهر</span></p>
              </div>
              <ul style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> كل ميزات الباقة الأساسية</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> <strong style={{color: "var(--primary)"}}>تحليل السيرة بالذكاء الاصطناعي</strong></li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> تقييم نسبة التوافق للوظائف</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> أولوية الظهور لأصحاب العمل</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> تنبيهات فورية حية</li>
              </ul>
              <button className="btn btn-primary" style={{ width: "100%", textAlign: "center" }}>الترقية الآن</button>
            </div>

          </div>
        </div>
      )}

      {/* Employer Plans */}
      {(!role || role === "EMPLOYER") && (
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "2rem", textAlign: "center" }}>باقات الشركات وأصحاب العمل</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", maxWidth: "900px", margin: "0 auto" }}>
            
            <div className="card hover-scale" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>الشركات الناشئة</h3>
                <p className="text-muted">لتوظيف سريع ومحدد</p>
                <p style={{ fontSize: "2.5rem", fontWeight: "bold", marginTop: "1rem", color: "var(--text-main)" }}>49<span style={{ fontSize: "1rem" }}>$/شهر</span></p>
              </div>
              <ul style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> نشر 3 وظائف شهرياً</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> نظام ATS أساسي</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> البحث المحدود في السير الذاتية</li>
              </ul>
              <button className="btn btn-outline" style={{ width: "100%", textAlign: "center" }}>اشترك الآن</button>
            </div>

            <div className="card hover-scale" style={{ display: "flex", flexDirection: "column", backgroundColor: "var(--surface-hover)" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>المؤسسات الكبرى (Enterprise)</h3>
                <p className="text-muted">لتوظيف مستمر بأدوات AI</p>
                <p style={{ fontSize: "2.5rem", fontWeight: "bold", marginTop: "1rem", color: "var(--accent)" }}>199<span style={{ fontSize: "1rem" }}>$/شهر</span></p>
              </div>
              <ul style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> نشر وظائف لامحدود</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> ترتيب المرشحين بالذكاء الاصطناعي</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> شارة 🏆 أفضل بيئة عمل (Employer Branding)</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: "var(--secondary)" }}>✔️</span> وصول كامل لقاعدة بيانات السير الذاتية</li>
              </ul>
              <button className="btn btn-primary" style={{ width: "100%", textAlign: "center", backgroundColor: "var(--accent)", color: "black" }}>تواصل مع المبيعات</button>
            </div>

          </div>
        </div>
      )}

      {/* Stripe / Payments Security Banner */}
      <div style={{ marginTop: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
        <p style={{ fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          🔒 الدفع آمن 100% ومحمي بواسطة تقنيات <strong>Stripe</strong> العالمية. يمكنك الإلغاء في أي وقت.
        </p>
      </div>

    </main>
  );
}
