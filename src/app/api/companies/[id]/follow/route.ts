import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/companies/[id]/follow — toggle follow for the current user.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: companyId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: "يجب تسجيل الدخول للمتابعة" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const existing = await prisma.companyFollow.findUnique({
    where: { userId_companyId: { userId, companyId } },
  });

  if (existing) {
    await prisma.companyFollow.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true, following: false });
  }

  // Ensure the company exists before following.
  const company = await prisma.companyProfile.findUnique({ where: { id: companyId } });
  if (!company) {
    return NextResponse.json({ success: false, error: "الشركة غير موجودة" }, { status: 404 });
  }

  await prisma.companyFollow.create({ data: { userId, companyId } });
  return NextResponse.json({ success: true, following: true });
}
