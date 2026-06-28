"use client";

import { useState } from "react";
import Link from "next/link";
import { useT } from "@/components/I18nProvider";

export default function ResourcesHub() {
  const t = useT();
  const [tab, setTab] = useState<"articles" | "podcasts">("articles");

  const ARTICLES = [
    { id: "a1", title: t("resources.article1"), category: t("resources.catResume"), read: t("resources.read5"), emoji: "📄" },
    { id: "a2", title: t("resources.article2"), category: t("resources.catInterviews"), read: t("resources.read7"), emoji: "🎯" },
    { id: "a3", title: t("resources.article3"), category: t("resources.catSalary"), read: t("resources.read6"), emoji: "💰" },
    { id: "a4", title: t("resources.article4"), category: t("resources.catGrowth"), read: t("resources.read4"), emoji: "🌐" },
  ];

  const EPISODES = [
    { id: "e1", title: t("resources.ep1"), host: t("resources.podcastName"), duration: "32:10", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: "e2", title: t("resources.ep2"), host: t("resources.podcastName"), duration: "27:45", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { id: "e3", title: t("resources.ep3"), host: t("resources.podcastName"), duration: "41:02", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  ];

  const [now, setNow] = useState<typeof EPISODES[number] | null>(null);

  return (
    <main className="container" style={{ padding: "3rem 1.5rem", paddingBottom: now ? "7rem" : "3rem" }}>
      <header className="mb-8 text-center">
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("resources.title")}</h1>
        <p className="text-muted">{t("resources.subtitle")}</p>
      </header>

      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "2rem" }}>
        <button className={`btn ${tab === "articles" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("articles")}>📚 {t("resources.tabArticles")}</button>
        <button className={`btn ${tab === "podcasts" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("podcasts")}>🎧 {t("resources.tabPodcasts")}</button>
      </div>

      {tab === "articles" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {ARTICLES.map((a) => (
            <div key={a.id} className="card hover-scale" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <span style={{ fontSize: "2.5rem" }}>{a.emoji}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: "bold" }}>{a.category}</span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "bold", lineHeight: 1.5 }}>{a.title}</h3>
              <span className="text-muted" style={{ fontSize: "0.8rem" }}>⏱️ {a.read}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {EPISODES.map((e) => {
            const playing = now?.id === e.id;
            return (
              <div key={e.id} className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderColor: playing ? "var(--primary)" : undefined }}>
                <button className="btn btn-primary" style={{ width: "48px", height: "48px", borderRadius: "50%", padding: 0, fontSize: "1.2rem" }} onClick={() => setNow(playing ? null : e)}>
                  {playing ? "⏸" : "▶"}
                </button>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{e.title}</h3>
                  <span className="text-muted" style={{ fontSize: "0.85rem" }}>{e.host} • {e.duration}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-muted" style={{ marginTop: "2rem", fontSize: "0.85rem" }}>
        {t("resources.alsoBrowse")} <Link href="/blog" style={{ color: "var(--primary)" }}>{t("resources.blogLink")}</Link> {t("resources.and")} <Link href="/podcasts" style={{ color: "var(--primary)" }}>{t("resources.podcastLink")}</Link>.
      </p>

      {/* Sticky bottom player (Spotify-style) */}
      {now && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--surface)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderTop: "var(--glass-border)", padding: "0.75rem 1.5rem", zIndex: 1000, display: "flex", alignItems: "center", gap: "1rem", boxShadow: "0 -4px 20px rgba(0,0,0,0.1)" }}>
          <div style={{ minWidth: "180px" }}>
            <p style={{ fontWeight: "bold", fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{now.title}</p>
            <span className="text-muted" style={{ fontSize: "0.75rem" }}>{now.host}</span>
          </div>
          <audio controls autoPlay src={now.audio} style={{ flex: 1, height: "36px" }} />
          <button className="btn btn-outline" style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }} onClick={() => setNow(null)}>✕</button>
        </div>
      )}
    </main>
  );
}
