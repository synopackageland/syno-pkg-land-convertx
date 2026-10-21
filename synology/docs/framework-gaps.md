# Published-toolchain blocker

| Item | Evidence | Required framework work |
| --- | --- | --- |
| Package-private Compose data on clean install | CLI/templates 0.21.0 with SDK/App 0.21.0: check succeeds; build fails with COMPOSE_PRIVATE_BIND_TIMING_UNSUPPORTED before an SPK is emitted | Provide a nonroot, lifecycle-correct way to prepare the package's private bind base before Container Manager worker acquire, or another explicitly approved storage contract. Preserve ownership, stop/start, update and keep/delete-data semantics. |

The release's docs/compose.md documents this same boundary. The CLI's
standalone/compose.js `dsmComposeProblem` rejects mounts beginning with
`${SYNOPKG_PKGVAR}/` because of DSM's preinst/pkgvar/worker/postinst ordering.
This is not an image permission error and does not become supported by manually
creating directories on a test NAS. No source override or root hook is used.

The gateway already accepts `dsm-users`; there is no demonstrated administrator-
only limitation in this release. Real DSM permission checks still require a
buildable, installed package. This App intentionally needs no OIDC support.

Remaining gates after the framework fix: build and inspect both 0001 and 0002;
install; DSM menu SSO; denied-user 403; direct-port rejection; real conversions
and downloads through the gateway; logout/reopen; stop/start; data-bearing
0001-to-0002 upgrade; keep/reinstall; delete-data uninstall; cleanup/readback.

## Image compatibility limitation

The official image's dasel JSON-to-YAML conversion fails under arbitrary UID
123456 with `user: unknown userid 123456`, even with HOME/USER/LOGNAME set.
The package UID cannot be assumed to equal the image's built-in UID 1000.
No passwd rewrite, privileged process, alternate UID or source patch is added.
Treat dasel as unavailable in this candidate until upstream supports arbitrary
UIDs or an explicitly supported runtime identity mechanism exists. The other
20 release converters succeeded with real fixtures under the same nonroot UID.
