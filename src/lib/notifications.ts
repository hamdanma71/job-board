import { prisma } from "@/lib/prisma";

/** Notify every follower of a company that it posted a new job. Best-effort. */
export async function notifyFollowersOfNewJob(companyId: string, companyName: string, jobTitle: string) {
  try {
    const followers = await prisma.companyFollow.findMany({
      where: { companyId },
      select: { userId: true },
    });
    if (followers.length === 0) return;
    await prisma.notification.createMany({
      data: followers.map((f) => ({
        userId: f.userId,
        title: "وظيفة جديدة من شركة تتابعها",
        message: `نشرت "${companyName}" وظيفة جديدة: ${jobTitle}`,
      })),
    });
  } catch (e) {
    console.error("notifyFollowersOfNewJob failed:", (e as any)?.message);
  }
}

/**
 * Match a newly-posted job against active JobAlerts and notify the owners.
 * Keyword match is case-insensitive substring over title+description; if an
 * alert has a location it must also be contained in the job location.
 * Best-effort — never throws into the job-creation flow.
 */
export async function notifyMatchingAlerts(job: { title: string; description: string; location: string }) {
  try {
    const alerts = await prisma.jobAlert.findMany({ where: { isActive: true } });
    if (alerts.length === 0) return;

    const haystack = `${job.title} ${job.description}`.toLowerCase();
    const jobLoc = (job.location || "").toLowerCase();

    const matchedUserIds = new Set<string>();
    for (const a of alerts) {
      const keywords = a.keywords.toLowerCase().split(/[\s,]+/).filter(Boolean);
      const keywordHit = keywords.length === 0 || keywords.some((k) => haystack.includes(k));
      const locationHit = !a.location || jobLoc.includes(a.location.toLowerCase());
      if (keywordHit && locationHit) matchedUserIds.add(a.userId);
    }
    if (matchedUserIds.size === 0) return;

    await prisma.notification.createMany({
      data: Array.from(matchedUserIds).map((userId) => ({
        userId,
        title: "وظيفة جديدة تطابق تنبيهك",
        message: `وظيفة جديدة قد تناسبك: ${job.title} — ${job.location}`,
      })),
    });
  } catch (e) {
    console.error("notifyMatchingAlerts failed:", (e as any)?.message);
  }
}
