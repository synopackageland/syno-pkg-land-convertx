#!/usr/bin/env python3
"""Render the pinned, unmodified official image's DSM runtime declaration."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
lock=json.loads((root/'image-lock.json').read_text())
(root/'compose.yaml').write_text('''# Official image, unchanged; the SDK sets the actual package UID/GID.
services:
  convertx:
    image: '''+lock['reference']+'''
    user: "${SYNOPKGLAND_UID}:${SYNOPKGLAND_GID}"
    entrypoint: [/usr/bin/env, -C, /var/tmp/convertx, /entrypoint.sh]
    command: [bun, run, /app/dist/src/index.js]
    working_dir: /app
    read_only: true
    cap_drop: [ALL]
    security_opt: [no-new-privileges:true]
    environment:
      ALLOW_UNAUTHENTICATED: 'true'
      UNAUTHENTICATED_USER_SHARING: 'true'
      ACCOUNT_REGISTRATION: 'false'
      HTTP_ALLOWED: 'false'
      AUTO_DELETE_EVERY_N_HOURS: '24'
      MAX_CONVERT_PROCESS: '2'
      HOME: /var/tmp/convertx/home
      XDG_CACHE_HOME: /var/tmp/convertx/cache
      XDG_CONFIG_HOME: /var/tmp/convertx/config
      USER: convertx
      LOGNAME: convertx
      TZ: UTC
      BRANDING: "ConvertX — shared space / 共用空間（彼此看得到檔案）"
    volumes: [data:/var/tmp]
    tmpfs:
      - /tmp:rw,nosuid,nodev,size=1073741824,mode=1777
    restart: unless-stopped
    stop_grace_period: 45s
volumes:
  data: {}
''')
