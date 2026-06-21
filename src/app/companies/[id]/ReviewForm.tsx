"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [salaryData, setSalaryData] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          rating,
          comment,
          salaryData,
          isAnonymous
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل في إرسال التقييم");

      setMessage("✅ تم إضافة تقييمك بنجاح!");
      setComment("");
      setSalaryData("");
      router.refresh(); // Refresh the page to show the new review
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>أضف تقييمك للشركة</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        <div className="input-group">
          <label className="input-label">التقييم (من 1 إلى 5)</label>
          <input 
            type="number" 
            min="1" 
            max="5" 
            className="input-field" 
            value={rating} 
            onChange={(e) => setRating(Number(e.target.value))} 
            required 
          />
        </div>

        <div className="input-group">
          <label className="input-label">رأيك ببيئة العمل</label>
          <textarea 
            className="input-field" 
            rows={3} 
            placeholder="اكتب تجربتك بصراحة..." 
            value={comment} 
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </div>

        <div className="input-group">
          <label className="input-label">متوسط راتبك (اختياري)</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="مثال: 12,000 ريال شهرياً" 
            value={salaryData} 
            onChange={(e) => setSalaryData(e.target.value)} 
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input 
            type="checkbox" 
            id="anonymous" 
            checked={isAnonymous} 
            onChange={(e) => setIsAnonymous(e.target.checked)} 
          />
          <label htmlFor="anonymous" style={{ fontSize: "0.9rem" }}>نشر التقييم كمجهول (حماية الخصوصية)</label>
        </div>

        {message && <p style={{ color: message.includes("✅") ? "green" : "red", fontSize: "0.9rem" }}>{message}</p>}

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "جاري الإرسال..." : "إرسال التقييم"}
        </button>
      </form>
    </div>
  );
}
