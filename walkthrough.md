# JobMatch — Walkthrough

دليل عمليّ لكيفية عمل المنصة من منظور المستخدم والمطوّر.

## التشغيل المحليّ
```bash
npm install
npx prisma generate
npm run dev          # http://localhost:3000
```
- قاعدة البيانات المحليّة SQLite في `prisma/dev.db` (موجودة وبها بيانات تجريبية).
- لإنشاء مستخدم Admin: `npx ts-node scripts/make-admin.ts <email>` (أو عدّل الدور يدويًّا).
- بدون `OPENAI_API_KEY` تعمل ميزات الذكاء الاصطناعي ببيانات تجريبية. بدون مفاتيح Stripe يفشل الـwebhook بأمان (fail-closed).

## رحلة الباحث عن عمل
1. **التسجيل** (`/register` → نوع: باحث) ثم **الدخول** (`/login`) → يُوجَّه إلى `/dashboard/candidate`.
2. **بناء الملف بالذكاء الاصطناعي:** زرّ «تحديث السيرة الذاتية الذكي» (`CVUploadButton`) → رفع PDF أو لصق نص → `POST /api/ai/parse-cv` يستخرج (مهارات/خبرة/موقع/تخصص…) ويحدّث الملف. أو «تعديل البيانات» يدويًّا (`EditProfileModal`).
3. **البحث:** `/jobs` بحث (يشمل العنوان+الوصف+اسم الشركة) + فلاتر موقع/نوع. للباحث المسجَّل تظهر **نسبة التوافق** لكل وظيفة (`src/lib/matching.ts`).
4. **التفاصيل والتقديم:** `/jobs/[id]` → «تقدّم الآن» (`ApplyButton` → `POST /api/applications`). الوظائف الخارجية تحوّل للموقع الأصلي.
5. **المتابعة:** عند تغيير الشركة لحالة الطلب، يصل **إشعار** (جرس Navbar يضيء عبر polling، والتفاصيل في `/dashboard/candidate/notifications`).

## رحلة الشركة
1. التسجيل كشركة → `/dashboard/employer`.
2. **نشر وظيفة** (`/dashboard/employer/post-job`): زرّ «✨ توليد بالذكاء الاصطناعي» يكتب الوصف من المسمى (`POST /api/ai/generate-jd`). **النشر يتطلّب اشتراك PRO فعّالًا** (وإلا 403 → الترقية).
3. **الترقية:** `/pricing` → Stripe Checkout (`POST /api/checkout`) → بعد الدفع يُحدّث الـwebhook الباقة ويُسجّل `Payment`.
4. **إدارة المتقدّمين (ATS):** `/dashboard/employer/jobs/[id]` يعرض المتقدّمين مرتّبين بنسبة التوافق، مع تغيير الحالة عبر مراحل ATS السبع: `مرشّح جديد → قيد المراجعة → مؤهّل → مقابلة → عرض وظيفي → تم التعيين / مرفوض`.

## رحلة المدير (Admin)
- `/admin` (محميّة بدور ADMIN): إحصاءات حيّة + **إجمالي الإيرادات** + **رسم إيرادات 6 أشهر** + توزيع الاشتراكات + جدول إدارة الشركات (توثيق / حظر / حذف). كل إجراء يُعيد التحقّق من دور ADMIN.

## تجميع الوظائف (Aggregation)
- `src/lib/scraper.ts` يجلب من RemoteOK API، يمنع التكرار بـ`externalUrl`، يحدّث القائم، ويُعطّل الخارجيّ الأقدم من 30 يومًا.
- `GET /api/cron/scrape` محميّ بـ`CRON_SECRET`؛ يُجدوَل عبر `vercel.json` كل 6 ساعات.

## الميزات الرئيسية (مرجع سريع)
| الميزة | الملف/المسار |
|---|---|
| رفع/لصق CV + تحليل AI | `src/app/api/ai/parse-cv/route.ts` · `src/lib/ai.ts` |
| محرك المطابقة الموزون | `src/lib/matching.ts` |
| مراحل ATS السبع (موحّدة) | `src/lib/applicationStatus.ts` |
| بوابة الاشتراك | `src/lib/subscription.ts` · `api/employer/jobs` · `api/jobs` |
| Stripe webhook (موقّع + idempotent) | `src/app/api/webhooks/stripe/route.ts` |
| الإشعارات (إنشاء + جرس + صفحة) | `api/applications/[id]` · `components/NotificationBell.tsx` |
| لوحة Admin | `src/app/admin/page.tsx` |
| صفحات الدول الديناميكية | `src/app/locations/[country]/page.tsx` |

## ملاحظات للمطوّر
- مكوّنات الخادم (RSC) **لا تستخدم** معالجات JS مضمّنة (`onMouseOver`)؛ تأثيرات الـhover عبر أصناف CSS في `globals.css`.
- المعاملات الديناميكية `params`/`searchParams` **وعود** (Next 15+): استخدم `await`.
- `skills` تُخزَّن كنصّ JSON/CSV (قيد SQLite)؛ عند الانتقال إلى Postgres يُفضَّل `String[]` أو جدول مهارات.
