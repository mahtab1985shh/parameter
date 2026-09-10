const fs=require('fs'),assert=require('assert/strict'),{JSDOM,VirtualConsole}=require('../../parameter-angular/node_modules/jsdom');
const {catalog,options}=require('../developer/project-dashboard/project-chart-options.js');
const source=fs.readFileSync(__dirname+'/reference-dashboards-source.html','utf8');
const doc=require('./migrate-reference-highcharts.cjs')(source).replace(/\ninit\(\);\s*\n/, '\nwindow.__fixture=deriveData(CONTRACTS[0]);init();\n');
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.cause?.stack||e.message));
const d=new JSDOM(doc,{url:'https://parameter.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
  w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.scrollTo=()=>{};
  w.SVGElement.prototype.getBBox=function(){return {x:0,y:0,width:100,height:30}};
}});
const w=d.window;
try{
  assert.deepEqual(errors,[]);
  w.document.getElementById('tabBtnProject').click();
  const live=()=>w.Highcharts.charts.filter(Boolean);
  assert.equal(live().length,10);
  assert.equal(w.document.querySelectorAll('#panelProject .highcharts-root').length,10);
  assert.equal(w.document.querySelectorAll('#projectOverview>div').length,4);
  assert.equal(w.document.querySelector('#chartScurve').closest('.card').dataset.widget,'scurve');
  assert.equal(w.document.querySelector('#gaugeCPI').closest('.card').dataset.widget,'cpi');
  const summaryBefore=w.document.getElementById('projectOverview').textContent;
  const financial=live().find(c=>c.renderTo.id==='chartFinancial');const before=financial.series[0].data[0].y;
  w.document.getElementById('comboBtn').click();const choices=w.document.querySelectorAll('#comboList [role="option"]');assert.ok(choices.length>1);choices[1].click();assert.notEqual(financial.series[0].data[0].y,before);
  assert.notEqual(w.document.getElementById('projectOverview').textContent,summaryBefore);
  for(const key of ['scurve','financial','physical','rial','hr','equip','temp']){
    const button=w.document.querySelector('[data-detail="'+key+'"]');assert.ok(button,key);button.click();assert.ok(w.document.querySelector('#detailBody .highcharts-root'),key);w.document.getElementById('detailBack').click();assert.equal(live().length,10);
  }
  const curves=live().find(c=>c.renderTo.id==='chartScurve');assert.ok(curves.series[1].options.data.some(v=>v===null));
  const cpi=live().find(c=>c.renderTo.id==='gaugeCPI');assert.equal(cpi.options.yAxis[0].plotBands[2].from,1);
  assert.ok(w.document.querySelector('#chartDuration .highcharts-root'));
  assert.ok(w.__fixture.scurve);
  for(const card of catalog){assert.ok(options(card.key,w.__fixture).series.length,card.key)}
  fs.writeFileSync(__dirname+'/../developer/project-dashboard/sample-project-data.json',JSON.stringify(w.__fixture,null,2)+'\n');
  console.log('PASS: 10 real Highcharts instances, contract changes, 7 detail views and cleanup, null gaps, KPI threshold');
}finally{d.window.close()}
