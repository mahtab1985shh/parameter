const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const file = path.join(__dirname, '..', 'parameter-v34-login-sharp.html');
let html = fs.readFileSync(file, 'utf8');
const match = html.match(/var binary=atob\("([^"]+)"\)/);
let project = Buffer.from(match[1], 'base64').toString('utf8');
const start = project.indexOf('<script id=\\"parameter-create-form-restore-script\\">');
const bodyStart = project.indexOf('>', start) + 1;
const end = project.indexOf('<\\u002Fscript>', start);
const encoded = project.slice(bodyStart, end);
let script = JSON.parse('"' + encoded + '"');
function replace(before, after) {
  if (script.split(before).length !== 2) throw Error('Unexpected source: ' + before.slice(0, 100));
  script = script.replace(before, () => after);
}
replace('  function ensurePicker(){', `  var dateFormatter=new Intl.DateTimeFormat('en-US-u-ca-persian',{year:'numeric',month:'numeric',day:'numeric',timeZone:'UTC'});
  function persianParts(date){var p={};dateFormatter.formatToParts(date).forEach(function(v){if(v.type!=='literal')p[v.type]=+v.value});return p}
  function yearStart(year){for(var d=18;d<=23;d++){var date=new Date(Date.UTC(year+621,2,d));var p=persianParts(date);if(p.year===year&&p.month===1&&p.day===1)return date}throw Error('Unsupported Persian year')}
  function monthLength(year,month){return month<=6?31:month<=11?30:Math.round((yearStart(year+1)-yearStart(year))/86400000)-336}
  function closeDateChoices(){document.querySelectorAll('.parameter-date-choice-list').forEach(function(el){el.hidden=true});document.querySelectorAll('.parameter-date-choice-toggle').forEach(function(el){el.setAttribute('aria-expanded','false')})}
  function syncDateChoices(){var menu=ensurePicker();menu.querySelector('[data-date-choice="year"] .parameter-date-choice-value').textContent=faNumber(selectedDate.year);menu.querySelector('[data-date-choice="month"] .parameter-date-choice-value').textContent=faMonths[selectedDate.month-1];menu.querySelectorAll('[data-date-value]').forEach(function(b){b.setAttribute('aria-selected',String(+b.dataset.dateValue===selectedDate[b.dataset.dateKind]))})}
  function setupDateChoices(menu){
    ['year','month'].forEach(function(kind){
      var select=menu.querySelector('.parameter-date-'+kind);select.hidden=true;select.tabIndex=-1;select.setAttribute('aria-hidden','true');
      var group=document.createElement('div');group.className='parameter-date-choice';
      var label=kind==='year'?'سال':'ماه';
      group.innerHTML='<span class="parameter-date-choice-label">'+label+'</span><button type="button" class="parameter-date-choice-toggle" data-date-choice="'+kind+'" aria-label="انتخاب '+label+'" aria-expanded="false" aria-haspopup="listbox"><span class="parameter-date-choice-value"></span><span aria-hidden="true">⌄</span></button><div class="parameter-date-choice-list" role="listbox" aria-label="'+label+'" hidden></div>';
      select.after(group);var toggle=group.querySelector('button'),list=group.querySelector('[role="listbox"]');
      toggle.onclick=function(e){e.stopPropagation();var opening=list.hidden;closeDateChoices();if(!opening)return;list.innerHTML='';var low=kind==='year'?Math.min(1300,selectedDate.year-20):1,high=kind==='year'?Math.max(1500,selectedDate.year+20):12;
        for(var i=low;i<=high;i++){var option=document.createElement('button');option.type='button';option.setAttribute('role','option');option.dataset.dateValue=i;option.dataset.dateKind=kind;option.textContent=kind==='year'?faNumber(i):faMonths[i-1];option.setAttribute('aria-selected',String(i===selectedDate[kind]));option.onclick=function(ev){ev.stopPropagation();selectedDate[kind]=+this.dataset.dateValue;selectedDate.day=Math.min(selectedDate.day,monthLength(selectedDate.year,selectedDate.month));select.value=selectedDate[kind];closeDateChoices();renderDateDays();positionDateDropdown();toggle.focus()};list.appendChild(option)}
        list.hidden=false;toggle.setAttribute('aria-expanded','true');var chosen=list.querySelector('[aria-selected="true"]');if(chosen){chosen.focus();chosen.scrollIntoView({block:'nearest'})}
      };
      list.onkeydown=function(e){var items=Array.from(list.querySelectorAll('button')),idx=items.indexOf(document.activeElement);if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeDateChoices();toggle.focus();return}var next=e.key==='ArrowDown'?idx+1:e.key==='ArrowUp'?idx-1:e.key==='Home'?0:e.key==='End'?items.length-1:null;if(next!==null){e.preventDefault();items[Math.max(0,Math.min(items.length-1,next))].focus()}};
    });
    menu.addEventListener('click',function(e){if(!e.target.closest('.parameter-date-choice'))closeDateChoices()});
  }
  function ensurePicker(){`);
