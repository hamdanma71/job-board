import Link from "next/link";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section style={{ 
        padding: "8rem 1.5rem", 
        textAlign: "center", 
        minHeight: "85vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative"
      }}>
        <div className="container animate-fade-in" style={{ position: "relative", zIndex: 10 }}>
          <div style={{
            display: "inline-block",
            padding: "0.5rem 1rem",
            backgroundColor: "rgba(79, 70, 229, 0.1)",
            border: "1px solid rgba(79, 70, 229, 0.2)",
            borderRadius: "var(--radius-full)",
            color: "var(--primary)",
            fontWeight: "bold",
            marginBottom: "2rem",
            fontSize: "0.9rem"
          }}>
            🚀 الجيل القادم من التوظيف المدعوم بالذكاء الاصطناعي
          </div>

          <h1 style={{ 
            fontSize: "clamp(3rem, 6vw, 4.5rem)", 
            fontWeight: 900, 
            marginBottom: "1.5rem", 
            lineHeight: 1.1,
            letterSpacing: "-1px"
          }}>
            ابحث عن حلمك المهني في <br />
            <span style={{ 
              background: "linear-gradient(135deg, var(--primary), var(--secondary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              أبوظبي والعالم
            </span>
          </h1>
          <p style={{ 
            fontSize: "clamp(1.1rem, 2vw, 1.3rem)", 
            color: "var(--text-muted)", 
            maxWidth: "700px", 
            margin: "0 auto 3rem auto",
            lineHeight: 1.8
          }}>
            المنصة الأولى التي تربطك بأفضل الشركات باستخدام خوارزميات الذكاء الاصطناعي الحديثة لضمان التوافق التام مع مهاراتك وطموحاتك.
          </p>
          
          {/* Glass Search Box */}
          <form action="/jobs" method="GET" style={{ 
            background: "var(--surface)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "var(--glass-border)",
            maxWidth: "850px", 
            margin: "0 auto", 
            padding: "0.75rem", 
            borderRadius: "var(--radius-full)", 
            display: "flex", 
            flexWrap: "wrap",
            gap: "0.5rem",
            boxShadow: "var(--shadow-glass)"
          }}>
            <input 
              name="search"
              type="text" 
              placeholder="المسمى الوظيفي (مثال: مهندس برمجيات)" 
              className="input-field" 
              style={{ flex: "1 1 250px", border: "none", boxShadow: "none", backgroundColor: "transparent", fontSize: "1.05rem" }}
            />
            <div style={{ width: "1px", backgroundColor: "var(--border-dark)", margin: "0.5rem 0", display: "none", '@media (min-width: 768px)': { display: "block" } } as any}></div>
            <input 
              name="location"
              type="text" 
              placeholder="المدينة أو الدولة" 
              defaultValue="الإمارات، أبوظبي"
              className="input-field" 
              style={{ flex: "1 1 200px", border: "none", boxShadow: "none", backgroundColor: "transparent", fontSize: "1.05rem", fontWeight: "bold", color: "var(--primary)" }}
            />
            <button type="submit" className="btn btn-primary" style={{ flex: "0 0 auto", borderRadius: "var(--radius-full)", padding: "1rem 2.5rem", fontSize: "1.05rem" }}>
              بحث ذكي
            </button>
          </form>
          
          <div style={{ marginTop: "2rem", color: "var(--text-muted)", fontSize: "0.95rem" }}>
            عمليات بحث شائعة: 
            <span style={{ color: "var(--primary)", cursor: "pointer", margin: "0 0.5rem", fontWeight: "bold" }}>العمل عن بعد</span> • 
            <span style={{ color: "var(--secondary)", cursor: "pointer", margin: "0 0.5rem", fontWeight: "bold" }}>تحليل البيانات</span> • 
            <span style={{ color: "var(--accent)", cursor: "pointer", margin: "0 0.5rem", fontWeight: "bold" }}>التسويق الرقمي</span>
          </div>
        </div>
      </section>

      {/* Modern Features Section */}
      <section style={{ padding: "6rem 0", position: "relative" }}>
        <div className="container">
          <div className="text-center mb-8">
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>لماذا نحن؟</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>تجربة توظيف مصممة بعناية فائقة لراحتك</p>
          </div>
          
          <div className="grid-2 mt-8">
            <div className="card text-center">
              <div style={{ 
                width: "80px", height: "80px", 
                background: "linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(79, 70, 229, 0.05))", 
                borderRadius: "24px", 
                margin: "0 auto 1.5rem auto", 
                display: "flex", alignItems: "center", justifyContent: "center", 
                color: "var(--primary)", fontSize: "2rem", fontWeight: "bold",
                border: "1px solid rgba(79, 70, 229, 0.1)",
                boxShadow: "inset 0 2px 4px rgba(255,255,255,0.5)"
              }}>✨</div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>مطابقة ذكية للوظائف</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>خوارزمياتنا تحلل سيرتك الذاتية وتطابقها بدقة مع الوظائف الأنسب لمهاراتك، مما يختصر عليك ساعات من البحث.</p>
            </div>

            <div className="card text-center">
              <div style={{ 
                width: "80px", height: "80px", 
                background: "linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(14, 165, 233, 0.05))", 
                borderRadius: "24px", 
                margin: "0 auto 1.5rem auto", 
                display: "flex", alignItems: "center", justifyContent: "center", 
                color: "var(--secondary)", fontSize: "2rem", fontWeight: "bold",
                border: "1px solid rgba(14, 165, 233, 0.1)",
                boxShadow: "inset 0 2px 4px rgba(255,255,255,0.5)"
              }}>📄</div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>السيرة الذاتية التلقائية</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>ارفع ملفك القديم وسيقوم نظامنا بتوليد سيرة ذاتية احترافية جذابة لأصحاب العمل في ثوانٍ معدودة.</p>
            </div>

            <div className="card text-center">
              <div style={{ 
                width: "80px", height: "80px", 
                background: "linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(244, 63, 94, 0.05))", 
                borderRadius: "24px", 
                margin: "0 auto 1.5rem auto", 
                display: "flex", alignItems: "center", justifyContent: "center", 
                color: "var(--accent)", fontSize: "2rem", fontWeight: "bold",
                border: "1px solid rgba(244, 63, 94, 0.1)",
                boxShadow: "inset 0 2px 4px rgba(255,255,255,0.5)"
              }}>💰</div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>شفافية الرواتب والبيئة</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>اطلع على تقييمات الموظفين السابقين ومتوسط الرواتب لكل شركة قبل أن تضيع وقتك في التقديم.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: "6rem 1.5rem", textAlign: "center" }}>
        <div className="card animate-fade-in" style={{ 
          maxWidth: "900px", 
          margin: "0 auto", 
          background: "linear-gradient(135deg, var(--primary), var(--secondary))",
          color: "white",
          border: "none"
        }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1.5rem" }}>هل أنت مستعد لنقل مسيرتك المهنية للمستوى التالي؟</h2>
          <p style={{ fontSize: "1.2rem", opacity: 0.9, marginBottom: "2.5rem", maxWidth: "600px", margin: "0 auto 2.5rem auto" }}>
            انضم إلى آلاف المحترفين والشركات الرائدة في أبوظبي والعالم الآن.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn" style={{ background: "white", color: "var(--primary)", padding: "1rem 3rem", fontSize: "1.1rem" }}>
              أنشئ حسابك مجاناً
            </Link>
            <Link href="/employers" className="btn" style={{ background: "transparent", border: "2px solid white", color: "white", padding: "1rem 3rem", fontSize: "1.1rem" }}>
              أنا صاحب عمل
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
