"""Workspace-local supported Node runtime; verify official archive checksum."""
from pathlib import Path
import hashlib,json,urllib.request,zipfile
root=Path(__file__).resolve().parents[1]
versions=json.load(urllib.request.urlopen("https://nodejs.org/dist/index.json"))
version=next(v["version"] for v in versions if v["version"].startswith("v24.") and v["lts"])
name=f"node-{version}-win-x64.zip"
target=root/".tools"/"downloads"/name
target.parent.mkdir(parents=True,exist_ok=True)
if not target.exists():urllib.request.urlretrieve(f"https://nodejs.org/dist/{version}/{name}",target)
checks=urllib.request.urlopen(f"https://nodejs.org/dist/{version}/SHASUMS256.txt").read().decode()
expected=next(line.split()[0] for line in checks.splitlines() if line.endswith("  "+name))
assert hashlib.sha256(target.read_bytes()).hexdigest()==expected,"Node archive checksum mismatch"
dest=root/".tools"/"node";dest.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(target) as z:
 for item in z.infolist():
  parts=Path(item.filename).parts[1:]
  if not parts:continue
  path=dest.joinpath(*parts).resolve()
  assert path.is_relative_to(dest.resolve())
  if item.is_dir():path.mkdir(parents=True,exist_ok=True)
  else:path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(z.read(item))
print(json.dumps({"node":version,"path":str(dest/"node.exe"),"sha256":expected}))
