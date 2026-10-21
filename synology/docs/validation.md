# Validation boundary

This draft has **no SPK and no installed DSM App**. Released-toolchain check is
successful, but build is explicitly refused with
`COMPOSE_PRIVATE_BIND_TIMING_UNSUPPORTED`. Do not infer DSM SSO, App permissions,
lifecycle or storage safety from the upstream-container proof below.

## Published inputs

CLI/templates 0.21.0; SDK/App 0.21.0; executor/v0.20.0; template UI 0.12.5.
No source overrides. Version fields produce the requested 0.19.0-0001 format;
CLI check accepts version 0.19.0 with build 1. The build fails at the private-bind
lifecycle guard before an SPK can be emitted or inspected.

Official image: c4illin/convertx:v0.19.0 at the index digest in image-lock.json.
The registry manifest/config bytes were checked against their SHA-256 digests;
both Linux amd64/arm64 config labels identify upstream v0.19.0 and its commit.
The proposed package targets x86_64 only. amd64 compressed layers total
1,538,985,762 bytes; Docker image size is 3,828,284,752 bytes. One uncached image
pull on the designated DSM 7.3.2 machine took 411 seconds. This is an observed
pull duration, not a completed Package Center installation time.

## Checks

- TDD: contract tests initially fail with missing manifest/Compose/image lock;
  after implementation, all three pass.
- Published CLI effective inventory: nonroot package UID placeholder, all
  capabilities dropped, isolated bridge, no upstream ports, private package
  bind and read-only SDK initializer mount.
- Build: expected framework refusal, recorded distinctly from a successful gate.
- e2e specs: dependency lock and syntax checked on the Linux gate host; execution
  awaits a buildable installed package. No browser acceptance result is claimed.

## Upstream nonroot image proof

The temporary fixture uses UID/GID 123456, read-only rootfs, ALL capabilities
dropped, no-new-privileges, 1 GiB /tmp tmpfs, private writable data, and a dedicated
internal bridge with no published ports. Root only prepares disposable test
storage; no product lifecycle hook or installed package is bypassed. The test containers, network, storage and pulled image were removed after
evidence collection; readback confirmed their absence. Shared builder caches
remain intact.

HOME, XDG_CACHE_HOME and XDG_CONFIG_HOME point into the writable private data,
and USER/LOGNAME are set to convertx. The latter declarations allow LibreOffice's
profile initialization with an arbitrary UID; PUID/PGID are not set.

The probes call the official image's compiled adapter modules and real binaries,
without mocking subprocesses or modifying upstream source.

| Converter results | Outcome |
| --- | --- |
| ImageMagick, GraphicsMagick, vips, FFmpeg, LibreOffice, pandoc (HTML and PDF), calibre, assimp, Inkscape, resvg, libjxl (encode and decode), vtracer, potrace, XeLaTeX, dvisvgm, pdftops, markitdown, vcf, libheif, msgconvert | 22 real conversion cases passed across 20 converters; every output is nonempty |
| dasel JSON to YAML | Failed: unknown arbitrary UID in the official image's passwd database; setting USER/LOGNAME does not fix it |

All 21 v0.19.0 converters were exercised. The libheif fixture contains two
images; both numbered PNG outputs were validated. HEIF input came from libheif's
public examples; MSG input came from the matching Email-Outlook-Message 0.921
CPAN distribution's test corpus. These external fixtures remain outside the
public repository. The complete probe exits nonzero because dasel really fails.

Upstream HTTP upload/convert/results/download passed for PNG to JPEG (300 bytes),
one-second MP4 to WebM (1,187 bytes), and TXT to PDF (12,648 bytes). Content types
and JPEG/WebM/PDF magic bytes were checked. A fresh upstream session downloaded
the same byte-identical files, confirming the configured shared-space behavior.
These run through the image's own loopback HTTP service, not an installed DSM gateway. No DSM SSO pass is implied.

The fixture had an empty Docker PortBindings map. A TCP connection from outside
the NAS to its port 3000 failed. Container stop/start became healthy again after
readiness polling; SHA-256 checks of all three downloaded files remained equal.
These are container-fixture observations, not Package Center lifecycle results.

## Pending DSM acceptance

Fresh install and installation duration; DSM main-menu login, denied-user 403,
anonymous rejection; upstream-port rejection on the installed effective project;
three downloads through the gateway; logout/reopen; stop/start; data-bearing
0001-to-0002 upgrade; uninstall keep/reinstall and delete-data; final readback.
Neither OIDC nor administrator role provisioning is applicable to this shared
upstream anonymous space. Account removal must deny future gateway access while
retaining other users' shared files.
