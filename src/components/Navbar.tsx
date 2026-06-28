import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NotificationBell from "./NotificationBell";
import LogoutButton from "./LogoutButton";
import LanguageSwitcher from "./LanguageSwitcher";
import { getLocale, getDictionary } from "@/lib/i18n";
import { getEnabledLocales } from "@/lib/settings";

export default async function Navbar() {
  const session = await getServerSession(authOptions);
  const dict = getDictionary(await getLocale());
  const t = (k: string) => dict[k] ?? k;
  const enabledLocales = await getEnabledLocales();

  return (
    <header style={{ 
      background: "var(--surface)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "var(--glass-border)",
      color: "var(--text-main)",
      padding: "0.8rem 1.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      boxShadow: "var(--shadow-sm)"
    }}>
      
      {/* Right Side (Logo & Main Links in RTL) */}
      <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
        
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <div style={{ 
            fontSize: "1.8rem", 
            fontWeight: "900", 
            background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px"
          }}>
            Job<span style={{ opacity: 0.8 }}>Match</span>
          </div>
        </Link>

        {/* Links */}
        <nav style={{ display: "flex", gap: "1.5rem", fontSize: "0.95rem", fontWeight: 600 }}>
          <Link href="/" className="nav-link">{t("nav.home")}</Link>
          <Link href="/jobs" className="nav-link">{t("nav.jobs")}</Link>
          <Link href="/salaries" className="nav-link">{t("nav.salaries")}</Link>
          <Link href="/network" className="nav-link">{t("nav.network")}</Link>
          <Link href="/skills" className="nav-link">{t("nav.skills")}</Link>
          <Link href="/resources" className="nav-link">{t("nav.resources")} 🎧</Link>
        </nav>
      </div>

      {/* Left Side (Auth, Icons, Employer Link in RTL) */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        
        {/* Language switcher */}
        <LanguageSwitcher enabled={enabledLocales} />

        {/* Messages + Notification Bell (If Logged In) */}
        {session && <Link href="/messages" className="nav-link" title={t("nav.messages")} style={{ fontSize: "1.4rem" }}>✉️</Link>}
        {session && <NotificationBell />}

        {/* Auth Buttons */}
        {!session ? (
          <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
            <Link href="/login" className="nav-link" style={{
              padding: "0.5rem 1.2rem",
              fontWeight: "600",
              fontSize: "0.9rem"
            }}>
              {t("nav.login")}
            </Link>
            <Link href="/register" className="btn btn-primary" style={{ padding: "0.5rem 1.5rem", fontSize: "0.9rem" }}>
              {t("nav.register")}
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
            <Link href={(session.user as any).role === "EMPLOYER" ? "/dashboard/employer" : (session.user as any).role === "CANDIDATE" ? "/dashboard/candidate" : "/admin"} className="btn btn-primary" style={{ padding: "0.5rem 1.5rem", fontSize: "0.9rem" }}>
              {t("nav.dashboard")}
            </Link>
            <LogoutButton />
          </div>
        )}

        {/* For Employers Link */}
        <Link href="/employers" className="nav-link-muted" style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          paddingInlineEnd: "1rem",
          borderInlineStart: "1px solid var(--border-dark)",
          fontWeight: "600",
          fontSize: "0.95rem"
        }}>
          {t("nav.employers")} <span style={{ fontSize: "1.2rem", lineHeight: 0 }}>›</span>
        </Link>
        
      </div>

    </header>
  );
}
