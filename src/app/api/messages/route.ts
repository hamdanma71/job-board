import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Sorted pair so a conversation between two users is unique regardless of direction.
function pair(a: string, b: string) {
  return a < b ? { userAId: a, userBId: b } : { userAId: b, userBId: a };
}

// GET /api/messages?with=<userId> — messages of a conversation; marks incoming as read.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  const me = (session.user as any).id;
  const other = req.nextUrl.searchParams.get("with");
  if (!other) return NextResponse.json({ success: false, error: "with مطلوب" }, { status: 400 });

  const conv = await prisma.conversation.findUnique({ where: { userAId_userBId: pair(me, other) } });
  if (!conv) return NextResponse.json({ success: true, messages: [] });

  const messages = await prisma.message.findMany({ where: { conversationId: conv.id }, orderBy: { createdAt: "asc" }, take: 200 });
  // Mark messages sent by the other party as read.
  await prisma.message.updateMany({ where: { conversationId: conv.id, senderId: { not: me }, isRead: false }, data: { isRead: true } });

  return NextResponse.json({ success: true, messages: messages.map((m) => ({ id: m.id, body: m.body, mine: m.senderId === me, createdAt: m.createdAt })) });
}

// POST { recipientId, body } — send a message (creates the conversation if needed).
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  const me = (session.user as any).id;
  const { recipientId, body } = await req.json();
  if (!recipientId || !body?.trim()) return NextResponse.json({ success: false, error: "المستلم والنص مطلوبان" }, { status: 400 });
  if (recipientId === me) return NextResponse.json({ success: false, error: "لا يمكنك مراسلة نفسك" }, { status: 400 });

  const recipient = await prisma.user.findUnique({ where: { id: recipientId }, select: { id: true } });
  if (!recipient) return NextResponse.json({ success: false, error: "المستلم غير موجود" }, { status: 404 });

  const key = pair(me, recipientId);
  const conv = await prisma.conversation.upsert({
    where: { userAId_userBId: key },
    update: { lastMessageAt: new Date() },
    create: { ...key, lastMessageAt: new Date() },
  });
  await prisma.message.create({ data: { conversationId: conv.id, senderId: me, body: body.trim().slice(0, 4000) } });

  // Notify the recipient.
  await prisma.notification.create({
    data: { userId: recipientId, title: "رسالة جديدة", message: `وصلتك رسالة جديدة: ${body.trim().slice(0, 60)}` },
  }).catch(() => {});

  return NextResponse.json({ success: true }, { status: 201 });
}
