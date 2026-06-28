import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST { action: "boost" | "refresh" | "toggleSearchable" } — candidate visibility products.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!session || (role !== "CANDIDATE" && role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  }
  const userId = (session.user as any).id;
  const { action } = await req.json();

  const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
  if (!profile) return NextResponse.json({ success: false, error: "أكمل ملفك الشخصي أولاً" }, { status: 400 });

  let data: any = {};
  if (action === "boost") {
    const until = new Date();
    until.setDate(until.getDate() + 30);
    data.rankBoostedUntil = until;
  } else if (action === "refresh") {
    data.lastRefreshedAt = new Date();
  } else if (action === "toggleSearchable") {
    data.isSearchable = !profile.isSearchable;
  } else {
    return NextResponse.json({ success: false, error: "إجراء غير معروف" }, { status: 400 });
  }

  const updated = await prisma.candidateProfile.update({ where: { userId }, data });
  return NextResponse.json({
    success: true,
    isSearchable: updated.isSearchable,
    rankBoostedUntil: updated.rankBoostedUntil,
    lastRefreshedAt: updated.lastRefreshedAt,
  });
}
