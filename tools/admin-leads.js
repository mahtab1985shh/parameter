/* Admin leads: local demo records; independent from the main Parameter workspace. */
(function () {
  'use strict';
  const KEY = 'parameter.admin.leads.v1';
  const CUSTOMER_KEY = 'parameter.admin.customers.v1';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fa = n => Number(n).toLocaleString('fa-IR');
  const today = () => {const now=new Date();return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');};
  const dateText = value => value ? new Date(value + 'T12:00:00Z').toLocaleDateString('fa-IR') : '—';
  const statuses = ['جدید', 'در تماس', 'واجد شرایط', 'تبدیل‌شده', 'رد شده'];
  const scores = ['داغ', 'گرم', 'سرد'];
  const products = ['پارامتر ابری', 'سازمانی'];
  const paths = {
    people:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M19 6v6m-3-3h6"/>',
    trend:'<path d="m3 17 6-6 4 4 8-10m-6 0h6v6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    view:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    edit:'<path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14v6Z"/>',
    delete:'<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
    swap:'<path d="M4 7h16l-4-4M20 17H4l4 4"/>',
    more:'<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
    download:'<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',
    search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>'
  };
  const icon = name => '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths[name] + '</svg>';
  function seed() {
    return [
      ['شرکت مهندسین مشاور سازه‌اندیش','مشاور ساختمانی','مهندس احمدی','مدیر فنی','کمپین دیجیتال لینکدین','CMP-DEMO-009',0,2,0,'مهندس رضایی',false,'دمو آنلاین',2],
      ['گروه ساختمانی آرمان سازه','پیمانکار ابنیه','مهندس کریمی','سرپرست کارگاه','پیامک پاییزه پیمانکاران','CMP-DEMO-008',1,1,0,'مهندس نادری',false,'ارسال پروپوزال',-2],
      ['شرکت راه و ساختمان پیشگام','پیمانکار راه و ابنیه','مهندس صادقی','مدیر پروژه','برنامه معرفی مشتریان','CMP-DEMO-006',1,0,1,'مهندس کاظمی',false,'تماس اول',1],
      ['دفتر فنی مهندس موسوی','مشاور دفتر فنی','مهندس موسوی','مالک','وبینار صورت‌وضعیت و تعدیل','CMP-DEMO-010',0,1,1,'مهندس رضایی',true,'پیگیری تلفنی',0],
      ['سازمان عمران شهری نمونه','کارفرمای دولتی','مهندس جعفری','معاون فنی','تماس ورودی','بدون کمپین',1,3,1,'مهندس فراهانی',false,'',null],
      ['شرکت تأسیسات نوین','پیمانکار تأسیسات','مهندس رحیمی','کارشناس کنترل پروژه','تبلیغات لینکدین — مدیران پروژه','CMP-DEMO-011',0,0,2,'مهندس نادری',true,'ارسال ایمیل معرفی',4],
      ['شرکت آبادگران شمال','پیمانکار ابنیه','مهندس قاسمی','مدیرعامل','فرم وب‌سایت','بدون کمپین',0,4,2,'مهندس کاظمی',true,'',null]
    ].map((r, i) => {
      const due = r[12] == null ? '' : new Date(Date.now() + r[12] * 86400000).toISOString().slice(0,10);
      return {id:'lead-demo-'+i, organization:r[0], industry:r[1], contact:r[2], role:r[3], phone:'', source:r[4], campaign:r[5], product:products[r[6]], status:statuses[r[7]], score:scores[r[8]], owner:r[9], accountType:r[10]?'free':'other', nextAction:r[11], due, created:today(), activities:[], rejection:r[7]===4?'نمونهٔ طراحی':'', sample:true};
    });
  }
  function readRows() {
    const stored = localStorage.getItem(KEY);
    if (!stored) return seed();
    const rows = JSON.parse(stored);
    if (!Array.isArray(rows) || rows.some(r => !r || typeof r.id !== 'string' || typeof r.organization !== 'string')) throw new Error('invalid data');
    return rows;
  }
  window.parameterAdminLeads = function (d, goCustomers) {
    const host = d.getElementById('admin-content');
    let rows, activeCategory = 'all', activeStage = 'leads', activePeriod = 'all', page = 1;
    const categories = [['companies','شرکت‌ها'],['people','اشخاص'],['members','اعضای سایت'],['free','کاربران رایگان']];
    const categoryOf = r => r.accountType==='free'?'free':(r.category||'companies');
    const selected = new Set(), size = 7;
    try { rows = readRows(); } catch { host.innerHTML='<p role="alert">اطلاعات لیدها از حافظهٔ مرورگر خوانده نشد؛ برای حفاظت از اطلاعات، تغییری ذخیره نشده است.</p>'; return; }
    if (!d.getElementById('admin-leads-style')) {
      const style = d.createElement('style'); style.id = 'admin-leads-style';
      style.textContent = `
        .leads-period{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:0 0 16px;color:#697C88;font-size:12px}.leads-period .leads-button{padding:7px 13px}.leads-type-filter{display:flex;align-items:center;gap:10px;color:#697C88;font-size:12px}.leads-type-filter select{font:inherit;padding:9px 12px;min-width:155px;background:#fff;color:#424b60;border:1px solid #DCE8EC;border-radius:8px}
        .leads-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:4px 0 14px}
        .leads-kpi{position:relative;display:grid;gap:10px;padding:20px;background:#fff;border:1px solid #DCE8EC;border-radius:12px;color:#697C88;font-size:12px;min-height:112px;box-sizing:border-box}
        .leads-kpi strong{font-size:25px;color:#4D49FF}.leads-kpi small{font-size:11px}.leads-kpi>i{position:absolute;left:20px;top:35px;display:grid;place-items:center;width:43px;height:43px;border-radius:14px;background:#eef1ff;color:#4D49FF}
        .leads-kpi:nth-child(2)>i{background:#e8fbf3;color:#00a67e}.leads-kpi:nth-child(3)>i{background:#fff4e9;color:#ed8124}
        #admin-content .leads-toolbar{flex-wrap:wrap;gap:10px;margin:0 0 14px;box-shadow:none!important}
        .leads-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;font:inherit;font-size:12px;border:1px solid #DCE8EC;border-radius:8px;background:#fff;color:#424b60;padding:10px 14px;cursor:pointer;white-space:nowrap}
        .leads-button.primary,.leads-button[aria-pressed=true]{background:#4D49FF;color:#fff;border-color:#4D49FF}.leads-button:disabled{opacity:.5;cursor:default}
        .leads-search{position:relative}.leads-search svg{position:absolute;right:10px;top:10px;color:#98a2b5}.leads-toolbar .leads-search input{width:290px;padding-right:36px;font-size:12px}
        .leads-toolbar .leads-spacer{flex:1}.leads-toolbar [data-count]{color:#697C88;font-size:11px;white-space:nowrap}
        #admin-content .leads-table{min-width:1570px!important;font-size:12px!important}.leads-table th{white-space:nowrap}.leads-table td{line-height:1.9;vertical-align:middle}.leads-table small{display:block;color:#8c94a4;font-size:10px;margin-top:3px}.leads-table input[type=checkbox]{accent-color:#4D49FF;width:15px;height:15px;cursor:pointer}
        #admin-content .leads-table tr.is-selected{background:#f3f3ff!important}.leads-company{min-width:200px}.leads-contact,.leads-source{min-width:175px}.leads-owner{white-space:nowrap}.leads-avatar{display:inline-grid;place-items:center;width:26px;height:26px;background:#6864f5;color:white;border-radius:50%;margin-left:7px}
        .leads-chip{display:inline-block;padding:3px 9px;border-radius:16px;font-size:11px;white-space:nowrap;font-weight:600}.leads-status-0{background:#e4f3ff;color:#1486bb}.leads-status-1{background:#fff1d2;color:#ad6900}.leads-status-2{background:#dcfbe8;color:#21834d}.leads-status-3{background:#eeeaff;color:#7551cd}.leads-status-4{background:#ffe6e6;color:#c73544}.leads-product{background:#e8f9fb;color:#208da2;border-radius:6px}.leads-free{color:#00846f!important}.leads-score{white-space:nowrap;font-weight:600}.leads-score-0,.leads-overdue{color:#db3544!important}.leads-score-1{color:#d67c00}.leads-score-2{color:#2474d5}
        .leads-actions{display:flex;align-items:center;gap:6px;white-space:nowrap}.leads-icon{display:inline-flex;align-items:center;border:0;background:transparent;color:#4D49FF;padding:5px;cursor:pointer}.leads-convert{background:#efefff;border:1px solid #d6d5ff;border-radius:7px;font:inherit;gap:4px}
        .leads-pagination{display:flex;justify-content:space-between;align-items:center;padding:14px;background:#fff;color:#697C88;font-size:11px;gap:12px;flex-wrap:wrap}.leads-pages{display:flex;gap:6px}.leads-pages button{padding:6px 11px}.leads-note{font-size:11px;color:#697C88;line-height:2;margin:12px 0}.leads-notice{font-size:12px;color:#8c432b;margin:8px 0}
        .leads-dialog{width:min(700px,92vw);max-height:90dvh;overflow:auto;border:1px solid #DCE8EC;border-radius:14px;background:white;color:#242540;padding:24px;font:13px Tahoma,sans-serif}.leads-dialog::backdrop{background:#24254055}.leads-dialog h2{font-size:17px;margin:0 0 18px}.leads-fields{display:grid;grid-template-columns:1fr 1fr;gap:15px}.leads-dialog label{display:grid;gap:7px}.leads-dialog input,.leads-dialog select,.leads-dialog textarea{font:inherit;color:inherit;padding:10px;border:1px solid #DCE8EC;border-radius:7px;min-width:0;background:#fff}.leads-dialog textarea{min-height:70px;resize:vertical}.leads-dialog footer{display:flex;gap:10px;justify-content:flex-end;margin-top:20px}.leads-dialog [role=alert]{color:#c73544}.leads-dialog dl{display:grid;grid-template-columns:140px 1fr;gap:13px}.leads-dialog dd{margin:0;overflow-wrap:anywhere}.leads-dialog dt{color:#697C88}.leads-menu{display:grid;gap:8px}.leads-menu button{justify-content:flex-start}.leads-dialog .wide{grid-column:1/-1}
        .leads-menu-dialog{position:fixed;inset:auto;margin:0;width:265px;box-sizing:border-box;padding:12px;box-shadow:0 16px 40px #24254026}.leads-menu-dialog::backdrop{background:transparent}.leads-menu-dialog h2{font-size:11px;color:#697C88;margin:4px 6px 12px}.leads-menu-dialog .leads-button{border:0;white-space:normal;text-align:right}.leads-menu-dialog .leads-button:hover{background:#f3f3ff}.leads-menu-dialog footer{margin-top:8px}
        @media(max-width:1150px){.leads-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.leads-kpis,.leads-fields{grid-template-columns:1fr}.leads-search,.leads-toolbar .leads-search input{width:100%}.leads-dialog dl{grid-template-columns:1fr}.leads-dialog dd{margin-bottom:8px}}
      `;
      d.head.appendChild(style);
    }
    function notice(message) { host.querySelector('[data-notice]').textContent = message; }
    function persist(next) {
      try { localStorage.setItem(KEY, JSON.stringify(next)); rows = next; return true; }
      catch { notice('ذخیره در مرورگر انجام نشد؛ تغییر اعمال نشده است.'); return false; }
    }
    function update(record, changes) { return persist(rows.map(r => r.id === record.id ? {...r, ...changes} : r)); }
    function modal(title, content) {
      const previous = d.activeElement, dialog = d.createElement('dialog'); dialog.className = 'leads-dialog'; dialog.setAttribute('aria-label', title);
      dialog.innerHTML = '<h2>'+esc(title)+'</h2>'+content;
      d.body.appendChild(dialog); dialog.querySelectorAll('[data-close]').forEach(b => b.onclick = () => dialog.close());
      dialog.onclose = () => { dialog.remove(); if (previous?.isConnected) previous.focus(); };
      dialog.showModal(); return dialog;
    }
    const footer = (label='ذخیره') => '<p role="alert"></p><footer><button type="button" class="leads-button" data-close>بستن</button><button type="submit" class="leads-button primary">'+label+'</button></footer>';
    const formFields = [['organization','نام سازمان / شرکت'],['industry','حوزه فعالیت'],['contact','نام شخص رابط'],['role','سمت رابط'],['phone','شماره تماس'],['source','منبع / کمپین معرف'],['campaign','کد کمپین'],['owner','کارشناس مسئول'],['nextAction','اقدام بعدی'],['due','تاریخ اقدام بعدی']];
    function editor(record) {
      const r = record ? {...record,category:categoryOf(record)} : {product:products[0],score:'گرم',status:'جدید',accountType:activeCategory==='free'?'free':'other',category:activeCategory==='all'?'companies':activeCategory};
      const fields = r.category==='companies'?companyFields:r.category==='people'?peopleFields:formFields;
      const select = (key,label,options) => '<label>'+label+'<select name="'+key+'">'+options.map(([v,n])=>'<option value="'+esc(v)+'" '+(r[key]===v?'selected':'')+'>'+n+'</option>').join('')+'</select></label>';
      const dialog = modal(record?'ویرایش لید':'ثبت لید جدید','<form><div class="leads-fields">'+fields.map(([key,label])=>'<label>'+label+'<input name="'+key+'" type="'+(key==='due'?'date':key==='phone'?'tel':['userCount','rialValue'].includes(key)?'number':'text')+'" maxlength="250" '+(['userCount','rialValue'].includes(key)?'min="0" step="1" ':'')+(key==='organization'?'required':'')+' value="'+esc(r[key]??'')+'"></label>').join('')+select('product',r.category==='companies'?'محصول':'محصول موردعلاقه',products.map(v=>[v,v]))+select('score','امتیاز',scores.map(v=>[v,v]))+select('category','گروه لید',categories)+'</div>'+footer()+'</form>');
      dialog.querySelector('form').onsubmit = e => {
        e.preventDefault(); const next = {...r}; fields.forEach(([k]) => next[k]=dialog.querySelector('[name='+k+']').value.trim());
        if (!next.organization) return;
        for(const key of ['userCount','rialValue']){if(next[key]!==undefined&&next[key]!==''){const n=Number(next[key]);if(!Number.isSafeInteger(n)||n<0){dialog.querySelector('[role=alert]').textContent='تعداد کاربر و ارزش ریالی باید عدد صحیح و نامنفی باشند.';return;}next[key]=n;}}
        ['product','score','category'].forEach(k=>next[k]=dialog.querySelector('[name='+k+']').value);
        next.accountType=next.category==='free'?'free':'other';
        if (!record) Object.assign(next,{id:crypto.randomUUID(),created:today(),activities:[],...(activeStage==='opportunities'?{opportunity:next.organization}:{})});
        if (!persist(record?rows.map(item=>item.id===r.id?next:item):[next,...rows])) { dialog.querySelector('[role=alert]').textContent='ذخیره ناموفق بود.'; return; }
        dialog.close(); render();
      };
    }
    function view(r) {
      const pairs=[...(categoryOf(r)==='companies'?companyFields:categoryOf(r)==='people'?peopleFields:formFields).map(([k,label])=>[label,k==='due'?dateText(r[k]):r[k]]),['محصول',r.product],['وضعیت',r.status],['نوع کاربر',r.accountType==='free'?'کاربر رایگان':'سایر لیدها'],['تاریخ ثبت',dateText(r.created)],['دلیل رد',r.rejection],['فرصت فروش',r.opportunity]];
      modal('مشاهده لید — '+r.organization,'<dl>'+pairs.map(([label,v])=>'<dt>'+label+'</dt><dd>'+esc(v??'—')+'</dd>').join('')+'</dl><h3>فعالیت‌ها</h3>'+((r.activities||[]).map(a=>'<p>'+esc(a.text)+' <small>'+dateText(a.date)+'</small></p>').join('')||'<p>فعالیتی ثبت نشده است.</p>')+'<footer><button class="leads-button" data-close>بستن</button></footer>');
    }
    function textAction(r,title,key,label) {
      const dialog=modal(title,'<form><label>'+label+'<textarea name="value" maxlength="1000" required>'+esc(key==='owner'?r.owner:'')+'</textarea></label>'+footer()+'</form>');
      dialog.querySelector('form').onsubmit=e=>{e.preventDefault();const value=dialog.querySelector('textarea').value.trim();if(!value)return;const changes=key==='activity'?{activities:[...(r.activities||[]),{text:value,date:today()}]}:key==='rejection'?{rejection:value,status:'رد شده'}:{[key]:value};if(update(r,changes)){dialog.close();render()}else dialog.querySelector('[role=alert]').textContent='ذخیره ناموفق بود.';};
    }
    function convert(r) {
      if (r.status==='تبدیل‌شده') { notice('این لید قبلاً تبدیل شده است.'); return; }
      const dialog=modal('تبدیل به مشتری','<p>«'+esc(r.organization)+'» به مشتریان سازمانی اضافه شود؟ منبع، کمپین و رابط در پروندهٔ مشتری حفظ می‌شوند.</p><form>'+footer('تبدیل به مشتری')+'</form>');
      dialog.querySelector('form').onsubmit=e=>{
        e.preventDefault();
        const error=dialog.querySelector('[role=alert]');
        try {
          const raw=localStorage.getItem(CUSTOMER_KEY), data=raw?JSON.parse(raw):{people:[{id:'p1',values:['علی','رضایی','—','—','—']},{id:'p2',values:['سارا','احمدی','—','—','—']}],companies:[{id:'c1',values:['شرکت نمونه پارامتر','—','—','—','—']}]};
          if (!data || typeof data!=='object' || Array.isArray(data) || (data.companies && !Array.isArray(data.companies))) throw new Error('invalid customer data');
          const id='lead-customer-'+r.id;
          if (!(data.companies||[]).some(c=>c.id===id)) {
            data.companies=[...(data.companies||[]),{id,values:[r.organization,'—','—',r.phone||'—','—'],leadId:r.id,source:r.source,campaign:r.campaign}];
            data[id+':colleagues']=r.contact?[{id:crypto.randomUUID(),values:[r.contact,r.role||'',r.phone||'']}]:[];
          }
          // Store the customer first; stable IDs make a retry safe if lead storage fails.
          localStorage.setItem(CUSTOMER_KEY,JSON.stringify(data));
          if (!update(r,{status:'تبدیل‌شده',customerId:id})) { error.textContent='مشتری ذخیره شد، اما وضعیت لید ذخیره نشد. می‌توانید دوباره تلاش کنید؛ مشتری تکراری ساخته نمی‌شود.'; return; }
          dialog.close();render();notice('لید به مشتریان سازمانی اضافه شد.');
        } catch { error.textContent='اطلاعات مشتریان خوانده یا ذخیره نشد؛ تبدیل تکمیل نشده است.'; }
      };
    }
    function more(r, trigger) {
      const dialog=modal('عملیات — '+r.organization,'<div class="leads-menu">'+[['convert','تبدیل به مشتری'],['opportunity','ثبت فرصت فروش'],['qualify','علامت‌گذاری «واجد شرایط»'],['contact','علامت‌گذاری «در تماس»'],['reject','رد لید با ذکر دلیل'],['activity','ثبت فعالیت — تماس / جلسه / یادداشت'],['assign','واگذاری به کارشناس']].map(([a,label])=>'<button class="leads-button" data-more="'+a+'" '+(r.status==='تبدیل‌شده'&&['convert','qualify','contact','reject'].includes(a)?'disabled':'')+'>'+label+'</button>').join('')+'</div><footer><button class="leads-button" data-close>بستن</button></footer>');
      dialog.classList.add('leads-menu-dialog');
      const rect=trigger.getBoundingClientRect(), viewport=d.defaultView;
      dialog.style.left=Math.max(8,Math.min(rect.left,viewport.innerWidth-dialog.offsetWidth-8))+'px';
      dialog.style.top=Math.max(8,Math.min(rect.bottom+6,viewport.innerHeight-dialog.offsetHeight-8))+'px';
      dialog.addEventListener('click',e=>{const bounds=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<bounds.left||e.clientX>bounds.right||e.clientY<bounds.top||e.clientY>bounds.bottom))dialog.close()});
      dialog.querySelectorAll('[data-more]').forEach(b=>b.onclick=()=>{dialog.close();const a=b.dataset.more;if(a==='convert')convert(r);else if(a==='qualify'||a==='contact'){if(update(r,{status:a==='qualify'?'واجد شرایط':'در تماس'}))render();}else if(a==='reject')textAction(r,'رد لید','rejection','دلیل رد');else if(a==='activity')textAction(r,'ثبت فعالیت','activity','شرح تماس، جلسه یا یادداشت');else if(a==='assign')textAction(r,'واگذاری به کارشناس','owner','نام کارشناس');else textAction(r,'ثبت فرصت فروش در پروندهٔ لید','opportunity','عنوان و توضیحات فرصت فروش');});
    }
    function remove(r) {
      const dialog=modal('حذف لید','<p>«'+esc(r.organization)+'» حذف شود؟ پروندهٔ مشتریِ تبدیل‌شده حذف نخواهد شد.</p><form>'+footer('حذف')+'</form>');
      dialog.querySelector('form').onsubmit=e=>{e.preventDefault();if(persist(rows.filter(item=>item.id!==r.id))){selected.delete(r.id);dialog.close();render()}else dialog.querySelector('[role=alert]').textContent='حذف ذخیره نشد.';};
    }
    function inPeriod(r) {
      if(activePeriod==='all')return true;
      if(!r.created)return false;
      const now=new Date(), date=new Date(r.created+'T12:00:00');
      if(Number.isNaN(date.getTime()))return false;
      const localDay=x=>[x.getFullYear(),String(x.getMonth()+1).padStart(2,'0'),String(x.getDate()).padStart(2,'0')].join('-');
      if(activePeriod==='today')return r.created===localDay(now);
      if(activePeriod==='month')return date.toLocaleDateString('fa-IR',{year:'numeric',month:'numeric'})===now.toLocaleDateString('fa-IR',{year:'numeric',month:'numeric'})&&r.created<=localDay(now);
      const start=new Date(now);start.setDate(start.getDate()-(start.getDay()+1)%7);
      return r.created>=localDay(start)&&r.created<=localDay(now);
    }
    function filtered() {
      return rows.filter(r=>(activeCategory==='all'||categoryOf(r)===activeCategory)&&(activeStage==='leads'||Boolean(r.opportunity))&&inPeriod(r));
    }
    function exportRows() {
      const cols=[...formFields,['product','محصول'],['status','وضعیت'],['accountType','نوع کاربر'],['created','تاریخ ثبت']];
      const cell=v=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,"'$&").replace(/"/g,'""')+'"';
      const csv='\ufeff'+[cols.map(c=>cell(c[1])).join(','),...filtered().map(r=>cols.map(([k])=>cell(k==='accountType'?(r[k]==='free'?'کاربران رایگان':'سایر لیدها'):r[k])).join(','))].join('\r\n');
      const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})), a=d.createElement('a');a.href=url;a.download='parameter-leads.csv';d.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
      notice('خروجی CSV قابل باز شدن در اکسل، از ردیف‌های فیلترشده تهیه شد.');
    }
    function bulkImport() {
      const dialog=modal('ورود گروهی لیدها','<p>از اکسل این پنج ستون را به همین ترتیب کپی کنید (بدون عنوان ستون): نام سازمان، نام رابط، تلفن، محصول، نوع کاربر.</p><p>محصول: «پارامتر ابری» یا «سازمانی»؛ نوع کاربر: «رایگان» یا «سایر».</p><form><label>ردیف‌های کپی‌شده از اکسل<textarea name="rows" rows="9" required aria-label="ردیف‌های ورود گروهی"></textarea></label>'+footer('افزودن ردیف‌ها')+'</form>');
      dialog.querySelector('form').onsubmit=e=>{
        e.preventDefault();const lines=dialog.querySelector('textarea').value.trim().split(/\r?\n/).filter(Boolean), items=[];
        if(lines.length>500){dialog.querySelector('[role=alert]').textContent='در هر بار حداکثر ۵۰۰ ردیف وارد کنید.';return;}
        for(let i=0;i<lines.length;i++){const c=lines[i].split('\t').map(v=>v.trim());if(c.length!==5||!c[0]||!products.includes(c[3])||!['رایگان','سایر'].includes(c[4])){dialog.querySelector('[role=alert]').textContent='ستون‌های ردیف '+fa(i+1)+' صحیح نیست؛ هیچ ردیفی وارد نشده است.';return;}items.push({id:crypto.randomUUID(),organization:c[0],contact:c[1],phone:c[2],product:c[3],accountType:c[4]==='رایگان'?'free':'other',source:'ورود گروهی',status:'جدید',score:'گرم',created:today(),activities:[]});}
        if(persist([...items,...rows])){dialog.close();page=1;render();notice(fa(items.length)+' لید اضافه شد.');}else dialog.querySelector('[role=alert]').textContent='ذخیره ناموفق بود.';
      };
    }
    const companyFields = [['organization','نام شرکت'],['activityType','نوع فعالیت'],['industry','حوزه فعالیت'],['province','استان'],['city','شهر'],['source','نحوه آشنایی'],['owner','مسئول پیگیری'],['userCount','تعداد کاربر'],['rialValue','ارزش ریالی'],['nextAction','اقدام بعدی'],['due','تاریخ پیگیری'],['contact','نام شخص رابط'],['role','سمت رابط'],['phone','شماره تماس']];
    const peopleFields = [['organization','نام'],['lastName','نام خانوادگی'],['nationalCode','کد ملی'],['phone','موبایل'],...companyFields.filter(([k])=>!['organization','activityType','contact','role','phone'].includes(k))];
    function tableTitles() {
      if(activeCategory==='people')return ['ردیف','نام','نام خانوادگی','کد ملی','موبایل','حوزه فعالیت','استان','شهر','نحوه آشنایی','مسئول پیگیری','محصول','تعداد کاربر','اقدام بعدی','تاریخ پیگیری','وضعیت','عملیات'];
      return activeCategory==='companies'
        ? ['ردیف','نام شرکت','نوع فعالیت','حوزه فعالیت','استان','شهر','نحوه آشنایی','مسئول پیگیری','محصول','تعداد کاربر','اقدام بعدی','تاریخ پیگیری','وضعیت','عملیات']
        : ['ردیف','نام سازمان / شرکت','شخص رابط / تماس','منبع / کمپین معرف','محصول موردعلاقه','امتیاز','وضعیت','کارشناس مسئول','اقدام بعدی','تاریخ ثبت','عملیات'];
    }
    function companyCells(r) {
      const number=v=>v===undefined||v===null||v===''?'—':Number.isFinite(Number(v))?fa(v):esc(v);
      return '<td class="leads-company"><strong>'+esc(r.organization)+'</strong></td>'+(activeCategory==='people'?'<td>'+esc(r.lastName||'—')+'</td><td>'+esc(r.nationalCode||'—')+'</td><td>'+esc(r.phone||'—')+'</td>':'<td>'+esc(r.activityType||'—')+'</td>')+
        [r.industry,r.province,r.city,r.source].map(v=>'<td>'+esc(v||'—')+'</td>').join('')+
        '<td class="leads-owner"><span class="leads-avatar">'+esc((r.owner||'؟').replace('مهندس ','').slice(0,1))+'</span>'+esc(r.owner||'تعیین نشده')+'</td>'+
        '<td><span class="leads-chip leads-product">'+esc(r.product||'—')+'</span></td>'+
        '<td>'+number(r.userCount)+'</td>'+
        '<td>'+esc(r.nextAction||'—')+'</td><td><span class="'+(r.due&&r.due<today()&&!['تبدیل‌شده','رد شده'].includes(r.status)?'leads-overdue':'')+'">'+dateText(r.due)+'</span></td>'+
        '<td><span class="leads-chip leads-status-'+statuses.indexOf(r.status)+'">● '+esc(r.status)+'</span></td>';
    }
    function paintRows() {
      host.querySelector('thead tr').innerHTML='<th><input type="checkbox" data-select-all aria-label="انتخاب همه ردیف‌های این صفحه"></th>'+['نوع',...tableTitles()].map(t=>'<th>'+t+'</th>').join('');
      const matches=filtered(), pages=Math.max(1,Math.ceil(matches.length/size));page=Math.max(1,Math.min(page,pages));
      const shown=matches.slice((page-1)*size,page*size);
      
      host.querySelector('tbody').innerHTML=shown.map((r,i)=>'<tr data-row="'+esc(r.id)+'" class="'+(selected.has(r.id)?'is-selected':'')+'"><td><input type="checkbox" data-select="'+esc(r.id)+'" aria-label="انتخاب '+esc(r.organization)+'" '+(selected.has(r.id)?'checked':'')+'></td><td>'+esc(categories.find(c=>c[0]===categoryOf(r))?.[1]||'—')+'</td><td>'+fa((page-1)*size+i+1)+'</td>'+(['companies','people'].includes(activeCategory)?companyCells(r):'<td class="leads-company"><strong>'+esc(r.organization)+'</strong><small>'+esc(r.industry||'—')+'</small></td><td class="leads-contact">'+esc(r.contact||'—')+'<small>'+esc([r.role,r.phone].filter(Boolean).join(' · ')||'—')+'</small></td><td class="leads-source">'+esc(r.source||'—')+'<small>'+esc(r.campaign||'بدون کمپین')+'</small></td><td><span class="leads-chip leads-product">'+esc(r.product)+'</span>'+(r.accountType==='free'?'<small class="leads-free">کاربر رایگان</small>':'')+'</td><td><span class="leads-score leads-score-'+scores.indexOf(r.score)+'">● '+esc(r.score)+'</span></td><td><span class="leads-chip leads-status-'+statuses.indexOf(r.status)+'">● '+esc(r.status)+'</span></td><td class="leads-owner"><span class="leads-avatar">'+esc((r.owner||'؟').replace('مهندس ','').slice(0,1))+'</span>'+esc(r.owner||'تعیین نشده')+'</td><td><span class="'+(r.due&&r.due<today()&&!['تبدیل‌شده','رد شده'].includes(r.status)?'leads-overdue':'')+'">'+dateText(r.due)+'</span><small>'+esc(r.nextAction||'—')+'</small></td><td>'+dateText(r.created)+'</td>')+'<td><div class="leads-actions">'+[['view','مشاهده'],['edit','ویرایش'],['delete','حذف'],['swap','تبدیل به مشتری'],['related','فرم‌های مرتبط']].map(([a,label])=>'<button class="'+(a==='related'?'leads-button related-label':'leads-icon')+'" type="button" data-action="'+a+'" data-id="'+esc(r.id)+'" title="'+label+'" aria-label="'+label+' '+esc(r.organization)+'">'+(a==='related'?'فرم‌های مرتبط':icon(a))+'</button>').join('')+'</div></td></tr>').join('')||'<tr><td colspan="'+(tableTitles().length+2)+'" class="admin-empty">'+'رکوردی مطابق فیلترهای انتخاب‌شده پیدا نشد.'+'</td></tr>';
      const all=host.querySelector('[data-select-all]');all.checked=shown.length>0&&shown.every(r=>selected.has(r.id));all.indeterminate=shown.some(r=>selected.has(r.id))&&!all.checked;all.disabled=!shown.length;
      host.querySelector('[data-range]').textContent='نمایش '+(matches.length?fa((page-1)*size+1)+'–'+fa(Math.min(page*size,matches.length)):'۰')+' از '+fa(matches.length)+' لید · '+fa(selected.size)+' مورد انتخاب‌شده';
      const pageNumbers=[...new Set([1,page-1,page,page+1,pages])].filter(p=>p>0&&p<=pages).sort((a,b)=>a-b);
      host.querySelector('[data-pages]').innerHTML='<button class="leads-button" data-page="'+(page-1)+'" aria-label="صفحه قبل" '+(page===1?'disabled':'')+'>‹</button>'+pageNumbers.map(p=>'<button class="leads-button '+(p===page?'primary':'')+'" data-page="'+p+'" '+(p===page?'aria-current="page"':'')+'>'+fa(p)+'</button>').join('')+'<button class="leads-button" data-page="'+(page+1)+'" aria-label="صفحه بعد" '+(page===pages?'disabled':'')+'>›</button>';
      host.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{page=Number(b.dataset.page);paintRows()});
      host.querySelectorAll('[data-select]').forEach(b=>b.onchange=()=>{b.checked?selected.add(b.dataset.select):selected.delete(b.dataset.select);paintRows()});
      all.onchange=()=>{shown.forEach(r=>all.checked?selected.add(r.id):selected.delete(r.id));paintRows()};
      host.querySelector('tbody').onclick=e=>{const b=e.target.closest('[data-action]');if(!b)return;const r=rows.find(r=>r.id===b.dataset.id);if(!r)return;({view,edit:editor,delete:remove,swap:convert,related:relatedPage})[b.dataset.action](r,b)};
    }


    function generalForm(content,r){
      if(!d.getElementById('lead-general-style')){
        const st=d.createElement('style');st.id='lead-general-style';st.textContent=`
        .lg-hero{display:flex;align-items:center;gap:16px;padding:22px;border:1px solid #dddffd;border-radius:16px;background:linear-gradient(110deg,#f0efff,#f0fbfa);margin-bottom:18px}.lg-hero h2{margin:0 0 6px;font-size:19px}.lg-hero p{margin:0;color:#697c88;font-size:12px}.lg-emblem{display:grid;place-items:center;width:52px;height:52px;border-radius:16px;background:#4d49ff;color:#fff}
        .lg-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.lg-card{background:#fff;border:1px solid #dce8ec;border-radius:16px;padding:20px;box-shadow:0 5px 18px #24254006;border-top:3px solid var(--lg-accent,#4d49ff)}.lg-card h3{display:flex;gap:9px;align-items:center;margin:0 0 22px;font-size:14px;color:var(--lg-accent,#4d49ff)}.lg-fields{display:grid;gap:16px}.lg-fields label{display:grid;gap:8px;font-size:12px;color:#4b5466}.lg-fields input:not([type=radio]),.lg-fields select,.lg-fields textarea{width:100%;box-sizing:border-box;min-width:0;font:inherit;padding:11px 12px;border:1px solid #dce3ee;border-radius:9px;background:#fafbfe;color:#242540}.lg-fields input:read-only{background:#f1f4f8;color:#738096}.lg-fields input[type=range]{accent-color:#4d49ff;padding:0}.lg-fields fieldset{border:0;padding:0;margin:0}.lg-fields legend{font-size:12px;margin-bottom:10px}.lg-radios{display:flex;flex-wrap:wrap;gap:8px}.lg-radios label{display:flex;align-items:center;gap:5px;padding:8px;background:#f4f3ff;border-radius:8px}.lg-radios input{accent-color:#4d49ff}.lg-wide{grid-column:1/-1}.lg-bottom{display:flex;justify-content:space-between;align-items:center;margin-top:18px;gap:12px}.lg-sample{display:inline-block;font-size:10px;background:#fff0d8;color:#976315;padding:2px 7px;border-radius:6px;margin-right:7px}.lg-progress{display:flex;justify-content:space-between;color:#4d49ff}.lg-required{color:#d74d70}@media(max-width:1100px){.lg-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:650px){.lg-grid{grid-template-columns:1fr}.lg-bottom{flex-wrap:wrap}}
        `;d.head.appendChild(st);
      }
      const required=new Set(['organization','owner','source','product','userCount','rialValue','status']);
      const label=(k,t)=>t+(required.has(k)?' <span class="lg-required">*</span>':'');
      const input=(k,t,type='text',readOnly=false)=>'<label><span>'+label(k,t)+'</span><input name="'+k+'" type="'+type+'" value="'+esc(k==='created'?dateText(r.created):r[k]??'')+'" '+(required.has(k)?'required ':'')+(readOnly?'readonly ':'')+(['userCount','rialValue'].includes(k)?'min="0" step="1" ':'')+(k==='nationalId'?'inputmode="numeric" pattern="[0-9۰-۹٠-٩]{11}" maxlength="11" ':'maxlength="250" ')+'></label>';
      const select=(k,t,options)=>'<label><span>'+label(k,t)+'</span><select name="'+k+'" '+(required.has(k)?'required':'')+'><option value="">انتخاب کنید</option>'+[...new Set([r[k],...options].filter(Boolean))].map(v=>'<option value="'+esc(v)+'" '+(r[k]===v?'selected':'')+'>'+esc(v)+'</option>').join('')+'</select></label>';
      const card=(title,color,ico,body)=>'<section class="lg-card" style="--lg-accent:'+color+'"><h3>'+icon(ico)+title+'</h3><div class="lg-fields">'+body+'</div></section>';
      content.innerHTML='<div class="lg-hero"><span class="lg-emblem">'+icon('people')+'</span><div><h2>'+esc(r.organization)+'</h2><p>پروندهٔ لید · اطلاعات هویتی، تجاری و پیگیری</p></div></div><form data-general-form><div class="lg-grid">'+
        card('هویت و مشخصات شرکت','#4d49ff','people',input('organization','نام شرکت')+input('nationalId','شناسه ملی')+select('companyType','نوع شرکت',['خصوصی','دولتی','عمومی','تعاونی'])+input('creator','ایجادکننده','text',true)+input('created','تاریخ ایجاد','text',true))+
        card('فعالیت و موقعیت','#009c88','target',input('industry','حوزه فعالیت')+input('activityType','نوع فعالیت')+input('province','استان')+input('city','شهر')+select('source','نحوه آشنایی',['ارتباط مستقیم (Cold Call)','معرفی','وب‌سایت','نمایشگاه','شبکه‌های اجتماعی']))+
        card('محصول و پیگیری','#da8922','trend',select('product','محصول',products)+input('userCount','تعداد کاربر مورد نیاز','number')+input('rialValue','ارزش ریالی','number')+input('owner','مسئول پیگیری')+select('status','وضعیت',[...statuses,'پایلوت','قرارداد','پیگیری عقد قرارداد','برگزاری جلسه دمو','مذاکره اولیه تلفنی']))+
        '<section class="lg-card lg-wide"><h3>'+icon('clock')+'مسیر همکاری و توضیحات</h3><div class="lg-fields"><fieldset><legend>دسته‌بندی <span class="lg-required">*</span></legend><div class="lg-radios">'+['سرنخ','فرصت','مشتری','همکاری','لغو شده'].map(v=>'<label><input type="radio" name="relationshipStage" value="'+v+'" '+((r.relationshipStage||'سرنخ')===v?'checked':'')+' required>'+v+'</label>').join('')+'</div></fieldset><label><span class="lg-progress"><span>درصد پیشرفت</span><output data-progress>'+fa(r.progress??0)+'٪</output></span><input type="range" name="progress" min="0" max="100" step="0.01" value="'+esc(r.progress??0)+'"></label><label>نکات تکمیلی (حداکثر ۲۰۰۰ حرف)<textarea name="notes" maxlength="2000" rows="4" placeholder="توضیحات و نکات مهم این پرونده…">'+esc(r.notes||'')+'</textarea><small data-notes-count>'+fa((r.notes||'').length)+' / ۲۰۰۰</small></label></div></section></div><div class="lg-bottom"><span role="status" data-general-message>تغییرات پس از ذخیره در همین مرورگر نگهداری می‌شوند.</span><button type="submit" class="leads-button primary">ذخیره اطلاعات کلی</button></div></form>';
      const form=content.querySelector('form');
      form.querySelector('[name=progress]').oninput=e=>form.querySelector('[data-progress]').textContent=fa(e.target.value)+'٪';
      form.querySelector('[name=notes]').oninput=e=>form.querySelector('[data-notes-count]').textContent=fa(e.target.value.length)+' / ۲۰۰۰';
      form.onsubmit=e=>{
        e.preventDefault();const next={};
        ['organization','nationalId','companyType','industry','activityType','province','city','source','product','owner','status','notes'].forEach(k=>next[k]=form.querySelector('[name='+k+']').value.trim());
        const msg=form.querySelector('[data-general-message]');
        if([...required].some(k=>!['userCount','rialValue'].includes(k)&&!next[k])){msg.textContent='فیلدهای ستاره‌دار را تکمیل کنید.';return;}
        for(const k of ['userCount','rialValue']){next[k]=Number(form.querySelector('[name='+k+']').value);if(!Number.isSafeInteger(next[k])||next[k]<0){msg.textContent='تعداد کاربر و ارزش ریالی باید عدد صحیح نامنفی باشند.';return;}}
        next.progress=Number(form.querySelector('[name=progress]').value);next.relationshipStage=form.querySelector('[name=relationshipStage]:checked').value;
        if(update(r,next)){relatedPage(r,0);host.querySelector('[data-general-message]').textContent='اطلاعات با موفقیت ذخیره شد.';}else msg.textContent='ذخیره انجام نشد.';
      };
    }
    function demoRelated(r,key){
      const id=n=>'sample-'+r.id+'-'+key+'-'+n;
      const names=['کارشناس نمونه الف','کارشناس نمونه ب'];
      const data={
        actions:[{id:id(1),title:'هماهنگی جلسه معرفی محصول',owner:names[0],due:today(),status:'در حال پیگیری',notes:'دادهٔ نمونه: ارائه قابلیت‌ها و پاسخ به پرسش‌ها'},{id:id(2),title:'ارسال پیشنهاد اولیه',owner:names[1],due:today(),status:'برنامه‌ریزی‌شده',notes:'دادهٔ نمونه: بررسی تعداد کاربران'}],
        people:[{id:id(1),name:'شخص نمونه اول',role:'مدیر فناوری اطلاعات',phone:'',email:'contact@example.com'},{id:id(2),name:'شخص نمونه دوم',role:'کارشناس قراردادها',phone:'',email:'contracts@example.com'}],
        requests:[{id:id(1),title:'درخواست نسخه آزمایشی',date:today(),status:'در حال بررسی',notes:'دادهٔ نمونه: دسترسی آزمایشی برای تیم'},{id:id(2),title:'درخواست آموزش اولیه',date:today(),status:'ثبت‌شده',notes:'دادهٔ نمونه: جلسه آنلاین آشنایی'}],
        issues:[{id:id(1),title:'نیاز به تأیید بودجه',owner:names[0],status:'باز',notes:'دادهٔ نمونه: منتظر بررسی داخلی'},{id:id(2),title:'ابهام در انتقال اطلاعات',owner:names[1],status:'در حال بررسی',notes:'دادهٔ نمونه: بررسی قالب داده‌های قبلی'}]
      };
      return (data[key]||[]).map(x=>({...x,sample:true}));
    }

    function relatedPage(record, selectedTab=0) {
      if(typeof selectedTab!=='number')selectedTab=0;
      const r=rows.find(item=>item.id===record.id);
      if(!r){render();return;}
      const tabs=['اطلاعات کلی','اقدامات','اشخاص مرتبط','درخواست‌های مشتری','موانع و مشکلات'];
      const schemas={
        1:[['title','عنوان اقدام'],['owner','مسئول'],['due','تاریخ پیگیری'],['status','وضعیت'],['notes','توضیحات']],
        2:[['name','نام و نام خانوادگی'],['role','سمت'],['phone','تلفن'],['email','ایمیل']],
        3:[['title','عنوان درخواست'],['date','تاریخ درخواست'],['status','وضعیت'],['notes','توضیحات']],
        4:[['title','عنوان مانع / مشکل'],['owner','مسئول پیگیری'],['status','وضعیت'],['notes','توضیحات']]
      };
      const key=['','actions','people','requests','issues'][selectedTab];
      d.querySelector('#page-title').textContent='فرم‌های مرتبط — '+r.organization;
      d.querySelector('.breadcrumb').textContent='پنل ادمین / لیدها / '+r.organization+' / '+tabs[selectedTab];
      host.innerHTML='<button type="button" class="leads-button" data-related-back>بازگشت به لیدها</button><div class="group-tabs" role="tablist" aria-label="فرم‌های مرتبط">'+tabs.map((label,i)=>'<button type="button" role="tab" aria-selected="'+(i===selectedTab)+'" class="group-tab '+(i===selectedTab?'active':'')+'" data-related-tab="'+i+'"><span class="parameter-tab-icon">'+icon('people')+'</span>'+label+'</button>').join('')+'</div><div data-related-content></div><p class="leads-note" data-notice role="status">اطلاعات این صفحه فقط به همین لید مربوط است و در همین مرورگر ذخیره می‌شود.</p>';
      host.querySelector('[data-related-back]').onclick=render;
      host.querySelectorAll('[data-related-tab]').forEach(b=>b.onclick=()=>relatedPage(r,Number(b.dataset.relatedTab)));
      const content=host.querySelector('[data-related-content]');
      if(selectedTab===0){generalForm(content,r);return;}
      const fields=schemas[selectedTab], entries=r.relatedForms?.[key]??demoRelated(r,key);
      function saveEntries(next){return update(r,{relatedForms:{...r.relatedForms,[key]:next}});}
      function editEntry(entry){
        const dialog=modal((entry?'ویرایش':'ثبت')+' — '+tabs[selectedTab],'<form><div class="leads-fields">'+fields.map(([k,label],i)=>'<label>'+label+'<input name="'+k+'" type="'+(['date','due'].includes(k)?'date':k==='email'?'email':'text')+'" value="'+esc(entry?.[k]??'')+'" maxlength="1000" '+(i===0?'required':'')+'></label>').join('')+'</div>'+footer()+'</form>');
        dialog.querySelector('form').onsubmit=e=>{e.preventDefault();const item={...entry,id:entry?.id||crypto.randomUUID()};fields.forEach(([k])=>item[k]=dialog.querySelector('[name='+k+']').value.trim());if(!item[fields[0][0]])return;if(!saveEntries(entry?entries.map(x=>x.id===entry.id?item:x):[...entries,item])){dialog.querySelector('[role=alert]').textContent='ذخیره انجام نشد.';return;}dialog.close();relatedPage(r,selectedTab);};
      }
      content.innerHTML='<div class="admin-toolbar leads-toolbar" style="justify-content:flex-end"><button class="leads-button primary" data-related-create>＋ ثبت '+tabs[selectedTab]+'</button></div><div class="board-wrap"><table class="admin-table"><thead><tr><th>ردیف</th>'+fields.map(([,label])=>'<th>'+label+'</th>').join('')+'<th>عملیات</th></tr></thead><tbody>'+entries.map((item,i)=>'<tr><td>'+fa(i+1)+(item.sample?'<span class="lg-sample">نمونه</span>':'')+'</td>'+fields.map(([k])=>'<td>'+esc(['date','due'].includes(k)?dateText(item[k]):item[k]||'—')+'</td>').join('')+'<td><button class="leads-icon" title="ویرایش" aria-label="ویرایش" data-related-edit="'+esc(item.id)+'">'+icon('edit')+'</button><button class="leads-icon" title="حذف" aria-label="حذف" data-related-delete="'+esc(item.id)+'">'+icon('delete')+'</button></td></tr>').join('')+(entries.length?'':'<tr><td class="admin-empty" colspan="'+(fields.length+2)+'">اطلاعاتی برای نمایش وجود ندارد.</td></tr>')+'</tbody></table></div>';
      content.querySelector('[data-related-create]').onclick=()=>editEntry();
      content.querySelectorAll('[data-related-edit]').forEach(b=>b.onclick=()=>editEntry(entries.find(x=>x.id===b.dataset.relatedEdit)));
      content.querySelectorAll('[data-related-delete]').forEach(b=>b.onclick=()=>{
        const dialog=modal('حذف رکورد','<p>این رکورد حذف شود؟</p><form>'+footer('حذف')+'</form>');
        dialog.querySelector('form').onsubmit=e=>{e.preventDefault();if(saveEntries(entries.filter(x=>x.id!==b.dataset.relatedDelete))){dialog.close();relatedPage(r,selectedTab);}else dialog.querySelector('[role=alert]').textContent='حذف انجام نشد.';};
      });
    }

    function render() {
      const summaryRows=filtered();
      const month=new Date().toLocaleDateString('fa-IR',{year:'numeric',month:'numeric'}), monthly=summaryRows.filter(r=>new Date(r.created+'T12:00:00Z').toLocaleDateString('fa-IR',{year:'numeric',month:'numeric'})===month).length;
      const pending=summaryRows.filter(r=>!['تبدیل‌شده','رد شده'].includes(r.status)),due=pending.filter(r=>r.due===today()).length,overdue=pending.filter(r=>r.due&&r.due<today()).length,converted=summaryRows.filter(r=>r.status==='تبدیل‌شده').length;
      d.querySelector('#page-title').textContent='لیدها';d.querySelector('.breadcrumb').textContent='پنل ادمین / لیدها';
      host.innerHTML='<div class="group-tabs leads-tabs" role="tablist" aria-label="لیدها و فرصت‌ها">'+[['leads','سرنخ‌ها','people'],['opportunities','فرصت‌ها','trend']].map(([key,label,ico])=>'<button type="button" class="group-tab '+(key===activeStage?'active':'')+'" role="tab" aria-selected="'+(key===activeStage)+'" data-stage="'+key+'"><span class="parameter-tab-icon">'+icon(ico)+'</span>'+label+'</button>').join('')+'</div><div class="leads-period" role="group" aria-label="فیلتر زمانی"><span>زمان ثبت:</span>'+[['all','همه'],['month','ماه جاری'],['week','هفته جاری'],['today','امروز']].map(([key,label])=>'<button type="button" class="leads-button" aria-pressed="'+(key===activePeriod)+'" data-period="'+key+'">'+label+'</button>').join('')+'</div><div class="leads-kpis">'+[['کل لیدها',fa(summaryRows.length),'مطابق فیلترهای انتخاب‌شده','people'],['لیدهای این ماه',fa(monthly),'بر اساس ماه شمسی جاری','trend'],['پیگیری‌های امروز / معوق',fa(due)+' / '+fa(overdue),fa(overdue)+' پیگیری از موعد گذشته','clock'],['نرخ تبدیل لید به مشتری',fa(summaryRows.length?Math.round(converted/summaryRows.length*100):0)+'٪','نسبت به موارد فیلترشده','target']].map(([label,n,note,ico])=>'<div class="leads-kpi"><span>'+label+'</span><strong>'+n+'</strong><small>'+note+'</small><i>'+icon(ico)+'</i></div>').join('')+'</div><div class="admin-toolbar leads-toolbar" style="justify-content:flex-end"><label class="leads-type-filter">نوع <select data-category-filter aria-label="فیلتر نوع">'+[['all','همه انواع'],...categories].map(([key,label])=>'<option value="'+key+'" '+(key===activeCategory?'selected':'')+'>'+label+'</option>').join('')+'</select></label><span class="leads-spacer"></span><button class="leads-button primary" data-create>＋ '+(activeStage==='opportunities'?'ثبت فرصت جدید':'ثبت سرنخ جدید')+'</button></div><p class="leads-notice" data-notice role="status" aria-live="polite"></p><div class="board-wrap"><table class="admin-table leads-table"><thead><tr><th><input type="checkbox" data-select-all aria-label="انتخاب همه ردیف‌های این صفحه"></th>'+['نوع',...tableTitles()].map(t=>'<th>'+t+'</th>').join('')+'</tr></thead><tbody></tbody></table><div class="leads-pagination"><span data-range></span><nav class="leads-pages" data-pages aria-label="صفحه‌بندی لیدها"></nav></div></div><p class="leads-note">داده‌های نمونهٔ طراحی؛ تغییرات فقط در همین مرورگر ذخیره می‌شوند. فیلتر زمانی بر اساس تاریخ ثبت است؛ هفته از شنبه شروع می‌شود. فرصت‌ها، سرنخ‌های دارای فرصت فروش هستند. با «تبدیل به مشتری»، شرکت و رابط در مشتریان سازمانی ایجاد می‌شوند.</p>';
      host.querySelector('[data-create]').onclick=()=>editor();

      host.querySelector('[data-category-filter]').onchange=e=>{activeCategory=e.target.value;page=1;selected.clear();render()};
      host.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>{activeStage=b.dataset.stage;page=1;selected.clear();render()});
      host.querySelectorAll('[data-period]').forEach(b=>b.onclick=()=>{activePeriod=b.dataset.period;page=1;selected.clear();render()});
      
      paintRows();
    }
    render();
  };
})();
