"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CountrySelect from "@/components/CountrySelect";
import { useT } from "@/components/I18nProvider";

export default function PostJobPage() {
  const t = useT();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState(""); // Only needed if first job
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("FULL_TIME");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [experienceMin, setExperienceMin] = useState("");
  const [currency, setCurrency] = useState("");

  const handleGenerate = async () => {
    if (!title.trim()) {
      setError(t("postJob.errTitleFirstAi"));
      return;
    }
    setAiLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/generate-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, basicRequirements: description || "وصف عام للوظيفة" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("postJob.errGenerate"));
      setDescription(data.data.jobDescription);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSuggestSkills = async () => {
    if (!title.trim()) { setError(t("postJob.errTitleFirst")); return; }
    setAiLoading(true); setError("");
    try {
      const res = await fetch("/api/ai/suggest-skills", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("postJob.errSuggestSkills"));
      setDescription((d) => `${d}\n\n${t("postJob.requiredSkills")}\n- ${data.data.skills.join("\n- ")}`);
    } catch (err: any) { setError(err.message); } finally { setAiLoading(false); }
  };

  const [salaryInfo, setSalaryInfo] = useState<{ min: number; max: number; median: number; currency: string; note: string } | null>(null);
  const handleSalaryAnalysis = async () => {
    if (!title.trim()) { setError(t("postJob.errTitleFirst")); return; }
    setAiLoading(true); setError(""); setSalaryInfo(null);
    try {
      const res = await fetch("/api/ai/salary-analysis", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, location }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("postJob.errSalaryAnalysis"));
      setSalaryInfo(data.data);
    } catch (err: any) { setError(err.message); } finally { setAiLoading(false); }
  };

  const handleImproveAd = async () => {
    if (!description.trim()) { setError(t("postJob.errDescFirst")); return; }
    setAiLoading(true); setError("");
    try {
      const res = await fetch("/api/ai/improve-ad", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("postJob.errImproveAd"));
      setDescription(data.data.improved);
    } catch (err: any) { setError(err.message); } finally { setAiLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/employer/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, title, location, type, salary, description, featured, salaryMin, salaryMax, experienceMin })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/employer");
        router.refresh();
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <main className="container text-center" style={{ padding: "5rem" }}>
        <h2 style={{ color: "var(--secondary)" }}>{t("postJob.successTitle")}</h2>
        <p className="text-muted mt-4">{t("postJob.successRedirect")}</p>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: "3rem 1.5rem", maxWidth: "800px" }}>
      <header className="flex-between mb-8">
        <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>{t("postJob.title")}</h1>
        <Link href="/dashboard/employer" className="btn btn-outline">{t("postJob.cancel")}</Link>
      </header>

      <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        <div className="input-group">
          <label className="input-label">{t("postJob.companyNameLabel")}</label>
          <input type="text" className="input-field" placeholder={t("postJob.companyNamePlaceholder")} value={companyName} onChange={e => setCompanyName(e.target.value)} />
        </div>

        <div className="input-group">
          <label className="input-label">{t("postJob.jobTitleLabel")}</label>
          <input type="text" className="input-field" required placeholder={t("postJob.jobTitlePlaceholder")} value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <CountrySelect label={t("postJob.countryLabel")} onSelect={(c) => { setLocation(c?.name || ""); setCurrency(c?.currency || ""); }} />
          <input type="hidden" value={location} readOnly />

          <div className="input-group">
            <label className="input-label">{t("postJob.jobTypeLabel")}</label>
            <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
              <option value="FULL_TIME">{t("postJob.typeFullTime")}</option>
              <option value="PART_TIME">{t("postJob.typePartTime")}</option>
              <option value="CONTRACT">{t("postJob.typeContract")}</option>
              <option value="REMOTE">{t("postJob.typeRemote")}</option>
              <option value="INTERNSHIP">{t("postJob.typeInternship")}</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label className="input-label">{t("postJob.salaryLabel")}</label>
            <button type="button" className="btn btn-outline" style={{ fontSize: "0.78rem", padding: "0.3rem 0.7rem" }} onClick={handleSalaryAnalysis} disabled={aiLoading}>
              {t("postJob.analyzeSalary")}
            </button>
          </div>
          <input type="text" className="input-field" placeholder={currency ? `${t("postJob.salaryExample")} ${currency}` : t("postJob.selectCountryCurrency")} value={salary} onChange={e => setSalary(e.target.value)} />
          {currency && <span className="text-muted" style={{ fontSize: "0.78rem", marginTop: "0.3rem" }}>{t("postJob.countryCurrency")} {currency}</span>}
          {salaryInfo && (
            <div style={{ marginTop: "0.5rem", padding: "0.75rem", background: "var(--surface-hover)", borderRadius: "var(--radius-md)", fontSize: "0.85rem" }}>
              <strong>{t("postJob.marketRange")}</strong> {salaryInfo.min.toLocaleString()} – {salaryInfo.max.toLocaleString()} {salaryInfo.currency} ({t("postJob.median")} {salaryInfo.median.toLocaleString()})
              <p className="text-muted" style={{ marginTop: "0.25rem" }}>{salaryInfo.note}</p>
              <button type="button" className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem", marginTop: "0.4rem" }}
                onClick={() => setSalary(`${salaryInfo.min.toLocaleString()} - ${salaryInfo.max.toLocaleString()} ${salaryInfo.currency}`)}>
                {t("postJob.useThisRange")}
              </button>
            </div>
          )}
        </div>

        <div className="input-group">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
            <label className="input-label">{t("postJob.descLabel")}</label>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <button type="button" className="btn btn-outline" style={{ fontSize: "0.78rem", padding: "0.3rem 0.7rem" }} onClick={handleGenerate} disabled={aiLoading}>
                {aiLoading ? "..." : t("postJob.btnGenerate")}
              </button>
              <button type="button" className="btn btn-outline" style={{ fontSize: "0.78rem", padding: "0.3rem 0.7rem" }} onClick={handleSuggestSkills} disabled={aiLoading}>
                {t("postJob.btnSuggestSkills")}
              </button>
              <button type="button" className="btn btn-outline" style={{ fontSize: "0.78rem", padding: "0.3rem 0.7rem" }} onClick={handleImproveAd} disabled={aiLoading}>
                {t("postJob.btnImproveAd")}
              </button>
            </div>
          </div>
          <textarea className="input-field" required rows={8} placeholder={t("postJob.descPlaceholder")} value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: "1rem" }}>
          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label">{t("postJob.salaryMinLabel")}</label>
            <input type="number" min="0" className="input-field" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="5000" />
          </div>
          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label">{t("postJob.salaryMaxLabel")}</label>
            <input type="number" min="0" className="input-field" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} placeholder="8000" />
          </div>
          <div className="input-group" style={{ margin: 0 }}>
            <label className="input-label">{t("postJob.expMinLabel")}</label>
            <input type="number" min="0" className="input-field" value={experienceMin} onChange={e => setExperienceMin(e.target.value)} placeholder="2" />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input type="checkbox" id="featured" checked={featured} onChange={e => setFeatured(e.target.checked)} />
          <label htmlFor="featured" style={{ fontSize: "0.9rem" }}>{t("postJob.featuredLabel")}</label>
        </div>

        {error && <p style={{ color: "#ef4444", textAlign: "center" }}>{error}</p>}

        <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }} disabled={isLoading}>
          {isLoading ? t("postJob.publishing") : t("postJob.publishNow")}
        </button>
      </form>
    </main>
  );
}
