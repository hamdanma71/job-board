import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET — list the current candidate's job alerts
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const alerts = await prisma.jobAlert.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, alerts });
}

// POST — create a job alert
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { keywords, location, frequency } = await req.json();
  if (!keywords) return NextResponse.json({ success: false, error: "الكلمات المفتاحية مطلوبة" }, { status: 400 });
  const alert = await prisma.jobAlert.create({
    data: {
      keywords,
      location: location || null,
      frequency: frequency === "WEEKLY" ? "WEEKLY" : "DAILY",
      userId: (session.user as any).id,
    },
  });
  return NextResponse.json({ success: true, alert }, { status: 201 });
}
