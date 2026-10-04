const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1050}});
 await page.goto('file:///'+path.resolve(__dirname,'../schedule-designs-preview.html').replaceAll('\\','/'));
 assert.equal(await page.locator('.sg-grid-row').count(),8);
 await page.locator('#sg-critical').check();assert.equal(await page.locator('.sg-grid-row').count(),6);
 await page.locator('#sg-search').fill('آرماتور');assert.equal(await page.locator('.sg-grid-row').count(),1);
 await page.locator('#sg-search').fill('ناموجود');assert.equal(await page.locator('.sg-empty').count(),1);
 await page.locator('#sg-search').fill('');await page.locator('#sg-critical').uncheck();
 await page.locator('[data-sg-tab=roadmap]').click();assert.equal(await page.locator('.sg-task-card').count(),8);
 await page.screenshot({path:path.resolve(__dirname,'../../tmp/schedule-roadmap.png'),fullPage:true});
 await page.locator('.sg-task-card .sg-detail').first().click();assert(await page.locator('#sg-dialog').isVisible());await page.keyboard.press('Escape');assert.equal(await page.locator('#sg-dialog').count(),0);
 await page.locator('[data-sg-tab=control]').click();assert.equal(await page.locator('.sg-compare-row').count(),8);assert.equal(await page.locator('.sg-insights article').count(),3);
 await page.screenshot({path:path.resolve(__dirname,'../../tmp/schedule-control.png'),fullPage:true});
 await page.locator('[data-sg-tab=control]').press('Home');assert.equal(await page.locator('[data-sg-tab=table]').getAttribute('aria-selected'),'true');
 await page.locator('#sg-zoom').click();assert.equal(await page.locator('.sg-grid').evaluate(el=>el.style.minWidth),'1450px');
 await page.setViewportSize({width:390,height:844});
 for(const mode of ['table','roadmap','control']){await page.locator('[data-sg-tab='+mode+']').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile overflow: '+mode)}
 await page.setViewportSize({width:1440,height:1050});
 await page.goto('file:///'+path.resolve(__dirname,'../parameter-v34-login-sharp.html').replaceAll('\\','/'));
 await page.evaluate(()=>openMainProject());
 let frame;for(let i=0;i<40;i++){frame=page.frames().find(f=>f.url()==='about:srcdoc');if(frame&&await frame.evaluate(()=>typeof openScheduleEditor==='function'))break;await page.waitForTimeout(200)}
 await frame.evaluate(()=>{openScheduleEditor(CONTRACTS[0].id,'SC-1403-001');setScheduleTab('schedule',document.querySelector('[data-se-tab=schedule]'))});
 assert.equal(await frame.locator('.sg-grid-row').count(),8);assert(await frame.locator('.sg-shell').isVisible());
 await page.setViewportSize({width:1440,height:1050});await page.screenshot({path:path.resolve(__dirname,'../../tmp/schedule-integrated.png'),fullPage:true});
 await frame.locator('[data-sg-tab=roadmap]').click();assert.equal(await frame.locator('.sg-task-card').count(),8);
 console.log('PASS: three designs, filters, empty state, details/Escape, keyboard tabs, zoom, mobile widths, real application schedule integration');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
