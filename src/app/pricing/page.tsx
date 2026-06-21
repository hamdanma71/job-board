import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PricingView from "@/components/PricingView";

export default async function PricingPage() {
  const session = await getServerSession(authOptions);
  const isEmployer = session && (session.user as any).role === "EMPLOYER";

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      <header className="mb-12 text-center">
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>باقات الشركات</h1>
        <p className="text-muted">اختر الباقة المناسبة لاحتياجات التوظيف في شركتك. (حالياً في المرحلة التجريبية جميع الباقات مجانية!)</p>
      </header>

      <PricingView isEmployer={isEmployer} />
    </main>
  );
}
