"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CANDIDATE"); // Default to Candidate
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ أثناء التسجيل");
      }

      // Automatically redirect to login page after successful registration
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container flex-center" style={{ minHeight: "80vh", padding: "2rem" }}>
      <div className="card" style={{ maxWidth: "500px", width: "100%", padding: "2.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary)" }}>حساب جديد</h1>
          <p className="text-muted">انضم إلى منصة التوظيف الأذكى الآن</p>
        </div>

        {error && (
          <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="input-group">
            <label className="input-label">الاسم الكامل / اسم الشركة</label>
            <input 
              type="text" 
              className="input-field" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="مثال: أحمد محمد"
            />
          </div>

          <div className="input-group">
            <label className="input-label">البريد الإلكتروني</label>
            <input 
              type="email" 
              className="input-field" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="example@domain.com"
              dir="ltr"
            />
          </div>

          <div className="input-group">
            <label className="input-label">كلمة المرور</label>
            <input 
              type="password" 
              className="input-field" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              dir="ltr"
              minLength={6}
            />
          </div>

          <div className="input-group">
            <label className="input-label">نوع الحساب</label>
            <select 
              className="input-field" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="CANDIDATE">باحث عن عمل</option>
              <option value="EMPLOYER">صاحب عمل / شركة</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={isLoading}>
            {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.95rem" }}>
          <span className="text-muted">لديك حساب بالفعل؟ </span>
          <Link href="/login" style={{ color: "var(--primary)", fontWeight: "bold" }}>سجل دخولك هنا</Link>
        </div>
      </div>
    </main>
  );
}
