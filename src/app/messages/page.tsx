import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Messenger from "@/components/Messenger";
import { getLocale, getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata = { title: "الرسائل | JobMatch", description: "محادثاتك المباشرة مع الشركات والمرشّحين وشبكتك المهنية." };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <main className="container text-center" style={{ padding: "5rem" }}>
        <h2>{t("messagesPage.loginPrompt")}</h2>
        <Link href="/login" className="btn btn-primary mt-4">{t("messagesPage.login")}</Link>
      </main>
    );
  }

  const { to } = await searchParams;
  let initialToName: string | undefined;
  if (to) {
    const u = await prisma.user.findUnique({ where: { id: to }, select: { name: true } });
    initialToName = u?.name || t("messagesPage.conversation");
  }

  return (
    <main className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1.5rem" }}>{t("messagesPage.title")}</h1>
      <Messenger initialTo={to} initialToName={initialToName} />
    </main>
  );
}
