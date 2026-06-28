import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLocale, getDictionary } from "@/lib/i18n";

export const metadata = {
  title: "اختبارات المهارات | JobMatch",
  description: "أثبت مهاراتك عبر اختبارات قصيرة وأضِف شارات إلى ملفك المهني.",
};

export default async function SkillsPage() {
  const dict = getDictionary(await getLocale());
  const tr = (k: string) => dict[k] ?? k;
  const tests = await prisma.skillTest.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      <header className="mb-8 text-center">
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{tr("skillsPage.title")}</h1>
        <p className="text-muted">{tr("skillsPage.subtitle")}</p>
      </header>

      {tests.length === 0 ? (
        <div className="card text-center" style={{ padding: "3rem" }}>
          <p className="text-muted">{tr("skillsPage.empty")}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {tests.map((t) => {
            const count = (() => { try { return JSON.parse(t.questions).length; } catch { return 0; } })();
            return (
              <div key={t.id} className="card hover-scale" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <span style={{ fontSize: "2.5rem" }}>🎓</span>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{t.title}</h3>
                <span className="text-muted" style={{ fontSize: "0.85rem" }}>{tr("skillsPage.skillLabel")} {t.skill} • {count} {tr("skillsPage.questions")}</span>
                <Link href={`/skills/${t.id}`} className="btn btn-primary" style={{ marginTop: "auto" }}>{tr("skillsPage.startTest")}</Link>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
