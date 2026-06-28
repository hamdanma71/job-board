"use client";

import { useState } from "react";
import { useT } from "@/components/I18nProvider";

export default function PromoteApplicationButton({ applicationId, initialPromoted }: { applicationId: string; initialPromoted: boolean }) {
  const t = useT();
  const [promoted, setPromoted] = useState(initialPromoted);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/promote`, { method: "POST" });
      const data = await res.json();
      if (res.ok) setPromoted(data.promoted);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`btn ${promoted ? "btn-primary" : "btn-outline"}`}
      style={{ fontSize: "0.72rem", padding: "0.2rem 0.6rem" }}
      title={t("promote.tooltip")}
    >
      {promoted ? t("promote.promoted") : t("promote.promote")}
    </button>
  );
}
