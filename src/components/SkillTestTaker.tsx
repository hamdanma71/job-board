"use client";

import { useState } from "react";
import Link from "next/link";
import { useT } from "@/components/I18nProvider";

type Q = { q: string; options: string[] };

export default function SkillTestTaker({ testId, questions }: { testId: string; questions: Q[] }) {
  const t = useT();
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [result, setResult] = useState<{ score: number; passed: boolean; correct: number; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const choose = (qi: number, oi: number) => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)));
  const allAnswered = answers.every((a) => a >= 0);

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/skills/${testId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("skillTaker.submitError"));
      setResult(data.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="card text-center" style={{ padding: "3rem" }}>
        <div style={{ fontSize: "3rem" }}>{result.passed ? "🏅" : "📋"}</div>
        <h2 style={{ fontSize: "2rem", fontWeight: "bold", color: result.passed ? "#16a34a" : "var(--accent)", margin: "1rem 0" }}>
          {result.score}%
        </h2>
        <p style={{ marginBottom: "0.5rem" }}>{t("skillTaker.correctAnswers")} {result.correct} {t("skillTaker.outOf")} {result.total}</p>
        <p className="text-muted" style={{ marginBottom: "1.5rem" }}>{result.passed ? t("skillTaker.passed") : t("skillTaker.failed")}</p>
        <Link href="/skills" className="btn btn-outline">{t("skillTaker.backToTests")}</Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {questions.map((q, qi) => (
        <div key={qi} className="card">
          <h3 style={{ fontSize: "1.05rem", fontWeight: "bold", marginBottom: "1rem" }}>{qi + 1}. {q.q}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {q.options.map((opt, oi) => (
              <label key={oi} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 0.8rem", border: `1px solid ${answers[qi] === oi ? "var(--primary)" : "var(--border-light)"}`, borderRadius: "var(--radius-md)", cursor: "pointer", background: answers[qi] === oi ? "var(--surface-hover)" : "transparent" }}>
                <input type="radio" name={`q${qi}`} checked={answers[qi] === oi} onChange={() => choose(qi, oi)} />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}
      {error && <p style={{ color: "#ef4444" }}>{error}</p>}
      <button className="btn btn-primary" onClick={submit} disabled={loading || !allAnswered} style={{ alignSelf: "flex-start" }}>
        {loading ? t("skillTaker.grading") : allAnswered ? t("skillTaker.submitAnswers") : t("skillTaker.answerAll")}
      </button>
    </div>
  );
}
