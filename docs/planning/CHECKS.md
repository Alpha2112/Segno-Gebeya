# M1 check ledger

All application checks use local development services. MySQL tests use only segno_gebeya_test. Historical M0 design QA is recorded separately and is not reused as application verification.

| Command | Latest observed outcome |
|---|---|
| pnpm lint | Passed before final edits; final run pending |
| pnpm typecheck | All workspace projects passed; final run pending |
| pnpm test | Four shared client tests passed; session-invalidation test added for final run |
| pnpm api:check | Route/spec/version checks passed; generated type freshness check added |
| pnpm build | Both dashboards passed |
| pnpm build:mobile:web | Expo web export passed; does not prove native delivery |
| pnpm test:e2e:web | Core review journey passed; expanded three-test suite rerun in progress |
| docker compose exec -T api php artisan test --compact | 17 passed, 114 assertions on MySQL |
| docker compose exec -T api php vendor/bin/pint --test | Passed before final edits; final run pending |
| docker compose exec -T api php vendor/bin/phpstan analyse --no-progress --memory-limit=512M | Level 5 passed before final edits; final run pending |
| python scripts/check-references.py | 15 hashes, 11 boards, 1458 unique IDs preserved |
| scripts/build-android-local.ps1 / Android native compile | Windows path fixes applied; final build/device result pending |
| iOS build/device | Not run: no Mac or approved Apple/Expo signing account |

CI is configured, not remotely executed. Complete this ledger from actual results before closing M1 acceptance.
