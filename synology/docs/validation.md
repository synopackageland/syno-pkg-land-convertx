# Validation

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
