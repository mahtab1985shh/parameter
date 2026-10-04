const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1820,height:1120}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file:///'+path.resolve(__dirname,'../schedule-designs-preview.html').replaceAll('\\','/'));
 for(const mode of ['classic','outline','focus']){
 await page.locator('[data-sg-tab='+mode+']').click();
 assert.equal(await page.locator('.sg-meta-row').count(),20);assert.equal(await page.locator('.sg-bar.parent').count(),5);assert.equal(await page.locator('.sg-bar.milestone').count(),5);assert.equal(await page.locator('.sg-link').count(),16);
 await page.locator('.sg-meta-row [data-select="11"]').click();assert.equal(await page.locator('.sg-link.is-active').count(),3);assert.equal(await page.locator('.sg-relations button').count(),3);
 await page.screenshot({path:path.resolve(__dirname,'../../tmp/schedule-'+mode+'-v2.png'),fullPage:true});
 await page.locator('[data-clear]').click();
 }
 await page.locator('[data-expand=close]').click();assert.equal(await page.locator('.sg-meta-row').count(),1);assert.equal(await page.locator('.sg-link').count(),0);
 await page.locator('[data-expand=open]').click();assert.equal(await page.locator('.sg-meta-row').count(),20);
 await page.locator('[data-fold="8"]').click();assert.equal(await page.locator('.sg-meta-row').count(),14);assert.equal(await page.locator('.sg-bar[data-select="11"]').count(),0);
 await page.locator('#sg-search').fill('آرماتور');assert.equal(await page.locator('.sg-meta-row.child').count(),2);assert.equal(await page.locator('.sg-meta-row.parent').count(),5);
 await page.locator('#sg-search').fill('ناموجود');assert.equal(await page.locator('.sg-meta-row').count(),0);
 await page.locator('#sg-search').fill('');await page.locator('[data-expand=open]').click();
 await page.locator('#sg-critical').check();assert.equal(await page.locator('.sg-meta-row').count(),14);await page.locator('#sg-critical').uncheck();
 await page.locator('#sg-links-toggle').uncheck();assert.equal(await page.locator('.sg-link').count(),0);await page.locator('#sg-links-toggle').check();assert.equal(await page.locator('.sg-link').count(),16);
 await page.locator('#sg-zoom').click();assert.equal(await page.locator('.sg-board').evaluate(el=>el.style.getPropertyValue('--timeline-w')),'1560px');
 await page.locator('[data-sg-tab=focus]').press('Home');assert.equal(await page.locator('[data-sg-tab=classic]').getAttribute('aria-selected'),'true');
 await page.setViewportSize({width:390,height:844});
 for(const mode of ['classic','outline','focus']){await page.locator('[data-sg-tab='+mode+']').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile overflow '+mode)}
 assert.deepEqual(errors,[]);
 await page.setViewportSize({width:1820,height:1120});
 await page.goto('file:///'+path.resolve(__dirname,'../parameter-v34-login-sharp.html').replaceAll('\\','/'));
 await page.evaluate(()=>openMainProject());
 let frame;for(let i=0;i<40;i++){frame=page.frames().find(f=>f.url()==='about:srcdoc');if(frame&&await frame.evaluate(()=>typeof openScheduleEditor==='function'))break;await page.waitForTimeout(200)}
 await frame.evaluate(()=>{openScheduleEditor(CONTRACTS[0].id,'SC-1403-001');setScheduleTab('schedule',document.querySelector('[data-se-tab=schedule]'))});
 assert.equal(await frame.locator('.sg-meta-row').count(),20);assert(await frame.locator('.sg-shell').isVisible());
 assert.equal(await frame.locator('[data-sg-tab]').count(),1);assert.equal(await frame.locator('.sg-link').count(),16);
 await frame.evaluate(()=>{openContractDocuments(CONTRACTS[0].id);openContractDocumentForm('schedule','SC-1403-001',true)});assert(await frame.locator('.sg-shell').isVisible());
 await frame.evaluate(()=>closeScheduleEditor());assert(await frame.locator('#cv-body').isVisible());
 await page.screenshot({path:path.resolve(__dirname,'../../tmp/schedule-integrated-v2.png'),fullPage:true});
 console.log('PASS: three Gantt views, 5 parents/5 milestones/10 children, 16 dependency arrows, selection, hierarchy collapse, search retaining ancestors, critical filter, link toggle, zoom, keyboard, mobile, app integration');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
