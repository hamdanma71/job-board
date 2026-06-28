# JobMatch — خطة العمل والتوثيق المعتمد

**النسخة:** 2.0 · **آخر تحديث:** 2026-06-28 · **الحالة:** معتمدة (Single Source of Truth)

منصّة توظيف رقمية (Marketplace) ثنائية الجانب تربط الباحثين عن عمل بالشركات، مبنية على **Next.js 16 + Prisma**، **متعدّدة اللغات (10 لغات)** مع نظام ترجمة مُعتمد وأدوات ذكاء اصطناعي وتجميع وظائف ونظام ATS كامل.

> **هذا الملف هو المرجع المعتمد الوحيد لحالة المشروع.** طُهِّر من كل القيم/النسخ القديمة وغير المعتمدة وُوحِّد التوثيق. الرموز: ✅ منجز ومُتحقَّق · 🟡 جزئي · ⬜ مخطّط (يحتاج خدمة خارجية).

---

## 1) المكدّس التقني

- **الواجهة:** Next.js 16 (App Router) · React 19 · TypeScript · نظام تصميم CSS (`src/app/globals.css`، glassmorphism/gradient، يحترم `prefers-reduced-motion`).
- **الخلفية:** Next.js API Routes · NextAuth (Credentials + JWT، أدوار CANDIDATE/EMPLOYER/ADMIN).
- **قاعدة البيانات:** Prisma ORM — **محليًّا SQLite** (`prisma/dev.db`)، **للإنتاج PostgreSQL** (انظر §11 النشر).
- **المدفوعات:** Stripe (Checkout + Webhook موقّع + idempotency). **العملة المعتمدة عبر المنصّة: الدرهم الإماراتي (AED / د.إ).**
- **الذكاء الاصطناعي:** OpenAI (`gpt-4o-mini`، JSON mode) مع بدائل تجريبية آمنة عند غياب المفتاح.

---

## 2) نموذج البيانات (`prisma/schema.prisma`) — 28 نموذجًا

- **الهوية والملفّات:** `User` · `CandidateProfile` · `CompanyProfile`.
- **الوظائف والتقديم:** `Job` · `Application` · `JobAlert` · `Resume` · `SavedCandidate` · `Invitation`.
- **ATS والتعاون:** `Interview` · `Scorecard` · `CandidateComment` · `Offer`.
- **الشركات والتقييم:** `Review` (7 معايير) · `InterviewReview` (تجارب مقابلات نمط Glassdoor) · `CompanyFollow`.
- **الشبكة المهنية:** `Post` · `PostReaction` · `PostComment` · `Connection` · `Endorsement`.
- **الرسائل:** `Conversation` · `Message`.
- **المهارات:** `SkillTest` · `SkillTestResult`.
- **النظام:** `Notification` · `Payment` (إيرادات، `stripeEventId` فريد) · `AppSetting` (إعدادات key/value — منها اللغات المفعّلة).

**قيود وفهارس بارزة:** `Application @@unique([jobId,candidateId])` · `Review @@unique([companyId,reviewerId])` · `Conversation @@unique([userAId,userBId])` · `CompanyFollow @@unique([userId,companyId])` · `AppSetting.key @unique` · فهارس على كل المفاتيح الأجنبيّة وأعمدة الترتيب الساخنة.

**حقول مفتاحيّة:** `Application.status` (ATS 7 مراحل، المصدر الموحّد `src/lib/applicationStatus.ts`) · `Application.promoted` · `CompanyProfile.{subscriptionTier, subscriptionEndsAt, isVerified, isBanned, isStartup, stage, fundingRaised, teamSize}` · `CandidateProfile.{plan(FREE/PREMIUM), planEndsAt, isSearchable, rankBoostedUntil, nationality, visaStatus, specialization}` · `Job.{source, externalUrl, featured, salaryMin, salaryMax, experienceMin}`.

---

## 3) التدويل (i18n) — متعدّد اللغات، ذكيّ ومتكيّف تلقائيًّا

