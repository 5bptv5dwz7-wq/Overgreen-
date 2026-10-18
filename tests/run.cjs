const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
for(const file of ['version-consistency.cjs','flows.cjs']){const r=spawnSync(process.execPath,[path.join(__dirname,file)],{cwd:root,stdio:'inherit'});if(r.status)process.exit(r.status)}
const files=fs.readdirSync(__dirname).filter(f=>f.endsWith('.cjs')&&!['run.cjs','flows.cjs','version-consistency.cjs','build-closure-preview.cjs'].includes(f)).sort().map(f=>path.join(__dirname,f));
const r=spawnSync(process.execPath,['--test',...files],{cwd:root,stdio:'inherit'});process.exit(r.status??1);
