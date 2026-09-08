const fs=require('fs'),path=require('path'),vm=require('vm');
const file=path.join(__dirname,'../parameter-v34-login-sharp.html');let h=fs.readFileSync(file,'utf8'),m=h.match(/var binary=atob\("([^"]+)"\)/),p=Buffer.from(m[1],'base64').toString('utf8');
const enc=s=>JSON.stringify(s).slice(1,-1),js=fs.readFileSync(path.join(__dirname,'project-dashboard.js'),'utf8'),css=fs.readFileSync(path.join(__dirname,'project-dashboard.css'),'utf8');new vm.Script(js);
if(p.includes('/* PROJECT DASHBOARD START */'))throw Error('Already installed');
const sm='function userUtilityAction(type){',cm='.parameter-date-overlay{';if(p.split(sm).length!==2||!p.includes(cm))throw Error('Missing insertion points');
p=p.replace(sm,()=>enc('/* PROJECT DASHBOARD START */\n'+js+'\n/* PROJECT DASHBOARD END */\n')+sm);p=p.replace(cm,()=>enc(css+'\n')+cm);h=h.replace(m[1],Buffer.from(p).toString('base64'));fs.writeFileSync(file,h);console.log('Project dashboard integrated');