### 3.1 اللغات المعتمدة (10)
العربية (ar، RTL، الافتراضيّة) · الإنجليزية (en، المصدر) · الفرنسية (fr) · الأوردو (ur، RTL) · الفلبينية (fil) · الروسية (ru) · الألمانية (de) · الهندية (hi) · الإندونيسية (id) · الصينية (zh). **940 مفتاح ترجمة لكل لغة.**

### 3.2 المعمارية
- `src/locales/<code>.ts` — قاموس مسطّح `Record<string,string>` لكل لغة.
- **توليد تلقائيّ للسجلّ** (`scripts/i18n/gen-registry.js`): يمسح ملفّات اللغات ويُولّد:
  - `src/lib/locales.generated.ts` (آمن للعميل): `LOCALES` (code/label/dir) + `type Locale` مُشتقّ + `DEFAULT_LOCALE`.
  - `src/locales/dicts.generated.ts` (خادميّ فقط): استيرادات القواميس + خريطة `DICTS`.
- `src/lib/locales.ts` (آمن للعميل): يُعيد تصدير المولّد + `isLocale`/`dirOf`.
- `src/lib/i18n.ts` (خادميّ): `getLocale()` (من كوكي `locale`، مُغلَّف بـ`react cache()`) · `getDictionary()` (دمج الإنجليزية كطبقة fallback + **memoization**).
- `src/components/I18nProvider.tsx` (`useT`/`useLocale`) · `src/components/LanguageSwitcher.tsx` (يعرض المفعّلة فقط).
- **الاتجاه:** `src/app/layout.tsx` يضبط `<html lang dir>` حسب اللغة؛ `LanguageSwitcher` يحدّث `document.documentElement.dir/lang` فورًا عند التبديل فتنقلب المنصّة كلّها RTL↔LTR دون إعادة تحميل. الأنماط الاتجاهيّة منطقيّة (`inset/margin/padding/border-inline-*`). الخطوط: Cairo (عربي/أوردو) + Inter (لاتيني/سيريلّي) + fallback نظاميّ للديفاناغاري/CJK.

### 3.3 التكيّف التلقائيّ (إضافة لغة = إسقاط ملفّ واحد)
1. أنشئ `src/locales/<code>.ts` (ابدأ بمفاتيح قليلة ثمّ `npm run i18n:sync` لتسقيف الباقي بالإنجليزية كي لا ينكسر البناء).
2. (اختياريّ) أضِف label/dir في `scripts/i18n/i18n.config.json → localeMeta` (الافتراضيّ: label=CODE، dir من قائمة `rtl`).
3. `npm run i18n:gen` (أو `npm run dev`/`build` — يُشغّلانه تلقائيًّا). تظهر اللغة تلقائيًّا في السجلّ والمبدّل ولوحة الأدمن و`<html>` والبوّابة — **دون أي تعديل كود.**

### 3.4 إدارة اللغات من الأدمن
لوحة `/admin` فيها قسم «إدارة لغات الموقع»: تفعيل/تعطيل أي لغة (محفوظ في `AppSetting` عبر `src/lib/settings.ts`؛ العربية مقفلة كافتراضيّة)؛ المبدّل يعرض المفعّلة فقط، وكوكي لغة معطّلة يرجع للافتراضيّة.

### 3.5 معيار الترجمة «المطابقة» (قاعدة حاكمة)
كل ترجمة تلتزم بـ12 شرطًا: الدقّة الكاملة · الاكتمال · حفظ المعنى · توحيد المصطلحات · حفظ التنسيق · مطابقة الأسماء/البيانات · مطابقة الأرقام/الوحدات · سلامة اللغة · حفظ الأسلوب · عدم الاجتهاد · المراجع المعتمدة · المراجعة النهائية. (أسماء العلم والعلامة التجارية «JobMatch» تبقى دون تغيير.)

