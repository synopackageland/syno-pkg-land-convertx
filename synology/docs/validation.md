# Validation

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

Checked by unit contracts, check, build, inspect comparison with 0.20.0-0008 and
privacy scans. Device: upgraded from 0.20.0-0008 on an x86_64 DSM 7.3 NAS; the
container started, `/tmp` was a btrfs bind (not tmpfs) with mode 0700 owned by the
package UID, writable, and the main page loaded through the DSM gateway.

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

## Previous release evidence (historical)

## 0.20.0-0005: fixed DSM path ingress

Validated with released CLI 0.43.0, Go SDK/App 0.43.1 and templates 0.38.0.
The official ConvertX v0.20.0 image and named volume identity are unchanged.
The SDK tag resolves to `6f405971f6bb35ffc02004990fdcbfc370fb1ac3` and its Go
module checksum was verified against the public checksum service.

- Packaging contracts: 4 passed; check/build/inspect passed, with no inspect findings
- The installed gateway binary, Compose controller and gateway configuration
  hashes match the final SPK
- In-place upgrade preserves all 16 job rows, 4 filename rows and 6 existing
  upload/output file hashes, with the same named volume
- The existing full browser suite passes all 4 selected tests: administrator
  and denied-user sign-in setup, menu launch with PNG/JPEG, MP4/WebM and TXT/PDF
  downloads, logout/reopen, and the App-privilege denial
- The denial fixture changes only this App's rule for an existing test user;
  every stored App rule is restored to its exact baseline afterwards
- The old dedicated gateway port has no listener; upstream publishes no host
  ports and retains nonroot UID, read-only rootfs and dropped capabilities
- The final administrator/authorized normal-user/signed-out smoke passes 3 of 3
  tests, with no skipped tests
- Both allowed roles load home, converters and history under the fixed path;
  every observed namespaced static resource returns 200, with no failed requests
- Anonymous upload, results and download requests return 401; no upstream
  WebSocket endpoint is observed in this workflow
- Scoped source/SPK scans and public npm registry lockfile checks pass

The privacy scan distinguishes the SDK-generated isolated bridge subnet from
NAS addresses, and short numeric coincidences in public SDK ELF metadata from
credential disclosures. Browser profiles, raw logs and private machine details
are retained outside tracked files. No release or catalog publication is part
of this validation.

## 0.19.0-0004 port change

Four packaging contract tests and published CLI 0.28.0 check/build/inspect pass
locally. The built SPK declares HTTPS 31443 consistently in `conf/resource`,
`sso/gateway.json` and `sso/native-nginx.conf`; its nginx listener no longer uses
29443. The regression test fails against the previous 29443 declaration.
No NAS installation, upgrade or coexistence test has been run for this build.
Earlier device results below apply to their named builds only.

SDK 0.28.0 rebuild of 0.19.0-0004: published CLI/templates/SDK/App 0.28.0,
executor/v0.27.0, UI 0.14.4, Go 1.26.10, no source overrides. On macOS, ran
`npm test` (4 of 4 pass), `synopkgland check --json` (ok), `synopkgland build
--arch x86_64 --json` (ok, SynoPkgConvertX-0.19.0-0004-x86_64.spk) and
`synopkgland inspect` on that SPK (ok; only two unknown INFO field warnings).
No NAS installation, upgrade, slow-start or e2e test was run for this rebuild.

The published toolchain builds and inspects both 0.19.0-0001 and the 0002
upgrade fixture. Installed DSM acceptance uses the official pinned image,
SDK-initialized private named-volume storage, and the package UID.

## Published inputs

CLI/templates 0.21.0; SDK/App 0.21.0; executor/v0.20.0; template UI 0.12.5.
No source overrides. The package targets x86_64, DSM 7.2.1 or later; device
acceptance was performed on DSM 7.3.2 with Container Manager.

Official image: c4illin/convertx:v0.19.0 at the index digest in image-lock.json.
Registry manifest/config bytes were checked against their SHA-256 digests;
both Linux amd64/arm64 config labels identify the upstream release commit.
Compressed amd64 layers total 1,538,985,762 bytes; Docker image size is
3,828,284,752 bytes. An uncached device image pull took 411 seconds. A later
cached-image 0001 installation took 95 seconds, followed by successful start.
These measurements are separate; an uncached Package Center install was not timed.

