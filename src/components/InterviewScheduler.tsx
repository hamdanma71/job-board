"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/I18nProvider";

export default function InterviewScheduler({
  applicationId,
  existing,
}: {
  applicationId: string;
  existing?: { scheduledAt: string; mode: string; location: string | null; note: string | null } | null;
}) {
  const t = useT();
  const router = useRouter();
  const [scheduledAt, setScheduledAt] = useState(existing ? existing.scheduledAt.slice(0, 16) : "");
  const [mode, setMode] = useState(existing?.mode || "ONLINE");
  const [location, setLocation] = useState(existing?.location || "");
  const [note, setNote] = useState(existing?.note || "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(`/api/applications/${applicationId}/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt, mode, location, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("interview.saveError"));
      setMsg(t("interview.scheduledMsg"));
      router.refresh();
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card" style={{ marginTop: "1.5rem" }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem" }}>
        {existing ? t("interview.editTitle") : t("interview.scheduleTitle")}
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "1rem" }}>
        <div className="input-group" style={{ margin: 0 }}>
          <label className="input-label">{t("interview.dateLabel")}</label>
          <input type="datetime-local" className="input-field" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} required />
        </div>
        <div className="input-group" style={{ margin: 0 }}>
          <label className="input-label">{t("interview.typeLabel")}</label>
          <select className="input-field" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="ONLINE">{t("interview.online")}</option>
            <option value="ONSITE">{t("interview.onsite")}</option>
            <option value="PHONE">{t("interview.phone")}</option>
          </select>
        </div>
        <div className="input-group" style={{ margin: 0 }}>
          <label className="input-label">{t("interview.locationLabel")}</label>
          <input className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("interview.locationPlaceholder")} />
        </div>
      </div>
      <div className="input-group" style={{ marginTop: "1rem" }}>
        <label className="input-label">{t("interview.noteLabel")}</label>
        <input className="input-field" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: "0.5rem" }}>
        {loading ? t("interview.saving") : existing ? t("interview.updateBtn") : t("interview.scheduleBtn")}
      </button>
      {msg && <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>{msg}</p>}
    </form>
  );
}
