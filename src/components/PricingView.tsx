"use client";

import Link from "next/link";
import { useState } from "react";
import { useT } from "@/components/I18nProvider";

export default function PricingView({ isEmployer }: { isEmployer: boolean }) {
  const t = useT();
  const [isYearly, setIsYearly] = useState(false);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginBottom: "3rem" }}>
        <span style={{ fontWeight: !isYearly ? "bold" : "normal", color: !isYearly ? "var(--text)" : "var(--text-light)" }}>{t("pricingView.monthly")}</span>
        
        <label style={{ position: "relative", display: "inline-block", width: "60px", height: "34px" }}>
          <input 
            type="checkbox" 
            checked={isYearly} 
            onChange={(e) => setIsYearly(e.target.checked)} 
            style={{ opacity: 0, width: 0, height: 0 }} 
          />
          <span style={{ 
            position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: isYearly ? "var(--primary)" : "#ccc", 
            transition: ".4s", borderRadius: "34px" 
          }}>
            <span style={{
              position: "absolute", content: '""', height: "26px", width: "26px", 
              left: isYearly ? "4px" : "30px", bottom: "4px", backgroundColor: "white", 
              transition: ".4s", borderRadius: "50%"
            }}></span>
          </span>
        </label>
        
        <span style={{ fontWeight: isYearly ? "bold" : "normal", color: isYearly ? "var(--text)" : "var(--text-light)" }}>
          {t("pricingView.yearly")} <span style={{ fontSize: "0.75rem", backgroundColor: "var(--secondary)20", color: "var(--secondary)", padding: "0.2rem 0.5rem", borderRadius: "var(--radius-full)", marginInlineStart: "0.5rem" }}>{t("pricingView.discount20")}</span>
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Free Tier */}
        <div className="card hover-scale" style={{ border: "1px solid var(--border-light)" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("pricingView.freeName")}</h2>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--primary)", marginBottom: "1.5rem" }}>{t("pricingView.free")}</div>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem 0", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <li>✔️ {t("pricingView.freeFeat1")}</li>
            <li>✔️ {t("pricingView.freeFeat2")}</li>
            <li>✔️ {t("pricingView.freeFeat3")}</li>
            <li className="text-muted" style={{ textDecoration: "line-through" }}>{t("pricingView.freeFeat4")}</li>
            <li className="text-muted" style={{ textDecoration: "line-through" }}>{t("pricingView.freeFeat5")}</li>
          </ul>

          {isEmployer ? (
            <button className="btn btn-outline" style={{ width: "100%", cursor: "default" }}>{t("pricingView.currentPlan")}</button>
          ) : (
            <Link href="/register" className="btn btn-outline" style={{ display: "block", textAlign: "center", width: "100%" }}>{t("pricingView.registerCompany")}</Link>
          )}
        </div>

        {/* Pro Tier */}
        <div className="card hover-scale" style={{ border: "2px solid var(--primary)", position: "relative" }}>
          <div style={{ position: "absolute", top: "-15px", insetInlineStart: "20px", backgroundColor: "var(--primary)", color: "white", padding: "0.2rem 1rem", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: "bold" }}>
            {t("pricingView.mostPopular")}
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("pricingView.proName")}</h2>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "var(--primary)", marginBottom: "0.5rem" }}>
            {isYearly ? "159" : "199"} <span style={{ fontSize: "1rem", color: "var(--text-light)" }}>{t("pricingView.perMonthAed")}</span>
          </div>
          <div style={{ color: "var(--secondary)", fontWeight: "bold", fontSize: "0.9rem", marginBottom: "1rem" }}>
            {isYearly ? t("pricingView.billedYearly") : t("pricingView.freeForEarly")}
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem 0", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <li>✔️ {t("pricingView.proFeat1Pre")} <strong>{t("pricingView.proFeat1Strong")}</strong></li>
            <li>✔️ {t("pricingView.proFeat2")}</li>
            <li>✔️ {t("pricingView.proFeat3")}</li>
            <li>✔️ {t("pricingView.proFeat4")}</li>
            <li>✔️ {t("pricingView.proFeat5")}</li>
          </ul>

          {isEmployer ? (
            <button 
              className="btn btn-primary" 
              style={{ width: "100%" }} 
              onClick={async () => {
                try {
                  const res = await fetch('/api/checkout', { method: 'POST' });
                  const data = await res.json();
                  if (data.url) {
                    window.location.href = data.url;
                  } else {
                    alert(data.error || t("pricingView.checkoutError"));
                  }
                } catch(e) {
                  alert(t("pricingView.checkoutError"));
                }
              }}
            >
              {t("pricingView.upgradeNow")}
            </button>
          ) : (
            <Link href="/register" className="btn btn-primary" style={{ display: "block", textAlign: "center", width: "100%" }}>{t("pricingView.startNow")}</Link>
          )}
        </div>

      </div>
    </>
  );
}
