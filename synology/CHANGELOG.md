# Changelog

## 0.19.0-0004

- Move the HTTPS gateway from port 29443 to 31443 so ConvertX can coexist with
  Vaultwarden and Jellyfin. Update saved URLs, firewall rules and port forwarding
  to use `https://<nas-host>:31443` after upgrading.

## 0.19.0-0003

- Rebuild 0.19.0-0003 with published SDK/App/CLI/templates 0.26.0, UI 0.14.4 and Go 1.26.10. Maintainer: Syno Package Land. Official images and application sources are unchanged.
- 0.19.0-0003 使用已發佈 SDK/App/CLI/templates 0.26.0、UI 0.14.4 與 Go 1.26.10 重建；維護者顯示為 Syno Package Land。 官方映像與上游程式維持原樣。