The test network denies direct Docker Hub registry checks even though its
existing image mirror can pull the pinned image. Lifecycle hooks reported
COMPOSE_IMAGE_DENIED without failing installation or start when the digest was
already cached. Build used verified registry metadata through the existing
mirror and a disposable TLS transport relay. No NAS mirror, CA or daemon
settings were changed. This does not prove uncached installation on every network.

## Installed acceptance

- Three contract tests pass. Named-volume and App-privilege changes also have
  failing-before/passing-after evidence. Published CLI check, build and inspect
  succeed for the generated SPK.
- The browser suite passes all four tests: two DSM session setups, main-menu
  opening/conversions/logout/reopen, and the denied account's gateway 403 with
  dsm_app_privilege_denied. No second ConvertX password is needed. This is DSM
  gateway authentication in mode none, not OIDC.
- Through the installed gateway, PNG to JPEG downloads 300 bytes, a one-second
  MP4 to WebM downloads 1,187 bytes, and TXT to PDF downloads 13,581 bytes.
  JPEG/WebM/PDF magic bytes were independently checked.
- The installed container runs as the package UID with read-only rootfs,
  ALL capabilities dropped, no-new-privileges and no published upstream ports.
  Both the private root and data directory are mode 0700.
- Anonymous requests to home, upload, results and download return 401. Both
  installed bridges are internal and contain only this App. Outside the NAS,
  port 3000 is unreachable while the DSM port is reachable as a positive control.
- Native package stop/start and 0001-to-0002 upgrade preserve all 26 job records,
  13 filename records and 13 output hashes, with the same UID, modes and database
  inode. The jobs include empty browser-created jobs as well as real conversions.

## Full nonroot converter proof

A separate disposable official-image fixture exercised every v0.19.0 converter
as an arbitrary nonroot UID with read-only rootfs, capabilities dropped,
no-new-privileges, isolated network and writable private HOME/XDG paths. Probes
call the image's compiled adapter modules and real binaries without mocks or
upstream changes. This proof complements the three installed browser conversions.

| Converters | Result |
| --- | --- |
| ImageMagick, GraphicsMagick, vips, FFmpeg, LibreOffice, pandoc (HTML/PDF), calibre, assimp, Inkscape, resvg, libjxl (encode/decode), vtracer, potrace, XeLaTeX, dvisvgm, pdftops, markitdown, vcf, libheif, msgconvert | 22 conversion cases pass across 20 converters; every output is nonempty |
| dasel JSON to YAML | Fails with unknown arbitrary UID in the official passwd database; documented limitation |

HEIF and MSG fixtures came from upstream libheif examples and the matching
Email-Outlook-Message 0.921 test corpus. They remain outside this repository.
The probe exits nonzero for the actual dasel failure. No passwd, UID or upstream
code change conceals it. HOME, XDG_CACHE_HOME and XDG_CONFIG_HOME use private
writable directories; PUID/PGID remain unset.

The earlier upstream HTTP proof also verified byte-identical downloads across
fresh sessions, confirming shared-space behavior. Its output sizes and container
restart proof are distinct from the installed gateway/lifecycle checks above.

## Uninstall and cleanup

Named-volume data survives either uninstall choice, including delete-data.
A native delete-data API request returns COMPOSE_DATA_RETAINED and removes
test markers from the package data, config and home directories. Independent
readback confirms all 31 job records and 16 output hashes remain in the volume;
this is the documented SDK limitation, not a claim that conversion data was erased.
After recording that result, explicit fixture cleanup removes the unused volume.
The generated native uninstall wizard explicitly names the retained volume and
warns that its files are not erased. See [platform limits](framework-gaps.md).
Keep-data uninstall and 0002 reinstall preserve the complete database records
and output hashes. A final run follows the actual DSM main-menu popup without
substituting a gateway URL and again passes all four browser tests.
Private device evidence, logs and screenshots remain outside the public
repository; temporary credential/profile copies are removed with the fixtures.

## Published framework 0.22.0

The release candidate uses published CLI/templates and SDK/App 0.22.0, executor/v0.20.0 and the template UI release 0.12.5, without source overrides. Registry tarball integrities match the lockfiles. On DSM 7.3.2 x86_64, fresh installation, native start, DSM main-menu sign-in, PNG-to-JPEG conversion and download, native stop/start and delete-data uninstall passed. The converted JPEG decoded at its original 1000-by-1400 dimensions. Package, container and network removal were read back; the retained named volume was separately removed as test-fixture cleanup. DSM-managed empty directories and package identity were retained.
