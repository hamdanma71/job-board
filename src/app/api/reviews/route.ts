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
    const { companyId, rating, comment, salary, position, isAnonymous } = body;

    if (!companyId || !rating || !comment) {
      return NextResponse.json({ success: false, error: "البيانات الأساسية مطلوبة (التقييم والتعليق)" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        rating: Number(rating),
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
    console.error("Review creation error:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ داخلي أثناء إضافة التقييم" }, { status: 500 });
  }
}
