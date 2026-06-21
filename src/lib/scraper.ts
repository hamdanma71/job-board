import * as cheerio from "cheerio";
import axios from "axios";
import { prisma } from "@/lib/prisma";

export async function scrapeJobs() {
  try {
    const { data } = await axios.get("https://remoteok.com/api");
    
    let newJobsCount = 0;
    
    let systemCompany = await prisma.companyProfile.findFirst({
      where: { companyName: "System Aggregator" }
    });

    if (!systemCompany) {
      let dummyUser = await prisma.user.findFirst({ where: { email: "aggregator@system.com" } });
      if (!dummyUser) {
        dummyUser = await prisma.user.create({
          data: {
            name: "Aggregator",
            email: "aggregator@system.com",
            password: "hashed_dummy",
            role: "EMPLOYER"
          }
        });
      }
      systemCompany = await prisma.companyProfile.create({
        data: {
          companyName: "System Aggregator",
          userId: dummyUser.id,
          isVerified: true
        }
      });
    }

    const jobsToSave = data.slice(1, 6); 
    
    for (const job of jobsToSave) {
      const existingJob = await prisma.job.findFirst({
        where: { title: job.position, companyId: systemCompany.id }
      });

      if (!existingJob) {
        await prisma.job.create({
          data: {
            title: job.position || "Software Engineer",
            description: (job.description || "No description").substring(0, 1000), 
            location: job.location || "Remote",
            type: "FULL_TIME",
            requirements: JSON.stringify(job.tags || []),
            companyId: systemCompany.id
          }
        });
        newJobsCount++;
      }
    }

    return { success: true, count: newJobsCount };
  } catch (error) {
    console.error("Scraping error:", error);
    return { success: false, error: "Scraping failed" };
  }
}
