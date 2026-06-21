"use client";

import Link from "next/link";
import { useState } from "react";

export default function PricingView({ isEmployer }: { isEmployer: boolean }) {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginBottom: "3rem" }}>
        <span style={{ fontWeight: !isYearly ? "bold" : "normal", color: !isYearly ? "var(--text)" : "var(--text-light)" }}>شهرياً</span>
        
        <label style={{ position: "relative", display: "inline-block", width: "60px", height: "34px" }}>
          <input 
            type="checkbox" 
            checked={isYearly} 
            onChange={(e) => setIsYearly(e.target.checked)} 
            style={{ opacity: 0, width: 0, height: 0 }} 
          />
          <span style={{ 
            position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: isYearly ? "var(--primary)" : "#ccc", 
            transition: ".4s", borderRadius: "34px" 
          }}>
            <span style={{
              position: "absolute", content: '""', height: "26px", width: "26px", 
              left: isYearly ? "4px" : "30px", bottom: "4px", backgroundColor: "white", 
              transition: ".4s", borderRadius: "50%"
            }}></span>
          </span>
        </label>
        
        <span style={{ fontWeight: isYearly ? "bold" : "normal", color: isYearly ? "var(--text)" : "var(--text-light)" }}>
          سنوياً <span style={{ fontSize: "0.75rem", backgroundColor: "var(--secondary)20", color: "var(--secondary)", padding: "0.2rem 0.5rem", borderRadius: "var(--radius-full)", marginRight: "0.5rem" }}>خصم 20%</span>
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Free Tier */}
        <div className="card hover-scale" style={{ border: "1px solid var(--border-light)" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>الباقة الأساسية</h2>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--primary)", marginBottom: "1.5rem" }}>مجاناً</div>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem 0", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <li>✔️ نشر وظيفة واحدة نشطة</li>
            <li>✔️ الوصول للوحة المتقدمين (ATS)</li>
            <li>✔️ الترتيب الذكي للمتقدمين</li>
            <li className="text-muted" style={{ textDecoration: "line-through" }}>تصدير بيانات المرشحين</li>
            <li className="text-muted" style={{ textDecoration: "line-through" }}>توليد الوصف الوظيفي بالذكاء الاصطناعي</li>
          </ul>
          
          {isEmployer ? (
            <button className="btn btn-outline" style={{ width: "100%", cursor: "default" }}>باقتك الحالية</button>
          ) : (
            <Link href="/register" className="btn btn-outline" style={{ display: "block", textAlign: "center", width: "100%" }}>سجل كشركة الآن</Link>
          )}
        </div>

        {/* Pro Tier */}
        <div className="card hover-scale" style={{ border: "2px solid var(--primary)", position: "relative" }}>
          <div style={{ position: "absolute", top: "-15px", right: "20px", backgroundColor: "var(--primary)", color: "white", padding: "0.2rem 1rem", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: "bold" }}>
            الأكثر شعبية
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>باقة المحترفين (PRO)</h2>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--primary)", marginBottom: "0.5rem" }}>
            {isYearly ? "159" : "199"} <span style={{ fontSize: "1rem", color: "var(--text-light)" }}>ريال / شهرياً</span>
          </div>
          <div style={{ color: "var(--secondary)", fontWeight: "bold", fontSize: "0.9rem", marginBottom: "1rem" }}>
            {isYearly ? "يُدفع سنوياً (1,908 ريال)" : "(مجاناً للمشتركين الأوائل خلال فترة الإطلاق)"}
          </div>
          
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem 0", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <li>✔️ نشر وظائف <strong>غير محدودة</strong></li>
            <li>✔️ توليد الوصف الوظيفي بالذكاء الاصطناعي</li>
            <li>✔️ الوصول المتقدم لبيانات الرواتب</li>
            <li>✔️ فلاتر بحث متقدمة للمرشحين</li>
            <li>✔️ دعم فني أولوية</li>
          </ul>

          {isEmployer ? (
            <button 
              className="btn btn-primary" 
              style={{ width: "100%" }} 
              onClick={async () => {
                try {
                  const res = await fetch('/api/checkout', { method: 'POST' });
                  const data = await res.json();
                  if (data.url) {
                    window.location.href = data.url;
                  } else {
                    alert(data.error || 'حدث خطأ أثناء الاتصال ببوابة الدفع');
                  }
                } catch(e) {
                  alert('حدث خطأ أثناء الاتصال ببوابة الدفع');
                }
              }}
            >
              الترقية الآن
            </button>
          ) : (
            <Link href="/register" className="btn btn-primary" style={{ display: "block", textAlign: "center", width: "100%" }}>ابدأ الآن</Link>
          )}
        </div>

      </div>
    </>
  );
}
