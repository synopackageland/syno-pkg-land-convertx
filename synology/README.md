# ConvertX for DSM — draft packaging

**Blocked before SPK generation:** the published CLI 0.21.0 rejects package-private
Compose bind storage with `COMPOSE_PRIVATE_BIND_TIMING_UNSUPPORTED`. This is not
an installable or released package. See [framework gaps](docs/framework-gaps.md).

The candidate preserves the official ConvertX UI and uses the SDK DSM gateway
as its only public ingress. DSM-authorized users share one space: **users can see
and download each other's files**. There is no separate ConvertX password and
no per-user file isolation. This App intentionally uses gateway `mode: none`,
not OIDC, because upstream has no OIDC/header authentication support.

- Runtime: official ConvertX v0.19.0, pinned index digest in image-lock.json.
- SPK target: 0.19.0-0001, x86_64; the build number is a four-digit suffix.
- Toolchain: CLI/templates 0.21.0, SDK/App 0.21.0, executor/v0.20.0.
- No Node frontend or custom UI is shipped; the template UI release is 0.12.5.
- Nonroot package UID, all capabilities dropped, no-new-privileges, read-only
  rootfs, isolated networks, no published upstream ports, bounded /tmp tmpfs.
- Data: requested package-private /app/data; no shared-folder grants.
- Cleanup: upstream checks every 24 hours and deletes jobs older than 24 hours.

## Build and inspect

Use a Linux builder with Node 24, Go 1.26.9, Python 3 and curl. Fetch the pinned
published SDK Go modules using authorized Git credentials or a verified module
cache. Source overrides are refused.

```sh
cd synology
./scripts/build.sh
```

`npm test` checks the identity, storage and runtime security declarations.
`node tests/released-cli.mjs` checks the released planner's effective inventory
and records its exact build outcome under ignored evidence/. A recognized
framework refusal is not a successful SPK build or completed acceptance gate.

The image lock includes the official image's source labels, platform digests
and compressed layer bytes. To intentionally refresh the same release pin:

```sh
python3 scripts/pin-image.py --tag v0.19.0 \
  --commit "$(git rev-parse v0.19.0^{commit})" \
  --source-tree "$(git rev-parse v0.19.0^{tree})" --build 1
python3 scripts/render-compose.py
```

Only synology/ contains packaging changes. Main already includes upstream
post-v0.19.0 development; the runtime remains the pinned release, not that main
checkout's upcoming version. Do not use main source to rebuild a differently
versioned image.

See [design](docs/design.md), [validation](docs/validation.md) and
[DSM e2e prerequisites](docs/e2e.md). No GitHub Release, catalog update or package
registry publication is performed by these scripts.
