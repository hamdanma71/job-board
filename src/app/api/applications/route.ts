import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/applications - Apply to a job
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "CANDIDATE") {
      return NextResponse.json({ success: false, error: "يجب تسجيل الدخول كباحث عن عمل للتقديم" }, { status: 403 });
    }

    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ success: false, error: "معرف الوظيفة مطلوب" }, { status: 400 });
    }

    const candidateId = (session.user as any).id;

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId
        }
      }
    });

    if (existing) {
      return NextResponse.json({ success: false, error: "لقد قمت بالتقديم على هذه الوظيفة مسبقاً" }, { status: 400 });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId,
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to apply for job:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ داخلي أثناء تقديم الطلب" }, { status: 500 });
  }
}
