import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PostComposer from "@/components/PostComposer";
import PostCard from "@/components/PostCard";
import { getLocale, getDictionary } from "@/lib/i18n";

export const metadata = {
  title: "الشبكة المهنية | JobMatch",
  description: "تواصل مع المحترفين، شارك تحديثاتك المهنية، وابنِ شبكتك.",
};
import ConnectButton from "@/components/ConnectButton";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = { CANDIDATE: "باحث عن عمل", EMPLOYER: "صاحب عمل", ADMIN: "مشرف" };

export default async function NetworkPage() {
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  const session = await getServerSession(authOptions);
  const userId = session ? (session.user as any).id : null;

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: { select: { name: true, role: true } },
      _count: { select: { reactions: true, comments: true } },
      ...(userId ? { reactions: { where: { userId }, select: { id: true } } } : {}),
    },
  });

  // People to connect with + my connection state to each.
  let people: { id: string; name: string; role: string }[] = [];
  let stateById: Record<string, "none" | "pending" | "connected" | "incoming"> = {};
  if (userId) {
    people = await prisma.user.findMany({
      where: { id: { not: userId } },
      select: { id: true, name: true, role: true },
      take: 12,
      orderBy: { createdAt: "desc" },
    });
    // Scope the connection lookup to just the suggested people (not all of mine).
    const peopleIds = people.map((p) => p.id);
    const conns = peopleIds.length
      ? await prisma.connection.findMany({
          where: {
            OR: [
              { requesterId: userId, addresseeId: { in: peopleIds } },
              { addresseeId: userId, requesterId: { in: peopleIds } },
            ],
          },
        })
      : [];
    for (const p of people) {
      const c = conns.find((x) => x.requesterId === p.id || x.addresseeId === p.id);
      stateById[p.id] = !c
        ? "none"
        : c.status === "ACCEPTED"
        ? "connected"
        : c.requesterId === userId
        ? "pending"
        : "incoming";
    }
  }

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      <header className="mb-8">
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{t("networkPage.title")}</h1>
        <p className="text-muted">{t("networkPage.subtitle")}</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", alignItems: "start" }}>
        {/* Feed */}
        <div>
          {session ? (
            <PostComposer />
          ) : (
            <div className="card text-center" style={{ marginBottom: "1.5rem" }}>
              <Link href="/login" style={{ color: "var(--primary)" }}>{t("networkPage.loginLink")}</Link> {t("networkPage.loginToPost")}
            </div>
          )}

          {posts.length === 0 ? (
            <div className="card text-center" style={{ padding: "3rem" }}>
              <p className="text-muted">{t("networkPage.noPosts")}</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {posts.map((post: any) => (
                <PostCard key={post.id} post={{
                  id: post.id,
                  authorName: post.author.name,
                  roleLabel: ROLE_LABEL[post.author.role] || post.author.role,
                  content: post.content,
                  createdAt: new Date(post.createdAt).toISOString(),
                  reactionCount: post._count.reactions,
                  commentCount: post._count.comments,
                  liked: Array.isArray(post.reactions) && post.reactions.length > 0,
                }} />
              ))}
            </div>
          )}
        </div>

        {/* People */}
        <aside className="card" style={{ position: "sticky", top: "1rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1rem" }}>{t("networkPage.peopleYouMayKnow")}</h2>
          {!session ? (
            <p className="text-muted" style={{ fontSize: "0.9rem" }}>{t("networkPage.loginToSeeSuggestions")}</p>
          ) : people.length === 0 ? (
            <p className="text-muted" style={{ fontSize: "0.9rem" }}>{t("networkPage.noOtherUsers")}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {people.map((p) => (
                <div key={p.id} className="flex-between">
                  <div>
                    <strong style={{ fontSize: "0.92rem" }}>{p.name}</strong>
                    <p className="text-muted" style={{ fontSize: "0.75rem" }}>{ROLE_LABEL[p.role] || p.role}</p>
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                    <Link href={`/messages?to=${p.id}`} className="btn btn-outline" style={{ fontSize: "0.72rem", padding: "0.25rem 0.6rem" }}>✉️</Link>
                    <ConnectButton userId={p.id} initialState={stateById[p.id]} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