replace("    return modal;\n  }\n  function renderDateDays(){", "    setupDateChoices(modal);\n    return modal;\n  }\n  function renderDateDays(){");
const renderStart=script.indexOf('  function renderDateDays(){');
const renderEnd=script.indexOf('  function positionDateDropdown()',renderStart);
if(renderEnd<0)throw Error('Calendar renderer boundary missing');
script=script.slice(0,renderStart)+`  function renderDateDays(){
    var modal=ensurePicker(),days=monthLength(selectedDate.year,selectedDate.month),host=modal.querySelector('.parameter-date-days');host.innerHTML='';selectedDate.day=Math.min(selectedDate.day,days);
    syncDateChoices();
    var offset=selectedDate.month<=7?(selectedDate.month-1)*31:186+(selectedDate.month-7)*30;
    var weekday=(new Date(+yearStart(selectedDate.year)+offset*86400000).getUTCDay()+1)%7;
    for(var blank=0;blank<weekday;blank++){var spacer=document.createElement('span');spacer.setAttribute('aria-hidden','true');host.appendChild(spacer)}
    for(var i=1;i<=days;i++){var b=document.createElement('button');b.type='button';b.className='parameter-date-day'+(i===selectedDate.day?' selected':'');b.textContent=faNumber(i);b.dataset.day=i;b.setAttribute('aria-label',faNumber(i)+' '+faMonths[selectedDate.month-1]+' '+faNumber(selectedDate.year));b.onclick=function(){selectedDate.day=+this.dataset.day;if(pickedDateInput){pickedDateInput.value=faNumber(selectedDate.year)+'/'+faNumber(String(selectedDate.month).padStart(2,'0'))+'/'+faNumber(String(selectedDate.day).padStart(2,'0'));pickedDateInput.dispatchEvent(new Event('input',{bubbles:true}));pickedDateInput.dispatchEvent(new Event('change',{bubbles:true}));pickedDateInput.focus()}closeParameterDatePicker()};host.appendChild(b)}
  }
`+script.slice(renderEnd);
replace('    if(parts)selectedDate={year:+parts[1],month:+parts[2],day:+parts[3]};', "    var today=persianParts(new Date());selectedDate={year:today.year,month:today.month,day:today.day};\n    if(parts&&+parts[2]>=1&&+parts[2]<=12&&+parts[3]>=1&&+parts[3]<=monthLength(+parts[1],+parts[2]))selectedDate={year:+parts[1],month:+parts[2],day:+parts[3]};\n    closeDateChoices();");
replace("window.closeParameterDatePicker=function(){var menu=", "window.closeParameterDatePicker=function(){closeDateChoices();var menu=");
new vm.Script(script);
project=project.slice(0,bodyStart)+JSON.stringify(script).slice(1,-1)+project.slice(end);
const css='.parameter-date-controls select{height:36px;border:1px solid #d9e2ef;border-radius:7px;background:#fff;color:#334155;font:inherit;padding:0 8px}';
const added='.parameter-date-controls select[hidden]{display:none!important}.parameter-date-choice{position:relative;min-width:0}.parameter-date-choice-label{display:block;font-size:11px;color:#676879;margin-bottom:4px}.parameter-date-choice-toggle{display:flex;align-items:center;justify-content:space-between;width:100%;height:36px;padding:0 10px;background:#fff;border:1px solid #c3c6d4;border-radius:5px;color:#323338;font:inherit;font-size:12px;cursor:pointer}.parameter-date-choice-toggle:hover,.parameter-date-choice-toggle[aria-expanded=true]{border-color:#0073ea}.parameter-date-choice-list{position:absolute;top:100%;inset-inline:0;z-index:3;max-height:204px;overflow-y:auto;overscroll-behavior:contain;margin-top:4px;padding:4px;background:#fff;border:1px solid #d0d4e4;border-radius:6px;box-shadow:0 4px 14px #1f2d3d26}.parameter-date-choice-list[hidden]{display:none!important}.parameter-date-choice-list button{display:block;width:100%;padding:7px 8px;border:0;border-radius:4px;background:#fff;color:#323338;font:inherit;font-size:12px;text-align:center;cursor:pointer}.parameter-date-choice-list button:hover,.parameter-date-choice-list button:focus-visible{background:#f0f3ff;outline:2px solid #0073ea;outline-offset:-2px}.parameter-date-choice-list button[aria-selected=true]{background:#cce5ff;color:#0060b9;font-weight:700}';
if(!project.includes(css))throw Error('Calendar CSS missing');
project=project.replace(css,css+added);
html=html.replace(match[1],Buffer.from(project).toString('base64'));
fs.writeFileSync(file,html);
console.log('Updated date controls and compiled embedded script.');
