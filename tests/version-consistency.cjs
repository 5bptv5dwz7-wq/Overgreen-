const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8'),app=read('app.js'),html=read('index.html'),sw=read('sw.js');
const version=app.match(/const APP_VERSION='V(\d+)'/)?.[1];assert(version,'APP_VERSION missing');
assert.equal(html.match(/id="appVersion"[^>]*>v(\d+)<\/span>/)?.[1],version,'Visible version differs from APP_VERSION');
assert.equal(html.match(/src="app.js\?v=(\d+)"/)?.[1],version,'App script cache version differs');
assert.equal(sw.match(/const CACHE='overgreen-v(\d+)'/)?.[1],version,'Service worker version differs');
const badge={textContent:'v0'};vm.runInNewContext(app.slice(0,app.indexOf('// Request IDs')),{document:{getElementById:()=>badge}});assert.equal(badge.textContent,'v'+version,'Badge must show the loaded code version');
console.log('PASS visible badge, loaded code, asset URL and service worker all V'+version);
