/** Job categories — shared by the hub, landing pages, and sitemap. */
export type Category = { slug: string; name: string; icon: string; keywords: string[] };

export const CATEGORIES: Category[] = [
  { slug: "tech", name: "التقنية والبرمجة", icon: "💻", keywords: ["مطور", "برمج", "تقني", "developer", "engineer", "software", "programmer", "IT", "devops", "data"] },
  { slug: "health", name: "الطب والرعاية الصحية", icon: "🏥", keywords: ["طبيب", "تمريض", "صحي", "صيدل", "doctor", "nurse", "medical", "health", "pharmac"] },
  { slug: "engineering", name: "الهندسة والمقاولات", icon: "🏗️", keywords: ["هندس", "مقاول", "مدني", "معماري", "engineer", "civil", "mechanical", "construction", "architect"] },
  { slug: "finance", name: "المحاسبة والمالية", icon: "📊", keywords: ["محاسب", "مالي", "تدقيق", "accountant", "finance", "audit", "accounting", "financial"] },
  { slug: "sales", name: "المبيعات والتسويق", icon: "📈", keywords: ["مبيعات", "تسويق", "sales", "marketing", "business development", "growth"] },
  { slug: "design", name: "التصميم والفنون", icon: "🎨", keywords: ["تصميم", "مصمم", "جرافيك", "design", "designer", "ux", "ui", "graphic", "creative"] },
  { slug: "education", name: "التعليم والتدريب", icon: "📚", keywords: ["تعليم", "معلم", "تدريب", "مدرس", "teacher", "education", "training", "tutor", "instructor"] },
  { slug: "hr", name: "الموارد البشرية", icon: "🤝", keywords: ["موارد بشرية", "توظيف", "hr", "human resources", "recruiter", "talent", "recruitment"] },
  { slug: "legal", name: "الشؤون القانونية", icon: "⚖️", keywords: ["قانون", "محام", "قانوني", "legal", "lawyer", "attorney", "compliance"] },
  { slug: "customer-service", name: "خدمة العملاء", icon: "🎧", keywords: ["خدمة عملاء", "دعم", "customer", "support", "service", "call center"] },
  { slug: "logistics", name: "الخدمات اللوجستية", icon: "🚚", keywords: ["لوجست", "شحن", "نقل", "مخازن", "logistics", "supply chain", "warehouse", "shipping"] },
  { slug: "management", name: "الإدارة والأعمال", icon: "💼", keywords: ["إدارة", "مدير", "أعمال", "management", "manager", "operations", "executive", "director"] },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
