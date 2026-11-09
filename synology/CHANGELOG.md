# Changelog

## 0.20.0-0009

- en: Store temporary conversion files on disk instead of memory
- zh-TW: 轉換用的暫存檔改存於磁碟而非記憶體
- zh-CN: 转换用的临时文件改存于磁盘而非内存
- ja: 変換用の一時ファイルをメモリではなくディスクに保存
- ko: 변환 임시 파일을 메모리 대신 디스크에 저장
- de: Temporäre Konvertierungsdateien auf der Festplatte statt im Arbeitsspeicher speichern
- fr: Stocker les fichiers temporaires de conversion sur le disque plutôt qu’en mémoire
- es: Guardar los archivos temporales de conversión en el disco en lugar de en la memoria
- it: Salvare i file temporanei di conversione su disco invece che in memoria

Conversion temporary files move from a 1 GiB memory tmpfs on `/tmp` to SDK disk
scratch (`compose.services.convertx.scratch: [/tmp]`, with `TMPDIR=/tmp`): a
package-UID-owned mode-0700 directory on the package volume, emptied at every
container start. No memory tmpfs remains. Rebuilt with published SDK/App 0.53.25
(executor 0.53.6) and CLI 0.52.16. Upstream version and image digest are unchanged.

## 0.20.0-0008

- en: Improve page loading reliability when signing in
- zh-TW: 改善登入時頁面載入的穩定性
- zh-CN: 改善登录时页面加载的稳定性
- ja: サインイン時のページ読み込みの安定性を改善
- ko: 로그인 시 페이지 로딩 안정성 개선
- de: Zuverlässigkeit beim Laden von Seiten während der Anmeldung verbessern
- fr: Améliorer la fiabilité du chargement des pages lors de la connexion
- es: Mejorar la fiabilidad de la carga de páginas al iniciar sesión
- it: Migliorare l’affidabilità del caricamento delle pagine durante l’accesso

Rebuilt with SDK/App 0.53.21 and CLI 0.52.13. Upstream version and image
digest are unchanged. Tests and device acceptance were not run for this rebuild.

## 0.20.0-0007

- en: Fix DSM sign-in when opening over HTTP
- zh-TW: 修正以 HTTP 開啟時的 DSM 登入
- zh-CN: 修复通过 HTTP 打开时的 DSM 登录
- ja: HTTP で開いた際の DSM サインインを修正
- ko: HTTP로 열 때 DSM 로그인 문제 수정
- de: DSM-Anmeldung beim Öffnen über HTTP korrigieren
- fr: Corriger la connexion DSM lors de l’ouverture via HTTP

## 0.20.0-0005: fixed DSM path ingress

The App opens at `/synopkgland/SynoPkgConvertX/` on the current DSM HTTPS origin.
The gateway no longer publishes a dedicated port or offers a public port field.
The official image receives `WEBROOT=/synopkgland/SynoPkgConvertX`; its health
probe uses the same prefix. DSM App privilege, mode none and shared-space
behavior are preserved.

Built with CLI 0.43.0, Go SDK/App 0.43.1 and templates 0.38.0.
The executor pin comes from the released SDK executor manifest
(executor/v0.39.0). Upstream image and data volume identity are unchanged.

## 0.20.0-0003: CLI 0.42.2 / SDK 0.42.0 rebuild

Built with CLI 0.42.2 and SDK/App 0.42.0; templates 0.37.0.
The toolchain records the current UI release 0.19.2; this package has no custom UI dependency.
Upstream ConvertX v0.20.0 and its image digest are unchanged.
Preserves the DSM app launcher and saved gateway HTTPS port.


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
