"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/I18nProvider";

export default function InterviewReviewForm({ companyId }: { companyId: string }) {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState("");
  const [difficulty, setDifficulty] = useState(3);
  const [outcome, setOutcome] = useState("PENDING");
  const [questions, setQuestions] = useState("");
  const [experience, setExperience] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg("");
    try {
      const r = await fetch(`/api/companies/${companyId}/interview-review`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position, difficulty, outcome, questions, experience, isAnonymous }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || t("intReview.error"));
      setMsg(t("intReview.successMsg")); setExperience(""); setQuestions(""); setPosition("");
      router.refresh(); setOpen(false);
    } catch (e: any) { setMsg(`❌ ${e.message}`); } finally { setBusy(false); }
  };

  if (!open) return <button className="btn btn-outline" onClick={() => setOpen(true)}>{t("intReview.openBtn")}</button>;

  return (
    <form onSubmit={submit} className="card" style={{ marginTop: "1rem", background: "var(--surface-hover)" }}>
      <h4 style={{ fontWeight: "bold", marginBottom: "0.75rem" }}>{t("intReview.title")}</h4>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "0.75rem" }}>
        <input className="input-field" placeholder={t("intReview.position")} value={position} onChange={(e) => setPosition(e.target.value)} />
        <select className="input-field" value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))}>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{t("intReview.difficulty")} {n}/5</option>)}
        </select>
        <select className="input-field" value={outcome} onChange={(e) => setOutcome(e.target.value)}>
          <option value="PENDING">{t("intReview.pending")}</option>
          <option value="OFFER">{t("intReview.gotOffer")}</option>
          <option value="REJECTED">{t("intReview.rejected")}</option>
          <option value="NO_RESPONSE">{t("intReview.noResponse")}</option>
        </select>
      </div>
      <textarea className="input-field" style={{ marginTop: "0.75rem" }} rows={2} placeholder={t("intReview.questionsPlaceholder")} value={questions} onChange={(e) => setQuestions(e.target.value)} />
      <textarea className="input-field" style={{ marginTop: "0.75rem" }} rows={3} placeholder={t("intReview.experiencePlaceholder")} value={experience} onChange={(e) => setExperience(e.target.value)} required />
      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", marginTop: "0.5rem" }}>
        <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} /> {t("intReview.anonymous")}
      </label>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "..." : t("intReview.submit")}</button>
        <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>{t("intReview.cancel")}</button>
      </div>
      {msg && <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>{msg}</p>}
    </form>
  );
}
