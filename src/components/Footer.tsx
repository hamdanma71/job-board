import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ 
      backgroundColor: "#001a33", 
      color: "#e2e8f0", 
      padding: "5rem 1.5rem 2rem 1.5rem",
      marginTop: "4rem",
      fontFamily: "var(--font-inter), var(--font-cairo), sans-serif",
      borderTop: "1px solid var(--border-light)"
    }}>
      <div className="container">
        
        {/* Main Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "3rem", marginBottom: "4rem" }}>
          
          {/* Brand & Newsletter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <div style={{ fontSize: "2rem", fontWeight: "900", color: "white", letterSpacing: "-0.5px" }}>
                Job<span style={{ opacity: 0.8, color: "var(--primary)" }}>Match</span>
              </div>
            </Link>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem", lineHeight: "1.6" }}>
              منصة التوظيف الأذكى في الشرق الأوسط. نجمع أفضل المواهب مع أعظم الشركات من خلال تقنيات الذكاء الاصطناعي والمطابقة المتقدمة.
            </p>
            <form style={{ display: "flex", marginTop: "1rem", borderRadius: "4px", overflow: "hidden" }}>
              <input 
                type="email" 
                placeholder="اشترك بالنشرة البريدية" 
                style={{ flex: 1, padding: "0.75rem", border: "none", outline: "none", backgroundColor: "rgba(255,255,255,0.1)", color: "white" }}
              />
              <button type="submit" style={{ padding: "0.75rem 1.5rem", backgroundColor: "var(--primary)", color: "white", border: "none", fontWeight: "bold", cursor: "pointer" }}>
                اشتراك
              </button>
            </form>
          </div>

          {/* Jobs Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ color: "white", fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>تصفح الوظائف</h3>
            <Link href="/jobs" className="footer-link">البحث العام عن الوظائف</Link>
            <Link href="/jobs/remote" className="footer-link">وظائف العمل عن بعد</Link>
            <Link href="/jobs/executive" className="footer-link">الوظائف التنفيذية (C-Level)</Link>
            <Link href="/locations" className="footer-link">تصفح الوظائف حسب الدولة</Link>
          </div>

          {/* Insights Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ color: "white", fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>بيانات وموارد</h3>
            <Link href="/salaries" className="footer-link">رواتب السوق والتقييمات</Link>
            <Link href="/companies" className="footer-link">دليل الشركات</Link>
            <Link href="/blog" className="footer-link">المدونة والنصائح المهنية</Link>
            <Link href="/podcasts" className="footer-link">البودكاست الصوتي</Link>
          </div>

          {/* For Employers Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ color: "white", fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>أصحاب العمل</h3>
            <Link href="/employers" className="footer-link">لماذا منصتنا؟</Link>
            <Link href="/pricing" className="footer-link">باقات الأسعار والترقية</Link>
            <Link href="/register" className="footer-link">سجل شركتك مجاناً</Link>
            <Link href="/login" className="footer-link">تسجيل دخول الشركات</Link>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{ 
          borderTop: "1px solid rgba(255,255,255,0.1)", 
          paddingTop: "2rem", 
          display: "flex", 
          flexWrap: "wrap", 
          justifyContent: "space-between", 
          alignItems: "center",
          gap: "1rem",
          fontSize: "0.85rem",
          color: "rgba(255,255,255,0.5)"
        }}>
          <p>© 2026 منصة JobMatch للتوظيف المتقدم. جميع الحقوق محفوظة.</p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link href="#" className="footer-link">الشروط والأحكام</Link>
            <Link href="#" className="footer-link">سياسة الخصوصية</Link>
            <Link href="#" className="footer-link">اتصل بنا</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
