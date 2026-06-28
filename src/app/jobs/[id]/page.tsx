import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ApplyButton from "@/components/ApplyButton";
import { jobTypeLabel } from "@/lib/jobType";
import { getLocale, getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

async function getJob(id: string) {
  try {
    return await prisma.job.findUnique({ where: { id }, include: { company: true } });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  const job = await getJob(id);
  if (!job) return { title: t("jobDetail.metaNotFound") };
  return {
    title: `${job.title} - ${job.company?.companyName ?? ""} | JobMatch`,
    description: `${t("jobDetail.metaDescPrefix")}${job.title} ${t("jobDetail.metaDescIn")}${job.location}. ${t("jobDetail.metaDescSuffix")}`,
  };
}

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  const session = await getServerSession(authOptions);
  const job = await getJob(id);

  if (!job) {
    return (
      <main className="container text-center" style={{ padding: "5rem" }}>
        <h1>{t("jobDetail.notFoundTitle")}</h1>
        <Link href="/jobs" className="btn btn-outline mt-4">{t("jobDetail.backToAllJobs")}</Link>
      </main>
    );
  }

  const isCandidate = session && (session.user as any).role === "CANDIDATE";
  const isExternal = job.source && job.source !== "INTERNAL";

  return (
    <main className="container" style={{ padding: "3rem 1.5rem", maxWidth: "900px" }}>
      <Link href="/jobs" className="text-muted" style={{ fontSize: "0.9rem" }}>← {t("jobDetail.allJobs")}</Link>

      <div className="card animate-fade-in" style={{ marginTop: "1rem" }}>
        <div className="flex-between" style={{ alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{job.title}</h1>
            <p className="text-muted" style={{ fontSize: "1.05rem" }}>
              {job.company ? (
                <Link href={`/companies/${job.companyId}`} style={{ color: "var(--primary)", fontWeight: 600 }}>
                  {job.company.companyName}
                </Link>
              ) : t("jobDetail.company")}
              {" • "}{job.location}
            </p>
          </div>
          {isExternal && (
            <span style={{ padding: "0.25rem 0.75rem", backgroundColor: "var(--surface-hover)", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: "bold" }}>
              {t("jobDetail.from")} {job.source}
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", margin: "1.5rem 0" }}>
          <span className="badge" style={{ padding: "0.4rem 0.9rem", backgroundColor: "var(--surface-hover)", borderRadius: "var(--radius-full)", fontSize: "0.85rem" }}>
            {t("jobType." + job.type)}
          </span>
          {job.salary && (
            <span style={{ padding: "0.4rem 0.9rem", backgroundColor: "var(--surface-hover)", borderRadius: "var(--radius-full)", fontSize: "0.85rem" }}>
              💰 {job.salary}
            </span>
          )}
        </div>

        <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1.5rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.75rem" }}>{t("jobDetail.descriptionHeading")}</h2>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, color: "var(--text-muted)" }}>{job.description}</div>
        </div>

        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
          {isExternal && job.externalUrl ? (
            <a href={job.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              {t("jobDetail.applyOnSource")} ↗
            </a>
          ) : isCandidate ? (
            <ApplyButton jobId={job.id} />
          ) : !session ? (
            <Link href="/login" className="btn btn-primary">{t("jobDetail.loginToApply")}</Link>
          ) : (
            <span className="text-muted">{t("jobDetail.candidatesOnly")}</span>
          )}
        </div>
      </div>
    </main>
  );
}
