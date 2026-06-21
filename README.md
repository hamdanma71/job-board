# منصة التوظيف الذكية (Smart Job Board)

منصة توظيف متقدمة مبنية باستخدام:
- Next.js 16 (App Router)
- React 19
- Prisma ORM
- PostgreSQL
- NextAuth.js (للمصادقة)

## خطوات الرفع على خوادم الإنتاج (Deployment)

إذا كنت تخطط لرفع الموقع على منصات مثل **Vercel** أو أي منصة Serverless، يجب عليك استخدام قاعدة بيانات خارجية من نوع PostgreSQL (لأن Vercel لا تحتفظ بملفات قاعدة بيانات SQLite).

### 1. إعداد الاستضافة وقاعدة البيانات
قم بإنشاء قاعدة بيانات PostgreSQL (يمكنك استخدام Vercel Postgres, Supabase, Neon, أو غيرها).

### 2. إعداد متغيرات البيئة
انسخ محتويات ملف `.env.example` إلى إعدادات Environment Variables في لوحة تحكم الاستضافة (Vercel Dashboard):

- `DATABASE_URL`: رابط اتصال قاعدة البيانات الجديدة (PostgreSQL).
- `NEXTAUTH_SECRET`: مفتاح تشفير قوي (يمكن توليده عبر `openssl rand -base64 32`).
- `NEXTAUTH_URL`: رابط الدومين الخاص بك (مثال: `https://yourdomain.com`).
- `OPENAI_API_KEY`: مفتاح الـ API الخاص بـ OpenAI.

### 3. بناء قاعدة البيانات
بعد رفع الكود، ستحتاج إلى تطبيق مخطط قاعدة البيانات عبر تشغيل هذا الأمر (في Vercel يمكن إضافته إلى أمر الـ Build):
```bash
npx prisma db push
```

*ملاحظة: يمكنك تعديل إعدادات الـ Build Command في Vercel لتكون:*
```bash
npx prisma generate && npx prisma db push && next build
```

### 4. التشغيل
ستقوم Vercel تلقائياً ببناء وتشغيل الموقع `npm run build` ثم `npm run start`.
