# راهنمای پیاده‌سازی داشبورد پروژه با Highcharts در Angular

نسخه طراحی در خود تب «داشبورد پروژه» و تب «نمای تفصیلی پروژه» ده نمودار واقعی Highcharts دارد؛ هر دو مسیر از یک پیاده‌سازی استفاده می‌کنند. تنظیمات آن دقیقاً از `project-chart-options.js` خوانده می‌شود؛ همین فایل در کامپوننت Angular هم استفاده شده است. کارت‌ها، فیلتر قرارداد، تقویم و صفحه‌های جزئیات در فایل طراحی حفظ شده‌اند. هدر عمومی «لیست قراردادها» هنگام نمایش بخش داشبورد پنهان می‌شود و در صفحه قراردادها باقی می‌ماند.

چیدمان بصری جدید در `tools/project-dashboard-layout.css` تعریف شده: خلاصه چهارعددی، S-Curve بزرگ در کنار دو شاخص، کارت‌های مالی بدون زمینه‌های رنگی سنگین و اعداد روی میله‌ها. `project-dashboard-preview.html` پیش‌نمایش مستقل همین صفحه با داده نمونه است. برای بازسازی آن، دستور build زیر را اجرا کنید.

## نقطه شروع برنامه‌نویس

۱. این پوشه را به پروژه Angular منتقل کنید و نسخه‌های مشخص را نصب کنید:

```sh
npm install highcharts@12.4.0 highcharts-angular@5.0.0
```

۲. `provideProjectCharts()` را به آرایه `providers` در `app.config.ts` اضافه کنید. این provider از نسخه ESM استفاده می‌کند و ماژول‌های `highcharts-more` برای عقربه‌ها و بازه دما، و `accessibility` را بارگذاری می‌کند.

```ts
import { ApplicationConfig } from '@angular/core';
import { provideProjectCharts } from './project-dashboard/provide-project-charts';

export const appConfig: ApplicationConfig = {
  providers: [provideProjectCharts()], // در کنار providerهای موجود برنامه
};
```

۳. `ProjectDashboardComponent` را در `imports` کامپوننت میزبان قرار دهید:

```html
<parameter-project-dashboard [data]="projectData" [theme]="chartTheme" />
```

`projectData` از نوع `ProjectDashboardData` در `project-chart-options.d.ts` است. برای شروع `sample-project-data.json` داده نمونه همان طرح را دارد. در محصول واقعی، هنگام انتخاب قرارداد یا تغییر فیلتر، نتیجه API را به یک شیء جدید از این مدل تبدیل کنید؛ با تغییر ورودی، گزینه‌های تمام نمودارها بازسازی می‌شوند. نمودارها نسخه‌های مستقل از آرایه‌های ورودی می‌گیرند. برای واردکردن JSON، `resolveJsonModule: true` لازم است.

`chartTheme` اختیاری است و مقادیر `colors`, `fontFamily`, `text`, `grid`, `surface` را می‌گیرد. رنگ‌ها را از توکن‌های فعلی نرم‌افزار تهیه کنید. عنوان‌های نمودار و محور زمان فارسی هستند؛ تاریخ‌های شمسی برای نمایش، رشته دسته‌بندی هستند و نباید با `Date.parse` پردازش شوند.

## پیدا کردن نمودارها

در تابع `options(key, data, theme)` نام `key` را جست‌وجو کنید. `catalog` همان نام، عنوان فارسی، نوع نمودار و لینک نمونه رسمی را نگه می‌دارد. هیچ ابزار یا برچسب فنی اضافی به رابط کاربران اضافه نشده است.

