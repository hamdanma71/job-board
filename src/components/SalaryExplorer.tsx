"use client";

import { useMemo, useState } from "react";
import { useT } from "@/components/I18nProvider";

type Rec = { position: string; salary: number; currency: string; location: string; sector: string };

export default function SalaryExplorer({
  records,
  locations,
  sectors,
}: {
  records: Rec[];
  locations: string[];
  sectors: string[];
}) {
  const t = useT();
  const [location, setLocation] = useState("");
  const [sector, setSector] = useState("");

  const list = useMemo(() => {
    const filtered = records.filter(
      (r) => (!location || r.location === location) && (!sector || r.sector === sector)
    );
    // Group by position + currency so values of different currencies are never pooled.
    const grouped: Record<string, { position: string; currency: string; vals: number[] }> = {};
    for (const r of filtered) {
      const key = `${r.position}__${r.currency}`;
      (grouped[key] ||= { position: r.position, currency: r.currency, vals: [] }).vals.push(r.salary);
    }
    return Object.values(grouped)
      .map(({ position, currency, vals }) => ({
        position,
        currency,
        count: vals.length,
        min: Math.min(...vals),
        max: Math.max(...vals),
        avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
      }))
      .sort((a, b) => b.count - a.count);
  }, [records, location, sector]);

  return (
    <div>
      <div className="card" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "end", marginBottom: "1.5rem" }}>
        <div className="input-group" style={{ margin: 0, flex: "1 1 220px" }}>
          <label className="input-label">{t("salaryExp.locationLabel")}</label>
          <select className="input-field" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">{t("salaryExp.allLocations")}</option>
            {locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="input-group" style={{ margin: 0, flex: "1 1 220px" }}>
          <label className="input-label">{t("salaryExp.sectorLabel")}</label>
          <select className="input-field" value={sector} onChange={(e) => setSector(e.target.value)}>
            <option value="">{t("salaryExp.allSectors")}</option>
            {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <span className="text-muted" style={{ fontSize: "0.85rem" }}>{list.length} {t("salaryExp.titlesWord")} · {records.filter((r) => (!location || r.location === location) && (!sector || r.sector === sector)).length} {t("salaryExp.submissionsWord")}</span>
      </div>

      {list.length === 0 ? (
        <div className="card text-center" style={{ padding: "3rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{t("salaryExp.noData")}</h2>
          <p className="text-muted">{t("salaryExp.noDataHint")}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {list.map((item, idx) => (
            <div key={idx} className="card animate-fade-in" style={{ border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="flex-between" style={{ alignItems: "flex-start" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", textTransform: "capitalize", margin: 0 }}>{item.position}</h3>
                <span style={{ backgroundColor: "var(--surface-hover)", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", fontSize: "0.8rem", color: "var(--text-light)" }}>{item.count} {t("salaryExp.submissionsWord")}</span>
              </div>
              <div style={{ textAlign: "center", padding: "1rem 0", borderBottom: "1px solid var(--border-light)" }}>
                <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "0.3rem" }}>{t("salaryExp.avgSalary")}</p>
                <p style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary)", margin: 0 }}>
                  {item.avg.toLocaleString()} <span style={{ fontSize: "1rem", color: "var(--text-light)" }}>{item.currency}</span>
                </p>
              </div>
              <div className="flex-between" style={{ fontSize: "0.9rem" }}>
                <div><p className="text-muted" style={{ fontSize: "0.75rem", margin: 0 }}>{t("salaryExp.min")}</p><p style={{ color: "#ef4444", fontWeight: "bold", margin: 0 }}>{item.min.toLocaleString()}</p></div>
                <div style={{ textAlign: "end" }}><p className="text-muted" style={{ fontSize: "0.75rem", margin: 0 }}>{t("salaryExp.max")}</p><p style={{ color: "var(--secondary)", fontWeight: "bold", margin: 0 }}>{item.max.toLocaleString()}</p></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
