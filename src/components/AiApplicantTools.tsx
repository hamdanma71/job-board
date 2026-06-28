"use client";

import { useState } from "react";
import { useT } from "@/components/I18nProvider";

export default function AiApplicantTools({
  applicationId,
  jobTitle,
  jobDescription,
}: {
  applicationId: string;
  jobTitle: string;
  jobDescription: string;
}) {
  const t = useT();
  const [summary, setSummary] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [screen, setScreen] = useState<{ qualified: boolean; isSpam: boolean; reason: string } | null>(null);
  const [loading, setLoading] = useState<"" | "summary" | "questions" | "screen">("");
  const [error, setError] = useState("");

  const run = async (kind: "summary" | "questions" | "screen") => {
    setLoading(kind);
    setError("");
    try {
      if (kind === "screen") {
        const res = await fetch("/api/ai/screen-applicant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t("aiTools.errScreen"));
        setScreen(data.data);
      } else if (kind === "summary") {
        const res = await fetch("/api/ai/summarize-cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t("aiTools.errSummary"));
        setSummary(data.data.summary);
      } else {
        const res = await fetch("/api/ai/interview-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: jobTitle, description: jobDescription }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t("aiTools.errQuestions"));
        setQuestions(data.data.questions);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="card" style={{ marginTop: "1.5rem" }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem" }}>{t("aiTools.title")}</h3>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button className="btn btn-outline" onClick={() => run("summary")} disabled={loading !== ""}>
          {loading === "summary" ? t("aiTools.summarizing") : t("aiTools.summarizeBtn")}
        </button>
        <button className="btn btn-outline" onClick={() => run("questions")} disabled={loading !== ""}>
          {loading === "questions" ? t("aiTools.generating") : t("aiTools.questionsBtn")}
        </button>
        <button className="btn btn-outline" onClick={() => run("screen")} disabled={loading !== ""}>
          {loading === "screen" ? t("aiTools.screening") : t("aiTools.screenBtn")}
        </button>
      </div>

      {error && <p style={{ color: "#ef4444", fontSize: "0.9rem", marginTop: "0.75rem" }}>{error}</p>}

      {summary && (
        <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--surface-hover)", borderRadius: "var(--radius-md)" }}>
          <strong>{t("aiTools.candidateSummary")}</strong>
          <p style={{ marginTop: "0.5rem", lineHeight: 1.7 }}>{summary}</p>
        </div>
      )}

      {screen && (
        <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--surface-hover)", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
            <span style={{ padding: "0.25rem 0.7rem", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: "bold", background: screen.qualified ? "rgba(22,163,74,0.12)" : "rgba(245,158,11,0.12)", color: screen.qualified ? "#16a34a" : "#b45309" }}>
              {screen.qualified ? t("aiTools.qualified") : t("aiTools.notQualified")}
            </span>
            <span style={{ padding: "0.25rem 0.7rem", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: "bold", background: screen.isSpam ? "rgba(244,63,94,0.12)" : "rgba(100,116,139,0.12)", color: screen.isSpam ? "var(--accent)" : "var(--text-muted)" }}>
              {screen.isSpam ? t("aiTools.spam") : t("aiTools.serious")}
            </span>
          </div>
          <p style={{ lineHeight: 1.7, fontSize: "0.9rem" }}>{screen.reason}</p>
        </div>
      )}

      {questions.length > 0 && (
        <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--surface-hover)", borderRadius: "var(--radius-md)" }}>
          <strong>{t("aiTools.suggestedQuestions")}</strong>
          <ol style={{ marginTop: "0.5rem", paddingInlineStart: "1.2rem", lineHeight: 1.9 }}>
            {questions.map((q, i) => <li key={i}>{q}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
}
