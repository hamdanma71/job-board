import OpenAI from 'openai';

// Lazy initialize the OpenAI client so it doesn't crash on load if key is missing
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI();
  }
} catch (e) {}

/**
 * Generates an optimized Job Description based on a simple title and basic requirements.
 */
export async function generateJobDescription(title: string, basicRequirements: string): Promise<string> {
  if (!openai) {
    // Return dummy job description for testing UI
    console.log("No OPENAI_API_KEY found, returning dummy job description.");
    await new Promise(res => setTimeout(res, 1500));
    return `**وصف وظيفي مقترح (نموذج تجريبي)**\n\nنحن نبحث عن شخص موهوب لشغل دور ${title}.\n\n**المهام الأساسية:**\n- تنفيذ المهام بفعالية.\n- العمل ضمن فريق.\n\n**المتطلبات:**\n- ${basicRequirements}\n- خبرة لا تقل عن سنتين.`;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Using an efficient model
    messages: [
      { 
        role: "system", 
        content: "أنت خبير توظيف وموارد بشرية في الشرق الأوسط. مهمتك هي كتابة أوصاف وظيفية احترافية، جذابة، وخالية من الأخطاء اللغوية وتنسيقها بشكل جميل وجذاب للمتقدمين." 
      },
      { 
        role: "user", 
        content: `قم بكتابة وصف وظيفي احترافي لهذه الوظيفة:
المسمى الوظيفي: ${title}
المتطلبات الأساسية أو الملاحظات المبدئية: ${basicRequirements}
الرجاء تنسيق الوصف كنص مرتب (بدون Markdown مبالغ فيه) يحتوي على: 
- نبذة عن الدور
- المهام الأساسية
- المتطلبات والمؤهلات
- مهارات إضافية (إن وجدت)` 
      }
    ]
  });

  return response.choices[0].message.content || "";
}

/**
 * Parses a candidate's CV text to extract structured data using structured outputs (JSON).
 */
// Curated skill keywords (EN + AR) used by the no-OpenAI heuristic parser.
const CV_SKILL_KEYWORDS = [
  "javascript", "typescript", "react", "next.js", "nextjs", "node", "node.js", "vue", "angular",
  "python", "django", "flask", "java", "kotlin", "swift", "c++", "c#", ".net", "php", "laravel",
  "go", "rust", "ruby", "rails", "sql", "mysql", "postgresql", "postgres", "mongodb", "redis",
  "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "git", "ci/cd", "linux",
  "html", "css", "sass", "tailwind", "bootstrap", "graphql", "rest", "api",
  "figma", "sketch", "photoshop", "illustrator", "ui", "ux", "design",
  "excel", "word", "powerpoint", "power bi", "tableau", "data analysis", "machine learning",
  "seo", "sem", "marketing", "social media", "content", "copywriting", "sales", "crm", "salesforce",
  "accounting", "finance", "audit", "quickbooks", "sap", "hr", "recruitment", "project management",
  "agile", "scrum", "leadership", "communication", "negotiation", "customer service",
  "تطوير", "برمجة", "تصميم", "تسويق", "مبيعات", "محاسبة", "مالية", "تدقيق", "إدارة", "قيادة",
  "تواصل", "خدمة العملاء", "تحليل البيانات", "موارد بشرية", "هندسة", "مشاريع", "تفاوض",
];

// Personal-detail labels (Arabic CV / Bayt / LinkedIn exports use "Label\nValue"
// or "Label: Value"). Used by the no-OpenAI heuristic to fill profile fields.
const CV_FIELD_LABELS: Record<string, string[]> = {
  nationality: ["الجنسية", "nationality"],
  location: ["الموقع الحالي", "الموقع", "العنوان", "المدينة", "current location", "location", "address", "city"],
  visaStatus: ["وضع التأشيرة للموقع الحالي", "وضع التأشيرة", "حالة التأشيرة", "التأشيرة", "الإقامة", "visa status", "visa", "residency"],
  specialization: ["المسمى الوظيفي", "المسمّى الوظيفي", "التخصص", "الوظيفة الحالية", "المهنة", "job title", "title", "current position", "occupation"],
  dateOfBirth: ["تاريخ الميلاد", "date of birth", "dob", "birth date", "birthday"],
  gender: ["الجنس", "النوع", "gender", "sex"],
  maritalStatus: ["الحالة الاجتماعية", "الحالة الإجتماعية", "marital status", "marital"],
  languages: ["اللغات المعروفة", "اللغات", "languages known", "languages"],
  religion: ["الديانة", "الدين", "religion"],
  drivingLicense: ["هل لديك رخصة قيادة؟", "هل لديك رخصة قيادة", "رخصة القيادة", "رخصة قيادة", "driving license", "driving licence"],
  visaExpiry: ["تاريخ انتهاء صلاحية التأشيرة", "تاريخ انتهاء التأشيرة", "انتهاء التأشيرة", "visa expiry", "visa expiration", "visa expiry date"],
  altEmail: ["البريد الإلكتروني البديل", "البريد البديل", "alternate email", "alternative email", "secondary email"],
  altPhone: ["رقم اتصال بديل", "رقم اتصال إضافي", "هاتف بديل", "alternate phone", "alternative phone", "secondary phone"],
};
// Lines that are pure section noise — never used as a value or bio.
const CV_NOISE = ["التفاصيل الشخصية", "تعديل", "personal details", "edit", "السيرة الذاتية", "resume", "cv"];