| نمودار | کلید کد | نوع Highcharts | ورودی اصلی | نمونه رسمی |
|---|---|---|---|---|
| پیشرفت پروژه / S-Curve | `scurve` | `area` + دو `line` | `scurve.labels/planned/verified/actual` | [Area chart](https://www.highcharts.com/demo/highcharts/area-chart) |
| مدت پروژه | `duration` | `pie` با `innerSize: 72%` | `duration.active/inactive/remaining` | [Donut](https://www.highcharts.com/demo/highcharts/pie-donut) |
| شاخص هزینه | `cpi` | `gauge` نیم‌دایره | `cpi` | [Gauge](https://www.highcharts.com/demo/highcharts/gauge-speedometer) |
| شاخص زمان | `spi` | `gauge` نیم‌دایره | `spi` | [Gauge](https://www.highcharts.com/demo/highcharts/gauge-speedometer) |
| شاخص‌های مالی | `financial` | `column` | `financial.BCWS/BCWP/ACWP` | [Column](https://www.highcharts.com/demo/highcharts/column-basic) |
| پیشرفت فیزیکی | `physical` | سه سری `column` گروهی | `physical.categories/planned/verified/actual` | [Column](https://www.highcharts.com/demo/highcharts/column-basic) |
| پیشرفت ریالی | `rial` | `area` | `rial.dates/values` | [Area chart](https://www.highcharts.com/demo/highcharts/area-chart) |
| نیروی انسانی | `hr` | `bar` افقی | `hr.drivers/workers/security/engineers` | [Bar chart](https://www.highcharts.com/demo/highcharts/bar-chart) |
| ماشین‌آلات | `equip` | دو سری `bar` گروهی | `equip.categories/active/total` | [Bar chart](https://www.highcharts.com/demo/highcharts/bar-chart) |
| کمینه و بیشینه دما | `temperature` | `arearange` + دو `line` | `temperature.dates/min/max` | [Area range and line](https://www.highcharts.com/demo/highcharts/arearange-line) |

## قواعد داده و نمایش

- درصدها بین ۰ و ۱۰۰ هستند؛ مقدار ۵۰ به معنی ۵۰٪ است. مبلغ‌ها بر حسب ریال‌اند. تعداد نیرو و تجهیزات عدد صحیح است و دما می‌تواند منفی باشد.
- نقاط گزارش‌نشده S-Curve باید `null` باشند؛ صفر یا اتصال خط میان نقاط خالی معنای داده را تغییر می‌دهد. خطوط مستقیم انتخاب شده‌اند تا بین نقاط اندازه‌گیری، منحنی از دامنه داده فراتر نرود.
- در داده واقعی `CPI = BCWP / ACWP` و `SPI = BCWP / BCWS` محاسبه می‌شوند. مخرج صفر یعنی شاخص ناموجود (`null`). مقادیر فایل نمونه صرفاً برای نمایش‌اند و الزاماً از مبالغ نمونه محاسبه نشده‌اند.
- مرز مطلوب شاخص‌ها ۱ است. آستانه رنگ هشدار ۰٫۹ در این طرح یک انتخاب نمایشی قابل تنظیم است، نه قاعده ثابت کسب‌وکار. مقادیر بالاتر از ۲ بریده نمی‌شوند؛ سقف محور بزرگ‌تر می‌شود.
- `financial`، نمودار مقایسه مبالغ است و از صفر شروع می‌شود. `temperature` ناحیه بین کمینه و بیشینه را نشان می‌دهد، نه ناحیه بین بیشینه و صفر.
- عنوان قابل دسترس، tooltip، legend و نام سری‌ها در گزینه‌های مشترک تعریف شده‌اند. ماژول دسترس‌پذیری باید در اپ واقعی فعال بماند.
- بازکردن جزئیات در کامپوننت Angular با `dialog` بومی و بستن با Escape انجام می‌شود. wrapper ایجاد، به‌روزرسانی و حذف نمونه Highcharts را مدیریت می‌کند. در تب‌های پنهان، پس از نمایش فضای نمودار باید اندازه معتبر داشته باشد؛ نسخه HTML با `reflow()` بازتنظیم می‌شود.

## دامنه تحویل

کامپوننت Angular تحویلی، بخش ده نمودار و نمای بزرگ جزئیات آن‌هاست. انتخاب قرارداد، احراز هویت، واکشی API، کارت‌های مبلغ/انحراف، جدول‌ها، تقویم کارگاه و رخدادها در مسئولیت صفحه میزبان باقی می‌مانند. این موارد در نسخه HTML موجود حفظ شده‌اند و نیازی به تبدیلشان به Highcharts نیست. هیچ اتصال بک‌اند یا مهاجرت کل نرم‌افزار به Angular انجام نشده است.

این تحویل از wrapper رسمی نسخه ۵ با `provideHighcharts` و `HighchartsChartComponent` استفاده می‌کند. حداقل Angular ۱۹ است؛ با نسخه نصب‌شده Angular 21.2.19 و TypeScript 5.9.3، قالب و کامپوننت با `ngc` و `strictTemplates` کامپایل شدند. [راهنمای رسمی Angular](https://github.com/highcharts/highcharts-angular)

تست اجرایی بدون مرورگر با JSDOM، ایجاد ۱۰ نمونه واقعی Highcharts، تغییر قرارداد، بازوبسته‌شدن ۷ نمودار جزئیات، آزادسازی نمودار جزئیات و حفظ نقاط خالی را تأیید کرد. بررسی بصری مرورگر و آزمون کامل اپ Angular میزبان انجام نشده‌اند. تست کامپایل جایگزین این دو نیست.

فایل‌های توزیع Highcharts با نسخه 12.4.0 در `tools/highcharts-vendor` نگهداری و داخل HTML بسته‌بندی شده‌اند. اعلان مجوز سازنده حفظ شده است. برای انتشار تجاری، مجوز Highcharts سازمان باید برقرار باشد؛ نصب wrapper با مجوز MIT جایگزین مجوز خود Highcharts نیست. [مجوز Highcharts](https://www.highcharts.com/license)

## نگهداری طراحی

پس از تغییر تنظیمات مشترک، از ریشه مخزن اجرا کنید:

```sh
node tools/build-reference-dashboards.cjs
node tools/test-highcharts-dashboard.cjs
node tools/test-reference-dashboards.cjs
```

تست‌های این مخزن از JSDOM و TypeScript در پروژه همسایه `parameter-angular/node_modules` استفاده می‌کنند. برای انتقال تست‌ها به مخزن مستقل، مسیر import این دو وابستگی را به وابستگی محلی همان مخزن تغییر دهید. فایل `reference-dashboards-source.html` ورودی اولیه دست‌نخورده است؛ `migrate-reference-highcharts.cjs` آن را به نسخه Highcharts تبدیل می‌کند. کد خروجی را مستقیم ویرایش نکنید.
