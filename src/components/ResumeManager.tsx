"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/I18nProvider";

type Resume = { id: string; title: string; fileUrl: string | null; isPrimary: boolean };

export default function ResumeManager() {
  const t = useT();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const res = await fetch("/api/resumes");
    const data = await res.json();
    if (data.success) setResumes(data.resumes);
  };
  useEffect(() => { load(); }, []);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("file", file);
      const res = await fetch("/api/resumes", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("resumeMgr.uploadError"));
      setTitle(""); setFile(null);
      (document.getElementById("resume-file") as HTMLInputElement | null)?.value && ((document.getElementById("resume-file") as HTMLInputElement).value = "");
      load();
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const setPrimary = async (id: string) => { await fetch(`/api/resumes/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ setPrimary: true }) }); load(); };
  const remove = async (id: string) => { await fetch(`/api/resumes/${id}`, { method: "DELETE" }); load(); };

  return (
    <div className="card">
      <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem" }}>
        {t("resumeMgr.title")}
      </h2>

      <form onSubmit={upload} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "end", marginBottom: "1rem" }}>
        <div className="input-group" style={{ margin: 0, flex: "1 1 160px" }}>
          <label className="input-label">{t("resumeMgr.titleLabel")}</label>
          <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("resumeMgr.titlePlaceholder")} />
        </div>
        <div className="input-group" style={{ margin: 0, flex: "1 1 160px" }}>
          <label className="input-label">{t("resumeMgr.pdfFile")}</label>
          <input id="resume-file" type="file" accept=".pdf" className="input-field" style={{ padding: "0.5rem" }} onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading || !file}>{loading ? t("resumeMgr.uploading") : t("resumeMgr.addResume")}</button>
      </form>
      {msg && <p style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>{msg}</p>}

      {resumes.length === 0 ? (
        <p className="text-muted" style={{ fontSize: "0.9rem" }}>{t("resumeMgr.empty")}</p>
      ) : (
        <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {resumes.map((r) => (
            <li key={r.id} className="flex-between" style={{ padding: "0.6rem 0.8rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontSize: "0.9rem" }}>
                {r.title} {r.isPrimary && <span style={{ fontSize: "0.7rem", color: "var(--primary)", fontWeight: "bold" }}>{t("resumeMgr.primary")}</span>}
              </span>
              <span style={{ display: "flex", gap: "0.4rem" }}>
                {r.fileUrl && <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}>{t("resumeMgr.view")}</a>}
                {!r.isPrimary && <button className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }} onClick={() => setPrimary(r.id)}>{t("resumeMgr.setPrimary")}</button>}
                <button className="btn" style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem", background: "rgba(244,63,94,0.1)", color: "var(--accent)" }} onClick={() => remove(r.id)}>{t("resumeMgr.delete")}</button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