### 3.6 أدوات الجودة والأتمتة (`scripts/i18n/`) + أوامر npm
- `npm run i18n:gen` — توليد السجلّ من الملفّات.
- `npm run i18n:sync` — تسقيف المفاتيح الناقصة بقيم إنجليزيّة (لئلّا تكسر لغة جزئيّة البناء).
- `npm run i18n:audit` — تدقيق المطابقة: **حرج (يفشل):** مفتاح مفقود/قيمة فارغة/رقم محذوف/«JobMatch» محذوف/إيموجي محذوف/عدم تطابق السجلّ. **ليّن (تنبيه):** مسافات، مطابق للإنجليزية، مفاتيح زائدة. (مُحلِّل regex آمن بلا تنفيذ كود.)
- `npm run i18n:consistency` — اتّساق معجميّ: أي قيمة إنجليزيّة متكرّرة تُترجَم بصياغة واحدة/لغة (باستثناء `contextDivergent`: `jobs`/`Post`/`Offer`/`Jobs in`).
- `npm run i18n:normalize` — تطبيق المسرد المعتمد (`i18n.config.json → glossary`، idempotent).
- `npm run i18n:check` — البوّابة: `gen + audit + consistency`.

### 3.7 البوّابات الآليّة (تمنع ترجمة ناقصة/غير متّسقة)
- **محليًّا:** `predev` و`prebuild` يُشغّلان `gen→audit→consistency`؛ فشلها يُجهض `npm run build`.
- **CI:** `.github/workflows/i18n.yml` يُولّد السجلّ، يفشل على سجلّ قديم (`git diff --exit-code` للملفّين المولّدين)، ثمّ audit+consistency على push/PR.
- **النشر:** أوامر بناء Render/Railway/Vercel كلّها `npm run build` فتُطلق البوّابة عند النشر.
- **الملفّان المولّدان مُلتزَمان (committed) ولا يُحرَّران يدويًّا.**

---

## 4) المزايا حسب المجال (كلّها مُنفَّذة ومُتحقَّقة ما لم يُذكر غير ذلك)

### 4.1 الهوية والوصول
✅ تسجيل/دخول بأدوار (bcrypt + JWT) · لوحات تحكّم للباحث والشركة والأدمن · `NEXTAUTH_SECRET` إلزاميّ.

### 4.2 الباحث عن عمل
✅ ملف شخصيّ (جنسية/تأشيرة/تخصص/موقع/خبرة/مهارات) · رفع CV (PDF/لصق) + استخراج بالـAI + اقتراحات تحسين · سير ذاتية متعدّدة (`Resume`، أساسيّة + تنزيل محميّ) · إدارة الظهور (`isSearchable` + تعزيز Rank Booster + تحديث) · توصية وظائف تلقائيّة بالتوافق · تنبيهات وظائف (`JobAlert`) · صندوق الدعوات والعروض.

### 4.3 الشركة و ATS (عمق Greenhouse/Lever)
✅ نشر وظائف (مبوّب بالاشتراك) · لوحة متقدّمين بترتيب توافق تلقائيّ + تمييز الطلبات (`promoted`) · **ATS 7 مراحل** · بطاقات تقييم (`Scorecard`) + ملاحظات فريق + عروض (`Offer`) · جدولة مقابلات (`Interview`) + إشعار · **تحليلات قمع التوظيف** (`/dashboard/employer/analytics`).

### 4.4 بحث المرشّحين (RESDEX، حصريّ PRO)
✅ `/dashboard/employer/candidates` — بحث بقاعدة المرشّحين (كلمة/تخصص/جنسية/موقع/أدنى خبرة) + حفظ في قوائم (`SavedCandidate`) + دعوة للتقديم (`Invitation`) + مراسلة + وصول محميّ للسير.

### 4.5 الوظائف والتجميع و SEO
✅ صفحات وظائف + فلاتر (موقع/نوع/تاريخ/أدنى راتب/أقصى خبرة) · تجميع حقيقيّ (RemoteOK، dedupe بـ`externalUrl`، تعطيل المنتهية) + cron كل 6 ساعات · صفحات هبوط حسب التصنيف (`/jobs/category/[slug]`) + `sitemap.ts`/`robots.ts`.

### 4.6 الشركات والتقييمات (Glassdoor)
✅ صفحات الشركات + **تقييم 7 معايير** + **تجارب مقابلات** (`InterviewReview`) + متابعة الشركة (`CompanyFollow` + إشعار المتابعين عند وظيفة جديدة) + محرّر ملف الشركة + حقول الشركات الناشئة.

