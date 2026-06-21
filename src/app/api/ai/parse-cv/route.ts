import { NextRequest, NextResponse } from "next/server";
import { parseCV } from "@/lib/ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { PDFParse } from "pdf-parse";

// POST /api/ai/parse-cv
// Extracts data from text or file and optionally updates the candidate's profile
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // للمرحلة التجريبية: سنسمح باستخدام الـ API حتى بدون تسجيل دخول لاختبار الواجهة
    // if (!session || (session.user as any).role !== "CANDIDATE") {
    //   return NextResponse.json({ success: false, error: "Unauthorized. Candidates only." }, { status: 403 });
    // }

    const contentType = req.headers.get("content-type") || "";
    let cvText = "";
    let saveProfile = false;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      saveProfile = formData.get("saveProfile") === "true";

      if (!file) {
        return NextResponse.json({ success: false, error: "لم يتم العثور على الملف" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        try {
          const parser = new PDFParse({ data: buffer });
          const result = await parser.getText();
          cvText = result.text;
        } catch (pdfError: any) {
          console.warn("PDF Parsing warning:", pdfError.message);
          // في حال فشل استخراج النص بسبب توافقية Next.js، نضع نص افتراضي لنسمح للنظام بالمتابعة
          cvText = "تم رفع ملف PDF، ولكن لم نتمكن من استخراج النص برمجياً. (مرحلة تجريبية)";
        }
      } else {
        // Assume text file
        cvText = buffer.toString("utf-8");
      }
    } else {
      const body = await req.json();
      cvText = body.cvText;
      saveProfile = body.saveProfile;
    }

    if (!cvText) {
      return NextResponse.json({ success: false, error: "لم نتمكن من استخراج النص من السيرة الذاتية" }, { status: 400 });
    }

    // Call the OpenAI parser
    const parsedData = await parseCV(cvText);

    // Save to database if requested AND user is logged in
    const role = session ? (session.user as any).role : null;
    if (saveProfile && session && (role === "CANDIDATE" || role === "ADMIN")) {
      const candidateId = (session.user as any).id;
      
      await prisma.candidateProfile.upsert({
        where: { userId: candidateId },
        update: {
          bio: parsedData.bio,
          skills: JSON.stringify(parsedData.skills),
          experienceYears: parsedData.experienceYears,
          location: parsedData.location,
          nationality: parsedData.nationality,
          visaStatus: parsedData.visaStatus,
          specialization: parsedData.specialization,
        },
        create: {
          userId: candidateId,
          bio: parsedData.bio,
          skills: JSON.stringify(parsedData.skills),
          experienceYears: parsedData.experienceYears,
          location: parsedData.location,
          nationality: parsedData.nationality,
          visaStatus: parsedData.visaStatus,
          specialization: parsedData.specialization,
        }
      });
    }

    return NextResponse.json({ success: true, data: parsedData }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
