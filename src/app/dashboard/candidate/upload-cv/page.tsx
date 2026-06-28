"use client";

import { useState } from "react";
import Link from "next/link";
import { useT } from "@/components/I18nProvider";

export default function UploadCVPage() {
  const t = useT();
  const [cvText, setCvText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleParseCV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvText.trim() && !file) return;

    setIsLoading(true);
    setError("");
    setResult(null);
    setSuggestions([]);

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
        throw new Error(data.error || t("uploadCv.parseError"));
      }

      setResult(data.data);
      setSuggestions(data.suggestions || []);
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
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>{t("uploadCv.title")}</h1>
          <p className="text-muted">{t("uploadCv.subtitle")}</p>
        </div>
        <Link href="/dashboard/candidate" className="btn btn-outline">{t("uploadCv.backToDash")}</Link>
      </header>

      <div className="grid-2">
        <div className="card">
          <form onSubmit={handleParseCV}>
            <div className="input-group" style={{ marginBottom: "1.5rem" }}>
              <label className="input-label" htmlFor="cv-file">
                {t("uploadCv.step1")}
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

            <div style={{ textAlign: "center", marginBottom: "1.5rem", fontWeight: "bold", color: "var(--text-muted)" }}>{t("uploadCv.or")}</div>

            <div className="input-group">
              <label className="input-label" htmlFor="cv-text">
                {t("uploadCv.step2")}
              </label>
              <textarea
                id="cv-text"
                className="input-field"
                rows={10}
                placeholder={t("uploadCv.textPlaceholder")}
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
              {isLoading ? t("uploadCv.analyzing") : t("uploadCv.analyzeBtn")}
            </button>
          </form>
        </div>

        <div>
          {isLoading ? (
            <div className="card flex-center" style={{ height: "100%", minHeight: "300px" }}>
              <div style={{ textAlign: "center", color: "var(--primary)" }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚙️</div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{t("uploadCv.readingTitle")}</h3>
                <p className="text-muted mt-2">{t("uploadCv.readingSub")}</p>
              </div>
            </div>
          ) : result ? (
            <div className="card">
              <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", color: "var(--secondary)" }}>{t("uploadCv.successTitle")}</h2>

              <div className="mb-4">
                <h3 style={{ fontSize: "1rem", fontWeight: "bold", color: "var(--text-muted)" }}>{t("uploadCv.bioLabel")}</h3>
                <p style={{ marginTop: "0.5rem" }}>{result.bio || t("uploadCv.noBio")}</p>
              </div>

              <div className="mb-4">
                <h3 style={{ fontSize: "1rem", fontWeight: "bold", color: "var(--text-muted)" }}>{t("uploadCv.expYears")}</h3>
                <p style={{ marginTop: "0.5rem", fontSize: "1.25rem", fontWeight: "bold" }}>{result.experienceYears || 0} {t("uploadCv.yearsWord")}</p>
              </div>

              <div className="mb-4">
                <h3 style={{ fontSize: "1rem", fontWeight: "bold", color: "var(--text-muted)" }}>{t("uploadCv.location")}</h3>
                <p style={{ marginTop: "0.5rem" }}>{result.location || t("uploadCv.unspecified")}</p>
              </div>

              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "0.5rem" }}>{t("uploadCv.detectedSkills")}</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {result.skills?.map((skill: string, idx: number) => (
                    <span key={idx} style={{ padding: "0.3rem 0.8rem", backgroundColor: "var(--surface-hover)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-full)", fontSize: "0.85rem", color: "var(--primary)" }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {suggestions.length > 0 && (
                <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-light)" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "0.5rem" }}>{t("uploadCv.suggestionsTitle")}</h3>
                  <ul style={{ paddingInlineStart: "1.2rem", lineHeight: 1.9, fontSize: "0.9rem" }}>
                    {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="card flex-center" style={{ height: "100%", minHeight: "300px", backgroundColor: "var(--surface-hover)", border: "1px dashed var(--border-dark)" }}>
              <p className="text-muted">{t("uploadCv.resultsPlaceholder")}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
