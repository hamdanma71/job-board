import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fetchJobs() {
  console.log("🚀 Starting Job Aggregator Engine...");
  
  try {
    // 1. Fetch remote jobs from public API (Remotive)
    console.log("Fetching real remote jobs from Remotive API...");
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=20');
    const data: any = await res.json();
    
    if (!data.jobs || data.jobs.length === 0) {
      console.log("No jobs found in external API.");
      return;
    }

    let addedCount = 0;

    for (const remoteJob of data.jobs.slice(0, 20)) { // limit to 20 to avoid spamming DB in dev
      // Check if company exists, if not create a dummy one
      let company = await prisma.companyProfile.findFirst({
        where: { companyName: remoteJob.company_name }
      });

      if (!company) {
        // Create an admin user to own this company profile
        const dummyEmail = `admin_${Date.now()}_${Math.floor(Math.random() * 1000)}@${remoteJob.company_name.replace(/[^a-zA-Z]/g, '').toLowerCase() || 'company'}.com`;
        const user = await prisma.user.create({
          data: {
            name: remoteJob.company_name,
            email: dummyEmail,
            password: "no-login-allowed", // Aggregated companies don't have real logins
            role: "EMPLOYER"
          }
        });

        company = await prisma.companyProfile.create({
          data: {
            userId: user.id,
            companyName: remoteJob.company_name,
            industry: remoteJob.category,
            description: `شركة مُجمّعة تلقائياً من مصادر خارجية. ${remoteJob.company_name} هي شركة توظيف عن بعد.`
          }
        });
      }

      // Check if job already exists (avoid duplicates)
      const existingJob = await prisma.job.findFirst({
        where: {
          companyId: company.id,
          title: remoteJob.title
        }
      });

      if (!existingJob) {
        await prisma.job.create({
          data: {
            companyId: company.id,
            title: remoteJob.title,
            description: remoteJob.description, // HTML description
            location: remoteJob.candidate_required_location || "Remote",
            type: "REMOTE",
            salary: remoteJob.salary || "غير محدد",
            isActive: true,
            source: "REMOTIVE",
            externalUrl: remoteJob.url
          }
        });
        addedCount++;
        console.log(`✅ Added: ${remoteJob.title} at ${remoteJob.company_name}`);
      }
    }

    console.log(`\n🎉 Aggregation Complete. Added ${addedCount} new jobs to the database.`);

  } catch (error) {
    console.error("❌ Error during job aggregation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fetchJobs();
