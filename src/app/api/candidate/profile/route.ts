import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serializeSkills } from "@/lib/skills";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const role = session ? (session.user as any).role : null;
    if (!session || (role !== "CANDIDATE" && role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: "غير مصرح لك بالدخول" }, { status: 403 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { name, bio, skills, location, experienceYears, expectedSalary, nationality, visaStatus, specialization,
      dateOfBirth, gender, maritalStatus, languages, religion, drivingLicense, visaExpiry, altEmail, altPhone } = body;
    const normalizedSkills = skills !== undefined ? serializeSkills(skills) : undefined;
    const extra = { dateOfBirth, gender, maritalStatus, languages, religion, drivingLicense, visaExpiry, altEmail, altPhone };

    // Update User name
    if (name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name }
      });
    }

    // Update Profile
    const profile = await prisma.candidateProfile.upsert({
      where: { userId },
      update: {
        bio,
        skills: normalizedSkills,
        location,
        experienceYears: experienceYears ? parseInt(experienceYears, 10) : 0,
        expectedSalary,
        nationality,
        visaStatus,
        specialization,
        ...extra,
      },
      create: {
        userId,
        bio,
        skills: normalizedSkills,
        location,
        experienceYears: experienceYears ? parseInt(experienceYears, 10) : 0,
        expectedSalary,
        nationality,
        visaStatus,
        specialization,
        ...extra,
      }
    });

    return NextResponse.json({ success: true, profile }, { status: 200 });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ داخلي أثناء تحديث البيانات" }, { status: 500 });
  }
}
