"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useT } from "@/components/I18nProvider";

type Conv = { otherId: string; otherName: string; lastMessage: string; lastMessageAt: string; unread: number };
type Msg = { id: string; body: string; mine: boolean; createdAt: string };

export default function Messenger({ initialTo, initialToName }: { initialTo?: string; initialToName?: string }) {
  const t = useT();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [active, setActive] = useState<{ id: string; name: string } | null>(
    initialTo ? { id: initialTo, name: initialToName || t("messenger.conversation") } : null
  );
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const loadConvs = useCallback(async () => {
    try { const r = await fetch("/api/conversations"); const d = await r.json(); if (d.success) setConvs(d.conversations); } catch {}
  }, []);

  const loadMsgs = useCallback(async (otherId: string) => {
    try { const r = await fetch(`/api/messages?with=${otherId}`); const d = await r.json(); if (d.success) setMessages(d.messages); } catch {}
  }, []);

  useEffect(() => { loadConvs(); }, [loadConvs]);
  useEffect(() => { if (active) loadMsgs(active.id); }, [active, loadMsgs]);
  useEffect(() => {
    const iv = setInterval(() => { loadConvs(); if (active) loadMsgs(active.id); }, 15000);
    return () => clearInterval(iv);
  }, [active, loadConvs, loadMsgs]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !text.trim()) return;
    setSending(true);
    try {
      const r = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientId: active.id, body: text }) });
      if (r.ok) { setText(""); await loadMsgs(active.id); loadConvs(); }
    } finally { setSending(false); }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1rem", minHeight: "65vh" }}>
      {/* Conversation list */}
      <aside className="card" style={{ padding: "0", overflowY: "auto", maxHeight: "70vh" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", padding: "1rem", borderBottom: "1px solid var(--border-light)" }}>{t("messenger.conversations")}</h2>
        {convs.length === 0 ? (
          <p className="text-muted" style={{ padding: "1rem", fontSize: "0.85rem" }}>{t("messenger.noConversations")}</p>
        ) : convs.map((c) => (
          <button key={c.otherId} onClick={() => setActive({ id: c.otherId, name: c.otherName })}
            style={{ width: "100%", textAlign: "start", padding: "0.8rem 1rem", borderBottom: "1px solid var(--border-light)", background: active?.id === c.otherId ? "var(--surface-hover)" : "transparent", cursor: "pointer", border: "none" }}>
            <div className="flex-between">
              <strong style={{ fontSize: "0.92rem" }}>{c.otherName}</strong>
              {c.unread > 0 && <span style={{ background: "#ef4444", color: "white", borderRadius: "50%", fontSize: "0.7rem", padding: "1px 6px" }}>{c.unread}</span>}
            </div>
            <p className="text-muted" style={{ fontSize: "0.78rem", margin: "0.2rem 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.lastMessage}</p>
          </button>
        ))}
      </aside>

      {/* Thread */}
      <section className="card" style={{ display: "flex", flexDirection: "column", maxHeight: "70vh" }}>
        {!active ? (
          <div className="flex-center text-muted" style={{ flex: 1 }}>{t("messenger.selectPrompt")}</div>
        ) : (
          <>
            <h3 style={{ fontSize: "1.05rem", fontWeight: "bold", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border-light)", marginBottom: "0.75rem" }}>{active.name}</h3>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem", padding: "0.25rem" }}>
              {messages.length === 0 ? (
                <p className="text-muted text-center" style={{ marginTop: "2rem", fontSize: "0.85rem" }}>{t("messenger.startPrompt")}</p>
              ) : messages.map((m) => (
                <div key={m.id} style={{ alignSelf: m.mine ? "flex-start" : "flex-end", maxWidth: "75%", background: m.mine ? "var(--primary)" : "var(--surface-hover)", color: m.mine ? "white" : "var(--text-main)", padding: "0.5rem 0.85rem", borderRadius: "var(--radius-md)" }}>
                  <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.body}</p>
                  <span style={{ fontSize: "0.65rem", opacity: 0.7 }}>{new Date(m.createdAt).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <form onSubmit={send} style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-light)" }}>
              <input className="input-field" style={{ flex: 1 }} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("messenger.placeholder")} />
              <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>{t("messenger.send")}</button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
