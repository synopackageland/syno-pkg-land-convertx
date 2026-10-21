# Draft release notes

## 0.19.0-0001 — not released, blocked candidate

- Preserve upstream ConvertX v0.19.0 UI and use its pinned official image.
- Authenticate with the SDK DSM gateway; no second ConvertX password or OIDC
  client is configured.
- **Shared space: authorized users can see and download each other's files.**
  **共用空間、彼此看得到檔案；所有獲授權使用者共用同一份資料。**
- Request a nonroot package UID, read-only rootfs, private data and no public
  upstream container port. Automatic old-job cleanup runs every 24 hours.
- Known runtime limitation: dasel cannot resolve an arbitrary package UID.
- Packaging blocker: published CLI 0.21.0 rejects package-private Compose binds
  with COMPOSE_PRIVATE_BIND_TIMING_UNSUPPORTED. No SPK, DSM login acceptance,
  install/upgrade/uninstall result or release is available yet.
