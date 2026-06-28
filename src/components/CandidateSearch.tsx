"use client";

import { useState } from "react";
import { parseSkills } from "@/lib/skills";
import { NATIONALITIES } from "@/lib/worldCountries";
import { useT } from "@/components/I18nProvider";

type Candidate = {
  userId: string;
  name: string;
  specialization: string | null;
  experienceYears: number;
  location: string | null;
  nationality: string | null;
  skills: string | null;
  bio: string | null;
  hasResume: boolean;
  boosted: boolean;
};

export default function CandidateSearch() {
  const t = useT();
  const [filters, setFilters] = useState({ q: "", nationality: "", location: "", specialization: "", minExp: "" });
  const [results, setResults] = useState<Candidate[]>([]);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as any).toString();
      const res = await fetch(`/api/candidates/search?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("candSearchC.searchError"));
      setResults(data.candidates);
      setSearched(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const [invited, setInvited] = useState<Record<string, boolean>>({});

  const toggleSave = async (candidateId: string) => {
    const res = await fetch("/api/candidates/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId }),
    });
    const data = await res.json();
    if (res.ok) setSaved((s) => ({ ...s, [candidateId]: data.saved }));
  };

  const invite = async (candidateId: string) => {
    const res = await fetch("/api/candidates/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId, message: t("candSearchC.inviteMessage") }),
    });
    if (res.ok) setInvited((s) => ({ ...s, [candidateId]: true }));
    else { const d = await res.json(); alert(d.error || t("candSearchC.inviteError")); }
  };

  const set = (k: string, v: string) => setFilters((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <form onSubmit={search} className="card" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", alignItems: "end", marginBottom: "1.5rem" }}>
        <div className="input-group" style={{ margin: 0 }}>
          <label className="input-label">{t("candSearchC.keywordLabel")}</label>
          <input className="input-field" value={filters.q} onChange={(e) => set("q", e.target.value)} placeholder={t("candSearchC.keywordPlaceholder")} />
        </div>
        <div className="input-group" style={{ margin: 0 }}>
          <label className="input-label">{t("candSearchC.specLabel")}</label>
          <input className="input-field" value={filters.specialization} onChange={(e) => set("specialization", e.target.value)} placeholder={t("candSearchC.specPlaceholder")} />
        </div>
        <div className="input-group" style={{ margin: 0 }}>
          <label className="input-label">{t("candSearchC.nationalityLabel")}</label>
          <select className="input-field" value={filters.nationality} onChange={(e) => set("nationality", e.target.value)}>
            <option value="">{t("candSearchC.allNationalities")}</option>
            {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="input-group" style={{ margin: 0 }}>
          <label className="input-label">{t("candSearchC.locationLabel")}</label>
          <input className="input-field" value={filters.location} onChange={(e) => set("location", e.target.value)} placeholder={t("candSearchC.locationPlaceholder")} />
        </div>
        <div className="input-group" style={{ margin: 0 }}>
          <label className="input-label">{t("candSearchC.minExpLabel")}</label>
          <input className="input-field" type="number" min="0" value={filters.minExp} onChange={(e) => set("minExp", e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? t("candSearchC.searching") : t("candSearchC.searchBtn")}</button>
      </form>

      {error && <p style={{ color: "#ef4444" }}>{error}</p>}

      {searched && results.length === 0 && !loading && (
        <div className="card text-center" style={{ padding: "3rem" }}><p className="text-muted">{t("candSearchC.noResults")}</p></div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {results.map((c) => (
          <div key={c.userId} className="card" style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "240px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{c.name}</h3>
                {c.boosted && <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem", background: "linear-gradient(135deg,var(--primary),var(--secondary))", color: "white", borderRadius: "var(--radius-full)" }}>{t("candSearchC.boosted")}</span>}
              </div>
              <p className="text-muted" style={{ fontSize: "0.9rem", margin: "0.25rem 0" }}>
                {c.specialization || "—"} • {c.experienceYears} {t("candSearchC.yearsExp")} • {c.location || "—"} {c.nationality ? `• ${c.nationality}` : ""}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.5rem" }}>
                {parseSkills(c.skills).slice(0, 8).map((s, i) => (
                  <span key={i} style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem", background: "var(--surface-hover)", borderRadius: "var(--radius-full)" }}>{s}</span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "stretch" }}>
              <button className="btn btn-outline" style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }} onClick={() => toggleSave(c.userId)}>
                {saved[c.userId] ? t("candSearchC.saved") : t("candSearchC.saveToList")}
              </button>
              <a href={`/messages?to=${c.userId}`} className="btn btn-outline" style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}>{t("candSearchC.message")}</a>
              <button className="btn btn-outline" style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }} onClick={() => invite(c.userId)} disabled={invited[c.userId]}>
                {invited[c.userId] ? t("candSearchC.invited") : t("candSearchC.inviteBtn")}
              </button>
              {c.hasResume && (
                <a href={`/api/cv/${c.userId}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}>{t("candSearchC.resume")}</a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
