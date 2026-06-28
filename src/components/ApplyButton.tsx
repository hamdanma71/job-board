"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/I18nProvider";

export default function ApplyButton({ jobId }: { jobId: string }) {
  const t = useT();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
  const [message, setMessage] = useState("");

  const handleApply = async () => {
    setIsLoading(true);
    setStatus("IDLE");
    setMessage("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t("apply.error"));
      }

      setStatus("SUCCESS");
      setMessage(t("apply.successMsg"));
      setTimeout(() => {
        router.push("/dashboard/candidate");
        router.refresh();
      }, 2000);
      
    } catch (err: any) {
      setStatus("ERROR");
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
      <button 
        onClick={handleApply} 
        disabled={isLoading || status === "SUCCESS"}
        className="btn btn-primary"
      >
        {isLoading ? t("apply.applying") : status === "SUCCESS" ? t("apply.applied") : t("apply.applyNow")}
      </button>
      
      {message && (
        <span style={{ fontSize: "0.85rem", color: status === "SUCCESS" ? "var(--secondary)" : "#ef4444" }}>
          {message}
        </span>
      )}
    </div>
  );
}
