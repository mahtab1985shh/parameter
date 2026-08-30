const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const file=path.join(__dirname,'..','parameter-v34-login-sharp.html');let html=fs.readFileSync(file,'utf8');const m=html.match(/var binary=atob\("([^"]+)"\)/);let p=Buffer.from(m[1],'base64').toString('utf8');
const code=fs.readFileSync(path.join(__dirname,'portfolio-fields.js'),'utf8'),css=fs.readFileSync(path.join(__dirname,'portfolio-fields.css'),'utf8');new vm.Script(code);const enc=s=>JSON.stringify(s).slice(1,-1);
function change(a,b){a=enc(a);if(p.split(a).length!==2)throw Error('Source mismatch: '+a.slice(0,100));p=p.replace(a,()=>enc(b))}
change('function buildPlanCreateBody(level){',code+'\nfunction buildPlanCreateBody(level){');
change("pcField('totalCurr',false,pcMoney());","pcField('totalCurr',false,pcMoney())+pcPortfolioExtras();");
change('host.innerHTML = buildPlanCreateBody(planCreateLevel);','host.innerHTML = buildPlanCreateBody(planCreateLevel);\n  if(planCreateLevel===\'portfolio\')setupPortfolioExtras(host);');
const marker=p.indexOf('.parameter-date-overlay{');if(marker<0)throw Error('Style insertion missing');p=p.slice(0,marker)+enc(css)+'\\n'+p.slice(marker);
html=html.replace(m[1],Buffer.from(p).toString('base64'));fs.writeFileSync(file,html);console.log('Portfolio time range and multi-select added');
