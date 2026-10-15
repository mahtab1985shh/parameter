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
    const count=()=>page.locator('tbody tr[data-row]').count();
    assert.equal(await count(),4);
    const companyHeaders=['','ردیف','نام شرکت','نوع فعالیت','حوزه فعالیت','استان','شهر','نحوه آشنایی','مسئول پیگیری','محصول','تعداد کاربر','ارزش ریالی','اقدام بعدی','تاریخ پیگیری','وضعیت','عملیات'];
    assert.deepEqual(await page.locator('thead th').allTextContents(),companyHeaders);
    assert.equal(await page.locator('tbody tr').first().locator('td').count(),companyHeaders.length);
    await page.locator('[data-action=edit]').first().click();
    for(const [key,value] of Object.entries({activityType:'کارفرما',industry:'آب و فاضلاب',province:'تهران',city:'تهران',userCount:'25',rialValue:'0'})) await page.locator('[name='+key+']').fill(value);
    await page.locator('dialog button[type=submit]').click();
    const companyCells=await page.locator('tbody tr').first().locator('td').allTextContents();
    assert.equal(companyCells[3],'کارفرما');assert.equal(companyCells[4],'آب و فاضلاب');assert.equal(companyCells[10],'۲۵');assert.equal(companyCells[11],'۰');
    await page.locator('[data-action=view]').first().click();assert.match(await page.locator('dialog').innerText(),/تعداد کاربر/);await page.locator('dialog [data-close]').click();
    assert.deepEqual(await page.locator('[data-category]').allTextContents(),['شرکت‌ها','اشخاص','اعضای سایت','کاربران رایگان']);
    assert.equal(await page.getByRole('searchbox').count(),0);
    assert.equal(await page.locator('[data-customers],[data-import],[data-export],[data-free]').count(),0);
    assert.equal(await page.locator('.leads-kpi').count(),4);
    await page.locator('[data-category=free]').click();assert.equal(await count(),3);
    assert((await page.locator('thead th').allTextContents()).includes('امتیاز'));
    await page.locator('[data-category=people]').click();assert.equal(await count(),0);
    await page.locator('[data-create]').click();
    await page.locator('[name=organization]').fill('شخص آزمایشی');
    await page.locator('dialog button[type=submit]').click();assert.equal(await count(),1);
    await page.locator('[data-category=members]').click();assert.equal(await count(),0);
    await page.locator('[data-create]').click();
    await page.locator('[name=organization]').fill('عضو آزمایشی');
    await page.locator('dialog button[type=submit]').click();assert.equal(await count(),1);
    await page.locator('[data-category=companies]').click();assert.equal(await count(),4);
    assert.deepEqual(await page.locator('thead th').allTextContents(),companyHeaders);
    await page.locator('[data-category=free]').click();assert.equal(await count(),3);
    await page.locator('[data-create]').click();
    await page.locator('[name=organization]').fill('رایگان آزمایشی');
    await page.locator('dialog button[type=submit]').click();assert.equal(await count(),4);
    const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('parameter.admin.leads.v1')));
    assert.equal(stored[0].accountType,'free');
    await page.evaluate(()=>window.parameterAdminLeads(document));
    assert.equal(await count(),4);
    assert(await page.evaluate(()=>{const k=document.querySelector('.leads-kpis').getBoundingClientRect(),t=document.querySelector('.leads-tabs').getBoundingClientRect(),b=document.querySelector('[data-create]').getBoundingClientRect(),bar=document.querySelector('.leads-toolbar').getBoundingClientRect();return t.top>=k.bottom && b.left<bar.left+30;}));
    await page.screenshot({path:path.join(root,'..','output','admin-leads-preview.png'),fullPage:true});
    await page.setViewportSize({width:760,height:900});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.deepEqual(errors,[]);
    console.log('PASS: four category tabs below KPIs, independent filters and creation, persistence, removed search/old tabs/import/export, left-aligned create, responsive layout, inline sync and clean browser console.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
