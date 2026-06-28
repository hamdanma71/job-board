"use client";

import { useState, useRef } from "react";
import { useT } from "@/components/I18nProvider";

export default function CVUploadButton() {
  const t = useT();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"FILE" | "TEXT">("FILE");
  const [cvText, setCvText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processResponse = async (res: Response) => {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || t("cvBtn.parseFailed"));
    }
    setStatus("SUCCESS");
    setMessage(t("cvBtn.successMsg"));
    setTimeout(() => {
      setIsOpen(false);
      window.location.reload();
    }, 1000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setStatus("IDLE");
    setMessage(t("cvBtn.reading"));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("saveProfile", "true");

      const res = await fetch("/api/ai/parse-cv", {
        method: "POST",
        body: formData,
      });
      await processResponse(res);
    } catch (err: any) {
      setStatus("ERROR");
      setMessage(err.message);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleTextSubmit = async () => {
    if (!cvText.trim()) return;

    setIsLoading(true);
    setStatus("IDLE");
    setMessage(t("cvBtn.analyzingText"));

    try {
      const res = await fetch("/api/ai/parse-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, saveProfile: true }),
      });
      await processResponse(res);
    } catch (err: any) {
      setStatus("ERROR");
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        className="btn btn-outline" 
        style={{ width: "100%" }}
        onClick={() => setIsOpen(true)}
      >
        {t("cvBtn.openBtn")}
      </button>

      {isOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "500px", position: "relative" }}>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ position: "absolute", top: "1rem", insetInlineEnd: "1rem", background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}
            >
              &times;
            </button>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>{t("cvBtn.modalTitle")}</h2>
            
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.5rem" }}>
              <button 
                onClick={() => setActiveTab("FILE")}
                style={{ background: "none", border: "none", fontWeight: activeTab === "FILE" ? "bold" : "normal", color: activeTab === "FILE" ? "var(--primary)" : "var(--foreground)", cursor: "pointer" }}
              >
                {t("cvBtn.tabFile")}
              </button>
              <button 
                onClick={() => setActiveTab("TEXT")}
                style={{ background: "none", border: "none", fontWeight: activeTab === "TEXT" ? "bold" : "normal", color: activeTab === "TEXT" ? "var(--primary)" : "var(--foreground)", cursor: "pointer" }}
              >
                {t("cvBtn.tabText")}
              </button>
            </div>

            {activeTab === "FILE" && (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <input 
                  type="file" 
                  accept=".pdf,.txt" 
                  style={{ display: "none" }} 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <button 
                  className="btn btn-primary" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  {isLoading ? t("cvBtn.analyzing") : t("cvBtn.chooseFile")}
                </button>
                <p className="text-muted" style={{ fontSize: "0.85rem", marginTop: "1rem" }}>{t("cvBtn.supportedFormats")}</p>
              </div>
            )}

            {activeTab === "TEXT" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <textarea 
                  className="input-field" 
                  rows={6} 
                  placeholder={t("cvBtn.textPlaceholder")}
                  value={cvText}
                  onChange={e => setCvText(e.target.value)}
                  disabled={isLoading}
                />
                <button 
                  className="btn btn-primary" 
                  onClick={handleTextSubmit}
                  disabled={isLoading || !cvText.trim()}
                >
                  {isLoading ? t("cvBtn.analyzing") : t("cvBtn.extractUpdate")}
                </button>
              </div>
            )}

            {message && (
              <p style={{ 
                marginTop: "1rem", 
                fontSize: "0.9rem", 
                textAlign: "center",
                color: status === "ERROR" ? "#ef4444" : status === "SUCCESS" ? "var(--secondary)" : "var(--primary)" 
              }}>
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