function looksLikeLabel(line: string): boolean {
  const norm = line.replace(/[:：]/g, "").trim().toLowerCase();
  for (const labs of Object.values(CV_FIELD_LABELS)) if (labs.some((l) => l.toLowerCase() === norm)) return true;
  return CV_NOISE.some((n) => norm.includes(n.toLowerCase()));
}

/** Extract a value for any of the given labels: inline "label: value" or label-then-next-line. */
function valueForLabels(lines: string[], labels: string[]): string | undefined {
  const labs = labels.map((l) => l.toLowerCase());
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    const lower = raw.toLowerCase();
    const cIdx = raw.search(/[:：]/);
    for (const lab of labs) {
      // inline "Label: value" — the part BEFORE the colon must equal the label exactly
      if (cIdx > 0) {
        const before = raw.slice(0, cIdx).trim().toLowerCase();
        const after = raw.slice(cIdx + 1).trim();
        if (before === lab && after) return after;
      }
      // label on its own line → first following non-empty, non-label line
      if (lower.replace(/[:：]/g, "").trim() === lab) {
        for (let j = i + 1; j < lines.length; j++) {
          const v = lines[j].trim();
          if (v && !looksLikeLabel(v)) return v;
        }
      }
    }
  }
  return undefined;
}

/** Best-effort CV parsing without an LLM — extracts from the real text. */
function heuristicParseCV(cvText: string): Record<string, any> {
  const text = (cvText || "").trim();
  const lower = text.toLowerCase();
  const lines = text.split(/\r?\n+/).map((l) => l.trim()).filter(Boolean);

  // Skills: keywords actually present in the CV (deduped, capped).
  const seen = new Set<string>();
  const skills: string[] = [];
  for (const kw of CV_SKILL_KEYWORDS) {
    if (lower.includes(kw.toLowerCase()) && !seen.has(kw.toLowerCase())) {
      seen.add(kw.toLowerCase());
      skills.push(kw);
      if (skills.length >= 15) break;
    }
  }

  // Experience years: largest "N years / N سنوات" mention.
  let experienceYears: number | undefined;
  const matches = lower.match(/(\d{1,2})\s*\+?\s*(?:years|yrs|year|سنوات|سنة|عام|أعوام)/g);
  if (matches) {
    for (const m of matches) {
      const n = parseInt(m, 10);
      if (!isNaN(n)) experienceYears = Math.max(experienceYears ?? 0, n);
    }
  }

  // Labeled personal-detail fields.
  const nationality = valueForLabels(lines, CV_FIELD_LABELS.nationality);
  const location = valueForLabels(lines, CV_FIELD_LABELS.location);
  const visaStatus = valueForLabels(lines, CV_FIELD_LABELS.visaStatus);
  const specialization = valueForLabels(lines, CV_FIELD_LABELS.specialization);
  const dateOfBirth = valueForLabels(lines, CV_FIELD_LABELS.dateOfBirth);
  const gender = valueForLabels(lines, CV_FIELD_LABELS.gender);
  const maritalStatus = valueForLabels(lines, CV_FIELD_LABELS.maritalStatus);
  const languages = valueForLabels(lines, CV_FIELD_LABELS.languages);
  const religion = valueForLabels(lines, CV_FIELD_LABELS.religion);
  const drivingLicense = valueForLabels(lines, CV_FIELD_LABELS.drivingLicense);
  const visaExpiry = valueForLabels(lines, CV_FIELD_LABELS.visaExpiry);
  const altEmail = valueForLabels(lines, CV_FIELD_LABELS.altEmail);
  const altPhone = valueForLabels(lines, CV_FIELD_LABELS.altPhone);

  // Bio: prefer an explicit summary/about section; otherwise leave undefined so a
  // personal-details-only paste never overwrites an existing bio with field noise.
  const SUMMARY_LABELS = ["نبذة", "النبذة", "نبذة مختصرة", "الملخص", "الملخص الشخصي", "ملخص", "الهدف الوظيفي", "summary", "profile", "about", "objective", "professional summary"];
  let bio: string | undefined;
  for (let i = 0; i < lines.length; i++) {
    const norm = lines[i].replace(/[:：]/g, "").trim().toLowerCase();
    if (SUMMARY_LABELS.includes(norm)) {
      const rest: string[] = [];
      for (let j = i + 1; j < lines.length && rest.length < 3; j++) {
        if (looksLikeLabel(lines[j]) || SUMMARY_LABELS.includes(lines[j].toLowerCase())) break;
        rest.push(lines[j].trim());
      }
      if (rest.length) { bio = rest.join(" ").slice(0, 280); break; }
    }
    const inline = lines[i].match(/^(.*?)[:：]\s*(.+)$/);
    if (inline && SUMMARY_LABELS.includes(inline[1].trim().toLowerCase())) { bio = inline[2].trim().slice(0, 280); break; }
  }

  // Undetected fields stay undefined so the upsert keeps existing profile values.
  return {
    skills: skills.length ? skills : undefined,
    experienceYears,
    bio,
    location,
    nationality,
    visaStatus,
    specialization,
    dateOfBirth,
    gender,
    maritalStatus,
    languages,
    religion,
    drivingLicense,
    visaExpiry,
    altEmail,
    altPhone,
  };
}

