# Release notes

## 0.20.0-0010: installation reliability

Rebuilt with CLI 0.53.16. The ingress, gateway and Portal nginx reload is now
declared only for package start and stop: INFO keeps
`startstop_restart_services="nginx.service"` and no longer sets
`instuninst_restart_services`. The install-time reload could collide with DSM
`API.Info` and make Package Center show a `t.indexOf` error after installing.
SDK, App runtime, upstream version and image are unchanged.

This rebuild runs check, build, inspect comparison with 0.20.0-0009 and privacy
scans; unit, browser, container-runtime and device acceptance tests were not run.

Offline comparison with 0.20.0-0009: the only INFO change besides version and
changelog is the removed `instuninst_restart_services`. Permissions are
unchanged, approval retention is `not-required`, root programs and policy changes
are empty, the task template and `conf/privilege` are unchanged.

## 0.20.0-0009: temporary files on disk

Conversion temporary files move from a 1 GiB memory tmpfs on `/tmp` to SDK disk
scratch (`compose.services.convertx.scratch: [/tmp]`, with `TMPDIR=/tmp`): a
package-UID-owned mode-0700 directory on the package volume, emptied at every
container start. No memory tmpfs remains. Rebuilt with published SDK/App 0.53.25
(executor 0.53.6) and CLI 0.52.16. Upstream version and image digest are unchanged.

Offline comparison with 0.20.0-0008: permissions are unchanged, approval retention
is `not-required`, root programs and policy changes are empty and the task template
is unchanged. The only Compose change replaces the `/tmp` tmpfs with the scratch bind
mount; `conf/privilege` still runs as the package account.

## 0.20.0-0008: sign-in page loading

Rebuilt with published SDK/App 0.53.21 and CLI 0.52.13 to improve page loading
reliability when signing in. Concurrent asset requests share session admission
and queue through the identity gateway. Upstream version and image digest are
unchanged. This rebuild runs check, build, inspect comparison and privacy scans;
unit, browser, container-runtime and device acceptance tests were not run.

Offline comparison with 0.20.0-0007: permissions are unchanged,
approval retention is `not-required`, root programs and policy changes are empty,
and the task template is unchanged. `conf/privilege` still runs as the package
account. The generated Compose resource changes `force_recreate` from true to
false and the SDK ingress-check binary is rebuilt; neither adds root authority.

## 0.20.0-0005: fixed DSM path ingress

The App opens at `/synopkgland/SynoPkgConvertX/` on the current DSM HTTPS origin.
The gateway no longer publishes a dedicated port or offers a public port field.
The official image receives `WEBROOT=/synopkgland/SynoPkgConvertX`; its health
probe uses the same prefix. DSM App privilege, mode none and shared-space
behavior are preserved.

Built with CLI 0.43.0, Go SDK/App 0.43.1 and templates 0.38.0.
The executor pin comes from the released SDK executor manifest
(executor/v0.39.0). Upstream image and data volume identity are unchanged.

## 0.20.0-0002: SDK 0.38.2 rebuild

Built with SDK/App 0.38.2, CLI 0.41.9 and templates 0.35.5; upstream ConvertX v0.20.0 and its image digest are unchanged.
The gateway HTTPS port (default 31443) is now chosen in the install wizard; upgrades keep the saved port.
Adds an app-open smoke test (`npm run e2e:smoke`) for administrator, permitted normal user and signed-out access.


## 0.19.0-0009: SDK entry-gate migration

Built with SDK/App/templates 0.32.0, CLI 0.34.0 and executor v0.32.0.
Every request retains the DSM entry gate. No upstream-authenticated path exceptions are enabled in this build.
Protected executor payloads changed: administrator approval is required again after upgrading.
No NAS installation or device acceptance was performed for this rebuild.

## 0.19.0-0008 — Redesigned DSM menu launch page

- The page shown when an App can't be opened from the DSM menu is redesigned and now explains when the App's port isn't reachable from outside
- 重新設計從 DSM 選單無法開啟 App 時顯示的頁面，並說明 App 的連接埠無法從外部連線的情況
