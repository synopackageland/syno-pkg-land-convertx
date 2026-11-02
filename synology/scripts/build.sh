#!/usr/bin/env bash
# Run in a Linux builder with Node 24 and Go 1.26.10, using released dependencies.
set -euo pipefail
cd -- "$(dirname -- "$0")/.."
for key in SYNOPKGLAND_SDK_DIR SYNOPKGLAND_TEMPLATES_DIR SYNOPKGLAND_CLI_DIR; do
  if [[ -n ${!key:-} ]]; then echo 'Source overrides are not supported' >&2; exit 2; fi
done
mkdir -p evidence
npm ci --ignore-scripts --registry=https://registry.npmjs.org
python3 scripts/render-compose.py
npm test > evidence/test.log
node_modules/.bin/synopkgland check --json > evidence/check.json
node_modules/.bin/synopkgland build --arch x86_64 --json > evidence/build.json
# The public CLI reports its actual artifact names; forks can change package/build.
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const result = JSON.parse(readFileSync('evidence/build.json', 'utf8'));
if (result.ok !== true || !Array.isArray(result.data?.outputs) || result.data.outputs.length !== 1)
  throw new Error('Expected one successful x86_64 build output');
const inspect = spawnSync('node_modules/.bin/synopkgland', ['inspect', result.data.outputs[0], '--json'], { encoding: 'utf8' });
if (inspect.stderr) process.stderr.write(inspect.stderr);
if (inspect.status !== 0) process.exit(inspect.status ?? 1);
const { writeFileSync } = await import('node:fs');
writeFileSync('evidence/inspect.json', inspect.stdout);
NODE
