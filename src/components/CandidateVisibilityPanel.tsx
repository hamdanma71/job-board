"use client";

import { useState } from "react";
import { useT } from "@/components/I18nProvider";

export default function CandidateVisibilityPanel({
  initialSearchable,
  initialBoosted,
}: {
  initialSearchable: boolean;
  initialBoosted: boolean;
}) {
  const t = useT();
  const [searchable, setSearchable] = useState(initialSearchable);
  const [boosted, setBoosted] = useState(initialBoosted);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState("");

  const act = async (action: string) => {
    setLoading(action);
    setMsg("");
    try {
      const res = await fetch("/api/candidate/visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("visibility.error"));
      if (action === "toggleSearchable") setSearchable(data.isSearchable);
      if (action === "boost") { setBoosted(true); setMsg(t("visibility.boostMsg")); }
      if (action === "refresh") setMsg(t("visibility.refreshMsg"));
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="card">
      <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem" }}>
        {t("visibility.title")}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
          <input type="checkbox" checked={searchable} onChange={() => act("toggleSearchable")} disabled={loading !== ""} />
          {t("visibility.allowSearch")}
        </label>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button className="btn btn-primary" style={{ fontSize: "0.85rem", padding: "0.45rem 1rem" }} onClick={() => act("boost")} disabled={loading !== "" || boosted}>
            {boosted ? t("visibility.boosted") : t("visibility.boostBtn")}
          </button>
          <button className="btn btn-outline" style={{ fontSize: "0.85rem", padding: "0.45rem 1rem" }} onClick={() => act("refresh")} disabled={loading !== ""}>
            {t("visibility.refreshBtn")}
          </button>
        </div>
        {msg && <p style={{ fontSize: "0.85rem" }}>{msg}</p>}
        <p className="text-muted" style={{ fontSize: "0.78rem" }}>{t("visibility.hint")}</p>
      </div>
    </div>
  );
}
