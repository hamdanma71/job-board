"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/I18nProvider";

// Reusable accept/decline for invitations (/api/invitations/[id]) and offers (/api/offers/[id]).
export default function RespondActions({ kind, id }: { kind: "invitation" | "offer"; id: string }) {
  const t = useT();
  const router = useRouter();
  const [done, setDone] = useState<"" | "accept" | "decline">("");
  const [busy, setBusy] = useState(false);

  const respond = async (action: "accept" | "decline") => {
    setBusy(true);
    try {
      const url = kind === "invitation" ? `/api/invitations/${id}` : `/api/offers/${id}`;
      const res = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      if (res.ok) { setDone(action); router.refresh(); }
    } finally { setBusy(false); }
  };

  if (done) return <span className="text-muted" style={{ fontSize: "0.85rem" }}>{done === "accept" ? t("respond.accepted") : t("respond.declined")}</span>;

  return (
    <span style={{ display: "flex", gap: "0.4rem" }}>
      <button className="btn btn-primary" style={{ fontSize: "0.78rem", padding: "0.3rem 0.8rem" }} disabled={busy} onClick={() => respond("accept")}>{t("respond.accept")}</button>
      <button className="btn btn-outline" style={{ fontSize: "0.78rem", padding: "0.3rem 0.8rem" }} disabled={busy} onClick={() => respond("decline")}>{t("respond.decline")}</button>
    </span>
  );
}
