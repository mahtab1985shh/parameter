(function(){
  function di(name){return (window.ICONS&&ICONS[name])||''}
  function persianToday(){try{return new Intl.DateTimeFormat('fa-IR-u-ca-persian',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date())}catch(e){return 'امروز'}}
  function persianShortToday(){try{return new Intl.DateTimeFormat('fa-IR-u-ca-persian',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replace(/\u200e/g,'')}catch(e){return ''}}
  function todayItems(){
    var items=[];try{items=JSON.parse(localStorage.getItem('parameter.calendar.local.v1')||'[]')}catch(e){}
    var today=persianShortToday().replace(/\//g,'/');
    items=items.filter(function(x){return !x.start||!today||String(x.start).replace(/^۱۴۰۵/,'1405')===today.replace(/^۱۴۰۵/,'1405')}).slice(0,3);
    if(items.length)return items.map(function(x){return {title:x.title||'فعالیت امروز',kind:x.kind==='reminder'?'یادآور':'فعالیت',time:x.fromTime||x.rTime||'امروز',icon:x.kind==='reminder'?'alert':'calendar'}});
    return [
      {title:'جلسه بررسی پیشرفت پروژه ترمینال',kind:'فعالیت',time:'۰۹:۳۰',icon:'calendar'},
      {title:'پیگیری صورت‌وضعیت پیمانکاری',kind:'یادآور',time:'۱۱:۰۰',icon:'alert'},
      {title:'بازدید دوره‌ای کارگاه',kind:'رویداد',time:'۱۴:۳۰',icon:'clipboard'}
    ];
  }
  function kpi(label,value,unit,icon){return '<div class="dd-kpi"><div class="dd-kpi-copy"><span class="dd-kpi-label">'+label+'</span><strong class="dd-kpi-value">'+value+'</strong><span class="dd-kpi-unit">'+unit+'</span></div><i class="dd-kpi-icon">'+di(icon)+'</i></div>'}
  function iranMap(){
    var points=[['تهران',12,51,28],['اصفهان',10,48,48],['یزد',5,60,52],['فارس',7,50,68],['خراسان رضوی',6,76,35],['خوزستان',4,30,63]];
    var dots=points.map(function(p){return '<div class="dd-map-dot" style="position:absolute;left:'+p[2]+'%;top:'+p[3]+'%"><span class="dd-map-tooltip">'+p[0]+'، '+faDigits(p[1])+' قرارداد</span></div>'}).join('');
    var svgPoints=points.map(function(p){return '<g class="dd-map-point" tabindex="0" transform="translate('+(p[2]*5.2)+' '+(p[3]*3.15)+')"><circle r="14"></circle><text>'+faDigits(p[1])+'</text></g>'}).join('');
    var legend=points.map(function(p){return '<div class="dd-province"><span>'+p[0]+'</span><b>'+faDigits(p[1])+'</b></div>'}).join('');
    return '<section class="dd-card dd-map"><header class="dd-card-head"><h3>تراکم قراردادها در استان‌ها</h3><small>تعداد قراردادهای ثبت‌شده</small></header><div class="dd-map-body"><div class="dd-map-stage">'+dots+'<svg class="dd-iran" viewBox="0 0 520 315" role="img" aria-label="نقشه ایران و تعداد قراردادهای استانی"><path class="dd-iran-outline" d="M53 72l34-18 39 4 30-30 48 20 37-7 32 21 52-3 24 24 58 14 22 33 45 17-14 38-31 13-13 35-43 5-27 38-43-8-31 22-35-15-42 7-26-25-45-8-17-31-46-14-15-40-31-28 9-41-20-31z"/><path class="dd-iran-line" d="M116 58l25 62 54-34 49 44 63-46 30 63 67-29M82 120l80 22 5 68 69-21 37 75M165 143l76-13 62 65 81-11M236 189l-4 79M303 195l39 48"/>'+svgPoints+'</svg></div><div class="dd-map-legend">'+legend+'</div></div></section>';
  }
  window.renderDefaultDashboard=function(){
    var activities=todayItems().map(function(x){return '<div class="dd-today-item"><i>'+di(x.icon)+'</i><div><b>'+x.title+'</b><span>'+x.kind+'</span></div><span class="dd-today-time">'+x.time+'</span></div>'}).join('');
    return '<div class="dd-shell"><div class="dd-kpis">'+
      kpi('تعداد کل قراردادها','۱۲','قرارداد','file')+kpi('قراردادهای فعال','۸','قرارداد','clipboard')+kpi('مبلغ کل قراردادها','۱٬۲۴۶','میلیارد ریال','money')+kpi('مبلغ پرداخت‌شده','۴۸۲','میلیارد ریال','trend')+
      '</div>'+iranMap()+
      '<section class="dd-card dd-day"><div class="dd-date-pane"><i class="dd-day-icon">'+di('calendar')+'</i><div class="dd-day-copy"><b>'+persianToday()+'</b><span>تقویم کاری امروز</span></div></div><div class="dd-weather-pane"><i class="dd-day-icon">'+di('donut')+'</i><div class="dd-day-copy"><b>تهران، ۲۹°</b><span>صاف و آفتابی</span></div></div></section>'+
      '<section class="dd-card dd-today"><header class="dd-card-head"><h3>فعالیت‌ها و یادآورهای امروز</h3><small>'+faDigits(todayItems().length)+' مورد</small></header><div class="dd-today-list">'+activities+'</div></section>'+
      '<section class="dd-card dd-contract-status"><header class="dd-card-head"><h3>وضعیت پیمان‌ها و مبلغ قراردادها</h3></header><div class="dd-status-body">'+
        '<div class="dd-status-item"><b>پیمانکاری</b><strong>۷۴۰</strong><span>میلیارد ریال · ۴ فعال</span><div class="dd-status-track"><i style="width:72%"></i></div></div>'+
        '<div class="dd-status-item"><b>مطالعات</b><strong>۲۱۸</strong><span>میلیارد ریال · ۲ فعال</span><div class="dd-status-track"><i style="width:46%"></i></div></div>'+
        '<div class="dd-status-item"><b>نظارت</b><strong>۲۸۸</strong><span>میلیارد ریال · ۲ فعال</span><div class="dd-status-track"><i style="width:58%"></i></div></div>'+
      '</div></section></div>';
  };
  /* The legacy shell renders the dashboard before late feature modules load. */
  setTimeout(function(){if(typeof window.renderDashboard==='function')window.renderDashboard()},0);
})();
