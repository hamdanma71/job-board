import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function ownAlert(id: string, userId: string) {
  const alert = await prisma.jobAlert.findUnique({ where: { id } });
  return alert && alert.userId === userId ? alert : null;
}

// PATCH — toggle active state (or update fields)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const alert = await ownAlert(id, (session.user as any).id);
  if (!alert) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const updated = await prisma.jobAlert.update({
    where: { id },
    data: { isActive: typeof body.isActive === "boolean" ? body.isActive : !alert.isActive },
  });
  return NextResponse.json({ success: true, alert: updated });
}

// DELETE — remove an alert
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const alert = await ownAlert(id, (session.user as any).id);
  if (!alert) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  await prisma.jobAlert.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