### 4.7 الرواتب
✅ `/salaries` + **مستكشف رواتب متعدّد الأبعاد** (`SalaryExplorer`: فلتر دولة/قطاع لحظيّ، بلا خلط عملات).

### 4.8 الرسائل والشبكة المهنية (LinkedIn)
✅ رسائل مباشرة (`Conversation`/`Message` + `Messenger` + polling) · شبكة مهنية (`/network`: منشورات + تفاعلات + تعليقات + اتصالات request/accept + تزكيات مهارات + درجة اكتمال الملف).

### 4.9 المهارات والموارد
✅ اختبارات مهارات (`SkillTest`/`SkillTestResult` + تصحيح + شارة ≥60%) · مركز موارد `/resources` (مدوّنة + بودكاست بمشغّل صوت).

### 4.10 الدول والعملات
✅ 250 دولة + جنسيّاتها + عملاتها (`src/data` + `src/lib/worldCountries.ts` + `CountrySelect`) — تظهر العملة تلقائيًّا عند اختيار الدولة (post-job/الملف/بحث المرشّحين).

### 4.11 لوحة الأدمن
✅ إحصاءات + إيرادات (د.إ) + رسم 6 أشهر + توزيع اشتراكات · توثيق/حظر/حذف الشركات · **تغيير باقة الشركة** (FREE/PRO) و**باقة الأفراد** (FREE/PREMIUM) · **إدارة لغات الموقع** · كل إجراء يعيد التحقّق من ADMIN.

---

## 5) أدوات الذكاء الاصطناعي للشركات (10/10)
توليد الوصف الوظيفي · ترتيب التوافق · تلخيص السيرة · اقتراح المهارات · أسئلة المقابلة · تحسين الإعلان · فحص/تصفية ذكيّة · مقارنة المرشّحين · كشف التقديم العشوائيّ · تحليل سوق الرواتب. (جميعها عبر `/api/ai/*` مع بدائل تجريبية عند غياب مفتاح OpenAI.)

---

## 6) الأمان (مُطبَّق)
- توقيع Stripe webhook إلزاميّ (fail-closed) + فحص `payment_status` + idempotency (`stripeEventId`).
- بوّابة الاشتراك على مساري النشر (لا تجاوز) + فرض الانتهاء + حظر الحسابات.
- حماية `/api/cron/scrape` بـ`CRON_SECRET` (Bearer) · حارس جلسة على `parse-cv` · تحقّق صحّة حالة الطلب.
- وصول السير الذاتية محميّ (`/api/cv/[userId]` للمالك/الأدمن/الموظِّف المتلقّي، تحقّق regex ضدّ traversal).
- إجراءات الأدمن تعيد التحقّق من الدور · `_load.js` بلا تنفيذ كود (مُحلِّل آمن).
- **إدارة الأسرار:** `NEXTAUTH_SECRET` من البيئة فقط (لا بديل في الكود، fail-closed) · `.env`/`prisma/dev.db` غير متعقَّبَين (`.gitignore` + `!.env.example` للقالب) · **حارس أسرار تلقائيّ** (`scripts/secret-guard.js`) مُركَّب كـpre-commit (يُثبَّت ذاتيًّا عبر `npm run prepare`/`prepare`) يمنع التزام ملفّات env/مفاتيح أو أسرار معروفة؛ فحص يدويّ `npm run security:scan`.
- **تنبيه قائم (يحتاج إجراء المالك):** `NEXTAUTH_SECRET` قديم مكشوف في تاريخ git على origin (commit رفع سابق) — دُوِّر محليًّا؛ يجب **تدوير سرّ الإنتاج** على المنصّة، ولتطهير التاريخ يلزم إعادة كتابته (BFG/`git filter-repo`) بموافقة صريحة.

---

## 7) الأداء (مُطبَّق)
- `getDictionary` بـmemoization (Map/لغة) · `getLocale`+`getEnabledLocales` بـ`react cache()` (قراءة واحدة/طلب).
- استعلامات مُحسّنة: `groupBy`/`aggregate` بدل سحب الصفوف (companies/admin/analytics) · فهارس على FK/الترتيب · حدود `take`.