export async function parseCV(cvText: string) {
  if (!openai) {
    // No OpenAI key: derive fields from the ACTUAL CV text (heuristic) so different
    // CVs produce different profiles. Undetected fields are left undefined so the
    // upsert never overwrites existing profile data with blanks.
    console.log("No OPENAI_API_KEY found — using local heuristic CV parser.");
    return heuristicParseCV(cvText);
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `أنت مساعد ذكي لاستخراج البيانات من السير الذاتية (CV Parser). 
يجب أن تقوم بإرجاع البيانات بصيغة JSON حصرية (بدون أي نص آخر) تحتوي على المفاتيح التالية:
{
  "skills": ["مهارة 1", "مهارة 2", ...], // تأكد من استخراج مصفوفة نظيفة من المهارات
  "experienceYears": 4, // رقم صحيح يمثل مجموع سنوات الخبرة المذكورة تقريباً
  "location": "مدينة، دولة", // إذا لم يذكر ضع null
  "bio": "ملخص احترافي قصير من 3 سطور كحد أقصى يعتمد على خبرات الشخص المذكورة",
  "nationality": "الجنسية، مثلا سعودي أو مصري، وإذا لم تذكر ضع null",
  "visaStatus": "حالة التأشيرة أو الإقامة، وإذا لم تذكر ضع null",
  "specialization": "التخصص الدقيق أو المسمى الوظيفي الأساسي للمرشح، وإذا لم يذكر ضع null",
  "languages": "اللغات مفصولة بفاصلة مثل: العربية، الإنجليزية، وإذا لم تذكر ضع null",
  "dateOfBirth": "تاريخ الميلاد كما ورد نصاً، وإذا لم يذكر ضع null",
  "gender": "الجنس (ذكر/أنثى)، وإذا لم يذكر ضع null",
  "maritalStatus": "الحالة الاجتماعية، وإذا لم تذكر ضع null",
  "religion": "الديانة، وإذا لم تذكر ضع null",
  "drivingLicense": "بيان رخصة القيادة إن وُجد، وإلا null",
  "visaExpiry": "تاريخ انتهاء التأشيرة كما ورد، وإلا null",
  "altEmail": "بريد إلكتروني بديل إن وُجد، وإلا null",
  "altPhone": "رقم هاتف بديل إن وُجد، وإلا null",
  "educationLevel": "مستوى التعليم (مثلاً: بكالوريوس، ماجستير) وإذا لم يذكر ضع null"
}`
      },
      {
        role: "user",
        content: `استخرج البيانات من السيرة الذاتية التالية:\n\n${cvText}`
      }
    ]
  });

  const resultString = response.choices[0].message.content || "{}";
  try {
    return JSON.parse(resultString);
  } catch {
    return {};
  }
}

