(function(){
  'use strict';
  var storageKey='parameter.workflow-reassignments.v1', records={}, panel=null, current=null, selected=-1, trigger=null;
  try{records=JSON.parse(localStorage.getItem(storageKey)||'{}')}catch(e){}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function persist(next){try{localStorage.setItem(storageKey,JSON.stringify(next));records=next;return true}catch(e){if(window.showToast)showToast('ذخیره تغییر انجام نشد؛ فضای ذخیره‌سازی مرورگر را بررسی کنید.');return false}}
  function eligible(row){return !!row.querySelector('.status-chip.approved,.status-chip.published')}
  function key(row){var ctx=window.planDocsCtx||{};return [ctx.level,ctx.id,row.cells[0].textContent.trim(),row.querySelector('.workflow-version')?.textContent.trim()].join('|')}
  function record(row){var id=key(row);if(!records[id])records[id]={title:row.cells[0].textContent.trim(),stages:window.parameterWorkflowStages.snapshot(),history:[]};return records[id]}
  function users(){var data=window.__parameterDefaultUserData||{};return Object.keys(data).filter(function(k){return k.indexOf('contract-users:')===0}).flatMap(function(k){return data[k]}).filter(function(u){return u[4]==='فعال'}).filter(function(u,i,a){return a.findIndex(function(x){return x[1]===u[1]})===i})}
  function close(){if(panel){panel.close();panel.remove();panel=null}current=null;selected=-1;if(trigger&&trigger.isConnected)trigger.focus()}
  function render(){
    var r=records[current], stage=r.stages[selected];
    panel.innerHTML='<header><div><h2 id="wr-title">تغییر کاربر</h2><p>'+esc(r.title)+' · منتشرشده</p></div><button type="button" data-close aria-label="بستن">×</button></header><div class="wr-body"><h3>مراحل گردش کار</h3><p class="wr-note">مرحله را انتخاب کنید؛ برای هر مرحله فقط یک کاربر قرارداد جایگزین می‌شود.</p><div class="wr-stages">'+r.stages.map(function(s,i){return '<button type="button" class="wr-stage '+(i===selected?'selected':'')+'" data-stage="'+i+'" aria-pressed="'+(i===selected)+'" style="--wf-stage-color:'+esc(s.color)+'"><span class="wr-number">'+(i+1).toLocaleString('fa-IR')+'</span><h4>'+esc(s.name)+'</h4><dl><div><dt>نام کاربر</dt><dd>'+esc(s.user)+'</dd></div><div><dt>نقش</dt><dd>'+esc(s.role)+'</dd></div><div><dt>عملیات مجاز</dt><dd>'+esc((s.tags||[]).join('، '))+'</dd></div></dl></button>'}).join('')+'</div>'+(stage?'<section class="wr-picker"><h3>کاربران قرارداد · '+esc(stage.name)+'</h3><p>کاربر فعلی: <strong>'+esc(stage.user)+'</strong></p><div class="wr-users">'+(users().map(function(u){return '<label><input type="radio" name="wr-user" value="'+esc(u[1])+'" '+(u[0]===stage.user?'disabled':'')+'><span><b>'+esc(u[0])+(u[0]===stage.user?' (کاربر فعلی)':'')+'</b><small>'+esc(u[2])+' · '+esc(u[3])+'</small></span></label>'}).join('')||'<p>کاربر فعال مرتبط با قرارداد وجود ندارد.</p>')+'</div></section>':'')+'<section class="wr-history"><h3>تاریخچه جایگزینی کاربران</h3>'+(r.history.length?'<div class="wr-table"><table><thead><tr><th>مرحله</th><th>کاربر قبلی</th><th>کاربر جایگزین</th><th>تاریخ و ساعت تغییر</th></tr></thead><tbody>'+r.history.slice().reverse().map(function(h){return '<tr><td>'+esc(h.stage)+'</td><td>'+esc(h.previous)+'</td><td>'+esc(h.replacement)+'</td><td><time datetime="'+esc(h.at)+'">'+esc(new Date(h.at).toLocaleString('fa-IR'))+'</time></td></tr>'}).join('')+'</tbody></table></div>':'<p class="wr-note">هنوز تغییری ثبت نشده است.</p>')+'</section><p class="wr-result" role="status" aria-live="polite"></p></div><footer><button type="button" data-close>بستن</button><button type="button" class="wr-save" disabled>ثبت تغییر کاربر</button></footer>';
  }
  function open(row,button){if(!eligible(row))return;close();trigger=button;record(row);current=key(row);selected=-1;panel=document.createElement('dialog');panel.className='wr-drawer';panel.dir='rtl';panel.setAttribute('aria-labelledby','wr-title');document.body.appendChild(panel);render();panel.showModal();panel.querySelector('[data-close]').focus();panel.addEventListener('cancel',function(e){e.preventDefault();close()});panel.addEventListener('click',function(e){
      if(e.target.closest('[data-close]'))return close();var card=e.target.closest('[data-stage]');if(card){selected=Number(card.dataset.stage);render();panel.querySelector('[data-stage="'+selected+'"]').focus();return}
      if(!e.target.closest('.wr-save'))return;
      if(!row.isConnected||!eligible(row))return close();
      var input=panel.querySelector('input[name="wr-user"]:checked'), user=input&&users().find(function(u){return u[1]===input.value}), old=records[current].stages[selected];if(!user||!old||user[0]===old.user)return;
      var next=JSON.parse(JSON.stringify(records)),r=next[current],previous=old.user;
      r.history.push({stage:old.name,stageIndex:selected,previous:previous,previousId:old.userId||null,replacement:user[0],replacementId:user[1],at:new Date().toISOString()});r.stages[selected].user=user[0];r.stages[selected].userId=user[1];if(!persist(next))return;
      window.parameterWorkflowStages.use(r.stages);updateFirst(row,r);render();panel.querySelector('.wr-result').textContent=previous+' با '+user[0]+' جایگزین شد.';
    });panel.addEventListener('change',function(){panel.querySelector('.wr-save').disabled=!panel.querySelector('input[name="wr-user"]:checked')});
  }
  function updateFirst(row,r){var name=row.querySelector('.workflow-agent b');if(name&&r.stages[0]&&name.textContent!==r.stages[0].user)name.textContent=r.stages[0].user}
  function sync(){
    if(!window.parameterWorkflowStages)return;
    document.querySelectorAll('#view-workflow .wf-tab').forEach(function(tab){if((tab.getAttribute('onclick')||'').includes('changeUser'))tab.remove()});
    document.querySelectorAll('#view-plan-docs .parameter-workflow-pane tbody tr').forEach(function(row){
      var actions=row.querySelector('.doc-actions');if(!actions||row.cells.length<6)return;
      var button=actions.querySelector('.wr-trigger');if(!button){button=document.createElement('button');button.type='button';button.className='wr-trigger';button.title='تغییر کاربر';button.textContent='تغییر کاربر';actions.appendChild(button);button.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();open(row,button)})}
      button.disabled=!eligible(row);button.title=button.disabled?'تغییر کاربر فقط برای گردش‌کار منتشرشده فعال است':'تغییر کاربر';var r=records[key(row)];if(r)updateFirst(row,r);
    });
  }
  document.addEventListener('click',function(e){var row=e.target.closest('#view-plan-docs .parameter-workflow-pane tbody tr');if(row&&!e.target.closest('.wr-trigger')&&e.target.closest('[title="مشاهده"],[title="ویرایش"]'))window.parameterWorkflowStages.use(record(row).stages)},true);
  var queued=false;new MutationObserver(function(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;sync()})}).observe(document.body,{childList:true,subtree:true});sync();
})();
