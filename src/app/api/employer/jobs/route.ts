import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "EMPLOYER") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { title, description, location, type, salary, companyName } = body;

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

    const job = await prisma.job.create({
      data: {
        title,
        description,
        location,
        type: type || "FULL_TIME",
        salary,
        companyId: company.id,
      }
    });

    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
