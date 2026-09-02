const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const file=path.join(__dirname,'..','parameter-v34-login-sharp.html');let h=fs.readFileSync(file,'utf8');
const m=h.match(/var binary=atob\("([^"]+)"\)/);if(!m)throw Error('Bundle payload missing');
let p=Buffer.from(m[1],'base64').toString('utf8');const js=fs.readFileSync(path.join(__dirname,'contract-workspace.js'),'utf8'),css=fs.readFileSync(path.join(__dirname,'contract-workspace.css'),'utf8');new vm.Script(js);
const enc=s=>JSON.stringify(s).slice(1,-1),marker='function userUtilityAction(type){';if(p.split(marker).length!==2)throw Error('Script insertion marker ambiguous');
p=p.replace(marker,()=>enc(js+'\n')+marker);
const cssMarker='.parameter-date-overlay{';const ci=p.indexOf(cssMarker);if(ci<0)throw Error('CSS insertion marker missing');p=p.slice(0,ci)+enc(css+'\n')+p.slice(ci);
h=h.replace(m[1],Buffer.from(p).toString('base64'));fs.writeFileSync(file,h);console.log('Contract workspace integrated');
