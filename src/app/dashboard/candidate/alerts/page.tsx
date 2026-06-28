"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useT } from "@/components/I18nProvider";

type JobAlert = {
  id: string;
  keywords: string;
  location: string | null;
  frequency: "DAILY" | "WEEKLY";
  isActive: boolean;
};

export default function JobAlertsPage() {
  const t = useT();
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newFrequency, setNewFrequency] = useState<"DAILY"|"WEEKLY">("DAILY");

  const load = async () => {
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      if (data.success) setAlerts(data.alerts);
    } catch (e) { /* ignore */ }
  };

  useEffect(() => { load(); }, []);

  const toggleAlert = async (id: string) => {
    await fetch(`/api/alerts/${id}`, { method: "PATCH" });
    load();
  };

  const deleteAlert = async (id: string) => {
    await fetch(`/api/alerts/${id}`, { method: "DELETE" });
    load();
  };

  const addAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword) return;
    await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords: newKeyword, location: newLocation, frequency: newFrequency }),
    });
    setIsAdding(false);
    setNewKeyword("");
    setNewLocation("");
    setNewFrequency("DAILY");
    load();
  };

  return (
    <div className="container" style={{ padding: "2rem" }}>
      <div className="flex-between mb-8">
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("alerts.title")}</h1>
          <p className="text-muted">{t("alerts.subtitle")}</p>
        </div>
        <Link href="/dashboard/candidate" className="btn btn-outline">{t("alerts.backToDash")}</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
        
        {/* Controls */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{t("alerts.yourAlerts")} ({alerts.length})</h2>
            <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
              {isAdding ? t("alerts.cancelAdd") : t("alerts.addNew")}
            </button>
          </div>

          {isAdding && (
            <form onSubmit={addAlert} style={{ backgroundColor: "var(--surface-hover)", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", alignItems: "end" }}>
              <div className="input-group">
                <label className="input-label">{t("alerts.keywordsLabel")}</label>
                <input type="text" className="input-field" placeholder={t("alerts.keywordsPlaceholder")} value={newKeyword} onChange={e => setNewKeyword(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">{t("alerts.locationLabel")}</label>
                <input type="text" className="input-field" placeholder={t("alerts.locationPlaceholder")} value={newLocation} onChange={e => setNewLocation(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">{t("alerts.frequencyLabel")}</label>
                <select className="input-field" value={newFrequency} onChange={e => setNewFrequency(e.target.value as any)}>
                  <option value="DAILY">{t("alerts.daily")}</option>
                  <option value="WEEKLY">{t("alerts.weekly")}</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: "0.75rem" }}>{t("alerts.saveAlert")}</button>
            </form>
          )}

          {alerts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "var(--surface-hover)", borderRadius: "8px" }}>
              <span style={{ fontSize: "3rem" }}>🔕</span>
              <p className="text-muted mt-4">{t("alerts.empty")}</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {alerts.map(alert => (
                <div key={alert.id} style={{ border: "1px solid var(--border-light)", borderRadius: "8px", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: alert.isActive ? "transparent" : "var(--surface-hover)", transition: "all 0.2s" }}>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.5rem", color: alert.isActive ? "var(--text-main)" : "var(--text-muted)" }}>
                      {t("alerts.searchFor")} {alert.keywords}
                    </h3>
                    <div style={{ display: "flex", gap: "1rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                      <span>📍 {alert.location || t("alerts.allLocations")}</span>
                      <span>⏱️ {t("alerts.frequencyWord")} {alert.frequency === "DAILY" ? t("alerts.daily") : t("alerts.weekly")}</span>
                      <span>{alert.isActive ? t("alerts.statusActive") : t("alerts.statusPaused")}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button 
                      onClick={() => toggleAlert(alert.id)}
                      className={`btn ${alert.isActive ? "btn-outline" : "btn-primary"}`}
                      style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                    >
                      {alert.isActive ? t("alerts.pause") : t("alerts.activate")}
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      style={{ padding: "0.5rem 1rem", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                    >
                      {t("alerts.delete")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        <div className="card" style={{ backgroundColor: "var(--primary)", color: "white" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1rem" }}>{t("alerts.tipTitle")}</h3>
          <p style={{ lineHeight: "1.6", opacity: 0.9 }}>
            {t("alerts.tipBody")}
          </p>
        </div>

      </div>
    </div>
  );
}