/**
 * Calculates a matching score between a candidate's extracted data and a job description.
 */
export async function calculateMatchScore(candidateSkills: string[], candidateExperience: number, jobRequirementsText: string) {
  if (!openai) {
    // Return dummy score for testing UI
    console.log("No OPENAI_API_KEY found, returning dummy match score.");
    await new Promise(res => setTimeout(res, 1000));
    return {
      score: 85,
      reason: "يتمتع المرشح بخبرة ممتازة ومهارات مطابقة بشكل جيد لمتطلبات الوظيفة الأساسية."
    };
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `أنت نظام ذكي لمطابقة المرشحين.
يجب أن ترجع إجابتك بصيغة JSON حصرية تحتوي على:
{
  "score": 85, // رقم من 0 إلى 100 يمثل نسبة التطابق
  "reason": "ملخص من سطرين يوضح لماذا هذا التقييم، وما هي المهارات المطابقة والناقصة"
}`
      },
      {
        role: "user",
        content: `هل هذا المرشح مناسب لهذه الوظيفة؟
بيانات المرشح:
- المهارات: ${candidateSkills.join(", ")}
- سنوات الخبرة: ${candidateExperience}

متطلبات الوظيفة:
${jobRequirementsText}`
      }
    ]
  });

  const resultString = response.choices[0].message.content || "{}";
  try {
    return JSON.parse(resultString);
  } catch {
    return { score: 0, reason: "" };
  }
}

async function chatJSON(system: string, user: string): Promise<any> {
  const response = await openai!.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  try {
    return JSON.parse(response.choices[0].message.content || "{}");
  } catch {
    return {};
  }
}

/** Summarize an applicant's CV/profile into a short recruiter-facing brief. */
export async function summarizeCandidate(profileText: string): Promise<string> {
  if (!openai) {
    await new Promise((r) => setTimeout(r, 800));
    return "ملخّص تجريبي: مرشّح ذو خبرة جيدة ومهارات متوافقة مع الدور، يُنصح بمراجعة سنوات الخبرة والمشاريع السابقة في المقابلة.";
  }
  const res = await chatJSON(
    'أنت مساعد توظيف. لخّص المرشّح في 3 أسطر للمسؤول عن التوظيف. أعد JSON: {"summary": "..."}',
    `بيانات المرشّح:\n${profileText}`
  );
  return res.summary || "";
}

/** Suggest required skills for a given job title. */
export async function suggestSkills(title: string): Promise<string[]> {
  if (!openai) {
    await new Promise((r) => setTimeout(r, 600));
    return ["التواصل الفعّال", "العمل ضمن فريق", "حل المشكلات", "إدارة الوقت", "إجادة الأدوات التقنية"];
  }
  const res = await chatJSON(
    'أنت خبير موارد بشرية. اقترح 6-8 مهارات أساسية للوظيفة. أعد JSON: {"skills": ["..."]}',
    `المسمى الوظيفي: ${title}`
  );
  return Array.isArray(res.skills) ? res.skills : [];
}

/** Generate suggested interview questions for a job. */
export async function generateInterviewQuestions(title: string, description: string): Promise<string[]> {
  if (!openai) {
    await new Promise((r) => setTimeout(r, 800));
    return [
      "حدّثنا عن خبرتك الأكثر صلة بهذا الدور.",
      "كيف تتعامل مع ضغط المواعيد النهائية؟",
      "اذكر مثالاً على مشكلة حللتها بإبداع.",
      "ما الذي يجذبك لهذه الوظيفة تحديداً؟",
      "أين ترى نفسك بعد ثلاث سنوات؟",
    ];
  }
  const res = await chatJSON(
    'أنت مسؤول توظيف. ولّد 5-7 أسئلة مقابلة مناسبة. أعد JSON: {"questions": ["..."]}',
    `المسمى: ${title}\nالوصف: ${description}`
  );
  return Array.isArray(res.questions) ? res.questions : [];
}

