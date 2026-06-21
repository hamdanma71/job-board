"use client";

import { useState } from "react";
import Link from "next/link";

export default function UploadCVPage() {
  const [cvText, setCvText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleParseCV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvText.trim() && !file) return;

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      let options: RequestInit = { method: "POST" };

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("saveProfile", "true");
        options.body = formData;
      } else {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify({ cvText, saveProfile: true });
      }

      const response = await fetch("/api/ai/parse-cv", options);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "حدث خطأ أثناء تحليل السيرة الذاتية");
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      <header className="flex-between mb-8">
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>تحليل السيرة الذاتية بالذكاء الاصطناعي</h1>
          <p className="text-muted">دع الذكاء الاصطناعي يستخرج مهاراتك وخبراتك تلقائياً لبناء ملفك</p>
        </div>
        <Link href="/dashboard/candidate" className="btn btn-outline">العودة للوحة التحكم</Link>
      </header>

      <div className="grid-2">
        <div className="card">
          <form onSubmit={handleParseCV}>
            <div className="input-group" style={{ marginBottom: "1.5rem" }}>
              <label className="input-label" htmlFor="cv-file">
                1. رفع ملف السيرة الذاتية (PDF, TXT)
              </label>
              <input 
                type="file" 
                id="cv-file"
                className="input-field"
                accept=".pdf,.txt"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  if (e.target.files?.[0]) setCvText(""); // Clear text if file is chosen
                }}
                disabled={isLoading}
                style={{ padding: "0.5rem" }}
              />
            </div>

            <div style={{ textAlign: "center", marginBottom: "1.5rem", fontWeight: "bold", color: "var(--text-muted)" }}>أو</div>

            <div className="input-group">
              <label className="input-label" htmlFor="cv-text">
                2. لصق محتوى السيرة الذاتية يدوياً
              </label>
              <textarea
                id="cv-text"
                className="input-field"
                rows={10}
                placeholder="مثال: أعمل كمطور برمجيات منذ 5 سنوات ولدي خبرة في React و Node.js..."
                value={cvText}
                onChange={(e) => {
                  setCvText(e.target.value);
                  if (e.target.value) setFile(null); // Clear file if text is typed
                }}
                style={{ resize: "vertical" }}
                disabled={isLoading}
              ></textarea>
            </div>
            
            {error && (
              <div style={{ color: "red", marginBottom: "1rem", fontSize: "0.9rem" }}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: "100%" }} 
              disabled={isLoading || (!cvText.trim() && !file)}
            >
              {isLoading ? "جاري التحليل واستخراج البيانات..." : "تحليل السيرة الذاتية"}
            </button>
          </form>
        </div>

        <div>
          {isLoading ? (
            <div className="card flex-center" style={{ height: "100%", minHeight: "300px" }}>
              <div style={{ textAlign: "center", color: "var(--primary)" }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚙️</div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>الذكاء الاصطناعي يقرأ سيرتك الذاتية...</h3>
                <p className="text-muted mt-2">يتم الآن استخراج المهارات وسنوات الخبرة</p>
              </div>
            </div>
          ) : result ? (
            <div className="card">
              <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", color: "var(--secondary)" }}>✅ تم التحليل بنجاح!</h2>
              
              <div className="mb-4">
                <h3 style={{ fontSize: "1rem", fontWeight: "bold", color: "var(--text-muted)" }}>النبذة (Bio)</h3>
                <p style={{ marginTop: "0.5rem" }}>{result.bio || "لم يتم التعرف على نبذة"}</p>
              </div>

              <div className="mb-4">
                <h3 style={{ fontSize: "1rem", fontWeight: "bold", color: "var(--text-muted)" }}>سنوات الخبرة</h3>
                <p style={{ marginTop: "0.5rem", fontSize: "1.25rem", fontWeight: "bold" }}>{result.experienceYears || 0} سنوات</p>
              </div>

              <div className="mb-4">
                <h3 style={{ fontSize: "1rem", fontWeight: "bold", color: "var(--text-muted)" }}>الموقع الجغرافي</h3>
                <p style={{ marginTop: "0.5rem" }}>{result.location || "غير محدد"}</p>
              </div>

              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "0.5rem" }}>المهارات المكتشفة</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {result.skills?.map((skill: string, idx: number) => (
                    <span key={idx} style={{ padding: "0.3rem 0.8rem", backgroundColor: "var(--surface-hover)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-full)", fontSize: "0.85rem", color: "var(--primary)" }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card flex-center" style={{ height: "100%", minHeight: "300px", backgroundColor: "var(--surface-hover)", border: "1px dashed var(--border-dark)" }}>
              <p className="text-muted">النتائج ستظهر هنا بعد التحليل</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
