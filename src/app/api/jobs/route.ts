import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/jobs - Fetch jobs with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "";
    const type = searchParams.get("type"); // e.g., FULL_TIME, PART_TIME

    // Build the query
    const query: any = {
      where: {
        isActive: true,
      },
      include: {
        company: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    };

    if (search) {
      query.where.title = { contains: search, mode: "insensitive" };
    }
    
    if (location) {
      query.where.location = { contains: location, mode: "insensitive" };
    }

    if (type) {
      query.where.type = type;
    }

    const jobs = await prisma.job.findMany(query);
    return NextResponse.json({ success: true, data: jobs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/jobs - Create a new job (Employers only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Simple auth check
    if (!session || (session.user as any).role !== "EMPLOYER") {
      return NextResponse.json({ success: false, error: "Unauthorized. Employers only." }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, location, salary, type, companyName } = body;

    // Validate required fields
    if (!title || !description || !location) {
      return NextResponse.json({ success: false, error: "المعلومات الأساسية للوظيفة مطلوبة" }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Fetch or create CompanyProfile
    let company = await prisma.companyProfile.findUnique({
      where: { userId }
    });

    if (!company) {
      if (!companyName) {
        return NextResponse.json({ success: false, error: "اسم الشركة مطلوب لإنشاء الملف التعريفي لأول مرة" }, { status: 400 });
      }
      company = await prisma.companyProfile.create({
        data: {
          userId,
          companyName,
          location
        }
      });
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        location,
        salary,
        type: type || "FULL_TIME",
        companyId: company.id,
      },
    });

    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
