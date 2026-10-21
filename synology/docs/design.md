# ConvertX DSM integration

The package uses the published SDK's named-volume storage contract and
retains the unchanged upstream UI and image.

## Identity and sharing

ConvertX has no OIDC/header integration. The SDK identity gateway uses `mode:
none` with `access: dsm-users`: DSM authenticates and checks the application's
DSM privilege before the gateway proxies any upstream request. `none` selects
no upstream identity protocol; it does not select public access. No local
ConvertX password or OIDC client is provisioned. DSM administrators and other
DSM-authorized users use the same space; there is no per-user App administrator
role or file isolation in this integration.

Both ALLOW_UNAUTHENTICATED and UNAUTHENTICATED_USER_SHARING are explicitly true.
The latter makes upstream use shared user id 0 instead of creating per-browser
anonymous identities. Authorized users can see and download each other's files.
The upstream branding setting displays this shared-space notice without
patching the UI. Account registration stays off. Removing a DSM account ends
its gateway eligibility; shared files remain shared until cleanup. It must not
trigger deletion of other users' files.

## Network boundary

Only the gateway's HTTPS listener (29443) is public. There are no Compose
published ports or host-network services. The published SDK planner removes
any upstream port publishing, allocates a dedicated internal bridge for ingress,
and gives the gateway the container's internal address. Isolated egress disables
Internet access and uses no outbound network. No unrelated service belongs to
the application's networks. Docker socket, privileged mode, host PID/network,
external networks and filesystem mounts outside declared package data are absent.

Acceptance must inspect the installed effective project (not just this source),
confirm no port bindings, and connect from outside the NAS to port 3000 and every
actual published port except the gateway: all must fail. A DSM-authenticated
account lacking the application's DSM privilege must receive 403. An anonymous
request must not reach the upstream page.

The host and its privileged container controller are trusted: an internal bridge
is not an access-control boundary against NAS root or arbitrary host processes
that can connect to the private bridge address. This design promises no direct
LAN/WAN listener; it cannot promise exclusive gateway access against a hostile
NAS host. No host firewall or daemon configuration is changed by this App.

## Process, data, and cleanup

Use the official v0.19.0 multi-platform image by immutable index digest. Its
root-oriented entrypoint is safe to invoke with PUID/PGID unset under an explicit
Compose package UID: its exec path then inherits that UID. No image rebuild,
usermod, groupmod, chown, root initializer or App-owned login adapter is added.
The SDK sets the real package UID/GID, drops every capability and enables
no-new-privileges. Rootfs is read-only; a bounded 1 GiB /tmp tmpfs is writable.
HOME, XDG cache and XDG config live in SDK-initialized private subdirectories of /var/tmp/convertx. USER/LOGNAME name the upstream runtime context; they do not create a passwd entry or impersonate a DSM user.

A private named volume is mounted on /var/tmp, the official image's sticky base.
SDK storage_init creates /var/tmp/convertx and its private data, HOME, cache,
config and public subdirectories as the package UID. The app changes directory
after initialization and keeps its upstream relative data/ paths. SDK prepare
copies /app/public into the private public directory because the upstream asset
glob does not follow a directory symlink. The image and upstream code stay intact.

AUTO_DELETE_EVERY_N_HOURS=24 checks for jobs older than 24 hours every 24 hours,
so deletion can approach 48 hours after creation while running. The package does
not delete files while stopped. MAX_CONVERT_PROCESS=2 bounds concurrency.
Named volumes survive keep-data and delete-data uninstall; the wizard reports
the exact retained volume. See framework-gaps.md for that known SDK limitation.

## Upstream and license

The fork's existing main already contains upstream development after v0.19.0;
merging that tag reports already up to date. These additions modify only
synology/. Runtime uses the exact v0.19.0 official image and its labeled source
commit, not main's upcoming 0.20.0 code. The image lock records that commit and
both architectures, although the proposed SPK currently targets x86_64 only.
Upstream source: https://github.com/C4illin/ConvertX/tree/v0.19.0 (AGPL-3.0).
All packaging changes are MIT and retain upstream notices. This draft is not a
release, and the CLI includes its generated SDK/template notices in the SPK.
