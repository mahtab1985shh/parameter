const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const css=fs.readFileSync(path.join(__dirname,'digital-archive.css'),'utf8').replace('../assets/archive-fa.woff2','data:font/woff2;base64,'+fs.readFileSync(path.join(root,'assets/archive-fa.woff2')).toString('base64'));
const js=fs.readFileSync(path.join(__dirname,'digital-archive.js'),'utf8');
const html='<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>پارامتر | آرشیو دیجیتال</title><style>'+css+'</style></head><body><main id="digital-archive"></main><script>'+js+'</script></body></html>';
fs.writeFileSync(path.join(root,'digital-archive-v2.html'),html);
console.log('Standalone file: digital-archive-v2.html');
