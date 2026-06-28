"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/I18nProvider";

type C = { companyName: string; industry: string | null; description: string | null; location: string | null; website: string | null; isStartup: boolean; stage: string | null; fundingRaised: string | null; teamSize: string | null };

export default function CompanyProfileEditor({ company }: { company: C }) {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    companyName: company.companyName || "", industry: company.industry || "", description: company.description || "",
    location: company.location || "", website: company.website || "", isStartup: company.isStartup,
    stage: company.stage || "", fundingRaised: company.fundingRaised || "", teamSize: company.teamSize || "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: any) => setF((s) => ({ ...s, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch("/api/company/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      if (r.ok) { router.refresh(); setOpen(false); }
    } finally { setBusy(false); }
  };

  if (!open) return <button className="btn btn-outline" onClick={() => setOpen(true)} style={{ fontSize: "0.85rem" }}>{t("companyEditor.openBtn")}</button>;

  return (
    <form onSubmit={save} className="card" style={{ marginTop: "1rem" }}>
      <h3 style={{ fontWeight: "bold", marginBottom: "0.75rem" }}>{t("companyEditor.title")}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "0.75rem" }}>
        <input className="input-field" placeholder={t("companyEditor.name")} value={f.companyName} onChange={(e) => set("companyName", e.target.value)} />
        <input className="input-field" placeholder={t("companyEditor.industry")} value={f.industry} onChange={(e) => set("industry", e.target.value)} />
        <input className="input-field" placeholder={t("companyEditor.location")} value={f.location} onChange={(e) => set("location", e.target.value)} />
        <input className="input-field" placeholder={t("companyEditor.website")} value={f.website} onChange={(e) => set("website", e.target.value)} />
      </div>
      <textarea className="input-field" style={{ marginTop: "0.75rem" }} rows={2} placeholder={t("companyEditor.description")} value={f.description} onChange={(e) => set("description", e.target.value)} />
      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", margin: "0.75rem 0" }}>
        <input type="checkbox" checked={f.isStartup} onChange={(e) => set("isStartup", e.target.checked)} /> {t("companyEditor.isStartup")}
      </label>
      {f.isStartup && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "0.75rem" }}>
          <input className="input-field" placeholder={t("companyEditor.stage")} value={f.stage} onChange={(e) => set("stage", e.target.value)} />
          <input className="input-field" placeholder={t("companyEditor.funding")} value={f.fundingRaised} onChange={(e) => set("fundingRaised", e.target.value)} />
          <input className="input-field" placeholder={t("companyEditor.teamSize")} value={f.teamSize} onChange={(e) => set("teamSize", e.target.value)} />
        </div>
      )}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "..." : t("companyEditor.save")}</button>
        <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>{t("companyEditor.cancel")}</button>
      </div>
    </form>
  );
}
