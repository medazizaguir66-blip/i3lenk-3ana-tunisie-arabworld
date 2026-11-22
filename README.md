# I3lenk 3ana Tunisie Arabworld

"ابني لي تطبيق ويب متكامل وعصري باللغة العربية (اتجاه من اليمين إلى اليسار RTL، ومتجاوب تماماً مع شاشة الهاتف) مخصص لأصحاب المتاجر الإلكترونية في تونس، يحمل اسم 'إعلانك عنّا' وشعار 'لأصحاب المتاجر الإلكترونية في تونس'.

1. التصميم والألوان: خلفية علوية باللون الأزرق الملكي الداكن مع عنوان أبيض وأصفر ذهبي: 'إعلانك جاهز في ثواني، والردود زادة.'، مع زر 'Pro 👑' ذهبي في الأعلى بجانب أيقونة الإعدادات (⚙️) يفتح نافذة الاشتراك مباشرة.

2. نموذج التوليد والذكاء الاصطناعي: بطاقة بيضاء دائرية الحواف تحتوي على: 'اسم المنتج'، 'السعر بالدينار التونسي (DT)'، 'المميزات وتفاصيل التوصيل'، وأزرار اختيار اللهجة (الدارجة التونسية، العربية الفصحى، الفرنسية)، وزر أحمر بارز 'توليد الإعلان والردود' مربوط بالذكاء الاصطناعي (Gemini API عبر Edge Function أو مفتاح API في الإعدادات) يعرض 3 بطاقات أنيقة قابلة للنسخ بضغطة زر: 1) وصف إعلاني جذاب، 2) 10 هاشتاغات قوية للسوق التونسي، 3) 3 ردود جاهزة ومقنعة على أسئلة الحرفاء.

3. بطاقة ونافذة Pro الذهبية اللامعة: اسمح بـ 3 محاولات مجانية يومياً لكل زائر. أضف في الأسفل بطاقة Pro مميزة بإطار ذهبي مضيء ومتحرك، نجوم صغيرة، وتاج متحرك، تعرض 3 مزايا للاشتراك وزر لامع 'اشترك تواً (15 دينار/شهر)'. عند الضغط تفتح نافذة منبثقة (Modal) برأس ذهبي تشرح الدفع عبر D17 أو Flouci على الرقم 52535555، وتحتوي على 3 أزرار واضحة لإرسال لقطة الدفع (بدون أي ذكر للواتساب):

• زر 'تواصل عبر إنستغرام' يفتح تطبيق إنستغرام مباشرة (instagram://user?username=aguir._.mohamed_aziz) أو الرابط https://instagram.com في نفس النافذة لتجنب حظر المتصفح.

• زر 'نسخ اسم الحساب' بجانبه ينسخ النص @aguir._.mohamed_aziz بضغطة واحدة مع إشعار 'تم النسخ!' ليسهل على الحريف البحث عنه.

• زر 'إرسال رسالة SMS' يفتح تطبيق الرسائل على الرقم 52535555 برسالة جاهزة.

4. نظام أكواد التفعيل الحقيقي (Lovable Cloud) ولوحة التحكم /admin: فعّل قاعدة البيانات لتخزين أكواد تفعيل بصيغة TN-XXXX-XXXX (حروف كبيرة وأرقام). كل كود يعمل على جهاز واحد فقط (يرتبط ببصمة المتصفح Device ID، وإذا استعمله شخص آخر يظهر له 'هذا الكود مفعل مسبقاً على جهاز آخر') ويكون صالحاً لمدة 30 يوماً من تاريخ التفعيل (وإذا جدد الحريف قبل انتهاء المدة تُضاف 30 يوماً لرصيده الحالي). أنشئ صفحة لوحة تحكم سرية على المسار /admin محمية بكلمة سر ADMIN_PASSWORD في الأسرار (Secrets) تتيح لي: توليد كود جديد بصيغة TN-XXXX-XXXX ونسخه، رؤية جدول الأكواد وحالتها وتاريخ انتهائها، وإلغاء أي كود أو فك ارتباطه بالجهاز."

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://i3lenk-3ana-tunisie-arabworld.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f34f17b9-a00c-47fe-9bfc-dac4adaefdfa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
