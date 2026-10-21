# Release notes

## 0.19.0-0001 — not released

- Preserve upstream ConvertX v0.19.0 UI and use its pinned official image.
- Authenticate with the SDK DSM gateway; no second ConvertX password or OIDC
  client is configured.
- **Shared space: authorized users can see and download each other's files.**
  **共用空間、彼此看得到檔案；所有獲授權使用者共用同一份資料。**
- Use a nonroot package UID, read-only rootfs, private named-volume data and no public
  upstream container port. Automatic old-job cleanup runs every 24 hours.
- Known runtime limitation: dasel cannot resolve an arbitrary package UID.
- Named-volume data remains after either uninstall choice, including delete-data:
  this known SDK limitation is shown in the native wizard and documentation.
