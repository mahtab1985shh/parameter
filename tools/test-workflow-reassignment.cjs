const fs=require('fs'),vm=require('vm'),assert=require('assert');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync('parameter-v34-login-sharp.html','utf8');
const packed=Buffer.from(html.match(/var binary=atob\("([^"]+)"\)/)[1],'base64').toString('utf8');
const template=JSON.parse(packed.match(/<script[^>]*type="__bundler\/template"[^>]*>([\s\S]*?)<\/script>/)[1]);
assert(!template.includes("['changeUser','تغییر کاربر','Change user']"));
assert(template.includes('window.parameterWorkflowStages='));
let count=0;for(const m of template.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){if(m[1].trim()){new vm.Script(m[1]);count++}}
const stages=[{name:'ثبت و ارسال',user:'مهتاب شجاعی',role:'تهیه‌کننده سند',tags:['ایجاد','ارسال'],color:'#2f86ff'},{name:'کنترل اولیه',user:'حمید احمدی',role:'کارشناس',tags:['مشاهده'],color:'#8b5cf6'}];
const row=(status,title)=>'<tr><td>'+title+'</td><td>صورت وضعیت</td><td><div class="workflow-agent"><b>مهتاب شجاعی</b></div></td><td class="workflow-version">۱.۰</td><td><span class="status-chip '+status+'"></span></td><td><div class="doc-actions"><button title="ویرایش">ویرایش</button></div></td></tr>';
function boot(saved){const dom=new JSDOM('<body><div id="view-plan-docs"><div class="parameter-workflow-pane"><table><tbody>'+row('approved','گردش الف')+row('draft','گردش ب')+'</tbody></table></div></div></body>',{url:'https://parameter.test',runScripts:'outside-only'}),w=dom.window;
 w.requestAnimationFrame=()=>1;w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};w.planDocsCtx={id:'p1',level:'plan'};w.parameterWorkflowStages={snapshot:()=>JSON.parse(JSON.stringify(stages)),use:s=>w.liveStages=s};w.__parameterDefaultUserData={'contract-users:contractor':[['علی رضایی','u1','پیمانکار','مدیر','فعال'],['کاربر غیرفعال','u3','پیمانکار','مدیر','غیرفعال']],'contract-users:studies':[['حمید احمدی','u2','مطالعات','کارشناس','فعال']],'plan-users:internal':[['کاربر طرح','u4','طرح','مدیر','فعال']]};w.showToast=()=>{};if(saved)w.localStorage.setItem('parameter.workflow-reassignments.v1',saved);w.eval(fs.readFileSync('tools/workflow-reassignment.js','utf8'));return dom}
let dom=boot(),w=dom.window,d=w.document;
assert(d.querySelectorAll('.wr-trigger')[1].disabled);d.querySelectorAll('.wr-trigger')[1].click();assert(!d.querySelector('dialog'));
d.querySelector('.wr-trigger').click();assert.equal(d.querySelectorAll('.wr-stage').length,2);assert(d.querySelector('.wr-save').disabled);
d.querySelector('[data-stage="0"]').click();assert.equal(d.querySelectorAll('input[name="wr-user"]').length,2);
function pick(id){let input=d.querySelector('[value="'+id+'"]');input.click();assert(!d.querySelector('.wr-save').disabled);d.querySelector('.wr-save').click()}
pick('u1');assert.equal(w.liveStages[0].user,'علی رضایی');assert.equal(d.querySelector('.workflow-agent b').textContent,'علی رضایی');assert.equal(d.querySelectorAll('.wr-history tbody tr').length,1);
pick('u2');assert.equal(d.querySelectorAll('.wr-history tbody tr').length,2);let history=JSON.parse(w.localStorage.getItem('parameter.workflow-reassignments.v1'));let r=Object.values(history)[0];assert.equal(r.history[0].previous,'مهتاب شجاعی');assert.equal(r.history[1].previous,'علی رضایی');assert.equal(r.history[1].replacement,'حمید احمدی');assert(!isNaN(Date.parse(r.history[1].at)));assert.equal(r.stages[1].user,'حمید احمدی');
d.querySelector('dialog [data-close]').click();d.querySelector('.wr-trigger').click();assert.equal(d.querySelectorAll('.wr-history tbody tr').length,2);
let saved=w.localStorage.getItem('parameter.workflow-reassignments.v1');dom.window.close();dom=boot(saved);w=dom.window;d=w.document;d.querySelector('.wr-trigger').click();assert.equal(d.querySelectorAll('.wr-history tbody tr').length,2);
d.querySelector('[data-stage="0"]').click();assert(d.querySelector('[value="u2"]').disabled);d.querySelector('[value="u1"]').click();d.querySelector('.status-chip').className='status-chip draft';d.querySelector('.wr-save').click();assert.equal(w.localStorage.getItem('parameter.workflow-reassignments.v1'),saved);assert(!d.querySelector('dialog'));
dom.window.close();console.log('PASS: '+count+' embedded scripts parse; draft guard, contract-only active users, single selection, repeated replacements, stage isolation, persistence, stale-status guard.');
