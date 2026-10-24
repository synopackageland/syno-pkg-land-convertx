# ConvertX for DSM

## SDK 0.29.1 rebuild

Rebuild 0.19.0-0005 with SDK/App 0.29.1 and CLI/templates 0.29.0, retaining executor/v0.27.0. Upstream images and App configuration are unchanged. No NAS testing was performed for this rebuild.

## HTTPS port change in 0.19.0-0004

The gateway now uses HTTPS port **31443** instead of 29443, allowing ConvertX,
Jellyfin and Vaultwarden to coexist. After upgrading, update saved URLs, firewall
rules and port forwarding to use `https://<nas-host>:31443`.

## SDK 0.28.0 rebuild in 0.19.0-0004

Rebuilt with published SDK/App/CLI/templates 0.28.0 (executor/v0.27.0), adding the SDK's slow-NAS startup defaults (generous health/readiness timing, Starting status in the UI, `/_spl/ping` gateway liveness). Go 1.26.10 and UI 0.14.4 are unchanged. Not tested on a NAS.

以已發佈的 SDK/App/CLI/templates 0.28.0（executor/v0.27.0）重建，納入 SDK 針對慢速 NAS 的啟動預設值（較寬鬆的健康檢查與就緒時限、介面顯示「啟動中」狀態、`/_spl/ping` 閘道存活檢查）。Go 1.26.10 與 UI 0.14.4 不變。尚未在 NAS 上測試。

## SDK 0.26.0 rebuild (0.19.0-0003)

Rebuild 0.19.0-0003 with published SDK/App/CLI/templates 0.26.0, UI 0.14.4 and Go 1.26.10. Maintainer: Syno Package Land. Official images and application sources are unchanged.

0.19.0-0003 使用已發佈 SDK/App/CLI/templates 0.26.0、UI 0.14.4 與 Go 1.26.10 重建；維護者顯示為 Syno Package Land。 官方映像與上游程式維持原樣。

This package uses the supported SDK storage path: a private named volume on
the image's sticky /var/tmp base, with package-UID private subdirectories created
by SDK storage_init. See [platform limits](docs/framework-gaps.md).

The package preserves the official ConvertX UI and uses the SDK DSM gateway
as its only public ingress. DSM-authorized users share one space: **users can see
and download each other's files**. There is no separate ConvertX password and
no per-user file isolation. This App intentionally uses gateway `mode: none`,
not OIDC, because upstream has no OIDC/header authentication support.

- Runtime: official ConvertX v0.19.0, pinned index digest in image-lock.json.
- SPK version: 0.19.0-0001, x86_64; the build number is a four-digit suffix.
- Toolchain: CLI/templates 0.22.0, SDK/App 0.22.0, executor/v0.20.0.
- No Node frontend or custom UI is shipped; the template UI release is 0.12.5.
- Nonroot package UID, all capabilities dropped, no-new-privileges, read-only
  rootfs, isolated networks, no published upstream ports, bounded /tmp tmpfs.
- Data: named volume data:/var/tmp; SDK-owned private subtree /var/tmp/convertx.
  No shared-folder grants or host filesystem access are required.
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
