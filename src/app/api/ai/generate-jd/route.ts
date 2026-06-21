import { NextRequest, NextResponse } from "next/server";
import { generateJobDescription } from "@/lib/ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/ai/generate-jd
// Generates a professional job description from basic notes
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "EMPLOYER") {
      return NextResponse.json({ success: false, error: "Unauthorized. Employers only." }, { status: 403 });
    }

    const body = await req.json();
    const { title, basicRequirements } = body;

    if (!title || !basicRequirements) {
      return NextResponse.json({ success: false, error: "title and basicRequirements are required" }, { status: 400 });
    }

    const jobDescription = await generateJobDescription(title, basicRequirements);

    return NextResponse.json({ success: true, data: { jobDescription } }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
