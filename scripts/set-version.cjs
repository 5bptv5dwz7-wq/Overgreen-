const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),version=process.argv[2];
if(!/^[1-9]\d*$/.test(version||''))throw new Error('Usage: node scripts/set-version.cjs <version number>');
const read=f=>fs.readFileSync(path.join(root,f),'utf8'),app=read('app.js'),old=app.match(/const APP_VERSION='V(\d+)'/)?.[1];
if(!old)throw new Error('APP_VERSION missing');
// Repair mixed releases as well: each local asset must use the new version,
// including assets whose URL was already bumped independently from APP_VERSION.
const html=read('index.html').replace(/((?:src|href)=["'](?!https?:\/\/|\/\/)[^"']*\?v=)[^"']+(?=["'])/g,'$1'+version).replace(/(id="appVersion"[^>]*>)v\d+(<\/span>)/,'$1v'+version+'$2');
fs.writeFileSync(path.join(root,'app.js'),app.replace("const APP_VERSION='V"+old+"'","const APP_VERSION='V"+version+"'").replace(/register\('\.\/sw\.js\?v=\d+'\)/,"register('./sw.js?v="+version+"')"));
fs.writeFileSync(path.join(root,'index.html'),html);
fs.writeFileSync(path.join(root,'sw.js'),read('sw.js').replace(/const CACHE='overgreen-v\d+'/,"const CACHE='overgreen-v"+version+"'"));
console.log('Release V'+version+' aligned');
