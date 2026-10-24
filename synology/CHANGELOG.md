# Changelog

## 0.19.0-0004

- Move the HTTPS gateway from port 29443 to 31443 so ConvertX can coexist with
  Vaultwarden and Jellyfin. Update saved URLs, firewall rules and port forwarding
  to use `https://<nas-host>:31443` after upgrading.
- Rebuilt with published SDK/App/CLI/templates 0.28.0 (executor/v0.27.0), adding the SDK's slow-NAS startup defaults (generous health/readiness timing, Starting status in the UI, `/_spl/ping` gateway liveness). Go 1.26.10 and UI 0.14.4 are unchanged. Not tested on a NAS.
- 以已發佈的 SDK/App/CLI/templates 0.28.0（executor/v0.27.0）重建，納入 SDK 針對慢速 NAS 的啟動預設值（較寬鬆的健康檢查與就緒時限、介面顯示「啟動中」狀態、`/_spl/ping` 閘道存活檢查）。Go 1.26.10 與 UI 0.14.4 不變。尚未在 NAS 上測試。

## 0.19.0-0003

- Rebuild 0.19.0-0003 with published SDK/App/CLI/templates 0.26.0, UI 0.14.4 and Go 1.26.10. Maintainer: Syno Package Land. Official images and application sources are unchanged.
- 0.19.0-0003 使用已發佈 SDK/App/CLI/templates 0.26.0、UI 0.14.4 與 Go 1.26.10 重建；維護者顯示為 Syno Package Land。 官方映像與上游程式維持原樣。
