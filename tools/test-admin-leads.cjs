const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
(async () => {
  const html = fs.readFileSync(path.join(root, 'parameter-v34-login-sharp.html'), 'utf8');
  for (const name of ['admin-shell','admin-customers','admin-leads']) {
    const inline = html.match(new RegExp('<script id="parameter-'+name+'-inline">([\\s\\S]*?)</script>'));
    assert(inline, name+' inline missing');
    assert.equal(inline[1].replace(/\r/g,'').trim(),fs.readFileSync(path.join(__dirname,name+'.js'),'utf8').replace(/\r/g,'').trim());
  }
  const browser = await chromium.launch({channel:'chrome', headless:true});
  try {
    const page = await browser.newPage({viewport:{width:1920,height:1080}});
    const errors=[];page.on('pageerror', e=>errors.push(e.message));
    // Isolated fixture: no real app data or network requests are used by this test.
    await page.route('https://admin-fixture.test/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html dir="rtl" lang="fa"><head><style>body{margin:20px;background:#f5f9fb;font:13px Tahoma;color:#242540}.group-tabs{display:flex;gap:8px;padding:12px 0}.group-tab{padding:9px 14px;border:1px solid #dce8ec;border-radius:10px;background:white;color:#4d49ff;display:flex;align-items:center;gap:8px}.group-tab.active{background:#4d49ff;color:white}.admin-toolbar{display:flex;align-items:center;background:white;padding:12px;border:1px solid #dce8ec;border-radius:12px}.admin-toolbar input{padding:10px;border:1px solid #dce8ec;border-radius:8px}.board-wrap{overflow:auto;background:white;border:1px solid #dce8ec;border-radius:12px}.admin-table{width:100%;border-collapse:collapse;text-align:right}.admin-table th{background:#eaf8f6;color:#3531b8;padding:14px}.admin-table td{padding:12px;border-bottom:1px solid #e9edf2}.admin-empty{text-align:center;padding:40px!important}#page-title{background:white;border:1px solid #dce8ec;border-radius:10px;padding:16px;font-size:18px}</style></head><body><h1 id="page-title"></h1><div class="breadcrumb"></div><main id="admin-content"></main></body></html>'}));
    await page.goto('https://admin-fixture.test/');
    await page.addScriptTag({path:path.join(__dirname,'admin-customers.js')});
    await page.addScriptTag({path:path.join(__dirname,'admin-leads.js')});
    await page.evaluate(()=>window.parameterAdminLeads(document,()=>window.parameterAdminCustomers(document,0)));
    assert.deepEqual(await page.locator('[data-stage]').allTextContents(),['سرنخ‌ها','فرصت‌ها']);
    assert.deepEqual(await page.locator('[data-period]').allTextContents(),['همه','ماه جاری','هفته جاری','امروز']);
    assert.equal(await page.locator('[data-category]').count(),0);
    await page.locator('[data-category-filter]').selectOption('companies');
    const count=()=>page.locator('tbody tr[data-row]').count();
    assert.equal(await page.locator('[data-action=more]').count(),0);
    assert.equal(await page.locator('[data-action=swap]').first().innerText(),'');
    assert.equal(await page.locator('[data-action=swap]').first().getAttribute('title'),'تبدیل به مشتری');
    await page.locator('[data-action=swap]').first().click();assert.match(await page.locator('dialog').innerText(),/اضافه شود/);await page.locator('dialog [data-close]').click();
    await page.locator('[data-action=related]').first().click();
    assert.deepEqual(await page.locator('[data-related-tab]').allTextContents(),['اطلاعات کلی','اقدامات','اشخاص مرتبط','درخواست‌های مشتری','موانع و مشکلات']);
    for(const name of ['organization','nationalId','companyType','creator','created','industry','activityType','province','city','source','product','userCount','rialValue','owner','status','relationshipStage','progress','notes'])assert(await page.locator('[data-general-form] [name='+name+']').count(),name);
    assert.equal(await page.locator('[name=notes]').getAttribute('maxlength'),'2000');
    await page.locator('[name=userCount]').fill('25');await page.locator('[name=rialValue]').fill('0');await page.locator('[name=notes]').fill('یادداشت تست');await page.locator('[data-general-form] button[type=submit]').click();
    assert.match(await page.locator('[data-general-message]').innerText(),/موفقیت/);
    await page.screenshot({path:path.join(root,'..','output','admin-lead-general-preview.png'),fullPage:true});
    for(const tab of [1,2,3,4]){await page.locator('[data-related-tab="'+tab+'"]').click();assert.equal(await page.locator('tbody tr').count(),2);assert.equal(await page.locator('.lg-sample').count(),2);}
    await page.locator('[data-related-tab="1"]').click();await page.locator('[data-related-create]').click();await page.locator('dialog [name=title]').fill('اقدام آزمایشی');await page.locator('dialog button[type=submit]').click();assert.match(await page.locator('tbody').innerText(),/اقدام آزمایشی/);
    await page.locator('[data-related-back]').click();await page.locator('[data-action=related]').nth(1).click();await page.locator('[data-related-tab="1"]').click();assert(!((await page.locator('tbody').innerText()).includes('اقدام آزمایشی')));
    await page.locator('[data-related-back]').click();await page.locator('[data-action=related]').first().click();await page.locator('[data-related-tab="1"]').click();assert.match(await page.locator('tbody').innerText(),/اقدام آزمایشی/);await page.locator('[data-related-back]').click();
    assert.equal(await count(),4);
    const companyHeaders=['','نوع','ردیف','نام شرکت','نوع فعالیت','حوزه فعالیت','استان','شهر','نحوه آشنایی','مسئول پیگیری','محصول','تعداد کاربر','اقدام بعدی','تاریخ پیگیری','وضعیت','عملیات'];
    assert.deepEqual(await page.locator('thead th').allTextContents(),companyHeaders);
    assert.equal(await page.locator('tbody tr').first().locator('td').count(),companyHeaders.length);
    await page.locator('[data-action=edit]').first().click();
    for(const [key,value] of Object.entries({activityType:'کارفرما',industry:'آب و فاضلاب',province:'تهران',city:'تهران',userCount:'25',rialValue:'0'})) await page.locator('[name='+key+']').fill(value);
    await page.locator('dialog button[type=submit]').click();
    const companyCells=await page.locator('tbody tr').first().locator('td').allTextContents();
    assert.equal(companyCells[4],'کارفرما');assert.equal(companyCells[5],'آب و فاضلاب');assert.equal(companyCells[11],'۲۵');
    await page.locator('[data-action=view]').first().click();assert.match(await page.locator('dialog').innerText(),/تعداد کاربر/);await page.locator('dialog [data-close]').click();
    assert.deepEqual(await page.locator('[data-category-filter] option').allTextContents(),['همه انواع','شرکت‌ها','اشخاص','اعضای سایت','کاربران رایگان']);
    assert.equal(await page.getByRole('searchbox').count(),0);
    assert.equal(await page.locator('[data-customers],[data-import],[data-export],[data-free]').count(),0);
    assert.equal(await page.locator('.leads-kpi').count(),4);
    await page.locator('[data-category-filter]').selectOption('free');assert.equal(await count(),3);
    assert((await page.locator('thead th').allTextContents()).includes('امتیاز'));
    await page.locator('[data-category-filter]').selectOption('people');assert.equal(await count(),0);
    await page.locator('[data-create]').click();
    await page.locator('[name=organization]').fill('شخص آزمایشی');
    await page.locator('[name=lastName]').fill('نام خانوادگی نمونه');
    await page.locator('[name=nationalCode]').fill('0000000000');
    await page.locator('[name=phone]').fill('09000000000');
    await page.locator('dialog button[type=submit]').click();assert.equal(await count(),1);
    assert.deepEqual(await page.locator('thead th').allTextContents(),['','نوع','ردیف','نام','نام خانوادگی','کد ملی','موبایل','حوزه فعالیت','استان','شهر','نحوه آشنایی','مسئول پیگیری','محصول','تعداد کاربر','اقدام بعدی','تاریخ پیگیری','وضعیت','عملیات']);
    const personCells=await page.locator('tbody tr').first().locator('td').allTextContents();assert.equal(personCells[4],'نام خانوادگی نمونه');assert.equal(personCells[5],'0000000000');assert.equal(personCells[6],'09000000000');
    await page.locator('[data-category-filter]').selectOption('members');assert.equal(await count(),0);
    await page.locator('[data-create]').click();
    await page.locator('[name=organization]').fill('عضو آزمایشی');
    await page.locator('dialog button[type=submit]').click();assert.equal(await count(),1);
    await page.locator('[data-category-filter]').selectOption('companies');assert.equal(await count(),4);
    assert.deepEqual(await page.locator('thead th').allTextContents(),companyHeaders);
    await page.locator('[data-category-filter]').selectOption('free');assert.equal(await count(),3);
    await page.locator('[data-create]').click();
    await page.locator('[name=organization]').fill('رایگان آزمایشی');
    await page.locator('dialog button[type=submit]').click();assert.equal(await count(),4);
    const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('parameter.admin.leads.v1')));
    assert.equal(stored[0].accountType,'free');
    await page.evaluate(()=>window.parameterAdminLeads(document));
    assert.equal(await count(),7);
    assert(await page.evaluate(()=>{const k=document.querySelector('.leads-kpis').getBoundingClientRect(),t=document.querySelector('.leads-tabs').getBoundingClientRect(),b=document.querySelector('[data-create]').getBoundingClientRect(),bar=document.querySelector('.leads-toolbar').getBoundingClientRect();return t.bottom<=k.top && b.left<bar.left+30;}));
    await page.screenshot({path:path.join(root,'..','output','admin-leads-preview.png'),fullPage:true});
    await page.setViewportSize({width:760,height:900});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.deepEqual(errors,[]);
    await page.locator('[data-stage=opportunities]').click();assert.equal(await count(),0);
    await page.locator('[data-create]').click();await page.locator('[name=organization]').fill('فرصت آزمایشی');await page.locator('dialog button[type=submit]').click();assert.equal(await count(),1);
    for(const period of ['month','week','today']){await page.locator('[data-period='+period+']').click();assert.equal(await count(),1);}
    await page.evaluate(()=>{const key='parameter.admin.leads.v1',data=JSON.parse(localStorage.getItem(key));data[0].created='2020-01-01';localStorage.setItem(key,JSON.stringify(data));window.parameterAdminLeads(document);});
    await page.locator('[data-stage=opportunities]').click();assert.equal(await count(),1);
    for(const period of ['month','week','today']){await page.locator('[data-period='+period+']').click();assert.equal(await count(),0);}
    await page.locator('[data-period=all]').click();assert.equal(await count(),1);
    console.log('PASS: stage tabs, type column and filter, date filters, creation, persistence, related forms, responsive layout and inline sync.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
