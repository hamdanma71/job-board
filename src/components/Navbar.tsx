import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NotificationBell from "./NotificationBell";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

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
          <Link href="/" style={{ transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--primary)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-main)"}>الرئيسية</Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", cursor: "pointer", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--primary)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-main)"}>
            <Link href="/jobs">تصفح الوظائف</Link>
          </div>
          <Link href="/salaries" style={{ transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--primary)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-main)"}>الرواتب والشركات</Link>
          <Link href="/podcasts" style={{ transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--primary)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-main)"}>البودكاست 🎧</Link>
        </nav>
      </div>

      {/* Left Side (Auth, Icons, Employer Link in RTL) */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        
        {/* Notification Bell (If Logged In) */}
        {session && <NotificationBell />}

        {/* Auth Buttons */}
        {!session ? (
          <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
            <Link href="/login" style={{
              padding: "0.5rem 1.2rem",
              color: "var(--text-main)",
              fontWeight: "600",
              fontSize: "0.9rem",
              textDecoration: "none",
              transition: "color 0.2s"
            }} onMouseOver={(e) => e.currentTarget.style.color = "var(--primary)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-main)"}>
              دخول
            </Link>
            <Link href="/register" className="btn btn-primary" style={{ padding: "0.5rem 1.5rem", fontSize: "0.9rem" }}>
              سجل الآن
            </Link>
          </div>
        ) : (
          <Link href={(session.user as any).role === "EMPLOYER" ? "/dashboard/employer" : (session.user as any).role === "CANDIDATE" ? "/dashboard/candidate" : "/admin"} className="btn btn-primary" style={{ padding: "0.5rem 1.5rem", fontSize: "0.9rem" }}>
            لوحة التحكم
          </Link>
        )}

        {/* For Employers Link */}
        <Link href="/employers" style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          paddingLeft: "1rem",
          borderRight: "1px solid var(--border-dark)",
          color: "var(--text-muted)",
          textDecoration: "none",
          fontWeight: "600",
          fontSize: "0.95rem",
          transition: "color 0.2s"
        }} onMouseOver={(e) => e.currentTarget.style.color = "var(--primary)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
          أصحاب العمل <span style={{ fontSize: "1.2rem", lineHeight: 0 }}>›</span>
        </Link>
        
      </div>

    </header>
  );
}
