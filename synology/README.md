# ConvertX for DSM

## 0.20.0-0005: fixed DSM path ingress

The App opens at `/synopkgland/SynoPkgConvertX/` on the current DSM HTTPS origin.
The gateway no longer publishes a dedicated port or offers a public port field.
The official image receives `WEBROOT=/synopkgland/SynoPkgConvertX`; its health
probe uses the same prefix. DSM App privilege, mode none and shared-space
behavior are preserved.

Built with CLI 0.43.0, Go SDK/App 0.43.1 and templates 0.38.0.
The executor pin comes from the released SDK executor manifest
(executor/v0.39.0). Upstream image and data volume identity are unchanged.

## 0.20.0-0003: CLI 0.42.2 / SDK 0.42.0 rebuild

Built with CLI 0.42.2 and SDK/App 0.42.0; templates 0.37.0.
The toolchain records the current UI release 0.19.2; this package has no custom UI dependency.
Upstream ConvertX v0.20.0 and its image digest are unchanged.
Preserves the DSM app launcher and saved gateway HTTPS port.


## 0.20.0-0002: SDK 0.38.2 rebuild

Built with SDK/App 0.38.2, CLI 0.41.9 and templates 0.35.5; upstream ConvertX v0.20.0 and its image digest are unchanged.
The gateway HTTPS port (default 31443) is now chosen in the install wizard; upgrades keep the saved port.
Adds an app-open smoke test (`npm run e2e:smoke`) for administrator, permitted normal user and signed-out access.


## 0.19.0-0009: SDK entry-gate migration

Built with SDK/App/templates 0.32.0, CLI 0.34.0 and executor v0.32.0.
Every request retains the DSM entry gate. No upstream-authenticated path exceptions are enabled in this build.
Protected executor payloads changed: administrator approval is required again after upgrading.
No NAS installation or device acceptance was performed for this rebuild.

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

- Runtime: official ConvertX v0.20.0, pinned index digest in image-lock.json.
- SPK version: 0.20.0-0005, x86_64; the build number is a four-digit suffix.
- Toolchain: CLI 0.43.0, templates 0.38.0, Go SDK/App 0.43.1.
- No Node frontend or custom UI is shipped.
- Nonroot package UID, all capabilities dropped, no-new-privileges, read-only
  rootfs, isolated networks, no published upstream ports, bounded /tmp tmpfs.
- Data: named volume data:/var/tmp; SDK-owned private subtree /var/tmp/convertx.
  No shared-folder grants or host filesystem access are required.
- Cleanup: upstream checks every 24 hours and deletes jobs older than 24 hours.

## Build and inspect

Use a Linux builder with Node 24, Go 1.26.10, Python 3 and curl. The script
installs the locked CLI 0.43.0 and templates 0.38.0 from public npm. The CLI
fetches SDK v0.43.1 and its Go modules from public GitHub/Go services; internet
access is required, private credentials and a preloaded module cache are not.
Avoid private Git URL rewrites or organization proxy settings; on a clean builder
`GIT_TERMINAL_PROMPT=0` makes accidental credential prompts fail explicitly.
The CLI downloads its pinned Go toolchain when needed. Source overrides are refused.

For a community fork, set `package` in `dsm-package.yaml` to
`C<your numeric GitHub owner ID>XConvertX` (at most 64 ASCII alphanumerics), change
distributor/contact details and choose your own `compose.resource_prefix`.
Update `identity_gateway.ingress.path`, `WEBROOT` in the compose renderer,
and the health path to use that same case-sensitive package ID.
Preserve the upstream license, NOTICE and icon attribution. Changing the ID
creates a separate DSM package rather than an upgrade of this package.
The build script inspects the output path in the CLI's JSON response, so changing
the identity or build number needs no script edits. See the complete
[community submission guide](https://synopkgland.com/docs/guides/list-your-app/).

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
