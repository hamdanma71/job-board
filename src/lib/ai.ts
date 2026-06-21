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
export async function parseCV(cvText: string) {
  if (!openai) {
    // Return dummy data for testing purposes
    console.log("No OPENAI_API_KEY found, returning dummy parsed CV data.");
    await new Promise(res => setTimeout(res, 2000));
    return {
      skills: ["إدارة الوقت", "التواصل الفعال", "استخدام الحاسب الآلي", "مهارات قيادية", "حل المشكلات"],
      experienceYears: 4,
      location: "الرياض، السعودية",
      bio: "محترف ذو خبرة مميزة في مجال العمل، مستعد لتقديم حلول إبداعية وإضافة قيمة حقيقية للشركة.",
      nationality: "",
      visaStatus: "",
      specialization: "تطوير البرمجيات"
    };
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
  "languages": ["اللغة 1", "اللغة 2"], // اللغات المذكورة
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
  return JSON.parse(resultString);
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
  return JSON.parse(resultString);
}
