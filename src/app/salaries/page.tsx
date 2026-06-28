import { prisma } from "@/lib/prisma";
import SalaryExplorer from "@/components/SalaryExplorer";
import { getLocale, getDictionary } from "@/lib/i18n";

export const metadata = {
  title: "استكشاف الرواتب | JobMatch",
  description: "قارن متوسط الرواتب حسب المسمى الوظيفي والدولة والقطاع بناءً على تقييمات حقيقية.",
};

function detectCurrency(s: string): string {
  const t = s.toLowerCase();
  if (/ريال|sar|﷼/.test(t)) return "SAR";
  if (/درهم|aed|dhs?/.test(t)) return "AED";
  if (/دينار|kwd|bhd|jod/.test(t)) return "KWD";
  if (/جنيه|egp/.test(t)) return "EGP";
  if (/\$|usd|دولار/.test(t)) return "USD";
  if (/ر\.?ق|qar/.test(t)) return "QAR";
  return "AED"; // default
}

export default async function SalariesPage() {
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  const reviews = await prisma.review.findMany({
    where: { salary: { not: null }, position: { not: null } },
    select: { salary: true, position: true, company: { select: { location: true, industry: true } } },
    orderBy: { createdAt: "desc" },
    take: 2000,
  });

  // Flatten into salary records enriched with location + sector + currency dimensions.
  const records = reviews
    .map((r) => {
      const raw = r.salary || "";
      const num = parseInt(raw.replace(/[^0-9]/g, ""));
      if (isNaN(num) || num < 1000) return null;
      return {
        position: (r.position || "").trim().toLowerCase(),
        salary: num,
        currency: detectCurrency(raw),
        location: r.company?.location || "غير محدد",
        sector: r.company?.industry || "غير محدد",
      };
    })
    .filter((x): x is { position: string; salary: number; currency: string; location: string; sector: string } => x != null);

  const locations = Array.from(new Set(records.map((r) => r.location))).sort();
  const sectors = Array.from(new Set(records.map((r) => r.sector))).sort();

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      <header className="mb-8 text-center">
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("salariesPage.title")}</h1>
        <p className="text-muted">{t("salariesPage.subtitle")}</p>
      </header>

      <SalaryExplorer records={records} locations={locations} sectors={sectors} />
    </main>
  );
}
