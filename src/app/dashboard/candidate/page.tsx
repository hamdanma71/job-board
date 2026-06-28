import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CVUploadButton from "@/components/CVUploadButton";
import EditProfileModal from "@/components/EditProfileModal";
import NotificationBell from "@/components/NotificationBell";
import CandidateVisibilityPanel from "@/components/CandidateVisibilityPanel";
import ResumeManager from "@/components/ResumeManager";
import PromoteApplicationButton from "@/components/PromoteApplicationButton";
import RespondActions from "@/components/RespondActions";
import { calculateMatchScore } from "@/lib/matching";
import { statusLabel, statusColor } from "@/lib/applicationStatus";
import { getLocale, getDictionary } from "@/lib/i18n";

// Always render fresh so a just-uploaded CV / edited profile shows immediately.
export const dynamic = "force-dynamic";

export default async function CandidateDashboard() {
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  const session = await getServerSession(authOptions);

  const role = session ? (session.user as any).role : null;
  if (!session || (role !== "CANDIDATE" && role !== "ADMIN")) {
    return (
      <main className="container text-center" style={{ padding: "5rem" }}>
        <h2>{t("candDash.unauthorized")}</h2>
        <p className="text-muted mt-4">{t("candDash.currentRole")} {session ? (session.user as any).role || t("candDash.undefined") : t("candDash.noSession")}</p>
      </main>
    );
  }

  const userId = (session.user as any).id;
  const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
  const boostedActive = profile?.rankBoostedUntil ? new Date(profile.rankBoostedUntil) > new Date() : false;

  // Profile completeness (LinkedIn-style) + endorsements received.
  const completenessFields = [profile?.bio, profile?.skills, profile?.location, profile?.specialization, profile?.nationality, profile?.visaStatus, profile?.resumeUrl, profile?.expectedSalary];
  const completeness = Math.round((completenessFields.filter(Boolean).length / completenessFields.length) * 100);
  const endorsementCount = await prisma.endorsement.count({ where: { candidateId: userId } }).catch(() => 0);

  // Pending invitations (reverse marketplace) + active offers awaiting response.
  let invitations: any[] = [];
  let offers: any[] = [];
  try {
    [invitations, offers] = await Promise.all([
      prisma.invitation.findMany({ where: { candidateId: userId, status: "PENDING" }, include: { employer: { include: { companyProfile: { select: { companyName: true } } } }, job: { select: { id: true, title: true } } }, orderBy: { createdAt: "desc" } }),
      prisma.offer.findMany({ where: { status: "SENT", application: { candidateId: userId } }, include: { application: { include: { job: { include: { company: { select: { companyName: true } } } } } } }, orderBy: { createdAt: "desc" } }),
    ]);
  } catch { /* ignore */ }
  
  let applications: any[] = [];
  try {
    applications = await prisma.application.findMany({
      where: { candidateId: userId },
      include: {
        job: {
          include: { company: true }
        }
      },
      orderBy: { appliedAt: "desc" },
      take: 50,
    });
  } catch (error) {
    console.log("Database connection failed, showing empty state");
  }

  // AI-style recommended jobs: rank open jobs by profile match (excludes applied).
  let recommended: { job: any; score: number }[] = [];
  if (profile) {
    try {
      // Exclude already-applied jobs in the query so they don't crowd the pool.
      const activeJobs = await prisma.job.findMany({
        where: { isActive: true, applications: { none: { candidateId: userId } } },
        include: { company: true },
        take: 40,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      });
      recommended = activeJobs
        .map((j) => ({
          job: j,
          score: calculateMatchScore(
            { skills: profile.skills || "", experienceYears: profile.experienceYears || 0, specialization: profile.specialization, location: profile.location },
            j
          ),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);
    } catch (e) { /* ignore */ }
  }

  return (
    <main className="container" style={{ padding: "3rem 1.5rem" }}>
      <header className="flex-between mb-8">
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>{t("candDash.welcome")}</h1>
          <p className="text-muted">{t("candDash.welcomeSub")}</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <NotificationBell />
          <Link href="/jobs" className="btn btn-primary">{t("candDash.browseJobs")}</Link>
          <Link href="/" className="btn btn-outline">{t("candDash.home")}</Link>
        </div>
      </header>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="flex-between" style={{ marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{t("candDash.profileCompleteness")}</h2>
          <span className="text-muted" style={{ fontSize: "0.85rem" }}>👍 {endorsementCount} {t("candDash.skillEndorsements")}</span>
        </div>
        <div style={{ height: "12px", background: "var(--surface-hover)", borderRadius: "var(--radius-full)" }}>
          <div style={{ height: "100%", width: `${completeness}%`, background: completeness >= 75 ? "#16a34a" : "linear-gradient(90deg,var(--primary),var(--secondary))", borderRadius: "var(--radius-full)", transition: "width var(--transition-normal)" }}></div>
        </div>
        <p className="text-muted" style={{ fontSize: "0.82rem", marginTop: "0.4rem" }}>{completeness}% — {t("candDash.completeHint")}</p>
      </div>

      <div className="grid-2">
        {/* Profile Summary */}
        <div className="card">
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem" }}>{t("candDash.profile")}</h2>

          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-light)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("candDash.nationalityVisa")}</h3>
            <p>{profile?.nationality ? profile.nationality : t("candDash.nationalityUnset")} • {profile?.visaStatus ? profile.visaStatus : t("candDash.visaUnset")}</p>
          </div>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-light)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("candDash.specLocation")}</h3>
            <p>{profile?.specialization ? profile.specialization : t("candDash.specUnset")} • {profile?.location ? profile.location : t("candDash.locationUnset")}</p>
          </div>

          {(profile?.dateOfBirth || profile?.gender || profile?.maritalStatus || profile?.languages || profile?.religion || profile?.drivingLicense || profile?.visaExpiry || profile?.altEmail || profile?.altPhone) && (
            <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-light)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.75rem" }}>{t("editProfile.additionalDetails")}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem 1.5rem", fontSize: "0.9rem" }}>
                {profile?.dateOfBirth && <div><span className="text-muted">{t("profileFields.dateOfBirth")}: </span>{profile.dateOfBirth}</div>}
                {profile?.gender && <div><span className="text-muted">{t("profileFields.gender")}: </span>{profile.gender}</div>}
                {profile?.maritalStatus && <div><span className="text-muted">{t("profileFields.maritalStatus")}: </span>{profile.maritalStatus}</div>}
                {profile?.languages && <div><span className="text-muted">{t("profileFields.languages")}: </span>{profile.languages}</div>}
                {profile?.religion && <div><span className="text-muted">{t("profileFields.religion")}: </span>{profile.religion}</div>}
                {profile?.drivingLicense && <div><span className="text-muted">{t("profileFields.drivingLicense")}: </span>{profile.drivingLicense}</div>}
                {profile?.visaExpiry && <div><span className="text-muted">{t("profileFields.visaExpiry")}: </span>{profile.visaExpiry}</div>}
                {profile?.altEmail && <div><span className="text-muted">{t("profileFields.altEmail")}: </span>{profile.altEmail}</div>}
                {profile?.altPhone && <div><span className="text-muted">{t("profileFields.altPhone")}: </span>{profile.altPhone}</div>}
              </div>
            </div>
          )}

          <div style={{ marginBottom: "1.5rem", padding: "1rem" }}>
            <p className="text-muted" style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>{t("candDash.bio")}</p>
            <p>{profile?.bio || t("candDash.bioEmpty")}</p>
          </div>

          <div style={{ marginBottom: "1.5rem", padding: "0 1rem" }}>
            <p className="text-muted" style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>{t("candDash.topSkills")}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {profile?.skills ? (
                (() => {
                  try {
                    const skillsArray = JSON.parse(profile.skills);
                    return Array.isArray(skillsArray) ? skillsArray.map((skill: string, index: number) => (
                      <span key={index} className="badge badge-primary">{skill}</span>
                    )) : <span className="badge badge-primary">{profile.skills}</span>;
                  } catch (e) {
                    return <span className="badge badge-primary">{profile.skills}</span>;
                  }
                })()
              ) : (
                <p className="text-muted" style={{ fontSize: "0.85rem" }}>{t("candDash.noSkills")}</p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", padding: "0 1rem", marginBottom: "1.5rem" }}>
            <Link href="/jobs" className="btn btn-primary" style={{ padding: "0.5rem 1rem", textDecoration: "none" }}>
              {t("candDash.findJobs")}
            </Link>
            <Link href="/dashboard/candidate/alerts" className="btn btn-outline" style={{ padding: "0.5rem 1rem", textDecoration: "none" }}>
              {t("candDash.manageAlerts")}
            </Link>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <EditProfileModal
              initialName={(session.user as any).name || ""}
              initialBio={profile?.bio || ""}
              initialSkills={profile?.skills || ""}
              initialLocation={profile?.location || ""}
              initialExperience={profile?.experienceYears || 0}
              initialNationality={profile?.nationality || ""}
              initialVisaStatus={profile?.visaStatus || ""}
              initialSpecialization={profile?.specialization || ""}
              initialDateOfBirth={profile?.dateOfBirth || ""}
              initialGender={profile?.gender || ""}
              initialMaritalStatus={profile?.maritalStatus || ""}
              initialLanguages={profile?.languages || ""}
              initialReligion={profile?.religion || ""}
              initialDrivingLicense={profile?.drivingLicense || ""}
              initialVisaExpiry={profile?.visaExpiry || ""}
              initialAltEmail={profile?.altEmail || ""}
              initialAltPhone={profile?.altPhone || ""}
            />
            <CVUploadButton />
          </div>
        </div>

        {/* Applications List */}
        <div className="card">
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem" }}>{t("candDash.recentApplications")}</h2>
          <ul style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {applications.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: "2rem 0" }}>{t("candDash.noApplications")}</p>
            ) : (
              applications.map((app) => (
                <li key={app.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)" }}>
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: "bold" }}>{app.job.title}</h3>
                    <span className="text-muted" style={{ fontSize: "0.85rem" }}>{app.job.company?.companyName} • {new Date(app.appliedAt).toLocaleDateString("ar-SA")}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <PromoteApplicationButton applicationId={app.id} initialPromoted={app.promoted} />
                    <span style={{
                      padding: "0.25rem 0.75rem",
                      backgroundColor: `${statusColor(app.status)}1a`,
                      color: statusColor(app.status),
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.85rem",
                      fontWeight: "bold"
                    }}>
                      {t("appStatus." + app.status)}
                    </span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Offers + Invitations inbox */}
      {(offers.length > 0 || invitations.length > 0) && (
        <div className="grid-2" style={{ marginTop: "2rem" }}>
          {offers.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1rem" }}>{t("candDash.jobOffers")}</h2>
              {offers.map((o) => (
                <div key={o.id} className="flex-between" style={{ padding: "0.75rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <strong style={{ fontSize: "0.95rem" }}>{o.application.job.title}</strong>
                    <p className="text-muted" style={{ fontSize: "0.82rem" }}>{o.application.job.company?.companyName}{o.salary ? ` • ${o.salary}` : ""}</p>
                  </div>
                  <RespondActions kind="offer" id={o.id} />
                </div>
              ))}
            </div>
          )}
          {invitations.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1rem" }}>{t("candDash.invitations")}</h2>
              {invitations.map((inv) => (
                <div key={inv.id} className="flex-between" style={{ padding: "0.75rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <strong style={{ fontSize: "0.95rem" }}>{inv.employer.companyProfile?.companyName || t("candDash.companyWord")}</strong>
                    <p className="text-muted" style={{ fontSize: "0.82rem" }}>{inv.job ? `${t("candDash.forJob")} ${inv.job.title}` : (inv.message || t("candDash.generalInvite"))}</p>
                  </div>
                  <RespondActions kind="invitation" id={inv.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Visibility + multiple CVs */}
      <div className="grid-2" style={{ marginTop: "2rem" }}>
        <CandidateVisibilityPanel initialSearchable={profile?.isSearchable ?? true} initialBoosted={boostedActive} />
        <ResumeManager />
      </div>

      {/* AI recommended jobs */}
      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>{t("candDash.recommendedJobs")}</h2>
        {!profile ? (
          <div className="card text-center" style={{ padding: "2rem" }}>
            <p className="text-muted">{t("candDash.recNoProfile")}</p>
          </div>
        ) : recommended.length === 0 ? (
          <div className="card text-center" style={{ padding: "2rem" }}>
            <p className="text-muted">{t("candDash.recEmpty")} <Link href="/jobs" style={{ color: "var(--primary)" }}>{t("candDash.jobsWord")}</Link>.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
            {recommended.map(({ job, score }) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="card hover-scale" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", color: "inherit" }}>
                <div className="flex-between" style={{ alignItems: "flex-start" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{job.title}</h3>
                  <span style={{ fontSize: "0.8rem", fontWeight: "bold", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", background: score > 75 ? "rgba(22,163,74,0.12)" : score > 40 ? "rgba(245,158,11,0.12)" : "var(--surface-hover)", color: score > 75 ? "#16a34a" : score > 40 ? "#b45309" : "var(--text-muted)" }}>
                    {score}% {t("candDash.matchWord")}
                  </span>
                </div>
                <span className="text-muted" style={{ fontSize: "0.85rem" }}>{job.company?.companyName} • {job.location}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
