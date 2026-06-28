"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { APPLICATION_STATUSES, STATUS_LABELS } from "@/lib/applicationStatus";
import { useT } from "@/components/I18nProvider";

export default function ApplicationStatusUpdater({ applicationId, currentStatus }: { applicationId: string, currentStatus: string }) {
  const t = useT();
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  const statuses = APPLICATION_STATUSES.map((value) => ({ value, label: t("appStatus." + value) }));

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error("update failed");

      // Force refresh to update the UI
      router.refresh();

    } catch (error) {
      alert(t("statusUpd.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <select 
        className="input-field" 
        style={{ flex: 1 }} 
        value={status} 
        onChange={e => setStatus(e.target.value)}
        disabled={isLoading}
      >
        {statuses.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <button 
        className="btn btn-primary" 
        onClick={handleUpdate} 
        disabled={isLoading || status === currentStatus}
      >
        {isLoading ? t("statusUpd.saving") : t("statusUpd.save")}
      </button>
    </div>
  );
}
