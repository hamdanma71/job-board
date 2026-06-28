import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/subscription";
import CandidateSearch from "@/components/CandidateSearch";
import { getLocale, getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function CandidatesSearchPage() {
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!session || (role !== "EMPLOYER" && role !== "ADMIN")) {
    return <main className="container text-center" style={{ padding: "5rem" }}><h2>{t("candSearch.unauthorized")}</h2></main>;
  }

  const company = await prisma.companyProfile.findUnique({ where: { userId: (session.user as any).id } });
  const isPro = hasActiveSubscription(company);

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      <header className="flex-between mb-8">
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>{t("candSearch.title")}</h1>
          <p className="text-muted">{t("candSearch.subtitle")}</p>
        </div>
        <Link href="/dashboard/employer/saved" className="btn btn-outline">{t("candSearch.myList")}</Link>
      </header>

      {isPro ? (
        <CandidateSearch />
      ) : (
        <div className="card text-center" style={{ padding: "3rem" }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: "1rem" }}>{t("candSearch.proFeature")}</h2>
          <p className="text-muted" style={{ marginBottom: "1.5rem" }}>{t("candSearch.proDesc")}</p>
          <Link href="/pricing" className="btn btn-primary">{t("candSearch.upgradePro")}</Link>
        </div>
      )}
    </main>
  );
}
