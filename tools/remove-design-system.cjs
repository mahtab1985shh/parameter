const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const file=path.join(__dirname,'..','parameter-v34-login-sharp.html');
let html=fs.readFileSync(file,'utf8');
const match=html.match(/var binary=atob\("([^"]+)"\)/);
assert(match,'Embedded app missing');
function clean(source,encoded){
  const enc=s=>encoded?JSON.stringify(s).slice(1,-1):s;
  const start=source.indexOf('  window.openParameterDesignSystem=function(){');
  const end=source.indexOf('  var originalCloseWorkflowDesigner=null;',start);
  assert(start>=0&&end>start,'Design menu boundaries missing');
  source=source.slice(0,start)+source.slice(end);
  for(const line of [
    '    placeParameterDesignSystemMenu();\n',
    '  new MutationObserver(placeParameterDesignSystemMenu).observe(document.documentElement,{childList:true,subtree:true});\n',
    '    var designTrigger=event.target.closest&&event.target.closest(\'.sidebar-item[data-module="mod_settings"]\');\n',
    '    if(designTrigger){event.preventDefault();event.stopImmediatePropagation();openParameterDesignSystem();return}\n'
  ]){assert(source.includes(enc(line)),'Missing removal target: '+line);source=source.replace(enc(line),'');}
  assert(!source.includes('openParameterDesignSystem'));
  assert(!source.includes('placeParameterDesignSystemMenu'));
  return source;
}
const inner=clean(Buffer.from(match[1],'base64').toString('utf8'),true);
html=clean(html,false).replace(match[1],Buffer.from(inner).toString('base64'));
// Keep shared design tokens and common component styling; remove only the reference UI.
const a=html.indexOf('  function augmentDesignSystem(){');
const b=html.indexOf('  var queued=false;',a);
assert(a>=0&&b>a);
html=html.slice(0,a)+html.slice(b);
html=html.replace(';augmentDesignSystem()}','}');
fs.writeFileSync(file,html);
console.log('Removed design-system reference page entry, creation observer and UI augmentation in both app layers.');
