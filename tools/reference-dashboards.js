(function(){
  var modes=['reference-overview','reference-project'];
  var labels=['نمای جامع طرح‌ها','نمای تفصیلی پروژه'];
  var oldBar=window.dashboardModeBar,oldRender=window.renderDashboard,oldSet=window.setDashboardMode;
  var frames={};
  window.dashboardModeBar=function(){
    var box=document.createElement('div');box.innerHTML=oldBar();
    var tabs=box.querySelector('.dash-mode-switch')||box.firstElementChild;
    modes.forEach(function(mode,i){var b=document.createElement('button');b.type='button';b.className='dash-mode-btn group-tab'+(dashboardMode===mode?' active':'');b.setAttribute('aria-selected',String(dashboardMode===mode));b.innerHTML='<i class="parameter-tab-icon">'+(ICONS.layers||ICONS.file||'')+'</i>'+labels[i];b.onclick=function(){setDashboardMode(mode)};b.setAttribute('onclick',"setDashboardMode('"+mode+"')");tabs.appendChild(b)});
    return box.innerHTML;
  };
  window.setDashboardMode=function(mode){if(modes.indexOf(mode)<0){oldSet(mode);return}dashboardMode=mode;localStorage.setItem('parameter_dashboard_mode_v1',mode);renderDashboard()};
  window.renderDashboard=function(){
    var root=document.getElementById('view-dashboard');if(!root)return;
    modes.forEach(function(m){if(frames[m]&&frames[m].parentNode)frames[m].remove()});
    var isProject=dashboardMode==='project';
    root.classList.toggle('reference-dashboard-active',isProject||modes.indexOf(dashboardMode)>=0);
    if(!isProject&&modes.indexOf(dashboardMode)<0){oldRender();return}
    root.classList.remove('dash-mode-default','dash-mode-custom','dash-mode-project');
    root.innerHTML=dashboardModeBar();
    root.querySelectorAll('.dash-mode-actions').forEach(function(el){el.remove()});
    var mode=isProject?'reference-project':dashboardMode,frame=frames[mode];
    if(!frame){frame=document.createElement('iframe');frame.title=labels[modes.indexOf(mode)]+' — داده‌های نمونه';frame.className='reference-dashboard-frame';frame.setAttribute('sandbox','allow-scripts allow-same-origin');frame.srcdoc=window.PARAMETER_REFERENCE_DOCUMENT.replace('/* INITIAL_REFERENCE_TAB */',mode==='reference-project'?"setTab('project');":"setTab('default');");frames[mode]=frame}
    root.appendChild(frame);
    function theme(){if(!frame.contentDocument)return;var s=getComputedStyle(root),doc=frame.contentDocument.documentElement;[['--brand','--mon-blue'],['--brand-soft','--mon-blue-tint'],['--surface','--surface'],['--border','--border'],['--text-primary','--text-900'],['--text-secondary','--text-600']].forEach(function(pair){var value=s.getPropertyValue(pair[1]).trim();if(value)doc.style.setProperty(pair[0],value)});doc.style.fontFamily=s.fontFamily}
    frame.onload=theme;theme();
  };
})();
