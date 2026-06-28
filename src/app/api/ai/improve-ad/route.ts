import { NextRequest, NextResponse } from "next/server";
import { improveJobAd } from "@/lib/ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "EMPLOYER") {
    return NextResponse.json({ success: false, error: "Unauthorized. Employers only." }, { status: 403 });
  }
  const { description } = await req.json();
  if (!description) return NextResponse.json({ success: false, error: "description is required" }, { status: 400 });
  const improved = await improveJobAd(description);
  return NextResponse.json({ success: true, data: { improved } });
}
