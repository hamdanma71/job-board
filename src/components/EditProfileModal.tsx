"use client";

import { useState } from "react";

export default function EditProfileModal({ 
  initialName, 
  initialBio, 
  initialSkills, 
  initialLocation, 
  initialExperience,
  initialNationality,
  initialVisaStatus,
  initialSpecialization
}: { 
  initialName: string, 
  initialBio: string, 
  initialSkills: string,
  initialLocation: string,
  initialExperience: number,
  initialNationality: string,
  initialVisaStatus: string,
  initialSpecialization: string
}) {
  const [isOpen, setIsOpen] = useState(false);
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
          specialization 
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage("تم تحديث البيانات بنجاح!");
      setTimeout(() => {
        setIsOpen(false);
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      setMessage(error.message || "حدث خطأ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button className="btn btn-outline" style={{ marginTop: "1rem", width: "100%" }} onClick={() => setIsOpen(true)}>
        تعديل البيانات الشخصية
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
              style={{ position: "absolute", top: "1rem", left: "1rem", background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}
            >
              &times;
            </button>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>تعديل البيانات</h2>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="input-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="input-label">الاسم</label>
                  <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="input-label">التخصص الدقيق</label>
                  <input type="text" className="input-field" value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="مثال: هندسة برمجيات" />
                </div>
              </div>
              
              <div className="input-group">
                <label className="input-label">النبذة التعريفية</label>
                <textarea className="input-field" value={bio} onChange={e => setBio(e.target.value)} rows={3} />
              </div>

              <div className="input-group">
                <label className="input-label">المهارات (افصل بينها بفاصلة)</label>
                <input type="text" className="input-field" value={skills} onChange={e => setSkills(e.target.value)} />
              </div>

              <div className="input-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="input-label">المدينة / الدولة</label>
                  <input type="text" className="input-field" value={location} onChange={e => setLocation(e.target.value)} />
                </div>
                <div>
                  <label className="input-label">سنوات الخبرة</label>
                  <input type="number" className="input-field" value={experienceYears} onChange={e => setExperienceYears(Number(e.target.value))} />
                </div>
              </div>

              <div className="input-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="input-label">الجنسية</label>
                  <input type="text" className="input-field" value={nationality} onChange={e => setNationality(e.target.value)} />
                </div>
                <div>
                  <label className="input-label">حالة التأشيرة / الإقامة</label>
                  <input type="text" className="input-field" value={visaStatus} onChange={e => setVisaStatus(e.target.value)} placeholder="مثال: إقامة قابلة للتحويل" />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ marginTop: "1rem" }}>
                {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
              
              {message && <p style={{ textAlign: "center", fontSize: "0.9rem", color: message.includes("نجاح") ? "var(--secondary)" : "#ef4444" }}>{message}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
