(function(){
  var activeId=null, activeTab='contract', activeType='all';
  var typeSets={
    g1:[['all','همه اسناد','doc'],['schedule','برنامه زمان‌بندی','calendar'],['statement','صورت وضعیت','file'],['adjustment','تعدیل','bars'],['dailyReport','گزارش روزانه','calendar'],['report','گزارش پیشرفت','trend'],['minutes','صورت‌مجلس','users'],['workorder','دستور کار','clipboard'],['delayClaim','لایحه تأخیرات','alert'],['addendum','الحاقیه','addendum']],
    g2:[['all','همه اسناد','doc'],['studyParties','عوامل مطالعات','users'],['charter','منشور پروژه','flag'],['schedule','برنامه مطالعات','calendar'],['studyInvoice','صورت‌حساب مطالعات','file'],['report','گزارش مطالعات','trend'],['minutes','صورت‌جلسه','users'],['addendum','الحاقیه','addendum']],
    g3:[['all','همه اسناد','doc'],['supervisionParties','عوامل نظارت','users'],['supervisionInvoice','صورت‌حساب نظارت','file'],['supervisionFee','حق‌الزحمه نظارت','file'],['supervisionFeeAdjustment','تعدیل حق‌الزحمه','bars'],['report','گزارش نظارت','trend'],['minutes','صورت‌جلسه','users'],['contractsDoc','اسناد قراردادها','layers'],['addendum','الحاقیه','addendum']]
  };
  var typeLabel={schedule:'برنامه زمان‌بندی',statement:'صورت وضعیت',adjustment:'تعدیل',dailyReport:'گزارش روزانه',report:'گزارش پیشرفت',minutes:'صورت‌مجلس',workorder:'دستور کار',delayClaim:'لایحه تأخیرات',addendum:'الحاقیه',charter:'منشور پروژه',studyParties:'عوامل مطالعات',studyInvoice:'صورت‌حساب مطالعات',supervisionParties:'عوامل نظارت',supervisionInvoice:'صورت‌حساب نظارت',supervisionFee:'حق‌الزحمه نظارت',supervisionFeeAdjustment:'تعدیل حق‌الزحمه',contractsDoc:'اسناد قراردادها'};
  function icon(name){return (window.ICONS&&ICONS[name])||''}
  function contract(){return CONTRACTS.find(function(x){return x.id===activeId})}
  function groupLabel(g){return g==='g1'?'قرارداد پیمانکاری':g==='g2'?'قرارداد مطالعات':'قرارداد نظارت'}
  function personName(key){var p=PEOPLE&&PEOPLE[key];return p?(p.fa||p.en):'-'}
  function header(c){
    return '<div class="cw-context"><div class="cw-context-main"><button class="cw-icon-btn" title="بازگشت" onclick="closeContractDetail()">'+icon('chev')+'</button><div><b>'+t(c.subjectKey)+' — '+c.number+'</b><span> '+(c.partyFa||c.partyEn||'')+'</span></div></div><span class="cw-type">'+groupLabel(c.group)+'</span></div>'+
    '<div class="cw-tabs" role="tablist">'+
      tab('contract','مشخصات قرارداد','file')+tab('documents','اسناد مرتبط','layers')+tab('estimate','برآورد','bars')+tab('coefficients','ضرایب','grid')+
    '</div>';
  }
  function tab(key,label,ic){return '<button type="button" class="cw-tab '+(activeTab===key?'active':'')+'" onclick="setContractWorkspaceTab(\''+key+'\')">'+icon(ic)+'<span>'+label+'</span></button>'}
  function docsView(c){
    var sets=typeSets[c.group]||typeSets.g1;
    var available=c.docs||[];
    var filtered=activeType==='all'?available:available.filter(function(d){return d.type===activeType});
    var types=sets.map(function(x){var count=x[0]==='all'?available.length:available.filter(function(d){return d.type===x[0]}).length;return '<button class="cw-doc-type '+(activeType===x[0]?'active':'')+'" onclick="setContractDocumentType(\''+x[0]+'\')"><span>'+x[1]+'</span><i>'+faDigits(count)+'</i></button>'}).join('');
    var rows=filtered.map(function(d,i){var meta=DOC_TYPE_META[d.type]||DOC_TYPE_META.statement;return '<tr><td style="width:54px">'+faDigits(i+1)+'</td><td><div class="cw-doc-name"><i class="cw-doc-icon">'+icon(meta.icon||'file')+'</i><span>'+(d.fa||d.en)+'</span></div></td><td>'+d.code+'</td><td>'+(d.dateFa||d.dateEn)+'</td><td>'+personName(d.person)+'</td><td>'+statusChip(d.status)+'</td><td style="width:112px"><div class="cw-actions"><button class="cw-icon-btn" title="مشاهده" onclick="openContractDocumentForm(\''+d.type+'\',\''+d.code+'\',true)">'+icon('eye')+'</button><button class="cw-icon-btn" title="ویرایش" onclick="openContractDocumentForm(\''+d.type+'\',\''+d.code+'\',false)">'+icon('edit')+'</button><button class="cw-icon-btn" title="گردش کار">'+icon('workflow')+'</button></div></td></tr>'}).join('');
    if(!rows) rows='<tr><td colspan="7"><div class="cw-empty">داده‌ای جهت نمایش وجود ندارد.</div></td></tr>';
    return '<section class="cw-card"><header class="cw-card-head"><strong>اسناد مرتبط '+groupLabel(c.group)+'</strong><div class="cw-card-tools"><button class="cw-primary" onclick="openContractDocumentForm(\''+(activeType==='all'?sets[1][0]:activeType)+'\',\'\',false)">'+icon('plus')+'افزودن سند</button></div></header><div class="cw-doc-types">'+types+'</div><div class="cw-table-wrap"><table class="cw-table"><thead><tr><th style="width:54px">ردیف</th><th>عنوان سند</th><th>شماره سند</th><th>تاریخ سند</th><th>ایجادکننده</th><th>وضعیت</th><th style="width:112px">عملیات</th></tr></thead><tbody>'+rows+'</tbody></table></div></section>';
  }
  function render(){
    var c=contract(), body=document.getElementById('cv-body'), top=document.querySelector('#view-contract-detail .cv-topbar'); if(!c||!body)return;
    if(top)top.style.display='none';
    var content=activeTab==='documents'?docsView(c):activeTab==='estimate'?renderEstimateTab(c):activeTab==='coefficients'?renderCoefficientsTab(c):renderContractSheetTab(c);
    body.innerHTML='<div class="cw-shell">'+header(c)+'<div class="cw-content">'+content+'</div></div>';
  }
  window.setContractWorkspaceTab=function(tab){activeTab=tab;activeType='all';render()};
  window.setContractDocumentType=function(type){activeType=type;render()};
  window.openContractDetail=function(id){activeId=id;currentContractDetailId=id;activeTab='contract';activeType='all';showView('contract-detail');render()};
  window.openContractDocuments=function(id){activeId=id;currentContractDetailId=id;activeTab='documents';activeType='all';showView('contract-detail');render()};
  window.renderContractDetailBody=render;
  function field(label,name,value,type,full,readonly){return '<div class="cw-field '+(full?'full':'')+'"><label>'+label+'</label><input name="'+name+'" type="'+(type||'text')+'" value="'+(value||'')+'" '+(readonly?'readonly':'')+'></div>'}
  function extraFields(type){
    if(type==='schedule')return field('تاریخ شروع','startDate','۱۴۰۳/۰۴/۰۱')+field('تاریخ پایان','endDate','۱۴۰۴/۰۳/۳۱')+field('مدت (روز)','duration','۳۶۵','text')+field('درصد پیشرفت','progress','۳۵');
    if(type==='statement'||type==='studyInvoice'||type==='supervisionInvoice'||type==='supervisionFee')return field('دوره','period','۱')+field('مبلغ ناخالص (ریال)','gross','۱,۴۸۵,۰۰۰,۰۰۰')+field('کسورات (ریال)','deduction','۱۴۸,۵۰۰,۰۰۰')+field('مبلغ قابل پرداخت (ریال)','payable','۱,۳۳۶,۵۰۰,۰۰۰');
    if(type==='adjustment'||type==='supervisionFeeAdjustment')return field('دوره تعدیل','period','سه‌ماهه دوم ۱۴۰۳')+field('شاخص مبنا','baseIndex','۱۲۴۵')+field('شاخص دوره','periodIndex','۱۴۱۸')+field('مبلغ تعدیل (ریال)','adjustmentAmount','۲۵۸,۰۰۰,۰۰۰');
    if(type==='report'||type==='dailyReport')return field('دوره گزارش','reportPeriod','مرداد ۱۴۰۳')+field('پیشرفت برنامه‌ای (درصد)','planned','۴۲')+field('پیشرفت واقعی (درصد)','actual','۳۸')+field('تاریخ گزارش','reportDate','۱۴۰۳/۰۶/۰۵');
    if(type==='studyParties'||type==='supervisionParties')return field('نام و نام خانوادگی','agentName','')+field('سمت','position','')+field('تاریخ معرفی','introDate','')+field('شماره معرفی‌نامه','introNo','');
    if(type==='delayClaim')return field('شروع دوره تأخیر','delayStart','')+field('پایان دوره تأخیر','delayEnd','')+field('تأخیر مجاز (روز)','allowedDays','')+field('تأخیر غیرمجاز (روز)','disallowedDays','');
    return field('موضوع','subject','')+field('تاریخ ابلاغ','noticeDate','');
  }
  window.openContractDocumentForm=function(type,code,viewOnly){
    var c=contract(), existing=(c.docs||[]).find(function(d){return d.code===code}), title=(viewOnly?'مشاهده ':'')+(typeLabel[type]||'سند مرتبط');
    var host=document.createElement('div');host.id='cw-drawer-host';host.innerHTML='<div class="cw-drawer-backdrop" onclick="closeContractDocumentForm()"></div><aside class="cw-drawer" role="dialog" aria-label="'+title+'"><header class="cw-drawer-head"><strong>'+title+'</strong><button class="cw-drawer-close" onclick="closeContractDocumentForm()">×</button></header><div class="cw-drawer-body"><form class="cw-form-grid" onsubmit="event.preventDefault();closeContractDocumentForm();showToast(\'اطلاعات سند ثبت شد\')">'+field('نوع سند','docType',typeLabel[type]||type,'text',false,true)+field('شماره سند','code',existing?existing.code:'')+field('عنوان سند','title',existing?(existing.fa||existing.en):'','text',true)+field('تاریخ سند','date',existing?(existing.dateFa||existing.dateEn):'')+extraFields(type)+'<div class="cw-field full"><label>شرح</label><textarea name="description"></textarea></div></form></div><footer class="cw-drawer-foot">'+(viewOnly?'':'<button class="cw-primary" onclick="this.closest(\'.cw-drawer\').querySelector(\'form\').requestSubmit()">ثبت</button>')+'<button class="cw-secondary" onclick="closeContractDocumentForm()">انصراف</button></footer></aside>';
    document.body.appendChild(host);
    if(viewOnly)host.querySelectorAll('input,select,textarea').forEach(function(x){x.disabled=true});
  };
  window.closeContractDocumentForm=function(){var x=document.getElementById('cw-drawer-host');if(x)x.remove()};
})();
