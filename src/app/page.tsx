import Link from "next/link";

export default function Home() {
  return (
    <main>
      {/* Global Navbar is loaded from layout.tsx */}

      {/* Hero Section */}
      <section style={{ padding: "6rem 0", textAlign: "center", backgroundColor: "var(--surface-hover)" }}>
        <div className="container">
          <h1 style={{ fontSize: "3.5rem", fontWeight: 800, marginBottom: "1.5rem", color: "var(--text-main)", lineHeight: 1.2 }}>
            وظيفتك القادمة على بُعد <span style={{ color: "var(--primary)" }}>نقرة واحدة</span>
          </h1>
          <p style={{ fontSize: "1.25rem", color: "var(--text-muted)", maxWidth: "700px", margin: "0 auto 3rem auto" }}>
            منصة التوظيف الأذكى في الشرق الأوسط. نربطك بأفضل الشركات باستخدام خوارزميات الذكاء الاصطناعي لضمان أفضل تطابق لمهاراتك.
          </p>
          
          {/* Search Box */}
          <form action="/jobs" method="GET" className="card" style={{ maxWidth: "800px", margin: "0 auto", padding: "0.5rem", borderRadius: "var(--radius-full)", display: "flex", gap: "0.5rem" }}>
            <input 
              name="search"
              type="text" 
              placeholder="المسمى الوظيفي أو الكلمة المفتاحية" 
              className="input-field" 
              style={{ flex: 1, border: "none", boxShadow: "none", backgroundColor: "transparent" }}
            />
            <div style={{ width: "1px", backgroundColor: "var(--border-light)", margin: "0.5rem 0" }}></div>
            <input 
              name="location"
              type="text" 
              placeholder="المدينة أو الدولة" 
              defaultValue="الإمارات، أبوظبي"
              className="input-field" 
              style={{ flex: 1, border: "none", boxShadow: "none", backgroundColor: "transparent" }}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: "var(--radius-full)", padding: "0.75rem 2rem" }}>
              ابحث الآن
            </button>
          </form>
          
          <div style={{ marginTop: "2rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            عمليات بحث شائعة: <span style={{ color: "var(--primary)", cursor: "pointer", margin: "0 0.5rem" }}>مطور برمجيات</span> | <span style={{ color: "var(--primary)", cursor: "pointer", margin: "0 0.5rem" }}>مهندس مدني</span> | <span style={{ color: "var(--primary)", cursor: "pointer", margin: "0 0.5rem" }}>محاسب</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "5rem 0" }}>
        <div className="container">
          <div className="text-center mb-8">
            <h2 style={{ fontSize: "2.25rem", fontWeight: 700, marginBottom: "1rem" }}>لماذا نحن؟</h2>
            <p style={{ color: "var(--text-muted)" }}>طوّرنا المنصة لتقدم لك أفضل تجربة توظيف ممكنة</p>
          </div>
          
          <div className="grid-2 mt-8">
            <div className="card text-center" style={{ padding: "2.5rem" }}>
              <div style={{ width: "64px", height: "64px", backgroundColor: "rgba(37, 99, 235, 0.1)", borderRadius: "var(--radius-full)", margin: "0 auto 1.5rem auto", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontSize: "1.5rem", fontWeight: "bold" }}>AI</div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>مطابقة ذكية للوظائف</h3>
              <p style={{ color: "var(--text-muted)" }}>نقوم بتحليل سيرتك الذاتية ومطابقتها مع الوظائف الأنسب لخبراتك ومهاراتك.</p>
            </div>
            <div className="card text-center" style={{ padding: "2.5rem" }}>
              <div style={{ width: "64px", height: "64px", backgroundColor: "rgba(16, 185, 129, 0.1)", borderRadius: "var(--radius-full)", margin: "0 auto 1.5rem auto", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--secondary)", fontSize: "1.5rem", fontWeight: "bold" }}>CV</div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>بناء سيرة احترافية</h3>
              <p style={{ color: "var(--text-muted)" }}>أدوات متطورة لبناء سيرة ذاتية جاذبة لأصحاب العمل في دقائق معدودة.</p>
            </div>
            <div className="card text-center" style={{ padding: "2.5rem" }}>
              <div style={{ width: "64px", height: "64px", backgroundColor: "rgba(245, 158, 11, 0.1)", borderRadius: "var(--radius-full)", margin: "0 auto 1.5rem auto", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", fontSize: "1.5rem", fontWeight: "bold" }}>$</div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>تقييمات ورواتب شفافة</h3>
              <p style={{ color: "var(--text-muted)" }}>اطلع على تقييمات بيئة العمل ومتوسط الرواتب قبل التقديم لأي شركة.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
