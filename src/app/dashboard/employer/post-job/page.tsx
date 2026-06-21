"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PostJobPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState(""); // Only needed if first job
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("FULL_TIME");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/employer/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, title, location, type, salary, description })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/employer");
        router.refresh();
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <main className="container text-center" style={{ padding: "5rem" }}>
        <h2 style={{ color: "var(--secondary)" }}>تم نشر الوظيفة بنجاح!</h2>
        <p className="text-muted mt-4">جاري توجيهك إلى لوحة التحكم...</p>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: "3rem 1.5rem", maxWidth: "800px" }}>
      <header className="flex-between mb-8">
        <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>نشر وظيفة جديدة</h1>
        <Link href="/dashboard/employer" className="btn btn-outline">إلغاء</Link>
      </header>

      <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        <div className="input-group">
          <label className="input-label">اسم الشركة (إذا كانت هذه أول وظيفة)</label>
          <input type="text" className="input-field" placeholder="مثال: شركة التقنية الحديثة" value={companyName} onChange={e => setCompanyName(e.target.value)} />
        </div>

        <div className="input-group">
          <label className="input-label">المسمى الوظيفي *</label>
          <input type="text" className="input-field" required placeholder="مثال: مطور واجهات أمامية" value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="input-group">
            <label className="input-label">المدينة / الدولة *</label>
            <input type="text" className="input-field" required placeholder="مثال: الرياض، السعودية" value={location} onChange={e => setLocation(e.target.value)} />
          </div>

          <div className="input-group">
            <label className="input-label">نوع العمل</label>
            <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
              <option value="FULL_TIME">دوام كامل</option>
              <option value="PART_TIME">دوام جزئي</option>
              <option value="CONTRACT">عقد</option>
              <option value="REMOTE">عن بعد</option>
              <option value="INTERNSHIP">تدريب</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">الراتب المتوقع (اختياري)</label>
          <input type="text" className="input-field" placeholder="مثال: 5000 - 8000 ريال" value={salary} onChange={e => setSalary(e.target.value)} />
        </div>

        <div className="input-group">
          <label className="input-label">الوصف الوظيفي والمتطلبات *</label>
          <textarea className="input-field" required rows={8} placeholder="اكتب تفاصيل الوظيفة هنا..." value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        {error && <p style={{ color: "#ef4444", textAlign: "center" }}>{error}</p>}

        <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }} disabled={isLoading}>
          {isLoading ? "جاري النشر..." : "نشر الوظيفة الآن"}
        </button>
      </form>
    </main>
  );
}
