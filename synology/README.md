# ConvertX for DSM

## 0.19.0-0006

Improve opening the App from the DSM menu and external access settings. Built with SDK/App 0.30.2 and CLI/templates 0.30.0. No NAS testing was performed for this toolchain rebuild.

改善從 DSM 選單開啟 App 與外網存取設定；使用 SDK/App 0.30.2 和 CLI/templates 0.30.0 重建

This package uses the supported SDK storage path: a private named volume on
the image's sticky /var/tmp base, with package-UID private subdirectories created
by SDK storage_init. See [platform limits](docs/framework-gaps.md).

The package preserves the official ConvertX UI and uses the SDK DSM gateway
as its only public ingress. DSM-authorized users share one space: **users can see
and download each other's files**. There is no separate ConvertX password and
no per-user file isolation. This App intentionally uses gateway `mode: none`,
not OIDC, because upstream has no OIDC/header authentication support.

- Runtime: official ConvertX v0.19.0, pinned index digest in image-lock.json.
- SPK version: 0.19.0-0006, x86_64; the build number is a four-digit suffix.
- Toolchain: CLI/templates 0.30.0, SDK/App 0.30.2, executor/v0.27.0.
- No Node frontend or custom UI is shipped; the template UI release is 0.14.4.
- Nonroot package UID, all capabilities dropped, no-new-privileges, read-only
  rootfs, isolated networks, no published upstream ports, bounded /tmp tmpfs.
- Data: named volume data:/var/tmp; SDK-owned private subtree /var/tmp/convertx.
  No shared-folder grants or host filesystem access are required.
- Cleanup: upstream checks every 24 hours and deletes jobs older than 24 hours.

## Build and inspect

Use a Linux builder with Node 24, Go 1.26.10, Python 3 and curl. Fetch the pinned
published SDK Go modules using authorized Git credentials or a verified module
cache. Source overrides are refused.

```sh
cd synology
./scripts/build.sh
```

`npm test` checks the identity, storage and runtime security declarations.
`node tests/released-cli.mjs` checks the released planner's effective inventory
and requires successful SPK build and inspect, recording evidence under ignored
evidence/. Source inspection and container proofs do not replace DSM acceptance.

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

## Uninstall data retention

The named volume is kept on uninstall, including when the native delete-data
checkbox is selected. This is a known SDK limitation. The uninstall wizard lists
the exact undeleted volume name; delete-data does not erase its ConvertX files.
Reinstalling the same package reuses the retained private subtree. Only an
explicit administrator cleanup of that exact unused volume removes the data.

## Official package icon

The DSM package uses the official project artwork, preserved unchanged and only resized/rasterized to the required icon sizes. See [assets/icon-source.json](assets/icon-source.json) for the source revision and original SHA-256, and [NOTICE](NOTICE) for attribution and the applicable image license. The package ID remains `SynoPkgConvertX` for upgrade continuity.
