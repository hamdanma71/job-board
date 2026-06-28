import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST { addresseeId } — send a connection request
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "يجب تسجيل الدخول" }, { status: 401 });
  const requesterId = (session.user as any).id;
  const { addresseeId } = await req.json();
  if (!addresseeId) return NextResponse.json({ success: false, error: "addresseeId مطلوب" }, { status: 400 });
  if (addresseeId === requesterId) return NextResponse.json({ success: false, error: "لا يمكنك الاتصال بنفسك" }, { status: 400 });

  // Avoid duplicates in either direction.
  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId, addresseeId },
        { requesterId: addresseeId, addresseeId: requesterId },
      ],
    },
  });
  if (existing) return NextResponse.json({ success: false, error: "يوجد طلب/اتصال بالفعل" }, { status: 409 });

  const conn = await prisma.connection.create({ data: { requesterId, addresseeId, status: "PENDING" } });
  return NextResponse.json({ success: true, connection: conn }, { status: 201 });
}
