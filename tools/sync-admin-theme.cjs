const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');const css=fs.readFileSync(path.join(__dirname,'admin-theme.css'),'utf8');
const p=path.join(__dirname,'admin-shell.js');let s=fs.readFileSync(p,'utf8');s=s.replace(/    const css=[\s\S]*?;\n    frame.srcdoc=/,()=> '    const css='+JSON.stringify(css)+';\n    frame.srcdoc=');fs.writeFileSync(p,s);
const entry=path.join(root,'parameter-v34-login-sharp.html');let h=fs.readFileSync(entry,'utf8');h=h.replace(/(<script id="parameter-admin-shell-inline">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+'\n'+s+'\n'+b);fs.writeFileSync(entry,h);
