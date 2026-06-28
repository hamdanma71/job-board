"use client";

import { useState } from "react";
import { useT } from "@/components/I18nProvider";

export default function EndorseSkills({ candidateId, skills, initiallyEndorsed }: { candidateId: string; skills: string[]; initiallyEndorsed: string[] }) {
  const t = useT();
  const [endorsed, setEndorsed] = useState<Record<string, boolean>>(
    Object.fromEntries(initiallyEndorsed.map((s) => [s, true]))
  );

  const toggle = async (skill: string) => {
    const r = await fetch("/api/endorse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ candidateId, skill }) });
    const d = await r.json();
    if (r.ok) setEndorsed((e) => ({ ...e, [skill]: d.endorsed }));
  };

  if (skills.length === 0) return <p className="text-muted">{t("endorse.noSkills")}</p>;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {skills.map((s, i) => (
        <button key={i} onClick={() => toggle(s)} title={t("endorse.endorseSkill")}
          style={{ cursor: "pointer", fontSize: "0.82rem", padding: "0.25rem 0.7rem", borderRadius: "var(--radius-full)", border: `1px solid ${endorsed[s] ? "var(--primary)" : "var(--border-dark)"}`, background: endorsed[s] ? "var(--primary)" : "transparent", color: endorsed[s] ? "white" : "var(--text-main)" }}>
          {s} {endorsed[s] ? "✓" : "+"}
        </button>
      ))}
    </div>
  );
}
