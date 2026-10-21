import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parse} from 'yaml';
const root = new URL('../', import.meta.url);
const read = name => readFileSync(new URL(name, root), 'utf8');
test('DSM is the only login and package storage is private', () => {
  const m = parse(read('dsm-package.yaml'));
  assert.equal(m.identity_gateway.sdk, '0.21.0');
  assert.equal(m.identity_gateway.mode, 'none');
  assert.equal(m.identity_gateway.access, 'dsm-users');
  assert.equal(m.compose.sdk, '0.21.0');
  assert.equal(m.compose.network.egress, 'isolated');
  assert.deepEqual(m.compose.data, {files:{service:'convertx', target:'/app/data', storage:'package', path:'convertx'}});
});
test('unauthenticated upstream cannot publish a host port or run privileged', () => {
  const {convertx:s} = parse(read('compose.yaml')).services;
  assert.equal(s.ports, undefined);
  assert.equal(s.network_mode, undefined);
  assert.equal(s.privileged, undefined);
  assert.equal(s.read_only, true);
  assert.deepEqual(s.cap_drop, ['ALL']);
  assert.deepEqual(s.security_opt, ['no-new-privileges:true']);
  assert.equal(s.environment.PUID, undefined);
  assert.equal(s.environment.PGID, undefined);
  assert.equal(s.environment.ALLOW_UNAUTHENTICATED, 'true');
  assert.equal(s.environment.UNAUTHENTICATED_USER_SHARING, 'true');
  assert.equal(s.environment.ACCOUNT_REGISTRATION, 'false');
  assert.equal(s.environment.AUTO_DELETE_EVERY_N_HOURS, '24');
  assert.equal(s.environment.HOME, '/app/data/home');
  assert.equal(s.environment.XDG_CONFIG_HOME, '/app/data/config');
  assert.equal(s.environment.USER, 'convertx');
  assert.equal(s.environment.LOGNAME, 'convertx');
});
test('the official image digest and source revision match the release', () => {
  const lock=JSON.parse(read('image-lock.json'));
  const s=parse(read('compose.yaml')).services.convertx;
  assert.equal(lock.tag, 'v0.19.0');
  assert.match(lock.upstream_commit, /^[a-f0-9]{40}$/);
  assert.equal(s.image, lock.reference);
  assert.match(s.image, /^c4illin\/convertx:v0\.19\.0@sha256:[a-f0-9]{64}$/);
  for (const platform of lock.platforms) {
    assert.equal(platform.source_commit, lock.upstream_commit);
    assert.ok(platform.compressed_bytes > 0);
  }
  assert.deepEqual(lock.platforms.map(x=>x.architecture).sort(), ['amd64','arm64']);
});
