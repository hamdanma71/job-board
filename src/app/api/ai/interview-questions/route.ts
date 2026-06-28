import { NextRequest, NextResponse } from "next/server";
import { generateInterviewQuestions } from "@/lib/ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "EMPLOYER") {
    return NextResponse.json({ success: false, error: "Unauthorized. Employers only." }, { status: 403 });
  }
  const { title, description } = await req.json();
  if (!title) return NextResponse.json({ success: false, error: "title is required" }, { status: 400 });
  const questions = await generateInterviewQuestions(title, description || "");
  return NextResponse.json({ success: true, data: { questions } });
}
