(function(){
  'use strict';
  var storageKey='parameter.workflow-reassignments.v1', records={}, panel=null, current=null, trigger=null;
  try{records=JSON.parse(localStorage.getItem(storageKey)||'{}')}catch(e){}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function persist(next){try{localStorage.setItem(storageKey,JSON.stringify(next));records=next;return true}catch(e){if(window.showToast)showToast('ذخیره تغییر انجام نشد؛ فضای ذخیره‌سازی مرورگر را بررسی کنید.');return false}}
  function eligible(row){return !!row.querySelector('.status-chip.approved,.status-chip.published')}
  function key(row){var ctx=window.planDocsCtx||{};return [ctx.level,ctx.id,row.cells[0].textContent.trim(),row.querySelector('.workflow-version')?.textContent.trim()].join('|')}
  function record(row){var id=key(row);if(!records[id])records[id]={title:row.cells[0].textContent.trim(),stages:window.parameterWorkflowStages.snapshot(),history:[]};return records[id]}
  function users(){var data=window.__parameterDefaultUserData||{};return Object.keys(data).filter(function(k){return k.indexOf('contract-users:')===0}).flatMap(function(k){return data[k]}).filter(function(u){return u[4]==='فعال'}).filter(function(u,i,a){return a.findIndex(function(x){return x[1]===u[1]})===i})}
  function close(){if(panel){panel.close();panel.remove();panel=null}current=null;if(trigger&&trigger.isConnected)trigger.focus()}
  function sameUser(stage,user){return stage.userId?stage.userId===user[1]:stage.user===user[0]}
  function render(){
    var r=records[current], available=users();
    panel.innerHTML='<header><h2 id="wr-title">تغییر کاربر</h2><button type="button" data-close aria-label="بستن">×</button></header><div class="wr-body"><div class="wr-stages">'+r.stages.map(function(s,i){
      var last=(r.history||[]).slice().reverse().find(function(h){return h.stageIndex===i}), previous=last?last.previous:s.user;
      return '<section class="wr-stage" aria-labelledby="wr-stage-'+i+'"><h3 id="wr-stage-'+i+'">'+esc(s.name)+'</h3><div class="wr-person"><span>نام کاربر</span><b>'+esc(previous)+'</b></div><label class="wr-choice"><span>انتخاب کاربر قرارداد</span><select data-stage="'+i+'" aria-label="انتخاب کاربر قرارداد برای '+esc(s.name)+'"><option value="">انتخاب کاربر قرارداد</option>'+available.map(function(u){return '<option value="'+esc(u[1])+'"'+(sameUser(s,u)?' disabled':'')+'>'+esc(u[0])+(sameUser(s,u)?' (کاربر فعلی)':'')+'</option>'}).join('')+'</select></label>'+(last?'<div class="wr-current"><span>کاربر جایگزین فعلی</span><b>'+esc(s.user)+'</b></div>':'')+'</section>';
    }).join('')+'</div><p class="wr-result" role="status" aria-live="polite"></p></div><footer><button type="button" class="wr-save" disabled>ثبت</button></footer>';
  }
  function changes(){return Array.from(panel.querySelectorAll('select[data-stage]')).filter(function(input){return input.value}).map(function(input){return {index:Number(input.dataset.stage),user:users().find(function(u){return u[1]===input.value})}})}
  function open(row,button){
    if(!eligible(row))return;close();trigger=button;record(row);current=key(row);panel=document.createElement('dialog');panel.className='wr-drawer';panel.dir='rtl';panel.setAttribute('aria-labelledby','wr-title');document.body.appendChild(panel);render();panel.showModal();panel.querySelector('[data-close]').focus();
    panel.addEventListener('cancel',function(e){e.preventDefault();close()});
    panel.addEventListener('click',function(e){
      if(e.target.closest('[data-close]'))return close();
      if(!e.target.closest('.wr-save'))return;
      if(!row.isConnected||!eligible(row))return close();
      var updates=changes();if(!updates.length||updates.some(function(change){return !change.user||!records[current].stages[change.index]||sameUser(records[current].stages[change.index],change.user)}))return;
      var next=JSON.parse(JSON.stringify(records)),r=next[current];r.history=r.history||[];
      updates.forEach(function(change){var old=r.stages[change.index],user=change.user;r.history.push({stage:old.name,stageIndex:change.index,previous:old.user,previousId:old.userId||null,replacement:user[0],replacementId:user[1],at:new Date().toISOString()});old.user=user[0];old.userId=user[1]});
      if(!persist(next))return;
      window.parameterWorkflowStages.use(r.stages);updateFirst(row,r);render();panel.querySelector('.wr-result').textContent='تغییرات ثبت شد.';panel.querySelector('select').focus();
    });
    panel.addEventListener('change',function(){panel.querySelector('.wr-save').disabled=!changes().length});
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
