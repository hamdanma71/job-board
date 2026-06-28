import axios from "axios";
import { prisma } from "@/lib/prisma";

const SOURCE = "REMOTEOK";
const MAX_JOBS = 20;          // cap per run
const STALE_DAYS = 30;        // external jobs older than this are deactivated

async function getSystemCompany() {
  let systemCompany = await prisma.companyProfile.findFirst({
    where: { companyName: "System Aggregator" },
  });
  if (systemCompany) return systemCompany;

  let dummyUser = await prisma.user.findFirst({ where: { email: "aggregator@system.com" } });
  if (!dummyUser) {
    dummyUser = await prisma.user.create({
      data: {
        name: "Aggregator",
        email: "aggregator@system.com",
        // System account, not a real login (no valid bcrypt hash on purpose).
        password: "!disabled-system-account",
        role: "EMPLOYER",
      },
    });
  }
  return prisma.companyProfile.create({
    data: { companyName: "System Aggregator", userId: dummyUser.id, isVerified: true },
  });
}

/** Deactivate external jobs that have not been refreshed within STALE_DAYS. */
export async function deactivateStaleExternalJobs() {
  const cutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000);
  const res = await prisma.job.updateMany({
    where: { source: { not: "INTERNAL" }, isActive: true, updatedAt: { lt: cutoff } },
    data: { isActive: false },
  });
  return res.count;
}

export async function scrapeJobs() {
  let newJobsCount = 0;
  let errors = 0;
  let fetchOk = true;

  try {
    const { data } = await axios.get("https://remoteok.com/api", { timeout: 15000 });
    if (!Array.isArray(data)) throw new Error("Unexpected API response");

    const systemCompany = await getSystemCompany();

    // data[0] is API metadata; the rest are jobs.
    const jobs = data.slice(1, 1 + MAX_JOBS);

    for (const job of jobs) {
      try {
        const externalUrl: string | null = job.url || job.apply_url || null;

        // De-dupe primarily by externalUrl, falling back to (title, company).
        const existing = await prisma.job.findFirst({
          where: externalUrl
            ? { externalUrl }
            : { title: job.position, companyId: systemCompany.id, source: SOURCE },
        });

        if (existing) {
          // Refresh timestamp + reactivate so it isn't treated as stale.
          await prisma.job.update({
            where: { id: existing.id },
            data: { isActive: true },
          });
          continue;
        }

        await prisma.job.create({
          data: {
            title: job.position || "Software Engineer",
            description: (job.description || "No description").substring(0, 2000),
            location: job.location || "Remote",
            type: "REMOTE",
            salary: job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max}` : null,
            source: SOURCE,
            externalUrl,
            isActive: true,
            companyId: systemCompany.id,
          },
        });
        newJobsCount++;
      } catch (e) {
        errors++; // one bad record must not fail the whole batch
      }
    }
  } catch (error) {
    fetchOk = false;
    console.error("Scraping error:", error);
  }

  // Always run stale cleanup, even if the upstream fetch failed this run.
  const deactivated = await deactivateStaleExternalJobs().catch(() => 0);

  if (!fetchOk) {
    return { success: false, error: "Scraping failed", count: newJobsCount, errors, deactivated };
  }
  return { success: true, count: newJobsCount, errors, deactivated };
}
