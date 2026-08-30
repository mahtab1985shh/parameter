const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'..','parameter-v34-login-sharp.html'),'utf8');
const project=Buffer.from(html.match(/var binary=atob\("([^"]+)"\)/)[1],'base64').toString('utf8');
const start=project.indexOf('<script id=\\"parameter-create-form-restore-script\\">');
const end=project.indexOf('<\\u002Fscript>',start);
const script=JSON.parse('"'+project.slice(project.indexOf('>',start)+1,end)+'"');
const dom=new JSDOM('<!doctype html><html><body><div><input id="a"></div><div><input id="b"></div></body></html>',{runScripts:'outside-only'});
const w=dom.window;w.HTMLElement.prototype.scrollIntoView=function(){};w.eval(script);
const doc=w.document,a=doc.getElementById('a'),b=doc.getElementById('b');
function open(value){w.closeParameterDatePicker();a.value=value;w.openParameterDatePicker(a)}
function choose(kind,value){doc.querySelector('[data-date-choice="'+kind+'"]').click();const list=doc.querySelector('.parameter-date-choice-list:not([hidden])');assert.ok(list);const option=list.querySelector('[data-date-value="'+value+'"]');assert.ok(option);option.click();assert.equal(doc.querySelector('[data-date-choice="'+kind+'"]').getAttribute('aria-expanded'),'false')}
function days(){return doc.querySelectorAll('.parameter-date-day').length}
open('۱۴۰۳/۱۲/۳۰');assert.equal(days(),30);choose('year',1404);assert.equal(days(),29);assert.equal(doc.querySelector('.parameter-date-day.selected').dataset.day,'29');
choose('month',1);assert.equal(days(),31);choose('month',7);assert.equal(days(),30);
let inputEvents=0,changeEvents=0;a.addEventListener('input',()=>inputEvents++);a.addEventListener('change',()=>changeEvents++);
doc.querySelector('.parameter-date-day[data-day="15"]').click();assert.equal(a.value,'۱۴۰۴/۰۷/۱۵');assert.equal(inputEvents,1);assert.equal(changeEvents,1);assert.equal(a.getAttribute('aria-expanded'),'false');
w.openParameterDatePicker(a);assert.equal(doc.querySelector('[data-date-choice="month"]').textContent.includes('مهر'),true);
choose('year',1380);assert.equal(doc.querySelector('[data-date-choice="year"]').textContent.includes('۱۳۸۰'),true);
doc.querySelector('[data-date-choice="month"]').click();doc.activeElement.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(doc.querySelectorAll('.parameter-date-choice-list:not([hidden])').length,0);assert.equal(a.getAttribute('aria-expanded'),'true');
doc.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(a.getAttribute('aria-expanded'),'false');
b.value='۱۴۰۲/۰۲/۰۹';w.openParameterDatePicker(b);assert.equal(doc.querySelector('[data-date-choice="year"]').textContent.includes('۱۴۰۲'),true);assert.equal(doc.querySelector('.parameter-date-day.selected').dataset.day,'9');
doc.body.dispatchEvent(new w.Event('pointerdown',{bubbles:true}));assert.equal(b.getAttribute('aria-expanded'),'false');
open('۱۴۰۴/۰۱/۰۱');assert.equal(doc.querySelector('.parameter-date-days').querySelectorAll('span').length,6);
// A standalone fixture executes the exact extracted production script, not a substitute implementation.
if(process.argv[2]){
 const marker=project.indexOf('.parameter-date-overlay{');const cssEnd=project.indexOf('@media(max-width:700px)',marker);
 const css=JSON.parse('"'+project.slice(marker,cssEnd)+'"');
 fs.writeFileSync(process.argv[2],'<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>body{font-family:Tahoma;padding:40px}input{padding:12px;border:1px solid #ccd;border-radius:6px}'+css+'</style><label>تاریخ شروع <input aria-label="تاریخ شروع" value="۱۴۰۳/۱۲/۳۰" onclick="openParameterDatePicker(this)"></label><script>'+script+'</script></html>');
}
console.log('PASS: year/month dropdowns, 31/30/29 days, leap Esfand, weekday offset, clamping, selection events, reopen, independent fields, keyboard and outside dismissal.');
