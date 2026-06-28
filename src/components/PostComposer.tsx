"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/I18nProvider";

export default function PostComposer() {
  const t = useT();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("composer.error"));
      setContent("");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card" style={{ marginBottom: "1.5rem" }}>
      <textarea
        className="input-field"
        rows={3}
        placeholder={t("composer.placeholder")}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "0.5rem" }}>{error}</p>}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.75rem" }}>
        <button type="submit" className="btn btn-primary" disabled={loading || !content.trim()}>
          {loading ? t("composer.posting") : t("composer.post")}
        </button>
      </div>
    </form>
  );
}
