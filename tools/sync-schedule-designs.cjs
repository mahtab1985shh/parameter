const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..'),file=path.join(root,'parameter-v34-login-sharp.html');
let html=fs.readFileSync(file,'utf8'),m=html.match(/var binary=atob\("([^"]+)"\)/),payload=Buffer.from(m[1],'base64').toString('utf8');
const js=fs.readFileSync(path.join(__dirname,'schedule-designs.js'),'utf8'),css=fs.readFileSync(path.join(__dirname,'schedule-designs.css'),'utf8');new vm.Script(js);
const enc=s=>JSON.stringify(s).slice(1,-1);
for(const [start,end,source,anchor] of [['/* SCHEDULE DESIGNS JS START */','/* SCHEDULE DESIGNS JS END */',js,'function userUtilityAction(type){'],['/* SCHEDULE DESIGNS CSS START */','/* SCHEDULE DESIGNS CSS END */',css,'.parameter-date-overlay{']]){
 const replacement=enc(start+'\n'+source+'\n'+end+'\n');
 const i=payload.indexOf(start),j=payload.indexOf(end,i);
 if(i>=0){if(j<0)throw Error('Missing end marker');payload=payload.slice(0,i)+replacement+payload.slice(j+end.length+2)}
 else{if(payload.split(anchor).length!==2)throw Error('Ambiguous insertion point');payload=payload.replace(anchor,()=>replacement+anchor)}
}
html=html.replace(m[1],Buffer.from(payload).toString('base64'));fs.writeFileSync(file,html);
const template=JSON.parse(payload.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/)[1]);
const styles=[...template.matchAll(/<style[^>]*>[\s\S]*?<\/style>/g)].map(x=>x[0]).join('\n');
const outerStyles=[...html.matchAll(/<style[^>]*>[\s\S]*?<\/style>/g)].filter(x=>!x[0].includes('.login-')).map(x=>x[0]).join('\n');
fs.writeFileSync(path.join(root,'schedule-designs-preview.html'),'<!doctype html><html lang="fa" dir="rtl" data-theme="light"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>پارامتر | سه طرح زمان‌بندی</title>'+styles+outerStyles+'<link rel="stylesheet" href="tools/schedule-designs.css"><style>body{display:block!important;background:#f5f7fb!important;margin:0!important;font-family:Vazirmatn,Tahoma,sans-serif}#app-shell{display:block!important;max-width:1920px;margin:auto;padding:14px}.sg-shell{height:auto;min-height:92vh}</style><body><main id="app-shell"><div id="se-panel-schedule"></div></main><script src="tools/schedule-designs.js"></script><script>document.getElementById("se-panel-schedule").innerHTML=buildScheduleGrid()</script></body></html>');
console.log('Schedule designs integrated; preview generated');
