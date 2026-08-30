const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const file=path.join(__dirname,'..','parameter-v34-login-sharp.html');let html=fs.readFileSync(file,'utf8');const match=html.match(/var binary=atob\("([^"]+)"\)/);let project=Buffer.from(match[1],'base64').toString('utf8');
const code=fs.readFileSync(path.join(__dirname,'portfolio-fields.js'),'utf8'),css=fs.readFileSync(path.join(__dirname,'portfolio-fields.css'),'utf8');new vm.Script(code);const enc=s=>JSON.stringify(s).slice(1,-1);
const start=project.indexOf('// Extra controls for the portfolio creation form only.'),end=project.indexOf('function buildPlanCreateBody(level){',start);if(start<0||end<0)throw Error('Portfolio code missing');project=project.slice(0,start)+enc(code+'\n')+project.slice(end);
const cs=project.indexOf('#view-plan-create .pf-extra{'),ce=project.indexOf('.parameter-date-overlay{',cs);if(cs<0||ce<0)throw Error('Portfolio styles missing');project=project.slice(0,cs)+enc(css+'\n')+project.slice(ce);
html=html.replace(match[1],Buffer.from(project).toString('base64'));fs.writeFileSync(file,html);console.log('Synced time restrictions, direction and portaled dropdown');
