const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const file=path.join(__dirname,'..','parameter-v34-login-sharp.html');let h=fs.readFileSync(file,'utf8');const m=h.match(/var binary=atob\("([^"]+)"\)/);let p=Buffer.from(m[1],'base64').toString('utf8');const enc=s=>JSON.stringify(s).slice(1,-1);
const start=p.indexOf("    var main = pCard('کاربران درون‌سازمانی',"),end=p.indexOf("  } else if(peopleSubKind==='access'){",start);assert(start>=0&&end>start);
const code=String.raw`    function userRowButtons(r,related){
      var labels=related?['نقش‌های مربوطه','تاریخچه ورود','تاریخچه تغییرات']:['مشاهده','ویرایش','محدودیت IP'];
      var icons=related?['users','clock','list']:['eye','edit','lock'];
      return '<div class="parameter-user-row-actions">'+labels.map(function(label,i){return '<button type="button" class="pr-tool" data-user-action="'+(related?'related-':'operation-')+i+'" data-user-id="'+r[0]+'" title="'+label+'" onclick="showToast(this.textContent+\' — این کلید در نمونه طراحی هنوز به سرویس کاربر متصل نیست.\')">'+(ICONS[icons[i]]||'')+'<span>'+label+'</span></button>'}).join('')+'</div>';
    }
    content = '<div class="parameter-users-full">'+pCard('کاربران درون‌سازمانی',
      ['ردیف','نام','نام خانوادگی','نام کاربری','تاریخ ایجاد','تاریخ آخرین ورود','وضعیت','نوع لایسنس','کد فعال‌سازی','فرم‌های مرتبط','عملیات'],
      PS_USERS.map(function(r){return [r[0],r[1],r[2],r[3],r[4],r[5],pStat(r[6]),r[7],'—',userRowButtons(r,true),userRowButtons(r,false)];}))+'</div>';
`;
// Check the generated fragment before touching the bundle.
new vm.Script('(function(){'+code+'})');
p=p.slice(0,start)+enc(code)+p.slice(end);
const css='.parameter-users-full{width:100%;min-width:0}.parameter-users-full .psub-table th:nth-last-child(2){min-width:310px}.parameter-users-full .psub-table th:last-child{min-width:240px}.parameter-users-full .parameter-user-row-actions{display:flex;align-items:center;justify-content:center;gap:5px;flex-wrap:wrap}.parameter-users-full .parameter-user-row-actions .pr-tool{display:inline-flex;align-items:center;gap:4px;white-space:nowrap;font:inherit;font-size:10px;padding:5px 7px;color:var(--parameter-tab-blue,#087bf0);background:var(--surface,#fff);border:1px solid var(--border,#dce4f0);border-radius:var(--parameter-shared-radius,7px);cursor:pointer}.parameter-user-row-actions svg{width:14px;height:14px}.parameter-users-full .psub-table-wrap{overflow:auto}\n';
const at=p.indexOf('.lh-root{');assert(at>=0);p=p.slice(0,at)+enc(css)+p.slice(at);h=h.replace(m[1],Buffer.from(p).toString('base64'));fs.writeFileSync(file,h);console.log('Updated users table columns; removed standalone roles card.');
