import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/subscription";
import { notifyFollowersOfNewJob, notifyMatchingAlerts } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "EMPLOYER") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { title, description, location, type, salary, companyName, featured, salaryMin, salaryMax, experienceMin } = body;

    if (!title || !description || !location) {
      return NextResponse.json({ success: false, error: "المعلومات الأساسية للوظيفة مطلوبة" }, { status: 400 });
    }

    const toInt = (v: any) => { const n = parseInt(v); return Number.isFinite(n) ? n : null; };

    // Ensure company profile exists or create it based on companyName
    let company = await prisma.companyProfile.findUnique({ where: { userId } });
    
    if (!company) {
      if (!companyName) {
         return NextResponse.json({ success: false, error: "اسم الشركة مطلوب لأول وظيفة" }, { status: 400 });
      }
      company = await prisma.companyProfile.create({
        data: {
          userId,
          companyName,
        }
      });
    }

    if (company.isBanned) {
      return NextResponse.json({ success: false, error: "تم حظر هذا الحساب من نشر الوظائف" }, { status: 403 });
    }

    // Subscription Check
    if (!hasActiveSubscription(company)) {
      return NextResponse.json({ success: false, error: "يجب الترقية لباقة المحترفين (PRO) لتتمكن من نشر الوظائف" }, { status: 403 });
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        location,
        type: type || "FULL_TIME",
        salary,
        featured: Boolean(featured),
        salaryMin: toInt(salaryMin),
        salaryMax: toInt(salaryMax),
        experienceMin: toInt(experienceMin),
        companyId: company.id,
      }
    });

    await notifyFollowersOfNewJob(company.id, company.companyName, job.title);
    await notifyMatchingAlerts({ title: job.title, description: job.description, location: job.location });

    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
