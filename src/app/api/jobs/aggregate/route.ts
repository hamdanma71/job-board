import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// In a real application, this would fetch from an external API (Indeed, Bayt, etc.)
// For MVP, we simulate scraping/aggregation.
const EXTERNAL_JOBS_MOCK = [
  {
    title: "مطور برمجيات (Backend)",
    companyName: "Bayt.com Partner",
    description: "نبحث عن مطور Node.js ذو خبرة لا تقل عن 3 سنوات لبناء واجهات خلفية متطورة.",
    location: "دبي، الإمارات",
    type: "FULL_TIME",
    salary: "15,000 درهم",
    source: "BAYT",
    externalUrl: "https://www.bayt.com/example-job"
  },
  {
    title: "محلل بيانات أول",
    companyName: "Indeed Gulf",
    description: "فرصة ممتازة لمحلل بيانات يجيد استخدام Python و SQL لتحليل البيانات الضخمة وبناء تقارير استراتيجية.",
    location: "الرياض، السعودية",
    type: "FULL_TIME",
    salary: "12,000 ريال",
    source: "INDEED",
    externalUrl: "https://www.indeed.com/example-job"
  },
  {
    title: "مصمم واجهات وتجربة مستخدم (UI/UX)",
    companyName: "NaukriGulf Corp",
    description: "مطلوب مصمم مبدع للعمل عن بعد مع فريق عالمي. يفضل خبرة في Figma.",
    location: "عن بعد",
    type: "REMOTE",
    salary: "غير محدد",
    source: "NAUKRIGULF",
    externalUrl: "https://www.naukrigulf.com/example-job"
  }
];

export async function POST() {
  try {
    let aggregatedCount = 0;

    for (const jobData of EXTERNAL_JOBS_MOCK) {
      // 1. Ensure the external company exists in our DB, or create a mock company for them
      let company = await prisma.companyProfile.findFirst({
        where: { companyName: jobData.companyName }
      });

      if (!company) {
        // Create a system user for this external company
        const systemUser = await prisma.user.create({
          data: {
            name: jobData.companyName,
            email: `system_${Date.now()}_${Math.random()}@external.com`,
            password: "hashed_dummy_password",
            role: "EMPLOYER"
          }
        });

        company = await prisma.companyProfile.create({
          data: {
            userId: systemUser.id,
            companyName: jobData.companyName,
            description: `تم جلب الوظائف من منصة ${jobData.source}`
          }
        });
      }

      // 2. Check if job already exists to avoid duplicates
      const existingJob = await prisma.job.findFirst({
        where: {
          title: jobData.title,
          companyId: company.id,
          source: jobData.source
        }
      });

      if (!existingJob) {
        // 3. Create the external job
        await prisma.job.create({
          data: {
            title: jobData.title,
            description: jobData.description,
            location: jobData.location,
            type: jobData.type,
            salary: jobData.salary,
            source: jobData.source,
            externalUrl: jobData.externalUrl,
            companyId: company.id
          }
        });
        aggregatedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `تم تجميع ${aggregatedCount} وظائف خارجية جديدة بنجاح!`,
      totalProcessed: EXTERNAL_JOBS_MOCK.length
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
