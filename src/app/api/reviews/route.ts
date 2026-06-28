import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "CANDIDATE") {
      return NextResponse.json({ success: false, error: "غير مصرح، يجب تسجيل الدخول كباحث عن عمل" }, { status: 403 });
    }

    const reviewerId = (session.user as any).id;
    const body = await req.json();
    const { companyId, comment, salary, position, isAnonymous } = body;

    if (!companyId || !comment) {
      return NextResponse.json({ success: false, error: "البيانات الأساسية مطلوبة (التقييم والتعليق)" }, { status: 400 });
    }

    const companyExists = await prisma.companyProfile.findUnique({ where: { id: companyId }, select: { id: true } });
    if (!companyExists) {
      return NextResponse.json({ success: false, error: "الشركة غير موجودة" }, { status: 404 });
    }

    // Collect the 7 criteria (each 1..5); overall rating is their average.
    const CRITERIA = ["ratingWorkEnv", "ratingSalary", "ratingBenefits", "ratingGrowth", "ratingManagement", "ratingCulture", "ratingStability"] as const;
    const criteria: Record<string, number | null> = {};
    const provided: number[] = [];
    for (const key of CRITERIA) {
      const v = Number(body[key]);
      if (Number.isInteger(v) && v >= 1 && v <= 5) {
        criteria[key] = v;
        provided.push(v);
      } else {
        criteria[key] = null;
      }
    }

    // Overall: average of provided criteria, else fall back to body.rating.
    let ratingNum = provided.length
      ? Math.round(provided.reduce((a, b) => a + b, 0) / provided.length)
      : Number(body.rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ success: false, error: "التقييم يجب أن يكون رقماً من 1 إلى 5" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        rating: ratingNum,
        ...criteria,
        comment,
        salary: salary || null,
        position: position || null,
        isAnonymous: Boolean(isAnonymous),
        companyId,
        reviewerId
      }
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    // P2002 = unique constraint violation ([companyId, reviewerId])
    if (error?.code === "P2002") {
      return NextResponse.json({ success: false, error: "لقد قمت بتقييم هذه الشركة من قبل" }, { status: 409 });
    }
    if (error?.code === "P2003") {
      return NextResponse.json({ success: false, error: "الشركة غير موجودة" }, { status: 404 });
    }
    console.error("Review creation error:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ داخلي أثناء إضافة التقييم" }, { status: 500 });
  }
}
