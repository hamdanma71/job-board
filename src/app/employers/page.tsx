import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function EmployersLandingPage() {
  const session = await getServerSession(authOptions);
  const isEmployer = session && (session.user as any).role === "EMPLOYER";

  return (
    <main>
      {/* 1. Hero Section */}
      <section style={{ 
        backgroundColor: "var(--surface-hover)", 
        padding: "6rem 1.5rem", 
        textAlign: "center",
        borderBottom: "1px solid var(--border-light)"
      }}>
        <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ 
            fontSize: "3.5rem", 
            fontWeight: "900", 
            lineHeight: "1.2",
            marginBottom: "1.5rem",
            background: "linear-gradient(45deg, var(--primary), var(--secondary))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            وظّف أفضل الكفاءات أسرع من أي وقت مضى
          </h1>
          <p style={{ fontSize: "1.25rem", color: "var(--text-light)", marginBottom: "2.5rem", lineHeight: "1.6" }}>
            منصة توظيف متكاملة مدعومة بالذكاء الاصطناعي لاختصار وقت الفرز والتوظيف بنسبة 80%. انضم إلى مئات الشركات التي تعتمد علينا في بناء فرق عملها.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            {isEmployer ? (
              <Link href="/dashboard/employer" className="btn btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem" }}>
                الذهاب للوحة التحكم
              </Link>
            ) : (
              <Link href="/register" className="btn btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem" }}>
                ابدأ بنشر وظيفة مجاناً
              </Link>
            )}
            <Link href="/pricing" className="btn btn-outline" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem" }}>
              استعرض الباقات
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section style={{ padding: "3rem 1.5rem", backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border-light)" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: "3rem", fontWeight: "bold", color: "var(--primary)" }}>+10K</div>
            <div className="text-muted" style={{ fontSize: "1.1rem" }}>سيرة ذاتية نشطة</div>
          </div>
          <div>
            <div style={{ fontSize: "3rem", fontWeight: "bold", color: "var(--primary)" }}>95%</div>
            <div className="text-muted" style={{ fontSize: "1.1rem" }}>دقة مطابقة المرشحين</div>
          </div>
          <div>
            <div style={{ fontSize: "3rem", fontWeight: "bold", color: "var(--primary)" }}>-80%</div>
            <div className="text-muted" style={{ fontSize: "1.1rem" }}>تقليل في وقت التوظيف</div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section className="container" style={{ padding: "5rem 1.5rem" }}>
        <h2 style={{ textAlign: "center", fontSize: "2.5rem", fontWeight: "bold", marginBottom: "3rem" }}>لماذا تختار منصتنا لشركتك؟</h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
          
          <div className="card hover-scale" style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🧠</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>فرز ذكي (Smart Matching)</h3>
            <p className="text-muted">نظام أوزان متقدم يحلل المهارات والمسميات بدقة، ليبرز لك أفضل المرشحين دون الحاجة لقراءة مئات السير الذاتية يدوياً.</p>
          </div>

          <div className="card hover-scale" style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📂</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>نظام تتبع متقدم (ATS)</h3>
            <p className="text-muted">لوحة تحكم واحدة لإدارة طلبات التوظيف، تحديث حالات المتقدمين، وإرسال إشعارات فورية لهم بكل سهولة.</p>
          </div>

          <div className="card hover-scale" style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✨</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>توليد الوصف الوظيفي (AI)</h3>
            <p className="text-muted">قل وداعاً لكتابة الأوصاف الوظيفية. أدخل المسمى الوظيفي فقط، وسيقوم الذكاء الاصطناعي بكتابة وصف احترافي جاذب خلال ثوانٍ.</p>
          </div>

          <div className="card hover-scale" style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏆</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>بناء العلامة التجارية</h3>
            <p className="text-muted">احصل على صفحة شركة مخصصة، واجمع تقييمات موظفيك لتبني ثقة عالية تجذب أفضل المواهب في السوق إليك.</p>
          </div>

        </div>
      </section>

      {/* 4. How it works */}
      <section style={{ backgroundColor: "var(--surface-hover)", padding: "5rem 1.5rem" }}>
        <div className="container">
          <h2 style={{ textAlign: "center", fontSize: "2.5rem", fontWeight: "bold", marginBottom: "4rem" }}>3 خطوات بسيطة لتوظيف مرشحك القادم</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem", textAlign: "center" }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: "60px", height: "60px", backgroundColor: "var(--primary)", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold", margin: "0 auto 1.5rem" }}>1</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>أنشئ حساب شركتك</h3>
              <p className="text-muted">عملية تسجيل سريعة، واحصل على شارة التوثيق لزيادة موثوقيتك.</p>
            </div>
            
            <div style={{ position: "relative" }}>
              <div style={{ width: "60px", height: "60px", backgroundColor: "var(--primary)", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold", margin: "0 auto 1.5rem" }}>2</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>انشر وظيفتك</h3>
              <p className="text-muted">استخدم الذكاء الاصطناعي لصياغة الوصف، وانشرها لآلاف الباحثين.</p>
            </div>

            <div style={{ position: "relative" }}>
              <div style={{ width: "60px", height: "60px", backgroundColor: "var(--primary)", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold", margin: "0 auto 1.5rem" }}>3</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>وظّف الأفضل</h3>
              <p className="text-muted">راجع قائمة المرشحين المرتبة تلقائياً من الأفضل للأقل، واختر مرشحك.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer CTA */}
      <section className="container" style={{ padding: "6rem 1.5rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>مستعد لتغيير طريقة توظيفك؟</h2>
        <p style={{ fontSize: "1.2rem", color: "var(--text-light)", marginBottom: "2rem", maxWidth: "600px", margin: "0 auto 2rem" }}>
          انضم اليوم وابدأ بتجربة الباقة الأساسية مجاناً، أو قم بالترقية لباقة المحترفين للاستفادة القصوى من الذكاء الاصطناعي.
        </p>
        <Link href="/register" className="btn btn-primary hover-scale" style={{ padding: "1rem 3rem", fontSize: "1.2rem", display: "inline-block" }}>
          سجل شركتك الآن
        </Link>
      </section>

    </main>
  );
}
