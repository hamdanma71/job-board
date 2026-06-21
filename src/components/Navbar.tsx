import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header style={{ 
      backgroundColor: "#0066ff", // Bayt-like blue
      color: "white",
      padding: "0.5rem 1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontFamily: "var(--font-inter), var(--font-cairo), sans-serif",
      position: "sticky",
      top: 0,
      zIndex: 1000
    }}>
      
      {/* Right Side (Logo & Main Links in RTL) */}
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <div style={{ 
            fontSize: "1.8rem", 
            fontWeight: "900", 
            color: "white",
            letterSpacing: "-0.5px"
          }}>
            Job<span style={{ opacity: 0.8 }}>Match</span>
          </div>
        </Link>

        {/* Links */}
        <nav style={{ display: "flex", gap: "1.5rem", fontSize: "0.95rem", fontWeight: 500 }}>
          <Link href="/" className="nav-link-white">الرئيسية</Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", cursor: "pointer" }}>
            <Link href="/jobs" className="nav-link-white">تصفح الوظائف</Link>
            <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>▼</span>
          </div>
          <Link href="/dashboard/candidate" className="nav-link-white">أنشئ سيرتك</Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", cursor: "pointer" }}>
            <Link href="/salaries" className="nav-link-white">الرواتب والتقييمات</Link>
          </div>
        </nav>
      </div>

      {/* Left Side (Auth, Icons, Employer Link in RTL) */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        
        {/* Auth Buttons */}
        {!session ? (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Link href="/login" style={{
              padding: "0.4rem 1.2rem",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              borderRadius: "4px",
              color: "white",
              fontWeight: "600",
              fontSize: "0.9rem",
              textDecoration: "none"
            }}>
              دخول
            </Link>
            <Link href="/register" style={{
              padding: "0.4rem 1.2rem",
              backgroundColor: "white",
              color: "#0066ff",
              borderRadius: "4px",
              fontWeight: "bold",
              fontSize: "0.9rem",
              textDecoration: "none"
            }}>
              سجل الآن
            </Link>
          </div>
        ) : (
          <Link href={(session.user as any).role === "EMPLOYER" ? "/dashboard/employer" : (session.user as any).role === "CANDIDATE" ? "/dashboard/candidate" : "/admin"} style={{
            padding: "0.4rem 1.2rem",
            backgroundColor: "white",
            color: "#0066ff",
            borderRadius: "4px",
            fontWeight: "bold",
            fontSize: "0.9rem",
            textDecoration: "none"
          }}>
            لوحة التحكم
          </Link>
        )}

        {/* Icons (Grid / Lang) */}
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", opacity: 0.9 }}>
          <div style={{ cursor: "pointer", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
            <div style={{ width: "6px", height: "6px", border: "1.5px solid white", borderRadius: "1px" }}></div>
            <div style={{ width: "6px", height: "6px", border: "1.5px solid white", borderRadius: "1px" }}></div>
            <div style={{ width: "6px", height: "6px", border: "1.5px solid white", borderRadius: "1px" }}></div>
            <div style={{ width: "6px", height: "6px", border: "1.5px solid white", borderRadius: "1px" }}></div>
          </div>
          <div style={{ cursor: "pointer", fontWeight: "600", fontSize: "0.95rem" }}>
            English
          </div>
        </div>

        {/* For Employers Link */}
        <Link href="/employers" style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          paddingLeft: "1rem",
          borderRight: "1px solid rgba(255, 255, 255, 0.2)",
          color: "white",
          textDecoration: "none",
          fontWeight: "600",
          fontSize: "0.95rem"
        }}>
          أصحاب العمل <span style={{ fontSize: "1.2rem", lineHeight: 0 }}>›</span>
        </Link>
        
      </div>

    </header>
  );
}
