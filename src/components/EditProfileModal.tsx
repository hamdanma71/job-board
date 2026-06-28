"use client";

import { useState } from "react";
import CountrySelect from "@/components/CountrySelect";
import { NATIONALITIES } from "@/lib/worldCountries";
import { useT } from "@/components/I18nProvider";

export default function EditProfileModal({
  initialName,
  initialBio,
  initialSkills,
  initialLocation,
  initialExperience,
  initialNationality,
  initialVisaStatus,
  initialSpecialization,
  initialDateOfBirth = "",
  initialGender = "",
  initialMaritalStatus = "",
  initialLanguages = "",
  initialReligion = "",
  initialDrivingLicense = "",
  initialVisaExpiry = "",
  initialAltEmail = "",
  initialAltPhone = "",
}: {
  initialName: string,
  initialBio: string,
  initialSkills: string,
  initialLocation: string,
  initialExperience: number,
  initialNationality: string,
  initialVisaStatus: string,
  initialSpecialization: string,
  initialDateOfBirth?: string,
  initialGender?: string,
  initialMaritalStatus?: string,
  initialLanguages?: string,
  initialReligion?: string,
  initialDrivingLicense?: string,
  initialVisaExpiry?: string,
  initialAltEmail?: string,
  initialAltPhone?: string,
}) {
  const t = useT();
  const [isOpen, setIsOpen] = useState(false);
  const [ok, setOk] = useState(false);
  const [name, setName] = useState(initialName || "");
  const [bio, setBio] = useState(initialBio || "");
  let defaultSkills = initialSkills || "";
  try {
    if (defaultSkills.startsWith("[")) {
      const arr = JSON.parse(defaultSkills);
      if (Array.isArray(arr)) defaultSkills = arr.join(", ");
    }
  } catch (e) {}

  const [skills, setSkills] = useState(defaultSkills);
  const [location, setLocation] = useState(initialLocation || "الإمارات، أبوظبي");
  const [experienceYears, setExperienceYears] = useState(initialExperience || 0);
  
  const [nationality, setNationality] = useState(initialNationality || "");
  const [visaStatus, setVisaStatus] = useState(initialVisaStatus || "");
  const [specialization, setSpecialization] = useState(initialSpecialization || "");

  const [dateOfBirth, setDateOfBirth] = useState(initialDateOfBirth || "");
  const [gender, setGender] = useState(initialGender || "");
  const [maritalStatus, setMaritalStatus] = useState(initialMaritalStatus || "");
  const [languages, setLanguages] = useState(initialLanguages || "");
  const [religion, setReligion] = useState(initialReligion || "");
  const [drivingLicense, setDrivingLicense] = useState(initialDrivingLicense || "");
  const [visaExpiry, setVisaExpiry] = useState(initialVisaExpiry || "");
  const [altEmail, setAltEmail] = useState(initialAltEmail || "");
  const [altPhone, setAltPhone] = useState(initialAltPhone || "");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      let parsedSkills = skills;
      if (!skills.startsWith("[")) {
        parsedSkills = JSON.stringify(skills.split(",").map(s => s.trim()).filter(s => s));
      }

      const res = await fetch("/api/candidate/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          skills: parsedSkills,
          location,
          experienceYears,
          nationality,
          visaStatus,
          specialization,
          dateOfBirth,
          gender,
          maritalStatus,
          languages,
          religion,
          drivingLicense,
          visaExpiry,
          altEmail,
          altPhone,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOk(true);
      setMessage(t("editProfile.success"));
      setTimeout(() => {
        setIsOpen(false);
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      setOk(false);
      setMessage(error.message || t("editProfile.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button className="btn btn-outline" style={{ marginTop: "1rem", width: "100%" }} onClick={() => setIsOpen(true)}>
        {t("editProfile.openBtn")}
      </button>

      {isOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", justifyContent: "center", alignItems: "center",
          padding: "1rem"
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ position: "absolute", top: "1rem", insetInlineEnd: "1rem", background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}
            >
              &times;
            </button>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>{t("editProfile.title")}</h2>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="input-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="input-label">{t("editProfile.name")}</label>
                  <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="input-label">{t("editProfile.specialization")}</label>
                  <input type="text" className="input-field" value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder={t("editProfile.specPlaceholder")} />
                </div>
              </div>
              
              <div className="input-group">
                <label className="input-label">{t("editProfile.bio")}</label>
                <textarea className="input-field" value={bio} onChange={e => setBio(e.target.value)} rows={3} />
              </div>

              <div className="input-group">
                <label className="input-label">{t("editProfile.skills")}</label>
                <input type="text" className="input-field" value={skills} onChange={e => setSkills(e.target.value)} />
              </div>

              <div className="input-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <CountrySelect label={location ? `${t("editProfile.countryCurrent")} ${location})` : t("editProfile.country")} onSelect={(c) => setLocation(c?.name || "")} />
                <div>
                  <label className="input-label">{t("editProfile.expYears")}</label>
                  <input type="number" className="input-field" value={experienceYears} onChange={e => setExperienceYears(Number(e.target.value))} />
                </div>
              </div>

              <div className="input-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="input-label">{t("editProfile.nationality")}</label>
                  <select className="input-field" value={nationality} onChange={e => setNationality(e.target.value)}>
                    <option value="">{t("editProfile.chooseNationality")}</option>
                    {nationality && !NATIONALITIES.includes(nationality) && <option value={nationality}>{nationality}</option>}
                    {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">{t("editProfile.visaStatus")}</label>
                  <input type="text" className="input-field" value={visaStatus} onChange={e => setVisaStatus(e.target.value)} placeholder={t("editProfile.visaPlaceholder")} />
                </div>
              </div>

              <h3 style={{ fontSize: "1rem", fontWeight: "bold", marginTop: "0.5rem", borderTop: "1px solid var(--border-light)", paddingTop: "1rem" }}>{t("editProfile.additionalDetails")}</h3>
              <div className="input-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", margin: 0 }}>
                <div>
                  <label className="input-label">{t("profileFields.dateOfBirth")}</label>
                  <input type="text" className="input-field" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} placeholder={t("profileFields.dobPlaceholder")} />
                </div>
                <div>
                  <label className="input-label">{t("profileFields.gender")}</label>
                  <input type="text" className="input-field" value={gender} onChange={e => setGender(e.target.value)} />
                </div>
              </div>
              <div className="input-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", margin: 0 }}>
                <div>
                  <label className="input-label">{t("profileFields.maritalStatus")}</label>
                  <input type="text" className="input-field" value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)} />
                </div>
                <div>
                  <label className="input-label">{t("profileFields.religion")}</label>
                  <input type="text" className="input-field" value={religion} onChange={e => setReligion(e.target.value)} />
                </div>
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">{t("profileFields.languages")}</label>
                <input type="text" className="input-field" value={languages} onChange={e => setLanguages(e.target.value)} placeholder={t("profileFields.languagesPlaceholder")} />
              </div>
              <div className="input-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", margin: 0 }}>
                <div>
                  <label className="input-label">{t("profileFields.drivingLicense")}</label>
                  <input type="text" className="input-field" value={drivingLicense} onChange={e => setDrivingLicense(e.target.value)} />
                </div>
                <div>
                  <label className="input-label">{t("profileFields.visaExpiry")}</label>
                  <input type="text" className="input-field" value={visaExpiry} onChange={e => setVisaExpiry(e.target.value)} />
                </div>
              </div>
              <div className="input-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", margin: 0 }}>
                <div>
                  <label className="input-label">{t("profileFields.altEmail")}</label>
                  <input type="email" className="input-field" value={altEmail} onChange={e => setAltEmail(e.target.value)} />
                </div>
                <div>
                  <label className="input-label">{t("profileFields.altPhone")}</label>
                  <input type="text" className="input-field" value={altPhone} onChange={e => setAltPhone(e.target.value)} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ marginTop: "1rem" }}>
                {isLoading ? t("editProfile.saving") : t("editProfile.save")}
              </button>

              {message && <p style={{ textAlign: "center", fontSize: "0.9rem", color: ok ? "var(--secondary)" : "#ef4444" }}>{message}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
