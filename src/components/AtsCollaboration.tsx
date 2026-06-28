"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/I18nProvider";

type Scorecard = { id: string; rating: number; recommendation: string; strengths: string | null; weaknesses: string | null; reviewer?: { name: string } };
type Comment = { id: string; body: string; createdAt: string; author?: { name: string } };
type Offer = { salary: string | null; status: string; notes: string | null } | null;

export default function AtsCollaboration({ applicationId, scorecards, comments, offer }: { applicationId: string; scorecards: Scorecard[]; comments: Comment[]; offer: Offer }) {
  const t = useT();
  const REC_LABEL: Record<string, string> = { STRONG_YES: t("ats.recStrongYes"), YES: t("ats.recYes"), NO: t("ats.recNo"), STRONG_NO: t("ats.recStrongNo") };
  const router = useRouter();
  const [rating, setRating] = useState(4);
  const [rec, setRec] = useState("YES");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [comment, setComment] = useState("");
  const [oSalary, setOSalary] = useState("");
  const [oStart, setOStart] = useState("");
  const [oNotes, setONotes] = useState("");
  const [busy, setBusy] = useState("");

  const post = async (url: string, body: any, tag: string) => {
    setBusy(tag);
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (r.ok) router.refresh();
    } finally { setBusy(""); }
  };

  const avg = scorecards.length ? (scorecards.reduce((a, s) => a + s.rating, 0) / scorecards.length).toFixed(1) : null;

  return (
    <div className="card" style={{ marginTop: "1.5rem" }}>
      <h3 style={{ fontSize: "1.15rem", fontWeight: "bold", marginBottom: "1rem" }}>{t("ats.title")}</h3>

      {/* Scorecards */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h4 style={{ fontSize: "0.95rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("ats.scorecards")} {avg && <span className="text-muted">({t("ats.average")} {avg}/5)</span>}</h4>
        {scorecards.map((s) => (
          <div key={s.id} style={{ padding: "0.6rem 0.8rem", background: "var(--surface-hover)", borderRadius: "var(--radius-md)", marginBottom: "0.5rem", fontSize: "0.85rem" }}>
            <div className="flex-between"><strong>{s.reviewer?.name || t("ats.reviewer")}</strong><span>{"★".repeat(s.rating)} · {REC_LABEL[s.recommendation] || s.recommendation}</span></div>
            {s.strengths && <p style={{ margin: "0.2rem 0 0" }}>👍 {s.strengths}</p>}
            {s.weaknesses && <p style={{ margin: "0.2rem 0 0" }}>👎 {s.weaknesses}</p>}
          </div>
        ))}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "end", marginTop: "0.5rem" }}>
          <select className="input-field" style={{ width: "auto" }} value={rating} onChange={(e) => setRating(Number(e.target.value))}>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}</select>
          <select className="input-field" style={{ width: "auto" }} value={rec} onChange={(e) => setRec(e.target.value)}>{Object.entries(REC_LABEL).map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select>
          <input className="input-field" style={{ flex: "1 1 120px" }} placeholder={t("ats.strengths")} value={strengths} onChange={(e) => setStrengths(e.target.value)} />
          <input className="input-field" style={{ flex: "1 1 120px" }} placeholder={t("ats.weaknesses")} value={weaknesses} onChange={(e) => setWeaknesses(e.target.value)} />
          <button className="btn btn-outline" disabled={busy !== ""} onClick={() => post(`/api/applications/${applicationId}/scorecard`, { rating, recommendation: rec, strengths, weaknesses }, "sc")}>{t("ats.addScorecard")}</button>
        </div>
      </div>

      {/* Team comments */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h4 style={{ fontSize: "0.95rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("ats.teamNotes")}</h4>
        {comments.map((c) => (
          <div key={c.id} style={{ padding: "0.5rem 0.8rem", borderInlineStart: "3px solid var(--primary)", background: "var(--surface-hover)", borderRadius: "var(--radius-md)", marginBottom: "0.4rem", fontSize: "0.85rem" }}>
            <strong>{c.author?.name || t("ats.member")}:</strong> {c.body}
          </div>
        ))}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <input className="input-field" style={{ flex: 1 }} placeholder={t("ats.notePlaceholder")} value={comment} onChange={(e) => setComment(e.target.value)} />
          <button className="btn btn-outline" disabled={busy !== "" || !comment.trim()} onClick={() => { post(`/api/applications/${applicationId}/comment`, { body: comment }, "cm"); setComment(""); }}>{t("ats.commentBtn")}</button>
        </div>
      </div>

      {/* Offer */}
      <div>
        <h4 style={{ fontSize: "0.95rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("ats.offer")}</h4>
        {offer ? (
          <p style={{ fontSize: "0.9rem" }}>{t("ats.offerWord")} {offer.salary ? `(${offer.salary})` : ""} — {t("ats.statusLabel")} <strong>{offer.status === "ACCEPTED" ? t("ats.offerAccepted") : offer.status === "DECLINED" ? t("ats.offerDeclined") : t("ats.offerSent")}</strong></p>
        ) : (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "end" }}>
            <input className="input-field" style={{ flex: "1 1 120px" }} placeholder={t("ats.salary")} value={oSalary} onChange={(e) => setOSalary(e.target.value)} />
            <input type="date" className="input-field" style={{ flex: "1 1 120px" }} value={oStart} onChange={(e) => setOStart(e.target.value)} />
            <input className="input-field" style={{ flex: "1 1 120px" }} placeholder={t("ats.notes")} value={oNotes} onChange={(e) => setONotes(e.target.value)} />
            <button className="btn btn-primary" disabled={busy !== ""} onClick={() => post(`/api/applications/${applicationId}/offer`, { salary: oSalary, startDate: oStart, notes: oNotes }, "of")}>{t("ats.sendOffer")}</button>
          </div>
        )}
      </div>
    </div>
  );
}
