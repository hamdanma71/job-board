import Link from "next/link";

const blogPosts = [
  {
    id: 1,
    title: "كيف تستخدم الذكاء الاصطناعي لكتابة سيرة ذاتية لا ترفض",
    category: "نصائح مهنية",
    date: "15 أكتوبر 2026",
    readTime: "5 دقائق",
    image: "🤖",
    excerpt: "تعلم الأسرار والخفايا لاستخدام أدوات الذكاء الاصطناعي في إعادة صياغة مهاراتك بشكل يتوافق مع أنظمة تتبع المتقدمين (ATS)."
  },
  {
    id: 2,
    title: "أكثر 5 مهارات تقنية طلباً في سوق العمل الخليجي لعام 2026",
    category: "تحليلات السوق",
    date: "10 أكتوبر 2026",
    readTime: "8 دقائق",
    image: "📈",
    excerpt: "دراسة شاملة لأكثر المهارات التي تبحث عنها الشركات الكبرى في السعودية والإمارات، وكيفية اكتسابها."
  },
  {
    id: 3,
    title: "العمل الهجين (Hybrid): كيف تقنع مديرك بزيادة أيام العمل من المنزل",
    category: "بيئة العمل",
    date: "2 أكتوبر 2026",
    readTime: "6 دقائق",
    image: "🏡",
    excerpt: "استراتيجيات التفاوض المبنية على الأداء والإنتاجية لإقناع الإدارة بمرونة أكبر في ساعات وأماكن العمل."
  },
  {
    id: 4,
    title: "دليل المقابلات الشخصية للمناصب التنفيذية (C-Level)",
    category: "المناصب القيادية",
    date: "28 سبتمبر 2026",
    readTime: "12 دقيقة",
    image: "👔",
    excerpt: "كيف تختلف المقابلات التنفيذية عن العادية؟ وما هي الأسئلة الاستراتيجية التي يجب أن تتوقعها من مجالس الإدارة؟"
  }
];

export default function BlogHub() {
  return (
    <main>
      <section style={{ backgroundColor: "var(--surface-hover)", padding: "5rem 1.5rem", borderBottom: "1px solid var(--border-light)" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: "800px" }}>
          <h1 style={{ fontSize: "3.5rem", fontWeight: "bold", marginBottom: "1rem" }}>المدونة المهنية (Insights)</h1>
          <p className="text-muted" style={{ fontSize: "1.2rem", lineHeight: "1.6" }}>
            دليلك الشامل لتطوير مسيرتك المهنية. مقالات متخصصة، تحليلات لسوق العمل، ونصائح حصرية من خبراء التوظيف.
          </p>
          
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "2rem", flexWrap: "wrap" }}>
            <span className="badge badge-primary" style={{ padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer" }}>الكل</span>
            <span className="badge badge-outline" style={{ padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer" }}>نصائح مهنية</span>
            <span className="badge badge-outline" style={{ padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer" }}>تحليلات السوق</span>
            <span className="badge badge-outline" style={{ padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer" }}>بيئة العمل</span>
            <span className="badge badge-outline" style={{ padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer" }}>المناصب القيادية</span>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: "5rem 1.5rem" }}>
        
        {/* Featured Post */}
        <div className="card hover-scale" style={{ display: "flex", flexWrap: "wrap", gap: "2rem", padding: "0", overflow: "hidden", marginBottom: "4rem" }}>
          <div style={{ flex: "1 1 400px", backgroundColor: "rgba(37, 99, 235, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px", fontSize: "6rem" }}>
            🚀
          </div>
          <div style={{ flex: "1 1 400px", padding: "3rem 2rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span style={{ color: "var(--primary)", fontWeight: "bold", marginBottom: "1rem" }}>مقال مميز</span>
            <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem", lineHeight: "1.4" }}>الوظائف الأكثر أماناً في عصر ثورة الذكاء الاصطناعي</h2>
            <p className="text-muted" style={{ fontSize: "1.1rem", marginBottom: "2rem", lineHeight: "1.6" }}>
              كيف تحمي مستقبلك المهني من الأتمتة؟ وما هي المهارات البشرية التي لا يمكن للآلة تقليدها؟ دليل شامل للاستعداد للمستقبل.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--surface-hover)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>A</div>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>أحمد محمد</div>
                <div className="text-muted" style={{ fontSize: "0.8rem" }}>خبير موارد بشرية</div>
              </div>
            </div>
            <Link href="#" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>اقرأ المقال بالكامل</Link>
          </div>
        </div>

        {/* Post Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
          {blogPosts.map(post => (
            <div key={post.id} className="card hover-scale" style={{ display: "flex", flexDirection: "column", padding: "0", overflow: "hidden" }}>
              <div style={{ height: "200px", backgroundColor: "var(--surface-hover)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>
                {post.image}
              </div>
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <span style={{ color: "var(--primary)", fontSize: "0.85rem", fontWeight: "bold" }}>{post.category}</span>
                  <span className="text-muted" style={{ fontSize: "0.85rem" }}>{post.readTime} قراءة</span>
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem", lineHeight: "1.4" }}>
                  {post.title}
                </h3>
                <p className="text-muted" style={{ fontSize: "0.95rem", marginBottom: "1.5rem", flex: 1, lineHeight: "1.6" }}>
                  {post.excerpt}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: "1rem" }}>
                  <span className="text-muted" style={{ fontSize: "0.85rem" }}>{post.date}</span>
                  <Link href="#" style={{ color: "var(--primary)", fontWeight: "bold", textDecoration: "none" }}>اقرأ المزيد ›</Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>
    </main>
  );
}
