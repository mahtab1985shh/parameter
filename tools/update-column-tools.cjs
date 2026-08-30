const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const file=path.join(__dirname,'..','parameter-v34-login-sharp.html');let html=fs.readFileSync(file,'utf8');
const code=fs.readFileSync(path.join(__dirname,'column-tools.js'),'utf8');new vm.Script(code);
const rx=/<script id="parameter-v33-column-tools">[\s\S]*?<\/script>/;
if(!rx.test(html))throw Error('Column tools script missing');html=html.replace(rx,()=>'<script id="parameter-v33-column-tools">\n'+code+'\n</script>');
const match=html.match(/var binary=atob\("([^"]+)"\)/);let project=Buffer.from(match[1],'base64').toString('utf8');
if(!project.includes('statusCol, actionsCol, docsCol'))throw Error('Plan column definition missing');
project=project.replaceAll('statusCol, actionsCol, docsCol','statusCol, docsCol, actionsCol');html=html.replace(match[1],Buffer.from(project).toString('base64'));
// Related users must be inserted before the final action cell, including on every re-render.
if(!html.includes('headRow.appendChild(uh)')||!html.includes('row.appendChild(uc)'))throw Error('Related users insertion missing');
html=html.replace('headRow.appendChild(uh)','headRow.insertBefore(uh,headRow.lastElementChild)').replace('row.appendChild(uc)','row.insertBefore(uc,row.lastElementChild)');
fs.writeFileSync(file,html);console.log('Updated unified column menus and plan action ordering');
