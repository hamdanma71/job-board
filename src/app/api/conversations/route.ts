import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/conversations — list my conversations with the other party + last message + unread count.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  const me = (session.user as any).id;

  const convs = await prisma.conversation.findMany({
    where: { OR: [{ userAId: me }, { userBId: me }] },
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    include: {
      userA: { select: { id: true, name: true } },
      userB: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: { where: { senderId: { not: me }, isRead: false } } } },
    },
  });

  const list = convs.map((c) => {
    const other = c.userAId === me ? c.userB : c.userA;
    return {
      otherId: other.id,
      otherName: other.name,
      lastMessage: c.messages[0]?.body || "",
      lastMessageAt: c.lastMessageAt,
      unread: c._count.messages,
    };
  });
  return NextResponse.json({ success: true, conversations: list });
}
