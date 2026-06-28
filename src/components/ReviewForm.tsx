"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/I18nProvider";

const CRITERIA = [
  { key: "ratingWorkEnv", labelKey: "reviewForm.critWorkEnv" },
  { key: "ratingManagement", labelKey: "reviewForm.critManagement" },
  { key: "ratingSalary", labelKey: "reviewForm.critSalary" },
  { key: "ratingBenefits", labelKey: "reviewForm.critBenefits" },
  { key: "ratingGrowth", labelKey: "reviewForm.critGrowth" },
  { key: "ratingCulture", labelKey: "reviewForm.critCulture" },
  { key: "ratingStability", labelKey: "reviewForm.critStability" },
] as const;

export default function ReviewForm({ companyId }: { companyId: string }) {
  const t = useT();
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(CRITERIA.map((c) => [c.key, 5]))
  );
  const [comment, setComment] = useState("");
  const [salary, setSalary] = useState("");
  const [position, setPosition] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const router = useRouter();

  const setScore = (key: string, val: number) => setScores((s) => ({ ...s, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, ...scores, comment, salary, position, isAnonymous }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOk(true);
      setMessage(t("reviewForm.success"));
      setComment(""); setSalary(""); setPosition("");
      setTimeout(() => router.refresh(), 1500);
    } catch (err: any) {
      setOk(false);
      setMessage(err.message || t("reviewForm.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", backgroundColor: "var(--surface-hover)", padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{t("reviewForm.title")}</h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
        {CRITERIA.map((c) => (
          <div key={c.key} className="flex-between" style={{ gap: "0.5rem" }}>
            <span style={{ fontSize: "0.9rem" }}>{t(c.labelKey)}</span>
            <div style={{ display: "flex", gap: "0.15rem" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setScore(c.key, n)}
                  style={{ background: "none", border: "none", fontSize: "1.1rem", cursor: "pointer", color: n <= scores[c.key] ? "var(--accent)" : "var(--text-light)" }}>
                  ★
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label className="input-label">{t("reviewForm.positionLabel")}</label>
          <input type="text" className="input-field" value={position} onChange={(e) => setPosition(e.target.value)} placeholder={t("reviewForm.positionPlaceholder")} />
        </div>
        <div>
          <label className="input-label">{t("reviewForm.salaryLabel")}</label>
          <input type="text" className="input-field" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder={t("reviewForm.salaryPlaceholder")} />
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">{t("reviewForm.commentLabel")}</label>
        <textarea className="input-field" value={comment} onChange={(e) => setComment(e.target.value)} required rows={3} placeholder={t("reviewForm.commentPlaceholder")}></textarea>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input type="checkbox" id="anonymous" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
        <label htmlFor="anonymous" style={{ fontSize: "0.9rem" }}>{t("reviewForm.anonymous")}</label>
      </div>

      <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ alignSelf: "flex-start" }}>
        {isLoading ? t("reviewForm.submitting") : t("reviewForm.submit")}
      </button>

      {message && <p style={{ fontSize: "0.9rem", color: ok ? "var(--secondary)" : "#ef4444" }}>{message}</p>}
    </form>
  );
}
