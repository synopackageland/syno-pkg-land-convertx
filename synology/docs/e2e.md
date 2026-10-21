# DSM acceptance suite (not run: SPK build blocked)

The suite in tests/e2e uses the released CLI's DSM login/profile helpers. Run it
only after the package-private storage blocker is fixed and both 0001/0002 SPKs
have passed build and inspect. It is not evidence of completed DSM acceptance.

1. Use the designated isolated Linux browser/gate host. Install the test-only
   dependencies with `npm ci --ignore-scripts` in tests/e2e.
2. Set DSM_E2E_URL to the test NAS, CONVERTX_E2E_URL to its HTTPS gateway,
   DSM_E2E_PROFILE_DIR to a private reusable profile directory, and
   DSM_E2E_OUTPUT_DIR to private evidence storage. Keep profiles, screenshots,
   reports and accounts out of the public repository.
3. Set DSM_E2E_ACCOUNT_AUTHORIZED and DSM_E2E_ACCOUNT_DENIED to private JSON
   account files using the CLI's `{username,password}` format. The first account
   must already have the app privilege; the second must lack it. Do not create
   or edit NAS users or DSM privileges as a side effect of this suite.
4. Set CONVERTX_E2E_FIXTURES to a private directory with input.png, a one-second
   input.mp4, and input.txt (runtime.mjs creates these on the image-proof fixture).
5. Run `npm test`. Main-menu opening must reach upstream UI without a second
   password; each conversion must yield a nonempty download, and PDF output
   must begin with %PDF-. Gateway logout uses its same-origin POST endpoint;
   reopening must authenticate from the existing DSM session. The denied account
   follows the browser SSO flow and must receive gateway 403.
6. Independently inspect Container Manager's effective project and all container
   port bindings. From outside the NAS verify port 3000 is unreachable; verify
   anonymous requests cannot fetch uploads, conversion results or downloads.
7. With real generated SPKs, test native Package Center install, stop/start,
   0001-to-0002 upgrade with file/DB hash readback, keep-data uninstall/reinstall,
   and delete-data uninstall with exact package-owned path readback. Finally
   remove only the owned fixture and verify package/container/network/data state.

HTTP and converter module probes in tests/http.mjs and tests/runtime.mjs are
separate upstream-image proofs. They bypass no product restriction and cannot
establish that the DSM gateway, install wizard or lifecycle hooks work.