/** Suggest improvements for a candidate's CV. */
export async function suggestCvImprovements(cvText: string): Promise<string[]> {
  if (!openai) {
    await new Promise((r) => setTimeout(r, 700));
    return [
      "أضِف أرقاماً وإنجازات قابلة للقياس لكل خبرة (مثلاً: زيادة المبيعات 20%).",
      "اذكر المهارات التقنية بوضوح في قسم منفصل.",
      "اكتب ملخّصاً مهنياً موجزاً في الأعلى يبرز قيمتك.",
      "أضِف الشهادات والدورات ذات الصلة.",
    ];
  }
  const res = await chatJSON(
    'أنت خبير سير ذاتية. اقترح 4-6 تحسينات عملية. أعد JSON: {"suggestions": ["..."]}',
    `السيرة الذاتية:\n${cvText}`
  );
  return Array.isArray(res.suggestions) ? res.suggestions : [];
}

/** Improve/polish an existing job ad. */
export async function improveJobAd(description: string): Promise<string> {
  if (!openai) {
    await new Promise((r) => setTimeout(r, 900));
    return description + "\n\n— (نسخة محسّنة تجريبياً: أضِف نبذة جذّابة عن الشركة، ووضّح المهام والمزايا والمسار المهني.)";
  }
  const res = await chatJSON(
    'أنت كاتب إعلانات وظيفية. حسّن الإعلان ليكون أوضح وأجذب دون تغيير الحقائق. أعد JSON: {"improved": "..."}',
    description
  );
  return res.improved || description;
}

/** Smart screening: is the applicant qualified, and does it look like a spam/random application? */
export async function screenApplicant(profileText: string, jobText: string): Promise<{ qualified: boolean; isSpam: boolean; reason: string }> {
  if (!openai) {
    await new Promise((r) => setTimeout(r, 700));
    return { qualified: true, isSpam: false, reason: "نموذج تجريبي: المرشّح يبدو مؤهّلاً ومطابقاً للمتطلبات، ولا توجد مؤشرات على تقديم عشوائيّ." };
  }
  const res = await chatJSON(
    'أنت نظام فرز مرشّحين. حدّد إن كان المرشّح مؤهّلاً للوظيفة وهل التقديم يبدو عشوائياً/غير جادّ. أعد JSON: {"qualified": true, "isSpam": false, "reason": "..."}',
    `الوظيفة:\n${jobText}\n\nالمرشّح:\n${profileText}`
  );
  return { qualified: Boolean(res.qualified), isSpam: Boolean(res.isSpam), reason: res.reason || "" };
}

/** Compare several candidates for a job and rank them. */
export async function compareCandidates(candidates: { name: string; profile: string }[], jobText: string): Promise<{ ranking: { name: string; score: number; note: string }[]; recommendation: string }> {
  if (!openai) {
    await new Promise((r) => setTimeout(r, 900));
    return {
      ranking: candidates.map((c, i) => ({ name: c.name, score: Math.max(50, 95 - i * 10), note: "تقييم تجريبيّ بناءً على المهارات والخبرة." })),
      recommendation: candidates[0] ? `المرشّح الأنسب مبدئياً: ${candidates[0].name}.` : "لا يوجد مرشّحون.",
    };
  }
  const res = await chatJSON(
    'أنت مسؤول توظيف. قارن المرشّحين ورتّبهم لهذه الوظيفة. أعد JSON: {"ranking": [{"name":"...","score":0-100,"note":"..."}], "recommendation": "..."}',
    `الوظيفة:\n${jobText}\n\nالمرشّحون:\n${candidates.map((c, i) => `${i + 1}) ${c.name}: ${c.profile}`).join("\n")}`
  );
  return { ranking: Array.isArray(res.ranking) ? res.ranking : [], recommendation: res.recommendation || "" };
}

/** Analyze the salary market for a job title/location. */
export async function analyzeSalaryMarket(title: string, location: string): Promise<{ min: number; max: number; median: number; currency: string; note: string }> {
  if (!openai) {
    await new Promise((r) => setTimeout(r, 800));
    return { min: 6000, max: 18000, median: 11000, currency: "AED", note: "نموذج تجريبي: تقدير عام لنطاق الراتب الشهري في سوق الخليج لهذا الدور." };
  }
  const res = await chatJSON(
    'أنت محلّل سوق رواتب في الخليج. قدّر نطاق الراتب الشهري بالدرهم الإماراتي. أعد JSON: {"min":0,"max":0,"median":0,"currency":"AED","note":"..."}',
    `المسمى: ${title}\nالموقع: ${location || "الخليج"}`
  );
  return {
    min: Number(res.min) || 0,
    max: Number(res.max) || 0,
    median: Number(res.median) || 0,
    currency: res.currency || "AED",
    note: res.note || "",
  };
}
