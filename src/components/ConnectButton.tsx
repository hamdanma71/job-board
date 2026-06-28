"use client";

import { useState } from "react";
import { useT } from "@/components/I18nProvider";

export default function ConnectButton({
  userId,
  initialState,
}: {
  userId: string;
  initialState: "none" | "pending" | "connected" | "incoming";
}) {
  const t = useT();
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const connect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresseeId: userId }),
      });
      if (res.ok) setState("pending");
    } finally {
      setLoading(false);
    }
  };

  if (state === "connected") return <span className="text-muted" style={{ fontSize: "0.85rem" }}>{t("connect.connected")}</span>;
  if (state === "pending") return <span className="text-muted" style={{ fontSize: "0.85rem" }}>{t("connect.pending")}</span>;
  if (state === "incoming") return <span className="text-muted" style={{ fontSize: "0.85rem" }}>{t("connect.incoming")}</span>;

  return (
    <button className="btn btn-outline" style={{ fontSize: "0.8rem", padding: "0.3rem 0.8rem" }} onClick={connect} disabled={loading}>
      {loading ? "..." : t("connect.connect")}
    </button>
  );
}
