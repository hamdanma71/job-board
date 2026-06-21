"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplicationStatusUpdater({ applicationId, currentStatus }: { applicationId: string, currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  const statuses = [
    { value: "PENDING", label: "مرشح جديد (قيد المراجعة)" },
    { value: "REVIEWED", label: "تمت المراجعة (مؤهل مبدئياً)" },
    { value: "INTERVIEW", label: "تم تحديد مقابلة" },
    { value: "ACCEPTED", label: "عرض وظيفي (مقبول)" },
    { value: "REJECTED", label: "مرفوض" }
  ];

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error("فشل التحديث");
      
      // Force refresh to update the UI
      router.refresh();
      
    } catch (error) {
      alert("حدث خطأ أثناء تحديث الحالة");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <select 
        className="input-field" 
        style={{ flex: 1 }} 
        value={status} 
        onChange={e => setStatus(e.target.value)}
        disabled={isLoading}
      >
        {statuses.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <button 
        className="btn btn-primary" 
        onClick={handleUpdate} 
        disabled={isLoading || status === currentStatus}
      >
        {isLoading ? "جاري الحفظ..." : "حفظ الحالة"}
      </button>
    </div>
  );
}
