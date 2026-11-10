# M1 implementation and acceptance status

Authorized 2026-11-05 by the user's “approved go ahead” following the M0 handoff. The M0 foundations, M1 designs and identity/session/MFA defaults are accepted for implementation. M2 and later milestones remain unauthorized.

M1 application work now exists across the mobile app, both dashboards and the Laravel API. **M1 acceptance is still open:** iOS resources, native-language/legal review and the remaining native checks below are not silently marked complete.

| Task group | Implemented behavior | Evidence / remaining acceptance |
|---|---|---|
| M1-A foundations | pnpm workspace, shared OpenAPI-derived contracts/tokens/copy, Expo app, separate merchant/admin Vite apps, Laravel/MySQL API, Redis, local mail queue/capture, environment bootstrap and CI configuration | Root lint/type/build/unit/contract checks; original-source hash guard. Hosted CI has not been run. Android build investigation is recorded below; iOS unavailable |
| M1-B identity | Email/phone registration, purpose-bound OTP, recovery/reset, profile/photo, Ethiopia addresses/preferences, password change, per-device tokens, web cookies/CSRF, owned sessions/revocation, restricted deletion requests, controlled admin provisioning and MFA | MySQL tests and real browser journeys. SMS is a labelled development adapter. SecureStore is implemented; device behavior requires native evidence. Optional social sign-in has no qualified provider and is unimplemented |
| M1-C merchant onboarding | Draft/save/private upload, submit/status/information/resubmit, MFA-protected admin queue/detail/download, revision-checked review/confirmation, reason/audit, atomic owner membership, mode/store context and denied-access recovery | MySQL workflow/access tests and browser journey. Evidence policy is development-only; production registration and merchant submission fail closed. Legal verification is not claimed |

## Observed application checks

- Latest backend lifecycle/access run: **17 passed, 114 assertions** (including two subsequently removed scaffold examples; final focused count is recorded in CHECKS.md), against dedicated MySQL `segno_gebeya_test`. Includes OTP attempt/expiry/replay/purpose, generic recovery, Unicode password suffixes, reclaiming an unverified registration, private addresses/photos, scoped review, confirmation idempotence/conflicts, role denial, MFA replay/recovery, device revocation and account restriction.
- PHPStan level 5 and Pint have passed; final checks are rerun after relevant edits.
- The full browser account → private evidence → MFA → request information → resubmit → confirmed approval → merchant mode → device revocation journey has passed against the real API.
- Profile-photo/address/preference/password-change and recovery browser journeys have separate tests. Final run status is recorded in the evidence ledger.
- Browser rendering checks include Amharic/dark and 320/390/768 widths; screenshots are reviewed as application evidence, separate from the historical M0 prototype renders.
- Shared API-client tests cover credentials/CSRF, field/correlation errors, network failure and suppressing private responses after session invalidation.
- OpenAPI is checked against the actual Laravel route inventory and generated TypeScript. API clients share schema version 1.0.0.
- All 15 original source hashes, 11 image boards and 1458 stable requirement IDs remain preserved.

Evidence: [browser result](evidence/M1_WEB_RESULT.json), [Amharic profile](evidence/m1-profile-am-dark.png), [admin queue](evidence/m1-admin-queue.png). Exact commands and latest outcomes are maintained in [CHECKS.md](CHECKS.md). Never infer native or production verification from a browser export.

## Native delivery

The first Android emulator launch failed; a separate headless API 33 emulator subsequently booted. Initial Windows native builds exposed dependency and path-length problems:

1. pnpm 12 ignores package-layout settings in .npmrc; the supported hoisted setting now lives in pnpm-workspace.yaml.
2. Android Ninja rejected generated object filenames over 260 characters. The local build helper creates an owned short-path source copy, and an Expo config plugin sets CMAKE_OBJECT_PATH_MAX so CMake hashes long object names.
3. Native directories remain generated. No Android/iOS source or third-party package was hand-patched.

Android **debug x86_64 compilation passed** with 463 Gradle tasks after the hoisted/short-path/CMake fixes. APK: `.tools/artifacts/segno-gebeya-m1-debug.apk`, SHA-256 `0bcac13370f3ba6cb8d73fcaa9435a0f3c18ec30cbff5a55495aacfc93313ccb`.

The existing read-only emulator could not install the APK because its storage was full. A fresh owned API 34 emulator is being used for device checks. Current build command: `./scripts/build-android-local.ps1`; local logs/artifacts are ignored under .tools. A successful compilation alone does not prove device behavior.

The user has no Mac or approved Expo/Apple signing account. EAS profiles and the iOS bundle configuration exist, but **no iOS binary, signing, simulator or device result is claimed**.

## Security and data boundaries

Web access uses HttpOnly cookie sessions and CSRF. Mobile tokens are per-device, expiring and revocable; native storage uses Expo SecureStore. Administrator review rejects bearer tokens, requires MFA, and requires recent password authentication for privileged decisions. No administrator can register publicly.

Passwords use Laravel Argon2id. Legacy development bcrypt hashes remain readable and are rehashed after successful sign-in. Passwords chosen by the party proving channel ownership replace credentials on an unverified registration; earlier unverified credentials cannot survive that ownership proof. OTP verifiers are hashed, MFA secrets/recovery controls are protected, queued email payloads are encrypted, and private files never receive public storage URLs.

Deletion is a restricted request boundary, not completed legal erasure. Profile photos are re-encoded before storage. Merchant evidence remains private and requires scoped authorization. Currency, payments, delivery, commerce, AI and financial state are outside M1.

## Remaining gates

- iOS build/signing/device resources: unavailable, confirmed by the user.
- Native Android end-to-end, token persistence, OS accessibility and file-picker checks: enter actual device results; do not substitute web preview.
- Amharic copy requires a named native reviewer. Draft UI text and browser reflow do not prove linguistic accuracy.
- Merchant evidence, registration terms, privacy and retention policies require qualified review. The current notice and evidence checklist explicitly describe a local development pilot using sample data.
- Production email/SMS qualification and optional social-login decisions remain open. Mailpit/development OTP evidence does not qualify a production provider.
- Broader security/load/recovery and all later-milestone behavior remain future acceptance work.

Run instructions: [README](../../README.md). Requirement statuses: [coverage register](FEATURE_COVERAGE.md). This is an implementation progress record, not public-release approval.