---

## 8) الصفحات (37)
`/` · `/login` · `/register` · `/jobs` · `/jobs/[id]` · `/jobs/remote` · `/jobs/executive` · `/jobs/category/[slug]` · `/companies` · `/companies/[id]` · `/salaries` · `/locations` · `/locations/[country]` · `/categories` · `/employers` · `/blog` · `/podcasts` · `/resources` · `/skills` · `/skills/[id]` · `/network` · `/messages` · `/pricing` · `/premium` · `/admin` · لوحات `/dashboard/candidate(+/alerts,/notifications,/upload-cv)` · `/dashboard/employer(+/post-job,/candidates,/saved,/analytics,/applications/[id],/jobs/[id])`.

## 9) مسارات API (≈52)
`/auth/*` · `/ai/*` (9) · `/jobs` · `/employer/jobs` · `/applications(+/[id]/{comment,interview,offer,promote,scorecard})` · `/candidates/{search,save,invite}` · `/candidate/{profile,visibility}` · `/resumes(+/[id]/file)` · `/companies/[id]/{follow,interview-review}` · `/company/profile` · `/reviews` · `/posts(+/[id]/{react,comments})` · `/connections(+/[id])` · `/endorse` · `/conversations` · `/messages` · `/alerts(+/[id])` · `/invitations/[id]` · `/offers/[id]` · `/notifications` · `/cv/[userId]` · `/checkout` · `/webhooks/stripe` · `/cron/scrape` · `/skills/[id]/submit`.

---

## 10) التشغيل المحليّ
1. `npm install` · `npx prisma db push` (SQLite، القاعدة `prisma/dev.db`).
2. `npm run dev` (المنفذ 3000؛ `predev` يُولّد سجلّ اللغات أوّلًا).
3. **لا تُشغّل `npx tsc` بالتوازي مع `next dev`** (نفاد ذاكرة V8 — افصل بينهما).

## 11) النشر (Production)
1. **قاعدة البيانات:** بدّل `provider` إلى `postgresql` في `schema.prisma`، اضبط `DATABASE_URL` على Postgres مُدار، استخدم `prisma migrate deploy`.
2. **متغيّرات البيئة:** `DATABASE_URL` · `NEXTAUTH_SECRET` · `NEXTAUTH_URL` · `OPENAI_API_KEY` · `STRIPE_SECRET_KEY` · `STRIPE_WEBHOOK_SECRET` · `CRON_SECRET`.
3. **أمر البناء على كل المنصّات `npm run build`** (Render/Railway/Vercel) ⇒ يُطلق بوّابة i18n قبل البناء.
4. **Cron:** `vercel.json` يستدعي `/api/cron/scrape` كل 6 ساعات بـ`Authorization: Bearer ${CRON_SECRET}`.

## 12) يحتاج خدمات خارجية (⬜ غير مُفعّل محليًّا)
- **Postgres حيّ** · **Redis** (تخزين/طوابير) · **Elasticsearch/Algolia** (بحث متقدّم) · **تخزين سحابيّ** (S3/Blob للسير بدل القرص) · **Worker** لإرسال تنبيهات `JobAlert` فعليًّا.

## 13) خارطة مستقبليّة (⬜)
بقيّة مصادر الإيراد (pay-per-click / بيع وصول CV / Employer Branding) · مقابلات فيديو ذكيّة · تطبيقات هاتف · توسّع لغويّ (مرحلة ثالثة — تُتبنّى تلقائيًّا بإسقاط الملفّات) · سوق العمل الحرّ.

---

## 14) دليل الصيانة السريع
- **إضافة لغة:** §3.3 (إسقاط ملفّ + `npm run i18n:gen`).
- **قبل اعتماد أي ترجمة:** `npm run i18n:check` (يجب: HARD 0 · registry ok · REAL inconsistencies 0).
- **توحيد مصطلح:** أضِفه إلى `i18n.config.json → glossary` ثمّ `npm run i18n:normalize`.
- **تعديل سلوك/مخطّط:** حدّث هذا الملف (§ المعنيّ + النسخة + التاريخ) ليبقى المرجع المعتمد موحّدًا.
