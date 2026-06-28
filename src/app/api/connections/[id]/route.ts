import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PATCH — accept a pending connection request (only the addressee may accept)
export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "يجب تسجيل الدخول" }, { status: 401 });
  const userId = (session.user as any).id;

  const conn = await prisma.connection.findUnique({ where: { id } });
  if (!conn || conn.addresseeId !== userId) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  const updated = await prisma.connection.update({ where: { id }, data: { status: "ACCEPTED" } });
  return NextResponse.json({ success: true, connection: updated });
}
