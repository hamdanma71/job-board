import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";
import countries from "@/data/countries.json";

const BASE = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "", "/jobs", "/jobs/remote", "/jobs/executive", "/companies", "/salaries",
    "/locations", "/categories", "/blog", "/podcasts", "/resources", "/network",
    "/skills", "/pricing", "/premium", "/employers", "/login", "/register",
  ];
  const entries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "daily",
    priority: p === "" ? 1 : 0.7,
  }));

  // Category landing pages
  for (const c of CATEGORIES) {
    entries.push({ url: `${BASE}/jobs/category/${c.slug}`, changeFrequency: "daily", priority: 0.6 });
  }
  // Country landing pages
  for (const c of countries as { id: string }[]) {
    entries.push({ url: `${BASE}/locations/${c.id}`, changeFrequency: "weekly", priority: 0.5 });
  }

  // Dynamic: active jobs + companies (best-effort)
  try {
    const [jobs, companies] = await Promise.all([
      prisma.job.findMany({ where: { isActive: true }, select: { id: true, updatedAt: true }, take: 5000, orderBy: { createdAt: "desc" } }),
      prisma.companyProfile.findMany({ select: { id: true, updatedAt: true }, take: 5000, orderBy: { createdAt: "desc" } }),
    ]);
    for (const j of jobs) entries.push({ url: `${BASE}/jobs/${j.id}`, lastModified: j.updatedAt, changeFrequency: "weekly", priority: 0.8 });
    for (const co of companies) entries.push({ url: `${BASE}/companies/${co.id}`, lastModified: co.updatedAt, changeFrequency: "weekly", priority: 0.6 });
  } catch {
    /* DB unavailable — return static + landing entries only */
  }

  return entries;
}
