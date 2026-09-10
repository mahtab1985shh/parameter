const fs=require('fs'),path=require('path'),vm=require('vm');
const dir=__dirname,file=path.join(dir,'../parameter-v34-login-sharp.html');
const source=path.join(dir,'reference-dashboards-source.html');
if(!fs.existsSync(source))fs.copyFileSync('C:/Users/HP/Downloads/dashboard-project_3.html',source);
let doc=fs.readFileSync(source,'utf8');
doc=require('./migrate-reference-highcharts.cjs')(doc);
doc=doc.replace('</head>',`<style>
:root{color-scheme:light;--radius-lg:8px;--radius-md:6px;--brand:#0073ea;--brand-soft:#e5f1ff}
body{background:var(--surface);font-family:Vazirmatn,Tahoma,sans-serif}.tabbar,.brand{display:none!important}.topbar{position:relative;box-shadow:none;background:var(--surface);border-radius:0}.topbar__inner{padding:8px 12px}.main{padding:12px!important;max-width:none}.card,.pd-card{box-shadow:none;border-radius:8px}.page-foot{font-size:11px}.detail-view{z-index:1000}
</style></head>`);
doc=doc.replace('init();\n','init();\n/* INITIAL_REFERENCE_TAB */\n');
fs.writeFileSync(path.join(dir,'../project-dashboard-preview.html'),doc.replace('/* INITIAL_REFERENCE_TAB */',"setTab('project');"));
const adapter=fs.readFileSync(path.join(dir,'reference-dashboards.js'),'utf8');new vm.Script(adapter);
const js='/* REFERENCE DASHBOARDS START */\nwindow.PARAMETER_REFERENCE_DOCUMENT='+JSON.stringify(doc).replace(/<\//g,'<\\/')+';\n'+adapter+'\n/* REFERENCE DASHBOARDS END */\n';
const css='/* REFERENCE DASHBOARD CSS START */\n.main-wrap:has(#view-dashboard[style*="block"])>.page-head{display:none!important}#view-dashboard.reference-dashboard-active{height:auto!important;overflow:visible!important;min-width:0}.reference-dashboard-frame{width:100%;height:calc(100dvh - 160px);min-height:650px;border:0;display:block;background:var(--surface)}.reference-dashboard-active .dash-mode-switch{flex-wrap:wrap}.reference-dashboard-active .dashboard-modebar{height:auto!important}@media(max-width:700px){.reference-dashboard-frame{height:calc(100dvh - 150px);min-height:580px}}\n/* REFERENCE DASHBOARD CSS END */\n';
let h=fs.readFileSync(file,'utf8'),match=h.match(/var binary=atob\("([^"]+)"\)/),p=Buffer.from(match[1],'base64').toString('utf8');
const enc=s=>JSON.stringify(s).slice(1,-1);
if(!p.includes('function userUtilityAction(type){'))throw Error('Missing insertion point');
if(p.includes('/* REFERENCE DASHBOARDS START */')){const a=p.indexOf('/* REFERENCE DASHBOARDS START */'),b=p.indexOf('/* REFERENCE DASHBOARDS END */',a)+'/* REFERENCE DASHBOARDS END */'.length;p=p.slice(0,a)+enc(js.trimEnd())+p.slice(b)}else p=p.replace('function userUtilityAction(type){',()=>enc(js)+'function userUtilityAction(type){');
if(p.includes('/* REFERENCE DASHBOARD CSS START */')){const a=p.indexOf('/* REFERENCE DASHBOARD CSS START */'),b=p.indexOf('/* REFERENCE DASHBOARD CSS END */',a)+'/* REFERENCE DASHBOARD CSS END */'.length;p=p.slice(0,a)+enc(css.trimEnd())+p.slice(b)}else p=p.replace('.parameter-date-overlay{',()=>enc(css)+'.parameter-date-overlay{');
fs.writeFileSync(file,h.replace(match[1],Buffer.from(p).toString('base64')));
console.log('Synced reference dashboard tabs with bundled Highcharts.');
