"""Inspect M0 documentation links, source preservation and authorization boundary."""
from pathlib import Path
import re,json,urllib.parse,hashlib
ROOT=Path(__file__).resolve().parents[2]
mds=[ROOT/"AGENTS.md",ROOT/"README.md",ROOT/"plan.md",*sorted((ROOT/"docs/planning").glob("*.md")),*sorted((ROOT/"docs/design/m0").glob("*.md")),*sorted((ROOT/"docs/design/m1").glob("*.md")),ROOT/"docs/design/DESIGN_SYSTEM.md"]
missing=[]
for p in mds:
 for match in re.finditer(r"\]\(([^)]+)\)",p.read_text(encoding="utf-8")):
  target=match[1].strip("<>")
  if target.startswith(("http://","https://","#","mailto:")):continue
  part=urllib.parse.urlsplit(target).path
  resolved=(p.parent/urllib.parse.unquote(part)).resolve()
  if not resolved.exists():missing.append({"file":p.relative_to(ROOT).as_posix(),"target":target})
sources=json.loads((ROOT/"docs/planning/SOURCE_MANIFEST.json").read_text())
hashes=all(hashlib.sha256((ROOT/x["path"]).read_bytes()).hexdigest()==x["sha256"] for x in sources["files"])
scenes=json.loads((ROOT/"docs/design/m1/scenes.js").read_text(encoding="utf-8").removeprefix("window.SG_SCENES = ").strip().removesuffix(";"))
exports=all((ROOT/("docs/design/m1/previews/"+s["id"]+".png")).exists() for s in scenes)
appdirs=[d for d in ["apps","services","packages","node_modules","vendor"] if (ROOT/d).exists()]
result={"markdown_files_checked":len(mds),"missing_local_links":missing,"preserved_source_hashes_match":hashes,"all_22_default_exports_present":exports,"production_application_directories_present":appdirs,"scope":"M0 documentation/design only"}
(ROOT/"docs/planning/ARTIFACT_INTEGRITY.json").write_text(json.dumps(result,indent=2)+"\n",encoding="utf-8")
print(json.dumps(result,indent=2))
if missing or not hashes or not exports or appdirs:raise SystemExit(1)

