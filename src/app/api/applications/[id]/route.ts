import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isValidStatus, statusLabel } from "@/lib/applicationStatus";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "EMPLOYER") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { status } = body;

    // Reject arbitrary/invalid statuses (SQLite has no enum to enforce this).
    if (!isValidStatus(status)) {
      return NextResponse.json({ success: false, error: "حالة غير صالحة" }, { status: 400 });
    }

    const company = await prisma.companyProfile.findUnique({ where: { userId } });
    if (!company) {
      return NextResponse.json({ success: false, error: "Company not found" }, { status: 404 });
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true }
    });

    if (!application) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    // Verify this job belongs to the current company
    const job = await prisma.job.findUnique({
      where: { id: application.jobId }
    });

    if (!job || job.companyId !== company.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    // Update the application status
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status }
    });

    // Create a notification for the candidate (shared label map = no drift).
    await prisma.notification.create({
      data: {
        userId: application.candidateId,
        title: "تحديث على طلب التوظيف",
        message: `تم تحديث حالة طلبك لوظيفة "${job.title}" في شركة "${company.companyName}" إلى: ${statusLabel(status)}`
      }
    });

    return NextResponse.json({ success: true, application: updatedApplication }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
