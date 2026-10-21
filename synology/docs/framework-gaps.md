# Platform limits

## Supported storage and retention

The package uses the published SDK's supported named-volume path. Docker mounts
`data` on the official image's sticky `/var/tmp` base; SDK `storage_init` creates
and validates the package-UID-owned mode-0700 `convertx` subtree before executing
the unchanged upstream application. No host bind, root initializer, ownership
repair or image change is required.

The package's working directory is the private subtree, so upstream's relative
`data/` paths stay private. SDK preparation copies the official image's public
assets into the private public/ directory: the upstream static-file glob does
not traverse a directory symlink. `/usr/bin/env -C` changes directory only after
the SDK initializer has created and validated it. HOME and XDG paths are private.

Named volumes remain after **both** keep-data and delete-data uninstall choices.
The native wizard and successful uninstall message name the exact undeleted
volume. This is a known SDK limitation; delete-data does not erase ConvertX data.
A reinstall reuses the same volume. An administrator may explicitly delete that
exact unused volume after confirming its contents are no longer needed.

## Converter compatibility

The official image's dasel JSON-to-YAML conversion fails under an arbitrary
package UID with `user: unknown userid`. Setting HOME/USER/LOGNAME does not add a
passwd entry. Do not change passwd, UID or upstream code to conceal this limit.
The other 20 release converters succeeded with real nonroot fixtures.

## Identity

The published gateway supports `dsm-users` and DSM App privilege checks. ConvertX
uses its `none` upstream mode and one shared anonymous space, so OIDC subject
mapping and upstream administrator roles are not applicable. DSM-authorized
users can see each other's files; account deletion does not delete shared data.
