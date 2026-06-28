import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PricingView from "@/components/PricingView";
import { getLocale, getDictionary } from "@/lib/i18n";

export const metadata = {
  title: "الباقات والأسعار | JobMatch",
  description: "اختر باقة الشركة المناسبة لنشر الوظائف والوصول إلى قاعدة المرشّحين وأدوات الذكاء الاصطناعي.",
};

export default async function PricingPage() {
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  const session = await getServerSession(authOptions);
  const isEmployer = !!(session && (session.user as any).role === "EMPLOYER");

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      <header className="mb-12 text-center">
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("pricingPage.title")}</h1>
        <p className="text-muted">{t("pricingPage.subtitle")}</p>
      </header>

      <PricingView isEmployer={isEmployer} />
    </main>
  );
}
