/* Independent admin workspace built from Parameter's own shell and styles. */
(function () {
  'use strict';
  const groups = [
    ['داشبورد', ['داشبورد']],
    ['محصولات', ['قیمت‌گذاری', 'پلن‌های فروش']],
    ['مشتریان', ['اشخاص و شرکت‌ها', 'مشترکین سایت']],
    ['فروش', ['قرارداد فروش']],
    ['پشتیبانی', ['تیکت‌ها']],
    ['ادمین', ['سازمان‌ها', 'پرسنل', 'نقش و دسترسی‌ها', 'کاربران', 'کاربران محدود', 'دسترسی به سازمان‌ها', 'مشخصات شرکت', 'نشست‌های فعال', 'تنظیمات امنیتی']]
  ];
  const productTabs = [['ماژول‌ها', 'تعرفه‌ها'], ['آیتم‌ها', 'سرویس‌ها']];
  const iconColors=['#fdab3d','#00a67e','#e65783','#1688df','#ef9142','#985bcb','#00a99d'];
  const iconPaths=[
    '<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 5v9l9 5 9-5V8M12 13v9"/>',
    '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5"/>',
    '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9 7h6M9 11h6M9 15h3"/>',
    '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4m-4-11 3 3 5-5"/>',
    '<path d="M4 13v-2a8 8 0 0 1 16 0v2M20 17v2a2 2 0 0 1-2 2h-4"/><rect x="2" y="11" width="4" height="7" rx="2"/><rect x="18" y="11" width="4" height="7" rx="2"/>',
    '<path d="m12 3 8 4v5c0 5-8 9-8 9s-8-4-8-9V7l8-4Z"/><circle cx="12" cy="10" r="2"/><path d="M8 16a4 4 0 0 1 8 0"/>',
    '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01M12 6.5h5M12 17.5h5"/>'
  ];
  function menuIcon(i,variant=i){return '<svg class="admin-colored-icon" style="color:'+iconColors[variant%iconColors.length]+'!important" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+iconPaths[variant%iconPaths.length]+'</svg>'}
  const svg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>';
  function open() {
    if (document.getElementById('parameter-admin-frame')) return;
    const bundle = new DOMParser().parseFromString(decodeParameterProject(), 'text/html');
    const template = JSON.parse(bundle.querySelector('script[type="__bundler/template"]').textContent);
    const doc = new DOMParser().parseFromString(template, 'text/html');
    const shell = doc.querySelector('.page-shell');
    const styles = Array.from(doc.querySelectorAll('style')).map(n => n.outerHTML).join('') +
      Array.from(document.querySelectorAll('style[id]')).filter(n => !/login|admin/.test(n.id)).map(n => n.outerHTML).join('');
    // Styles have already been collected. Do not replay embedded shell styles
    // after the admin overrides in the generated document.
    shell.querySelectorAll('style').forEach(n=>n.remove());
    shell.dataset.adminRevision='monochrome-brand-5';
    shell.setAttribute('translate','no');
    shell.classList.add('notranslate');
    const header=shell.querySelector('.topbar.parameter-header');
    const sidebar=shell.querySelector('.sidebar');
    header.style.setProperty('background','linear-gradient(to left, #E4E4FF 0%, #9997FF 100%)','important');
    sidebar.style.setProperty('background','linear-gradient(to bottom, #E4E4FF 0%, #9997FF 100%)','important');
    shell.querySelector('.content').innerHTML = '<div id="admin-content"></div>';
    shell.querySelector('.sidebar-nav').innerHTML = groups.map((g, i) => '<div class="parameter-base-information-host"><button type="button" class="sidebar-item parameter-base-information-trigger" data-group="'+i+'" aria-expanded="false" aria-controls="admin-menu-'+i+'">'+menuIcon(i)+'<span>'+g[0]+'</span></button></div>').join('');
    groups.forEach((g,i)=>{
      const menu=doc.createElement('div');
      menu.id='admin-menu-'+i;menu.className='parameter-base-information-submenu';menu.dataset.submenu=i;
      menu.innerHTML='<div class="parameter-base-menu-head"><span class="parameter-base-menu-head-icon">'+menuIcon(i)+'</span><span class="parameter-base-menu-head-copy"><strong>'+g[0]+'</strong></span></div>'+g[1].map((label,j)=>'<button type="button" class="parameter-base-subitem" data-page="'+i+':'+j+'"><span class="parameter-base-subitem-icon">'+menuIcon(i,i+j)+'</span><span class="parameter-base-subitem-label">'+label+'</span></button>').join('');
      shell.appendChild(menu);
    });
    shell.querySelectorAll('script').forEach(n=>n.remove());
    shell.querySelectorAll('*').forEach(n=>Array.from(n.attributes).forEach(a=>{if(a.name.startsWith('on')||a.name.startsWith('data-i18n'))n.removeAttribute(a.name)}));
    shell.querySelectorAll('.workspace-popover,.header-language-dropdown,.user-popover,.header-notification,.theme-compact-btn,.header-language-menu').forEach(n=>n.remove());
    const parameterBrand=shell.querySelector('#header-parameter-brand');
    if(parameterBrand){parameterBrand.textContent='پنل ادمین پارامتر';parameterBrand.setAttribute('aria-label','پنل ادمین پارامتر');parameterBrand.style.setProperty('font-size','18px','important');parameterBrand.style.setProperty('font-weight','800','important');parameterBrand.style.setProperty('color','#111111','important')}
    const workspace=shell.querySelector('.workspace-trigger');
    workspace.innerHTML='<span class="workspace-mark">P</span><span>فضای کاری</span>';workspace.disabled=true;
    const brand=shell.querySelector('.header-company-brand');if(brand){
      brand.innerHTML='<img class="admin-company-logo" alt="لوگوی ماهان وب گستر آویژه" width="48" height="42"><strong class="admin-company-name">شرکت ماهان وب گستر آویژه</strong>';
      brand.querySelector('img').src=new URL('assets/mahan-brand-mark.svg',document.baseURI).href;
    }
    const footer=shell.querySelector('.sidebar-footer');
    if(footer)footer.insertAdjacentHTML('beforeend','<button type="button" id="admin-exit" title="خروج از پنل ادمین">خروج</button>');
    const user=shell.querySelector('.sidebar-user-name');if(user)user.textContent='مدیر سامانه';
    const frame=document.createElement('iframe');frame.id='parameter-admin-frame';frame.title='پنل ادمین پارامتر';frame.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:0;z-index:2147483647;background:white';
    const css=`
      :root{--mon-blue:#4D49FF;--mon-blue-dark:#3531B8;--mon-blue-tint:#EAF8F6;--sidebar-bg:#B8B6FF;--sidebar-bg-dark:#9997FF;--sidebar-bg-light:#E4E4FF;--ui-grad-start:#E4E4FF;--ui-grad-mid:#B8B6FF;--ui-grad-end:#9997FF}
      :root{--admin-purple-light:#E4E4FF;--admin-purple-deep:#9997FF}
      html body .topbar.parameter-header{background:linear-gradient(to left,var(--admin-purple-light) 0%,var(--admin-purple-light) 16%,var(--admin-purple-deep) 100%)!important;color:white!important;border-bottom:0!important;box-shadow:none!important}
      html body .sidebar{background:linear-gradient(to bottom,var(--admin-purple-light) 0%,var(--admin-purple-deep) 100%)!important;border-top:0!important}
      html body .sidebar-nav,html body .sidebar-footer{background:transparent!important}
      html body .header-parameter-brand{background:transparent!important;box-shadow:none!important}
      html body .admin-colored-icon{stroke:currentColor!important;flex-shrink:0;opacity:1!important}
      html body .sidebar .sidebar-item .admin-colored-icon{width:27px!important;height:27px!important;padding:5px!important;border-radius:8px!important;background:rgba(255,255,255,.95)!important;box-sizing:content-box!important;filter:none!important}
      #admin-exit{width:auto!important;min-width:150px!important;height:34px!important;padding:0 14px!important;white-space:nowrap!important;border:1px solid #ffffff70!important;border-radius:7px!important;background:#ffffff25!important;color:#fff!important;font:inherit!important;cursor:pointer}
      html body .header-company-brand{overflow:visible!important;flex-shrink:0!important}
      html body .sidebar-nav{overflow:auto}.sidebar-item{width:100%;font:inherit;cursor:pointer;text-align:right;border:0;display:flex;align-items:center;gap:10px;background:transparent;color:white;min-height:44px}
      html body .sidebar-item.current{background:#ffffff26!important;color:white!important}
      .parameter-base-menu-head-icon{background:#EAF8F6;color:#4D49FF;box-shadow:0 0 0 3px #fff,0 0 0 5px #00C6AE}.parameter-base-information-submenu .parameter-base-subitem:hover,.parameter-base-information-submenu .parameter-base-subitem.active{background:#EAF8F6;color:#3531B8}.parameter-base-information-submenu{max-width:calc(100vw - 16px);max-height:calc(100dvh - 80px);overflow:auto}
      .admin-toolbar{display:flex;align-items:center;gap:12px;margin:18px 0}.admin-toolbar input{font:inherit;border:1px solid #DCE8EC;border-radius:6px;padding:9px 12px;width:260px;max-width:100%}.admin-toolbar small{margin-inline-start:auto;color:#697C88}
      #admin-content .group-tab.active{background:#4D49FF!important;color:white!important}.admin-empty{text-align:center;padding:70px 20px!important;color:#697C88}.admin-table{width:100%;border-collapse:collapse;text-align:right}.admin-table th{padding:14px;background:#EAF8F6;border-bottom:1px solid #DCE8EC;font-size:12px}.admin-table td{padding:15px;border-bottom:1px solid #eee}.admin-footer{padding:14px;color:#697C88;font-size:11px;background:white}
      .admin-submenu button:focus-visible,.sidebar-item:focus-visible{outline:2px solid white;outline-offset:-3px}
      @media(max-width:760px){html body .app-shell{display:flex!important}html body .sidebar{display:flex!important;position:relative!important;transform:none!important;width:185px!important;min-width:185px!important}html body .main-wrap{min-width:0;flex:1}html body .group-tabs{flex-wrap:wrap}.admin-toolbar{flex-wrap:wrap}.board-wrap{overflow:auto}}
    `;
    shell.querySelectorAll('.admin-colored-icon').forEach(n=>{
      const color=iconColors[Array.from(shell.querySelectorAll('.admin-colored-icon')).indexOf(n)%iconColors.length];
      n.style.setProperty('color',color,'important');
      if(n.closest('.sidebar'))n.style.setProperty('background','transparent','important');
      n.style.setProperty('stroke',color,'important');
      n.querySelectorAll('*').forEach(p=>{p.style.setProperty('stroke',color,'important');p.style.setProperty('fill','none','important')});
    });
    shell.querySelectorAll('.sidebar .sidebar-item,.sidebar .sidebar-item span,.sidebar-user-name,.topbar span,.topbar button').forEach(n=>n.style.setProperty('color','#111111','important'));
    shell.querySelectorAll('.topbar svg,.topbar svg *').forEach(n=>n.style.setProperty('stroke','#111111','important'));
    const purpleStyles=`
      html:root{--mon-blue:#4D49FF!important;--mon-blue-dark:#3531B8!important;--mon-blue-tint:#EAF8F6!important;--mon-green:#4D49FF!important;--mon-green-tint:#EAF8F6!important;--bg:#F5F9FB;--surface:#fff;--border:#DCE8EC;--text-900:#242540;--text-600:#697C88;--ds-header-start:#E4E4FF;--ds-header-end:#9997FF;--ds-table-head:#EAF8F6;--ds-border:#DCE8EC}
      html body{background:#F5F9FB!important;color:#242540!important}
      html body .main-wrap,html body .content{background:#F5F9FB!important}
      html body .admin-company-name{font-size:16px;line-height:1.8;color:#fff!important;white-space:normal;text-align:center}
      html body .header-company-brand{display:flex!important;align-items:center!important;justify-content:center!important;gap:10px!important}
      html body .admin-company-logo{display:block!important;width:48px!important;height:42px!important;object-fit:contain!important;flex-shrink:0;background:#fff;border-radius:8px;padding:4px;box-sizing:border-box}
      html body #admin-exit{min-width:0!important;width:100%!important;padding:0 6px!important;background:#ffffff18!important}
      html body .workspace-trigger{background:#ffffff18!important;border-color:#ffffff30!important;color:white!important;opacity:1!important}
      html body .workspace-mark{background:#ffffff25!important;color:white!important}
      html body .pm-anim-bars i{background:#fff!important}
      html body .page-head{background:#fff!important;border:1px solid #DCE8EC!important;box-shadow:none!important;border-radius:10px!important;padding:16px 20px!important}
      html body .page-head .main-title{color:#242540!important;font-size:18px!important}
      html body #admin-content .group-tabs{background:transparent!important;border:0!important;box-shadow:none!important;gap:8px!important;flex-wrap:wrap!important;padding:12px 0!important}
      html body #admin-content .group-tab{background:#fff!important;color:#697C88!important;border:1px solid #DCE8EC!important;border-radius:10px!important;box-shadow:none!important;padding:9px 14px!important}
      html body #admin-content .group-tab.active{background:#4D49FF!important;color:#fff!important;border-color:#4D49FF!important}
      html body #admin-content .parameter-tab-icon{background:#EAF8F6!important;color:#4D49FF!important;border:0!important;box-shadow:none!important}
      html body #admin-content .group-tab.active .parameter-tab-icon{background:#ffffff25!important;color:#fff!important}
      html body #admin-content .parameter-tab-icon svg,html body #admin-content .parameter-tab-icon svg *{stroke:currentColor!important;fill:none!important}
      html body .admin-toolbar{background:#fff!important;border:1px solid #DCE8EC!important;border-radius:12px!important;padding:12px!important;box-shadow:0 6px 20px #24254008!important}
      html body .admin-toolbar input,html body .customer-fields input{background:#fff!important;border:1px solid #DCE8EC!important;border-radius:10px!important;color:#242540!important;box-shadow:none!important}
      html body input:focus-visible,html body button:focus-visible{outline:2px solid #4D49FF!important;outline-offset:2px!important}
      html body #admin-content .board-wrap{background:#fff!important;border:1px solid #DCE8EC!important;border-radius:16px!important;box-shadow:0 6px 20px #2425400E!important;overflow:auto!important}
      html body #admin-content .admin-table{border:0!important;border-collapse:collapse!important;background:#fff!important;box-shadow:none!important;font-size:12.5px!important}
      html body #admin-content .admin-table thead th{background:#EAF8F6!important;color:#3531B8!important;border:0!important;border-bottom:2px solid #DCE8EC!important;padding:12px!important;font-size:11px!important;font-weight:800!important}
      html body #admin-content .admin-table tbody td{background:transparent!important;color:#242540!important;border:0!important;border-bottom:1px solid #DCE8EC!important;padding:12px!important}
      html body #admin-content .admin-table tbody tr:hover{background:#F0FAF8!important}
      html body #admin-content .admin-table .admin-empty{padding:55px 16px!important;color:#697C88!important}
      html body .admin-footer{background:#fff!important;color:#697C88!important;border-top:1px solid #DCE8EC!important}
      html body .customer-create{background:#4D49FF!important;border-color:#4D49FF!important;border-radius:10px!important;color:#fff!important;box-shadow:none!important}
      html body .customer-icon,html body .customer-back{color:#4D49FF!important}
      html body .customer-icon svg,html body .customer-icon svg *{stroke:#4D49FF!important}
      html body .parameter-base-menu-head-icon,html body .parameter-base-subitem-icon{background:#EAF8F6!important;color:#4D49FF!important;box-shadow:none!important}
      html body .parameter-base-subitem:hover,html body .parameter-base-subitem.active{background:#EAF8F6!important;color:#4D49FF!important}
      html body .parameter-base-information-submenu{border-color:#DCE8EC!important;box-shadow:0 12px 32px #24254014!important}
    `;
    const finalStyles=`
      html body .topbar.parameter-header,html body .topbar.parameter-header *,html body .sidebar .sidebar-item,html body .sidebar .sidebar-item span,html body .sidebar-user-name,html body .admin-company-name,html body #header-parameter-brand,html body #admin-exit{color:#111!important}
      html body .sidebar .sidebar-item .admin-colored-icon{background:#ffffffdd!important;border-radius:8px!important}
      html body .related-label{display:inline-flex!important;align-items:center;justify-content:center;white-space:nowrap;border:1px solid #cbdde8!important;background:#eaf8f6!important;color:#244b64!important;border-radius:7px!important;padding:7px 12px!important;font:inherit!important;cursor:pointer;box-shadow:none!important}
      html body .related-label:hover{background:#d4f2ec!important}
      html body .related-label:focus-visible{outline:2px solid #4D49FF;outline-offset:2px}
      html body .admin-table .pmc-inline-tools,html body .admin-table .pmc-inline-filter,html body .admin-table .th-tools,html body .admin-table .th-search-row{display:none!important}
    `;
    frame.srcdoc='<!doctype html><html lang="fa" dir="rtl" translate="no" class="notranslate" data-theme="light"><head><meta charset="utf-8"><meta name="google" content="notranslate"><meta name="viewport" content="width=device-width,initial-scale=1">'+styles+'<style>'+css+purpleStyles+finalStyles+'</style></head><body>'+shell.outerHTML+'</body></html>';
    frame.onload=()=>{
      const d=frame.contentDocument;
      d.getElementById('admin-exit').onclick=()=>{frame.remove();document.querySelector('.login-admin-trigger')?.focus()};
      function closeMenus(){
        d.querySelectorAll('[data-submenu]').forEach(n=>n.classList.remove('open'));
        d.querySelectorAll('[data-group]').forEach(n=>{n.setAttribute('aria-expanded','false');n.parentElement.classList.remove('parameter-base-open')});
      }
      function select(i,j,tab=0){
        closeMenus();
        const tabs=i===1?productTabs[j]:groups[i][1];
        const selected=i===1?tab:j;
        const label=tabs[selected];
        d.querySelector('#page-title').textContent=label;
        d.querySelector('.breadcrumb').textContent='پنل ادمین / '+groups[i][0]+' / '+(i===1?groups[i][1][j]+' / ':'')+label;
        d.querySelectorAll('[data-group]').forEach(n=>n.classList.toggle('current',+n.dataset.group===i));
        d.querySelectorAll('[data-page]').forEach(n=>n.classList.toggle('active',n.dataset.page===i+':'+j));
        if(i===2){window.parameterAdminCustomers(d,j);return}
        if(i===0||i===3){window.parameterAdminSales(d,i===0,()=>select(3,0));return}
        d.getElementById('admin-content').innerHTML='<div class="group-tabs" role="tablist">'+tabs.map((t,k)=>'<button class="group-tab '+(k===selected?'active':'')+'" role="tab" aria-selected="'+(k===selected)+'" data-tab="'+k+'"><span class="parameter-tab-icon">'+svg+'</span>'+t+'</button>').join('')+'</div><div class="admin-toolbar"><input type="search" aria-label="جستجو در '+label+'" placeholder="جستجو در '+label+'…"><small>۰ مورد</small></div><div class="board-wrap"><table class="admin-table"><thead><tr><th>ردیف</th><th>عنوان</th><th>وضعیت</th><th>آخرین تغییر</th></tr></thead><tbody><tr><td colspan="4" class="admin-empty">اطلاعاتی برای نمایش وجود ندارد.</td></tr></tbody></table><div class="admin-footer">تعداد ردیف‌ها: ۰</div></div>';
        d.querySelectorAll('[data-tab]').forEach(n=>n.onclick=()=>i===1?select(i,j,+n.dataset.tab):select(i,+n.dataset.tab));
        d.querySelector('input[type=search]').oninput=e=>{d.querySelector('.admin-empty').textContent=e.target.value?'نتیجه‌ای یافت نشد.':'اطلاعاتی برای نمایش وجود ندارد.'};
      }
      d.querySelectorAll('[data-group]').forEach(n=>n.onclick=()=>{
        const i=+n.dataset.group;
        if(groups[i][1].length===1){select(i,0);return}
        const menu=d.getElementById('admin-menu-'+i),wasOpen=menu.classList.contains('open');
        closeMenus();if(wasOpen)return;
        menu.classList.add('open');n.setAttribute('aria-expanded','true');n.parentElement.classList.add('parameter-base-open');
        const rect=n.getBoundingClientRect(),width=menu.offsetWidth;
        menu.style.left=Math.max(8,Math.min(rect.left-width-8,d.documentElement.clientWidth-width-8))+'px';
        menu.style.top=Math.max(64,Math.min(rect.top,frame.contentWindow.innerHeight-menu.offsetHeight-8))+'px';
      });
      d.addEventListener('click',e=>{if(!e.target.closest('[data-group],[data-submenu]'))closeMenus()});
      d.addEventListener('keydown',e=>{if(e.key==='Escape'){const trigger=d.querySelector('[data-group][aria-expanded="true"]');closeMenus();trigger?.focus()}});
      frame.contentWindow.addEventListener('resize',closeMenus);
      d.querySelector('.sidebar-nav').addEventListener('scroll',closeMenus);
      d.querySelectorAll('[data-page]').forEach(n=>n.onclick=()=>select(...n.dataset.page.split(':').map(Number)));
      select(0,0);
    };
    document.body.appendChild(frame);
  }
  document.addEventListener('click',e=>{if(e.target.closest('.parameter-admin-trigger')){e.preventDefault();e.stopImmediatePropagation();open()}},true);
})();
