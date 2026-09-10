const fs=require('fs'),path=require('path'),ts=require('../../parameter-angular/node_modules/typescript');
module.exports=function(doc){
  const scripts=['highcharts.js','highcharts-more.js','accessibility.js'].map(f=>fs.readFileSync(path.join(__dirname,'highcharts-vendor',f),'utf8'));
  scripts.push(fs.readFileSync(path.join(__dirname,'../developer/project-dashboard/project-chart-options.js'),'utf8'));
  doc=doc.replace(/<script src="https:\/\/cdnjs[^\"]+"><\/script>/,()=>scripts.map(s=>'<script>'+s.replace(/<\/script/gi,'<\\/script')+'</script>').join('\n'));
  const start=doc.lastIndexOf('<script>')+8,end=doc.indexOf('</script>',start);let code=doc.slice(start,end);
  const ast=ts.createSourceFile('dashboard.js',code,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),edits=[];
  const functions={
    applyChartDefaults:`function applyChartDefaults(){Highcharts.setOptions({lang:{numericSymbols:['هزار','میلیون','میلیارد','تریلیون']}});}`,
    donutChart:'function donutChart(){}',
    renderGauge:`function renderGauge(id,value,max,label){drawProjectChart(id,label.toLowerCase(),{cpi:value,spi:value});}`,
    renderFinancial:`function renderFinancial(data){drawProjectChart('chartFinancial','financial',data);}`,
    renderPhysical:`function renderPhysical(data){drawProjectChart('chartPhysical','physical',data);}`,
    renderHR:`function renderHR(data){var h=data.hr;document.getElementById('hrCaption').textContent=fmtNum(h.drivers+h.workers+h.security+h.engineers)+' نفر فعال · میانگین '+h.avgDuration+' روز';drawProjectChart('chartHR','hr',data);}`,
    renderEquip:`function renderEquip(data){drawProjectChart('chartEquip','equip',data);}`,
    renderRial:`function renderRial(data){document.getElementById('rialAmount').textContent=fmtRial(data.rial.amount);document.getElementById('rialPercent').textContent=data.rial.percent+' %';drawProjectChart('chartRial','rial',data);}`,
    renderTemperature:`function renderTemperature(data){drawProjectChart('chartTemp','temperature',data);}`,
    renderScurve:`function renderScurve(data){drawProjectChart('chartScurve','scurve',data);}`
  };
  function visit(n){
    if(ts.isFunctionDeclaration(n)&&n.name&&functions[n.name.text]){edits.push([n.getStart(ast),n.end,functions[n.name.text]]);return}
    if(ts.isIfStatement(n)&&n.getText(ast).startsWith('if(chartRegistry.duration)')){edits.push([n.getStart(ast),n.end,"drawProjectChart('chartDuration','duration',data);"]);return}
    if(ts.isNewExpression(n)&&n.expression.getText(ast)==='Chart'){
      const id=n.arguments[0].getText(ast).match(/getElementById\('([^']+)'\)/)?.[1];if(!id)throw Error('Unmapped chart');
      const key={chartScurveDetail:'scurve',chartFinancialDetail:'financial',chartPhysicalDetail:'physical',chartRialDetail:'rial',chartHRDetail:'hr',chartEquipDetail:'equip',chartTempDetail:'temperature'}[id];if(!key)throw Error(id);
      edits.push([n.getStart(ast),n.end,`drawProjectChart('${id}','${key}',currentProjectData)`]);return
    }
    ts.forEachChild(n,visit);
  }visit(ast);edits.sort((a,b)=>b[0]-a[0]).forEach(([a,b,s])=>code=code.slice(0,a)+s+code.slice(b));
  code=code.replace('function closeDetail(){',`function closeDetail(){
    Object.keys(chartRegistry).filter(function(id){return id.indexOf('Detail')>=0}).forEach(function(id){chartRegistry[id].destroy();delete chartRegistry[id]});`);
  const helper=`
function drawProjectChart(id,key,data){
  var host=document.getElementById(id);if(!host)return;
  if(host.tagName==='CANVAS'){var div=document.createElement('div');div.id=id;div.style.cssText='width:100%;height:100%;min-width:0';host.replaceWith(div);host=div}
  if(chartRegistry[id]&&chartRegistry[id].renderTo!==host){chartRegistry[id].destroy();delete chartRegistry[id]}
  var theme={text:cssVar('--text-secondary'),grid:cssVar('--grid-line'),surface:cssVar('--surface'),colors:Array.from({length:8},function(_,i){return cssVar('--s'+(i+1))})};
  var opts=ParameterProjectCharts.options(key,data,theme);
  if(chartRegistry[id]){chartRegistry[id].update(opts,true,true);chartRegistry[id].reflow()}else chartRegistry[id]=Highcharts.chart(host,opts);
  return chartRegistry[id];
}
`;
  code=code.replace('var chartRegistry = {};','var chartRegistry = {};'+helper);
  code=code.replace("activeTab = tab;","activeTab = tab;\n  requestAnimationFrame(function(){Object.keys(chartRegistry).forEach(function(k){chartRegistry[k].reflow()})});");
  if(/new Chart\(|Chart\.defaults|\.getContext\(/.test(code))throw Error('Unmigrated Chart.js API');
  return (doc.slice(0,start)+code+doc.slice(end))
    .replaceAll('هزینه واقعی پروژه نسبت به هزینه تحقق‌یافته آن','ارزش کار انجام‌شده نسبت به هزینه واقعی پروژه')
    .replaceAll('Chart.js global theme','Highcharts global theme');
};
