"""Generate ignored local development environment files; never overwrite existing ones."""
from pathlib import Path
import secrets,base64
root=Path(__file__).resolve().parents[1]
p=root/'.env'
if not p.exists():p.write_text('MYSQL_PASSWORD='+secrets.token_hex(24)+'\nMYSQL_ROOT_PASSWORD='+secrets.token_hex(24)+'\n')
values=dict(line.split('=',1) for line in p.read_text().splitlines() if '=' in line and not line.startswith('#'))
p=root/'services/api/.env'
if not p.exists():
 s=(root/'services/api/.env.example').read_text().replace('APP_KEY=','APP_KEY=base64:'+base64.b64encode(secrets.token_bytes(32)).decode()).replace('DB_PASSWORD=','DB_PASSWORD='+values['MYSQL_PASSWORD'])
 p.write_text(s)
print('Local environment ready. Existing values were preserved; no secrets printed.')
