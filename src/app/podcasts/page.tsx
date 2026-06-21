import Link from "next/link";

const podcasts = [
  {
    id: 1,
    title: "حلقة #42: أسرار المقابلات التقنية مع مدير التوظيف في جوجل",
    host: "برنامج مسيرتك",
    duration: "45 دقيقة",
    image: "🎧",
    tags: ["مقابلات", "تقنية"]
  },
  {
    id: 2,
    title: "حلقة #41: متى يجب عليك تغيير مسارك المهني بالكامل؟",
    host: "برنامج مسيرتك",
    duration: "38 دقيقة",
    image: "🎙️",
    tags: ["تطوير مهني", "نصائح"]
  },
  {
    id: 3,
    title: "حلقة #40: كيف تتفاوض على راتبك بثقة واحترافية",
    host: "برنامج مسيرتك",
    duration: "52 دقيقة",
    image: "💼",
    tags: ["رواتب", "تفاوض"]
  },
  {
    id: 4,
    title: "حلقة #39: مستقبل العمل عن بعد في الشرق الأوسط",
    host: "برنامج مسيرتك",
    duration: "41 دقيقة",
    image: "🌍",
    tags: ["عمل عن بعد", "سوق العمل"]
  }
];

export default function PodcastsHub() {
  return (
    <main style={{ backgroundColor: "#000", color: "#fff", minHeight: "100vh" }}>
      
      {/* Hero Section */}
      <section style={{ 
        padding: "6rem 1.5rem", 
        background: "linear-gradient(to bottom, #1db954 0%, #000000 100%)",
        textAlign: "center"
      }}>
        <div className="container">
          <h1 style={{ fontSize: "4rem", fontWeight: "900", marginBottom: "1rem", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>JobMatch Podcasts</h1>
          <p style={{ fontSize: "1.25rem", opacity: 0.9, maxWidth: "600px", margin: "0 auto 2rem auto" }}>
            استمع لأفضل النصائح المهنية وتجارب الناجحين في سوق العمل أثناء تنقلك.
          </p>
          <button style={{ backgroundColor: "#1db954", color: "#fff", border: "none", padding: "1rem 3rem", borderRadius: "30px", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer", transition: "transform 0.2s" }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            ▶ استمع لأحدث حلقة
          </button>
        </div>
      </section>

      <section className="container" style={{ padding: "2rem 1.5rem 6rem 1.5rem" }}>
        
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "2rem", borderBottom: "1px solid #333", paddingBottom: "1rem" }}>أحدث الحلقات</h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {podcasts.map((podcast, index) => (
            <div key={podcast.id} style={{ 
              display: "flex", 
              alignItems: "center", 
              padding: "1rem", 
              borderRadius: "8px", 
              backgroundColor: "#121212",
              cursor: "pointer",
              transition: "background-color 0.2s"
            }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#282828'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#121212'}>
              
              <span style={{ fontSize: "1.2rem", color: "#b3b3b3", width: "30px", textAlign: "center" }}>{index + 1}</span>
              
              <div style={{ width: "50px", height: "50px", backgroundColor: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", borderRadius: "4px", margin: "0 1rem" }}>
                {podcast.image}
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.25rem" }}>{podcast.title}</h3>
                <span style={{ color: "#b3b3b3", fontSize: "0.9rem" }}>{podcast.host}</span>
              </div>
              
              <div style={{ display: "none", '@media (min-width: 768px)': { display: "flex" }, gap: "0.5rem", marginRight: "2rem" } as any}>
                {podcast.tags.map(tag => (
                  <span key={tag} style={{ border: "1px solid #555", color: "#b3b3b3", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem" }}>{tag}</span>
                ))}
              </div>
              
              <span style={{ color: "#b3b3b3", fontSize: "0.9rem" }}>{podcast.duration}</span>
              
            </div>
          ))}
        </div>

        <div style={{ marginTop: "4rem", backgroundColor: "#121212", padding: "3rem", borderRadius: "12px", textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>متوفرون على جميع المنصات</h2>
          <p style={{ color: "#b3b3b3", marginBottom: "2rem" }}>لا تفوت أي حلقة. اشترك الآن على منصتك المفضلة.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ backgroundColor: "#fff", color: "#000", border: "none", padding: "0.75rem 2rem", borderRadius: "30px", fontWeight: "bold", cursor: "pointer" }}>Apple Podcasts</button>
            <button style={{ backgroundColor: "#1db954", color: "#fff", border: "none", padding: "0.75rem 2rem", borderRadius: "30px", fontWeight: "bold", cursor: "pointer" }}>Spotify</button>
            <button style={{ backgroundColor: "#ea4335", color: "#fff", border: "none", padding: "0.75rem 2rem", borderRadius: "30px", fontWeight: "bold", cursor: "pointer" }}>Google Podcasts</button>
          </div>
        </div>

      </section>

    </main>
  );
}
