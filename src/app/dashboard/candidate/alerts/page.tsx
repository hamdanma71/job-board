"use client";

import { useState } from "react";
import Link from "next/link";

type JobAlert = {
  id: string;
  keywords: string;
  location: string;
  frequency: "DAILY" | "WEEKLY";
  isActive: boolean;
};

export default function JobAlertsPage() {
  const [alerts, setAlerts] = useState<JobAlert[]>([
    { id: "1", keywords: "React Developer", location: "Dubai", frequency: "DAILY", isActive: true },
    { id: "2", keywords: "Frontend Engineer", location: "Remote", frequency: "WEEKLY", isActive: false },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newFrequency, setNewFrequency] = useState<"DAILY"|"WEEKLY">("DAILY");

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const addAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword) return;
    const newAlert: JobAlert = {
      id: Date.now().toString(),
      keywords: newKeyword,
      location: newLocation,
      frequency: newFrequency,
      isActive: true
    };
    setAlerts([newAlert, ...alerts]);
    setIsAdding(false);
    setNewKeyword("");
    setNewLocation("");
    setNewFrequency("DAILY");
  };

  return (
    <div className="container" style={{ padding: "2rem" }}>
      <div className="flex-between mb-8">
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>التنبيهات الوظيفية 🔔</h1>
          <p className="text-muted">احصل على إشعارات فورية عبر البريد الإلكتروني للوظائف التي تناسب اهتماماتك.</p>
        </div>
        <Link href="/dashboard/candidate" className="btn btn-outline">عودة للوحة التحكم</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
        
        {/* Controls */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>تنبيهاتك الحالية ({alerts.length})</h2>
            <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
              {isAdding ? "إلغاء الإضافة" : "+ إضافة تنبيه جديد"}
            </button>
          </div>

          {isAdding && (
            <form onSubmit={addAlert} style={{ backgroundColor: "var(--surface-hover)", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", alignItems: "end" }}>
              <div className="input-group">
                <label className="input-label">المسمى الوظيفي أو الكلمات المفتاحية</label>
                <input type="text" className="input-field" placeholder="مثال: مدير تسويق" value={newKeyword} onChange={e => setNewKeyword(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">المدينة أو الدولة (اختياري)</label>
                <input type="text" className="input-field" placeholder="مثال: الرياض" value={newLocation} onChange={e => setNewLocation(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">وتيرة الإرسال</label>
                <select className="input-field" value={newFrequency} onChange={e => setNewFrequency(e.target.value as any)}>
                  <option value="DAILY">يومياً</option>
                  <option value="WEEKLY">أسبوعياً</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: "0.75rem" }}>حفظ التنبيه</button>
            </form>
          )}

          {alerts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "var(--surface-hover)", borderRadius: "8px" }}>
              <span style={{ fontSize: "3rem" }}>🔕</span>
              <p className="text-muted mt-4">لا توجد تنبيهات وظيفية معدة حالياً. أضف تنبيهاً لتكن أول من يعلم بالفرص الجديدة.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {alerts.map(alert => (
                <div key={alert.id} style={{ border: "1px solid var(--border-light)", borderRadius: "8px", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: alert.isActive ? "transparent" : "var(--surface-hover)", transition: "all 0.2s" }}>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.5rem", color: alert.isActive ? "var(--text-main)" : "var(--text-muted)" }}>
                      البحث عن: {alert.keywords}
                    </h3>
                    <div style={{ display: "flex", gap: "1rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                      <span>📍 {alert.location || "جميع المواقع"}</span>
                      <span>⏱️ التكرار: {alert.frequency === "DAILY" ? "يومياً" : "أسبوعياً"}</span>
                      <span>{alert.isActive ? "🟢 نشط" : "⚪ متوقف"}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button 
                      onClick={() => toggleAlert(alert.id)}
                      className={`btn ${alert.isActive ? "btn-outline" : "btn-primary"}`}
                      style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                    >
                      {alert.isActive ? "إيقاف مؤقت" : "تفعيل"}
                    </button>
                    <button 
                      onClick={() => deleteAlert(alert.id)}
                      style={{ padding: "0.5rem 1rem", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        <div className="card" style={{ backgroundColor: "var(--primary)", color: "white" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1rem" }}>💡 نصيحة لزيادة الفرص</h3>
          <p style={{ lineHeight: "1.6", opacity: 0.9 }}>
            قم بإنشاء تنبيهات متعددة باختلاف المسميات الوظيفية. مثلاً: "مطور واجهات" كتنبيه أول، و "React Developer" كتنبيه ثاني، لضمان عدم تفويت أي فرصة قد تستخدم مصطلحات مختلفة.
          </p>
        </div>

      </div>
    </div>
  );
}
