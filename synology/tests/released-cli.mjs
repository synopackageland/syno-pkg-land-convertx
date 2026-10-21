// Validate the released CLI's effective plan, then record the precise build
// boundary. A successful gate requires a real installable and inspectable SPK.
import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const cli='node_modules/.bin/synopkgland';
mkdirSync('evidence',{recursive:true});
function call(args) {
 const result=spawnSync(cli,args,{encoding:'utf8',timeout:300_000});
 assert.equal(result.error,undefined);
 const json=JSON.parse(result.stdout);
 return {status:result.status,json};
}
const check=call(['check','--json']);
assert.equal(check.status,0);assert.equal(check.json.ok,true);
const inventory=check.json.data.compose;
assert.equal(inventory.services.length,1);
const service=inventory.services[0];
assert.equal(service.container_root,false);assert.equal(service.host_elevation,false);
assert.equal(service.egress,'isolated');assert.equal(service.network,'bridge');
assert.deepEqual(service.cap_drop,['ALL']);assert.ok(!service.ports?.length);
assert.ok(service.mounts.some(m=>m.type==='volume' && m.target==='/var/tmp'));
assert.ok(!service.mounts.some(m=>m.source?.startsWith('${SYNOPKG_PKGVAR}/')));
writeFileSync('evidence/check.json',JSON.stringify(check.json,null,2)+'\n');
const build=call(['build','--arch','x86_64','--json']);
writeFileSync('evidence/build.json',JSON.stringify(build.json,null,2)+'\n');
assert.equal(build.status,0,JSON.stringify(build.json));
assert.equal(build.json.ok,true);
const spk=build.json.data.outputs[0];
assert.ok(existsSync(spk));
const inspect=call(['inspect',spk,'--json']);
assert.equal(inspect.status,0);assert.equal(inspect.json.ok,true);
writeFileSync('evidence/inspect.json',JSON.stringify(inspect.json,null,2)+'\n');
console.log('SPK build and inspect succeeded.');
