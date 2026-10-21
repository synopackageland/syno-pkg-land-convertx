#!/usr/bin/env python3
"""Scan packaging files using caller-supplied private patterns without echoing matches."""
import argparse
from pathlib import Path
import re
import subprocess
p=argparse.ArgumentParser()
p.add_argument('--pattern',required=True)
p.add_argument('--denylist',type=Path,required=True)
p.add_argument('--text',type=Path,action='append',default=[])
a=p.parse_args()
root=Path(__file__).resolve().parents[2]
files=subprocess.check_output(['git','ls-files','-z','--cached','--others','--exclude-standard','--','synology/'],cwd=root).decode().split('\0')
regex=re.compile(a.pattern)
literals=[x for x in a.denylist.read_text().splitlines() if x]
failed=[]
for file in [root/x for x in files if x]+a.text:
 if not file.is_file(): continue
 value=file.read_bytes().decode(errors='ignore')
 if regex.search(value) or any(x in value for x in literals): failed.append(str(file.relative_to(root)) if file.is_relative_to(root) else file.name)
if failed: raise SystemExit('Private content detected in: '+', '.join(failed))
print('Public content scan passed.')
