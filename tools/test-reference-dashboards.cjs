const fs=require('fs'),assert=require('assert/strict'),vm=require('vm'),{JSDOM}=require('../../parameter-angular/node_modules/jsdom');
const d=new JSDOM('<div id="view-dashboard"></div>',{url:'https://parameter.test',runScripts:'outside-only'}),w=d.window;
w.ICONS={file:'x'};w.dashboardMode='default';let calls=0;w.renderDashboard=()=>calls++;w.setDashboardMode=m=>{w.dashboardMode=m;w.renderDashboard()};w.dashboardModeBar=()=>'<div class="dashboard-modebar"><div class="dash-mode-switch"><button>Existing</button></div></div>';
w.PARAMETER_REFERENCE_DOCUMENT='<html><script>/* INITIAL_REFERENCE_TAB */</script></html>';
w.eval(fs.readFileSync(__dirname+'/reference-dashboards.js','utf8'));
for(const mode of ['reference-overview','reference-project']){w.setDashboardMode(mode);assert.equal(w.document.querySelectorAll('.group-tab').length,2);assert.equal(w.document.querySelectorAll('[aria-selected="true"]').length,1);assert.ok(w.document.querySelector('iframe').srcdoc.includes(mode==='reference-project'?"setTab('project')":"setTab('default')"));}
w.setDashboardMode('custom');assert.equal(calls,1);assert.equal(w.document.querySelector('iframe'),null);
w.setDashboardMode('project');assert.ok(w.document.querySelector('iframe').srcdoc.includes("setTab('project')"));assert.equal(calls,1,'Existing project tab must use Highcharts, not old renderer');
const h=fs.readFileSync(__dirname+'/../parameter-v34-login-sharp.html','utf8'),p=Buffer.from(h.match(/var binary=atob\("([^"]+)"\)/)[1],'base64').toString();const outer=new JSDOM(p);const inner=new JSDOM(JSON.parse(outer.window.document.querySelector('script[type="__bundler/template"]').textContent));
const script=[...inner.window.document.scripts].find(s=>s.textContent.includes('window.PARAMETER_REFERENCE_DOCUMENT='));assert.ok(script);
const assignment=script.textContent.match(/window.PARAMETER_REFERENCE_DOCUMENT=(.*);\n\(function\(\)/);assert.ok(assignment);const ref=JSON.parse(assignment[1].replace(/<\\\//g,'</'));assert.ok(ref.includes('/* INITIAL_REFERENCE_TAB */'));const rd=new JSDOM(ref);assert.equal(rd.window.document.querySelectorAll('script[src]').length,0);rd.window.document.querySelectorAll('script').forEach(s=>new vm.Script(s.textContent));assert.ok(rd.window.document.getElementById('panelDefault'));assert.ok(rd.window.document.getElementById('panelProject'));
assert.ok(ref.includes('ParameterProjectCharts.options'));
assert.ok(!ref.includes('new Chart('));
const dashboard=inner.window.document.getElementById('view-dashboard');
dashboard.style.display='block';assert.ok(inner.window.document.querySelector('.main-wrap:has(#view-dashboard[style*="block"])>.page-head'));
dashboard.style.display='none';assert.equal(inner.window.document.querySelector('.main-wrap:has(#view-dashboard[style*="block"])>.page-head'),null);
console.log('PASS: two tabs, selected state, project initialization, previous modes, bundled Highcharts, header visibility selector, script syntax');[d,outer,inner,rd].forEach(x=>x.window.close());
