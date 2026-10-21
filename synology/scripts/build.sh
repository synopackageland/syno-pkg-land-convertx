#!/usr/bin/env bash
# Run in a Linux builder with Node 24 and Go 1.26.9, using released dependencies.
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
version=$(sed -n 's/^version: //p' dsm-package.yaml)
build=$(sed -n 's/^build: //p' dsm-package.yaml)
printf -v padded '%04d' "$build"
node_modules/.bin/synopkgland inspect "dist/SynoPkgConvertX-$version-$padded-x86_64.spk" --json > evidence/inspect.json
