# Changelog


## 0.20.0-0002: SDK 0.38.2 rebuild

Built with SDK/App 0.38.2, CLI 0.41.9 and templates 0.35.5; upstream ConvertX v0.20.0 and its image digest are unchanged.
The gateway HTTPS port (default 31443) is now chosen in the install wizard; upgrades keep the saved port.
Adds an app-open smoke test (`npm run e2e:smoke`) for administrator, permitted normal user and signed-out access.


## 0.19.0-0009: SDK entry-gate migration

Built with SDK/App/templates 0.32.0, CLI 0.34.0 and executor v0.32.0.
Every request retains the DSM entry gate. No upstream-authenticated path exceptions are enabled in this build.
Protected executor payloads changed: administrator approval is required again after upgrading.
No NAS installation or device acceptance was performed for this rebuild.

## 0.19.0-0006

- Improve opening the App from the DSM menu and external access settings
- 改善從 DSM 選單開啟 App 與外網存取設定
