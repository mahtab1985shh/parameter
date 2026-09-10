function layoutProjectDashboard(){
  var panel=document.getElementById('panelProject');
  panel.querySelectorAll('.card').forEach(function(card){var control=card.querySelector('[data-detail]');if(!control)return;var key=control.dataset.detail;card.dataset.widget=key;card.style.setProperty('--widget-area',key)});
  var events=panel.querySelector('.events');if(events){var card=events.closest('.card');card.dataset.widget='events';card.style.setProperty('--widget-area','events')}
  if(!document.getElementById('projectOverview')){var summary=document.createElement('div');summary.id='projectOverview';summary.className='project-overview';summary.setAttribute('aria-label','خلاصه وضعیت پروژه');panel.prepend(summary)}
}
function updateProjectOverview(data){
  var host=document.getElementById('projectOverview');if(!host)return;
  var last=data.scurve.actual.map(function(v,i){return v==null?-1:i}).filter(function(i){return i>=0}).pop();
  var actual=last===undefined?null:data.scurve.actual[last],planned=last===undefined?null:data.scurve.planned[last];
  var n=data.hr.drivers+data.hr.workers+data.hr.security+data.hr.engineers;
  var machines=data.equip.active.reduce(function(a,b){return a+b},0);
  host.innerHTML='<div><span>پیشرفت واقعی</span><strong class="progress-value">'+(actual==null?'—':fmtNum(actual)+'٪')+'</strong><small>آخرین دوره گزارش‌شده</small></div><div><span>پیشرفت برنامه‌ای</span><strong>'+(planned==null?'—':fmtNum(planned)+'٪')+'</strong><small>در همان دوره گزارش</small></div><div><span>نیروی انسانی فعال</span><strong>'+fmtNum(n)+' <small>نفر</small></strong><small>مستقر در کارگاه</small></div><div><span>ماشین‌آلات فعال</span><strong>'+fmtNum(machines)+' <small>دستگاه</small></strong><small>مجموع تجهیزات فعال</small></div>';
}
