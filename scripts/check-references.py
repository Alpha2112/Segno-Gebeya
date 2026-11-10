"""Validate preserved source hashes and stable requirement IDs, without regenerating M0."""
from pathlib import Path
import csv,hashlib,json
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'docs/planning/SOURCE_MANIFEST.json').read_text(encoding='utf-8-sig'))
for item in manifest['files']:
    assert hashlib.sha256((root/item['path']).read_bytes()).hexdigest()==item['sha256'],item['path']+' changed'
with (root/'docs/planning/FEATURE_COVERAGE.csv').open(encoding='utf-8-sig',newline='') as f: rows=list(csv.DictReader(f))
assert len(rows)==1458 and len({r['ID'] for r in rows})==1458,'Requirement IDs changed'
assert len(list((root/'docs/design/images').glob('*.png')))==11,'Reference board inventory changed'
print(f"Preserved {len(manifest['files'])} source hashes, 11 boards and 1458 unique requirement IDs.")
