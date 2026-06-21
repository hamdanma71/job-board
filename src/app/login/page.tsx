"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isRegistered = searchParams.get("registered") === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور.");
        setIsLoading(false);
      } else {
        // Successful login, fetch session to determine role and redirect
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        
        if (sessionData?.user?.role === "EMPLOYER") {
          router.push("/dashboard/employer");
        } else {
          router.push("/dashboard/candidate");
        }
        router.refresh();
      }
    } catch (err: any) {
      setError("حدث خطأ أثناء الاتصال بالخادم.");
      setIsLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: "500px", width: "100%", padding: "2.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary)" }}>تسجيل الدخول</h1>
        <p className="text-muted">مرحباً بعودتك إلى منصة التوظيف</p>
      </div>

      {isRegistered && (
        <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--secondary)", padding: "1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", fontSize: "0.9rem", textAlign: "center" }}>
          ✅ تم إنشاء حسابك بنجاح! يرجى تسجيل الدخول.
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
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
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={isLoading}>
          {isLoading ? "جاري التحقق..." : "دخول"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.95rem" }}>
        <span className="text-muted">ليس لديك حساب؟ </span>
        <Link href="/register" style={{ color: "var(--primary)", fontWeight: "bold" }}>أنشئ حساباً جديداً</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="container flex-center" style={{ minHeight: "80vh", padding: "2rem" }}>
      <Suspense fallback={<div>جاري التحميل...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
