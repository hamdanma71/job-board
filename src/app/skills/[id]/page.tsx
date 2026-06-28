import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SkillTestTaker from "@/components/SkillTestTaker";
import { getLocale, getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function SkillTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  const test = await prisma.skillTest.findUnique({ where: { id } });

  if (!test) {
    return (
      <main className="container text-center" style={{ padding: "5rem" }}>
        <h1>{t("skillTest.notFound")}</h1>
        <Link href="/skills" className="btn btn-outline mt-4">{t("skillTest.backToTests")}</Link>
      </main>
    );
  }

  // Strip the correct answers before sending questions to the client.
  let questions: { q: string; options: string[] }[] = [];
  try {
    questions = JSON.parse(test.questions).map((x: any) => ({ q: x.q, options: x.options }));
  } catch { /* ignore */ }

  return (
    <main className="container" style={{ padding: "3rem 1.5rem", maxWidth: "800px" }}>
      <header className="mb-8">
        <Link href="/skills" className="text-muted" style={{ fontSize: "0.9rem" }}>{t("skillTest.allTests")}</Link>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginTop: "0.5rem" }}>{test.title}</h1>
        <p className="text-muted">{t("skillTest.skillLabel")} {test.skill} • {t("skillTest.passMark")}</p>
      </header>
      <SkillTestTaker testId={test.id} questions={questions} />
    </main>
  );
}
