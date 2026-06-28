import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocale, getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function SavedCandidatesPage() {
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!session || (role !== "EMPLOYER" && role !== "ADMIN")) {
    return <main className="container text-center" style={{ padding: "5rem" }}><h2>{t("saved.unauthorized")}</h2></main>;
  }

  const saved = await prisma.savedCandidate.findMany({
    where: { employerId: (session.user as any).id },
    include: { candidate: { select: { id: true, name: true, candidateProfile: { select: { specialization: true, experienceYears: true, location: true, nationality: true, resumeUrl: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  // Group by folder.
  const folders: Record<string, typeof saved> = {};
  for (const s of saved) (folders[s.folder] ||= []).push(s);

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      <header className="flex-between mb-8">
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>{t("saved.title")}</h1>
          <p className="text-muted">{saved.length} {t("saved.inYourLists")}</p>
        </div>
        <Link href="/dashboard/employer/candidates" className="btn btn-outline">{t("saved.searchCandidates")}</Link>
      </header>

      {saved.length === 0 ? (
        <div className="card text-center" style={{ padding: "3rem" }}>
          <p className="text-muted">{t("saved.emptyPre")} <Link href="/dashboard/employer/candidates" style={{ color: "var(--primary)" }}>{t("saved.searchCandidates")}</Link>.</p>
        </div>
      ) : (
        Object.entries(folders).map(([folder, items]) => (
          <section key={folder} style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1rem" }}>📁 {folder} ({items.length})</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {items.map((s) => {
                const p = s.candidate.candidateProfile;
                return (
                  <div key={s.id} className="card flex-between" style={{ gap: "1rem", flexWrap: "wrap" }}>
                    <div>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: "bold" }}>{s.candidate.name}</h3>
                      <p className="text-muted" style={{ fontSize: "0.88rem" }}>
                        {p?.specialization || "—"} • {p?.experienceYears ?? 0} {t("saved.yearsWord")} • {p?.location || "—"} {p?.nationality ? `• ${p.nationality}` : ""}
                      </p>
                      {s.note && <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>📝 {s.note}</p>}
                    </div>
                    {p?.resumeUrl && (
                      <a href={`/api/cv/${s.candidate.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}>{t("saved.resume")}</a>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </main>
  );
}
