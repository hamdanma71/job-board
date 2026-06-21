import Link from "next/link";
import countriesData from "@/data/countries.json";

export default function LocationsHub() {
  return (
    <main className="container" style={{ padding: "4rem 1.5rem" }}>
      
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem" }}>استكشف الوظائف حول العالم</h1>
        <p className="text-muted" style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}>
          اختر وجهتك المهنية القادمة من بين جميع دول العالم المعترف بها.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {countriesData.map((country: any) => (
          <Link key={country.id} href={`/locations/${country.id}`} style={{ textDecoration: "none" }}>
            <div className="card hover-scale" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontSize: "2rem" }}>{country.flag}</span>
                <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-main)" }}>{country.name}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <span style={{ color: "var(--primary)", fontWeight: "bold" }}>{country.jobCount}+</span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>وظيفة</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

    </main>
  );
}
