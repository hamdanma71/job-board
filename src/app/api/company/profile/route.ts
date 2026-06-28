import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT — update the current employer's company profile (incl. Wellfound-style startup fields).
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "EMPLOYER") return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  const userId = (session.user as any).id;

  const company = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!company) return NextResponse.json({ success: false, error: "أنشئ ملف الشركة بنشر وظيفة أولاً" }, { status: 400 });

  const b = await req.json();
  const data: any = {};
  for (const f of ["companyName", "industry", "description", "location", "website", "logoUrl", "stage", "fundingRaised", "teamSize"]) {
    if (typeof b[f] === "string") data[f] = b[f];
  }
  if (typeof b.isStartup === "boolean") data.isStartup = b.isStartup;

  const updated = await prisma.companyProfile.update({ where: { userId }, data });
  return NextResponse.json({ success: true, company: { id: updated.id } });
}
