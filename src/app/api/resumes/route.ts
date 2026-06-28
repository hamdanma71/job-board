import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const RESUME_DIR = path.join(process.cwd(), "private_uploads", "resumes");

async function requireCandidate() {
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!session || (role !== "CANDIDATE" && role !== "ADMIN")) return null;
  return session;
}

// GET — list the candidate's resumes
export async function GET() {
  const session = await requireCandidate();
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  const resumes = await prisma.resume.findMany({
    where: { userId: (session.user as any).id },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ success: true, resumes });
}

// POST (multipart: title, file) — add a resume with an uploaded PDF
export async function POST(req: NextRequest) {
  const session = await requireCandidate();
  if (!session) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 403 });
  const userId = (session.user as any).id;

  const form = await req.formData();
  const title = (form.get("title") as string || "").trim() || "سيرتي الذاتية";
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ success: false, error: "الملف مطلوب" }, { status: 400 });
  if (!(file.type === "application/pdf" || file.name.endsWith(".pdf"))) {
    return NextResponse.json({ success: false, error: "يُقبل ملف PDF فقط" }, { status: 400 });
  }

  const isFirst = (await prisma.resume.count({ where: { userId } })) === 0;
  const resume = await prisma.resume.create({ data: { userId, title, isPrimary: isFirst } });

  try {
    await mkdir(path.join(RESUME_DIR, userId), { recursive: true });
    await writeFile(path.join(RESUME_DIR, userId, `${resume.id}.pdf`), Buffer.from(await file.arrayBuffer()));
    const updated = await prisma.resume.update({ where: { id: resume.id }, data: { fileUrl: `/api/resumes/${resume.id}/file` } });
    return NextResponse.json({ success: true, resume: updated }, { status: 201 });
  } catch (e) {
    await prisma.resume.delete({ where: { id: resume.id } }).catch(() => {});
    return NextResponse.json({ success: false, error: "تعذّر حفظ الملف" }, { status: 500 });
  }
}
