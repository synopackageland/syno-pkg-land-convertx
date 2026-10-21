// Validate the released CLI's effective plan, then record the precise build
// boundary. A known blocker is evidence of refusal, never an installable SPK.
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
assert.ok(service.mounts.some(m=>m.source==='${SYNOPKG_PKGVAR}/convertx' && m.target==='/app/data'));
writeFileSync('evidence/check.json',JSON.stringify(check.json,null,2)+'\n');
const build=call(['build','--arch','x86_64','--json']);
writeFileSync('evidence/build.json',JSON.stringify(build.json,null,2)+'\n');
if (build.json.ok) {
 assert.equal(build.status,0);
 console.log('SPK build succeeded; proceed to device acceptance.');
} else {
 assert.notEqual(build.status,0);
 assert.equal(build.json.code,'COMPOSE_PRIVATE_BIND_TIMING_UNSUPPORTED');
 assert.equal(existsSync('dist/SynoPkgConvertX-0.19.0-0001-x86_64.spk'),false);
 console.log('Confirmed published-toolchain blocker: '+build.json.code);
}
