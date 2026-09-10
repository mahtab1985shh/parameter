/* Shared by the HTML design and Angular component. Highcharts 12.4.0. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ParameterProjectCharts=factory()})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const catalog=[
    ['scurve','پیشرفت پروژه (S-Curve)','area','area-chart'],
    ['duration','مدت پروژه','pie','pie-donut'],
    ['cpi','شاخص عملکرد هزینه (CPI)','gauge','gauge-speedometer'],
    ['spi','شاخص عملکرد زمان (SPI)','gauge','gauge-speedometer'],
    ['financial','شاخص‌های مالی','column','column-basic'],
    ['physical','پیشرفت فیزیکی','column','column-basic'],
    ['rial','پیشرفت ریالی','area','area-chart'],
    ['hr','نیروی انسانی','bar','bar-chart'],
    ['equip','ماشین‌آلات','bar','bar-chart'],
    ['temperature','وضعیت دما','arearange','arearange-line']
  ].map(([key,title,type,demo])=>({key,title,type,demo:'https://www.highcharts.com/demo/highcharts/'+demo}));
  function options(key,d,theme={}){
    const colors=theme.colors||['#2a78d6','#eb6834','#1baf7a','#eda100','#e0699a','#2f9e2f','#4a3aa7','#e34948'];
    const entry=catalog.find(x=>x.key===key);if(!entry)throw Error('Unknown project chart: '+key);
    const o={chart:{type:entry.type,backgroundColor:'transparent',style:{fontFamily:theme.fontFamily||'Vazirmatn, Tahoma, sans-serif'},animation:false,spacing:[12,12,10,8]},title:{text:undefined},accessibility:{description:entry.title},colors,
      legend:{enabled:true,rtl:true,itemStyle:{fontSize:'11px',fontWeight:'normal',color:theme.text||'#63667e'}},
      xAxis:{categories:[],lineColor:theme.grid||'#e4e6f2',tickLength:0,labels:{style:{fontSize:'10px',color:theme.text||'#63667e'}}},
      yAxis:{title:{text:undefined},gridLineColor:theme.grid||'#e4e6f2',labels:{style:{fontSize:'10px',color:theme.text||'#63667e'}}},
      tooltip:{shared:true,valueDecimals:1,style:{fontFamily:theme.fontFamily||'Vazirmatn, Tahoma, sans-serif',fontSize:'12px'},backgroundColor:theme.surface||'#fff'},
      plotOptions:{series:{animation:false,connectNulls:false,marker:{enabled:false}},column:{borderWidth:0,borderRadius:4},bar:{borderWidth:0,borderRadius:4}},series:[]};
    const series=(type,name,data,color)=>({type,name,data:data.slice(),color});
    const percent=()=>{o.yAxis.min=0;o.yAxis.max=100;o.yAxis.labels.format='{value}%';o.tooltip.valueSuffix='٪'};
    if(key==='scurve'){percent();o.xAxis.categories=d.scurve.labels.slice();o.series=[{...series('area','برنامه‌ای',d.scurve.planned,colors[0]),fillOpacity:.08},series('line','تحقق‌یافته',d.scurve.verified,colors[1]),series('line','واقعی',d.scurve.actual,colors[2])];}
    if(key==='physical'){percent();o.xAxis.categories=d.physical.categories.slice();o.series=[series('column','برنامه‌ای',d.physical.planned,colors[0]),series('column','تحقق‌یافته',d.physical.verified,colors[1]),series('column','واقعی',d.physical.actual,colors[2])];}
    if(key==='financial'){o.xAxis.categories=['BCWS','BCWP','ACWP'];o.yAxis.min=0;o.yAxis.title.text='ریال';o.tooltip.valueSuffix=' ریال';o.legend.enabled=false;o.series=[{type:'column',name:'مبلغ',data:o.xAxis.categories.map((name,i)=>({name,y:d.financial[name],color:colors[i]}))}];}
    if(key==='rial'){percent();o.xAxis.categories=d.rial.dates.slice();o.legend.enabled=false;o.series=[{...series('area','پیشرفت ریالی',d.rial.values,colors[0]),fillOpacity:.12}];}
    if(key==='hr'){o.xAxis.categories=['رانندگان','کارگران','حراست','مهندسین'];o.yAxis.min=0;o.yAxis.allowDecimals=false;o.tooltip.valueSuffix=' نفر';o.legend.enabled=false;o.series=[{type:'bar',name:'نیروی فعال',data:[d.hr.drivers,d.hr.workers,d.hr.security,d.hr.engineers].map((y,i)=>({y,color:colors[i]}))}];}
    if(key==='equip'){o.xAxis.categories=d.equip.categories.slice();o.yAxis.min=0;o.yAxis.allowDecimals=false;o.tooltip.valueSuffix=' دستگاه';o.series=[series('bar','فعال',d.equip.active,colors[0]),series('bar','کل دستگاه',d.equip.total,colors[4])];}
    if(key==='temperature'){o.xAxis.categories=d.temperature.dates.slice();o.tooltip.valueSuffix=' °C';o.series=[{type:'arearange',name:'بازه دما',data:d.temperature.min.map((v,i)=>[i,v,d.temperature.max[i]]),color:colors[0],fillOpacity:.12,lineWidth:0,showInLegend:false},series('line','کمینه',d.temperature.min,colors[0]),series('line','بیشینه',d.temperature.max,colors[7])];}
    if(key==='duration'){o.legend.enabled=false;o.tooltip.shared=false;o.tooltip.valueSuffix=' روز';o.series=[{type:'pie',name:'مدت پروژه',innerSize:'72%',dataLabels:{enabled:false},data:[['فعال',d.duration.active,colors[2]],['غیرفعال',d.duration.inactive,'#9294ab'],['باقی‌مانده',d.duration.remaining,colors[1]]].map(([name,y,color])=>({name,y,color}))}];}
    if(key==='cpi'||key==='spi'){
      const value=d[key];o.chart.height=170;o.pane={startAngle:-90,endAngle:90,center:['50%','72%'],size:'110%',background:[{backgroundColor:'transparent',borderWidth:0}]};o.xAxis={visible:false};o.yAxis={min:0,max:Math.max(2,value||0),title:{text:undefined},tickPositions:[0,1,2],minorTickInterval:undefined,gridLineWidth:0,lineWidth:0,tickLength:8,labels:{distance:16},plotBands:[{from:0,to:.9,color:'#d03b3b',thickness:12},{from:.9,to:1,color:'#d98c00',thickness:12},{from:1,to:Math.max(2,value||0),color:'#0ca30c',thickness:12}]};o.legend.enabled=false;o.tooltip.shared=false;o.tooltip.valueDecimals=4;o.series=[{type:'gauge',name:key.toUpperCase(),data:[value],dial:{radius:'75%',backgroundColor:theme.text||'#323338'},pivot:{backgroundColor:theme.text||'#323338'},dataLabels:{format:'{y:.4f}',borderWidth:0,style:{fontSize:'16px',color:theme.text||'#323338'}}}];
    }
    // Visible design: compact dashboard gauges, labelled bars and a clear plan/actual comparison.
    o.legend.align='right';o.legend.symbolRadius=3;o.legend.symbolHeight=8;o.legend.symbolWidth=14;
    o.yAxis.gridLineDashStyle='Dash';
    if(key==='scurve'){
      o.series[0].dashStyle='ShortDash';o.series[0].lineWidth=2;o.series[0].fillOpacity=.025;
      o.series[1].lineWidth=2;o.series[2].lineWidth=3;o.series[2].marker={enabled:true,radius:3,symbol:'circle'};
      o.yAxis.tickInterval=25;o.xAxis.tickInterval=Math.max(1,Math.ceil(d.scurve.labels.length/8));
    }
    if(key==='financial'||key==='hr'||key==='equip'){
      o.plotOptions.series.dataLabels={enabled:true,format:'{point.y:,.0f}',style:{fontSize:'10px',fontWeight:'500',textOutline:'none',color:theme.text||'#63667e'}};
      o.plotOptions.column.maxPointWidth=38;o.plotOptions.bar.maxPointWidth=16;
      o.yAxis.maxPadding=.2;
      if(key==='equip')o.series[1].color='#c6d7ec';
      if(key==='hr')o.series[0].data.forEach(p=>p.color=colors[0]);
    }
    if(key==='physical'){o.plotOptions.column.maxPointWidth=22;o.yAxis.tickInterval=25;}
    if(key==='rial'){o.series[0].fillOpacity=.18;o.series[0].lineWidth=3;o.series[0].marker={enabled:true,radius:4};}
    if(key==='cpi'||key==='spi'){o.chart.height=144;o.pane.size='112%';o.pane.center=['50%','76%'];o.yAxis.labels.distance=11;o.series[0].dataLabels.style.fontSize='23px';o.series[0].dataLabels.y=6;}
    return o;
  }
  return {catalog,options};
});
