"use client";

import { useState } from "react";
import { useT } from "@/components/I18nProvider";

type Comment = { id: string; body: string; author: string; createdAt: string };

export default function PostCard({ post }: { post: { id: string; authorName: string; roleLabel: string; content: string; createdAt: string; reactionCount: number; commentCount: number; liked: boolean } }) {
  const t = useT();
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.reactionCount);
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState(post.commentCount);
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);

  const toggleLike = async () => {
    const r = await fetch(`/api/posts/${post.id}/react`, { method: "POST" });
    const d = await r.json();
    if (r.ok) { setLiked(d.liked); setLikes(d.count); }
  };

  const openComments = async () => {
    setOpen(!open);
    if (!loaded) {
      const r = await fetch(`/api/posts/${post.id}/comments`);
      const d = await r.json();
      if (d.success) { setComments(d.comments); setLoaded(true); }
    }
  };

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const r = await fetch(`/api/posts/${post.id}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: text }) });
    if (r.ok) {
      const d = await r.json();
      setComments((c) => [...c, { id: Math.random().toString(), body: text, author: t("postCard.you"), createdAt: new Date().toISOString() }]);
      setCount(d.count);
      setText("");
    }
  };

  return (
    <div className="card">
      <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
        <strong>{post.authorName}</strong>
        <span className="text-muted" style={{ fontSize: "0.75rem" }}>{post.roleLabel}</span>
      </div>
      <p style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{post.content}</p>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border-light)" }}>
        <button onClick={toggleLike} className="nav-link" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem", color: liked ? "var(--primary)" : "var(--text-muted)", fontWeight: liked ? "bold" : "normal" }}>
          👍 {t("postCard.like")} {likes > 0 ? `(${likes})` : ""}
        </button>
        <button onClick={openComments} className="nav-link" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          💬 {t("postCard.comments")} ({count})
        </button>
      </div>
      {open && (
        <div style={{ marginTop: "0.75rem" }}>
          {comments.map((c) => (
            <div key={c.id} style={{ padding: "0.4rem 0.7rem", background: "var(--surface-hover)", borderRadius: "var(--radius-md)", marginBottom: "0.3rem", fontSize: "0.85rem" }}>
              <strong>{c.author}:</strong> {c.body}
            </div>
          ))}
          <form onSubmit={addComment} style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem" }}>
            <input className="input-field" style={{ flex: 1 }} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("postCard.commentPlaceholder")} />
            <button type="submit" className="btn btn-outline" disabled={!text.trim()}>{t("postCard.post")}</button>
          </form>
        </div>
      )}
    </div>
  );
}
