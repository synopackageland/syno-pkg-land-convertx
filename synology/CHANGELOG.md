# Release notes

## 0.19.0-0002

- Security rebuild with published SDK/App/CLI/templates 0.24.0, executor/v0.24.0 and UI 0.14.0.
- Rebuild package-owned Go binaries with go1.26.10; preserve official upstream binaries and container images.
- Use the official App icon with source and license attribution; preserve all existing display names.
- Offline package checks only for this release; no NAS testing was performed.

- 使用已發佈 SDK/App/CLI/templates 0.24.0、executor/v0.24.0 與 UI 0.14.0 進行安全修補重建。
- 自有 Go binaries 使用 go1.26.10；保留官方上游 binary、容器映像與既有顯示名稱。
- 使用上游官方圖示並註記來源與授權；本輪未執行 NAS 測試。

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
