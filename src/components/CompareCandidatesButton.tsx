"use client";

import { useState } from "react";
import { useT } from "@/components/I18nProvider";

export default function CompareCandidatesButton({ jobId }: { jobId: string }) {
  const t = useT();
  const [data, setData] = useState<{ ranking: { name: string; score: number; note: string }[]; recommendation: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/compare-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t("compareCand.error"));
      setData(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button className="btn btn-outline" onClick={run} disabled={loading}>
        {loading ? t("compareCand.comparing") : t("compareCand.compareBtn")}
      </button>
      {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "0.5rem" }}>{error}</p>}
      {data && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <p style={{ fontWeight: "bold", marginBottom: "0.75rem" }}>💡 {data.recommendation}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {data.ranking.map((r, i) => (
              <div key={i} className="flex-between" style={{ padding: "0.5rem 0.75rem", background: "var(--surface-hover)", borderRadius: "var(--radius-md)" }}>
                <div>
                  <strong>{i + 1}. {r.name}</strong>
                  <p className="text-muted" style={{ fontSize: "0.82rem" }}>{r.note}</p>
                </div>
                <span style={{ fontWeight: "bold", color: "var(--primary)" }}>{r.score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
