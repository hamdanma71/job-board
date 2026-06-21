"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({ companyId }: { companyId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [salary, setSalary] = useState("");
  const [position, setPosition] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, rating, comment, salary, position, isAnonymous })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage("تم إضافة التقييم بنجاح! شكراً لمشاركتك.");
      setComment("");
      setSalary("");
      setPosition("");
      setTimeout(() => {
        router.refresh();
      }, 1500);

    } catch (err: any) {
      setMessage(err.message || "حدث خطأ أثناء إضافة التقييم");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", backgroundColor: "var(--surface-hover)", padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>أضف تقييمك</h3>
      
      <div className="input-group">
        <label className="input-label">التقييم (من 5)</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {[1, 2, 3, 4, 5].map(num => (
            <button 
              key={num} 
              type="button" 
              onClick={() => setRating(num)}
              style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: num <= rating ? "var(--accent)" : "var(--text-light)" }}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="input-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label className="input-label">المسمى الوظيفي (اختياري)</label>
          <input type="text" className="input-field" value={position} onChange={e => setPosition(e.target.value)} placeholder="مثال: مهندس برمجيات" />
        </div>
        <div>
          <label className="input-label">الراتب الشهري (اختياري)</label>
          <input type="text" className="input-field" value={salary} onChange={e => setSalary(e.target.value)} placeholder="مثال: 12,000 ريال" />
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">تعليقك ورأيك في بيئة العمل</label>
        <textarea className="input-field" value={comment} onChange={e => setComment(e.target.value)} required rows={3} placeholder="ما هي إيجابيات وسلبيات العمل هنا؟"></textarea>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input type="checkbox" id="anonymous" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
        <label htmlFor="anonymous" style={{ fontSize: "0.9rem" }}>نشر التقييم كمجهول (لن يظهر اسمك)</label>
      </div>

      <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ alignSelf: "flex-start" }}>
        {isLoading ? "جاري الإرسال..." : "نشر التقييم"}
      </button>

      {message && <p style={{ fontSize: "0.9rem", color: message.includes("نجاح") ? "var(--secondary)" : "#ef4444" }}>{message}</p>}
    </form>
  );
}
