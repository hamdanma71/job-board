"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useT } from "@/components/I18nProvider";

function LoginForm() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isRegistered = searchParams.get("registered") === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(t("loginPage.invalidCredentials"));
        setIsLoading(false);
      } else {
        // Successful login, fetch session to determine role and redirect
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        
        if (sessionData?.user?.role === "EMPLOYER") {
          router.push("/dashboard/employer");
        } else {
          router.push("/dashboard/candidate");
        }
        router.refresh();
      }
    } catch (err: any) {
      setError(t("loginPage.serverError"));
      setIsLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: "500px", width: "100%", padding: "2.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary)" }}>{t("loginPage.title")}</h1>
        <p className="text-muted">{t("loginPage.subtitle")}</p>
      </div>

      {isRegistered && (
        <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--secondary)", padding: "1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", fontSize: "0.9rem", textAlign: "center" }}>
          {t("loginPage.registeredSuccess")}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div className="input-group">
          <label className="input-label">{t("loginPage.emailLabel")}</label>
          <input 
            type="email" 
            className="input-field" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="example@domain.com"
            dir="ltr"
          />
        </div>

        <div className="input-group">
          <label className="input-label">{t("loginPage.passwordLabel")}</label>
          <input 
            type="password" 
            className="input-field" 
            required 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••"
            dir="ltr"
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={isLoading}>
          {isLoading ? t("loginPage.loggingIn") : t("loginPage.loginBtn")}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.95rem" }}>
        <span className="text-muted">{t("loginPage.noAccount")} </span>
        <Link href="/register" style={{ color: "var(--primary)", fontWeight: "bold" }}>{t("loginPage.createAccount")}</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const t = useT();
  return (
    <main className="container flex-center" style={{ minHeight: "80vh", padding: "2rem" }}>
      <Suspense fallback={<div>{t("loginPage.loading")}</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
