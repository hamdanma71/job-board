import { NextRequest, NextResponse } from "next/server";
import { parseCV, suggestCvImprovements } from "@/lib/ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

import { PDFParse } from "pdf-parse";

// CVs are stored OUTSIDE /public and served via the authenticated /api/cv/[userId] route.
const CV_DIR = path.join(process.cwd(), "private_uploads", "cvs");

// POST /api/ai/parse-cv
// Extracts data from text or file and optionally updates the candidate's profile
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Parsing calls a paid AI provider — require an authenticated candidate/admin
    // so the endpoint cannot be used anonymously to drain the OpenAI quota.
    if (!session) {
      return NextResponse.json({ success: false, error: "يجب تسجيل الدخول لتحليل السيرة الذاتية" }, { status: 401 });
    }
    const sessionRole = (session.user as any).role;
    if (sessionRole !== "CANDIDATE" && sessionRole !== "ADMIN") {
      return NextResponse.json({ success: false, error: "هذه الخدمة متاحة للباحثين عن عمل فقط" }, { status: 403 });
    }

    const contentType = req.headers.get("content-type") || "";
    let cvText = "";
    let saveProfile = false;
    let pdfBuffer: Buffer | null = null; // kept so we can persist the uploaded CV

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
          pdfBuffer = buffer;
        } catch (pdfError: any) {
          console.warn("PDF Parsing error:", pdfError.message);
          // Do NOT substitute placeholder text and overwrite the profile — fail clearly.
          return NextResponse.json({ success: false, error: "تعذّر استخراج النص من ملف PDF. جرّب لصق المحتوى يدوياً." }, { status: 422 });
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

    // Best-effort CV improvement suggestions (never fail the request on error).
    let suggestions: string[] = [];
    try {
      suggestions = await suggestCvImprovements(cvText);
    } catch (e) {
      console.warn("CV suggestions failed:", (e as any)?.message);
    }

    // Save to database if requested AND user is logged in
    const role = session ? (session.user as any).role : null;
    if (saveProfile && session && (role === "CANDIDATE" || role === "ADMIN")) {
      const candidateId = (session.user as any).id;

      // Persist the uploaded PDF to a private dir; expose via authenticated route.
      let resumeUrl: string | undefined;
      if (pdfBuffer) {
        try {
          await mkdir(CV_DIR, { recursive: true });
          await writeFile(path.join(CV_DIR, `${candidateId}.pdf`), pdfBuffer);
          resumeUrl = `/api/cv/${candidateId}`;
        } catch (e) {
          console.error("Failed to store CV file:", e);
        }
      }

      const data = {
        bio: parsedData.bio,
        skills: JSON.stringify(parsedData.skills),
        experienceYears: parsedData.experienceYears,
        location: parsedData.location,
        nationality: parsedData.nationality,
        visaStatus: parsedData.visaStatus,
        specialization: parsedData.specialization,
        ...(resumeUrl ? { resumeUrl } : {}),
      };

      await prisma.candidateProfile.upsert({
        where: { userId: candidateId },
        update: data,
        create: { userId: candidateId, ...data },
      });
    }

    return NextResponse.json({ success: true, data: parsedData, suggestions }, { status: 200 });

  } catch (error: any) {
    console.error("parse-cv failed:", error?.message);
    return NextResponse.json({ success: false, error: "تعذّر تحليل السيرة الذاتية حالياً، حاول مرة أخرى لاحقاً" }, { status: 500 });
  }
}
