# M1 execution package — awaiting authorization

This is the approved task contract. Actual implementation, checks and remaining acceptance gaps are recorded in [M1_STATUS.md](M1_STATUS.md). Depends on [M0 exit checklist](M0_EXIT_CHECKLIST.md), reviewed [M1 designs](../design/m1/SCREEN_STATE_INDEX.md), and [decisions](DECISIONS.md). No future payment, delivery or telephone production contract is a prerequisite for M1-A.

## Internal tasks and gates

| Task | Deliverable / expected areas | Dependency | Acceptance checks and demo |
|---|---|---|---|
| M1-A1 Runtime compatibility | Record exact supported Node/pnpm/Expo/RN/PHP/Laravel versions; JavaScript workspace and Composer ownership; local environment contract | D-011/D-012 approval and M1 authorization | Versions documented and reproducible; no secret files tracked. Select only SDK-compatible native modules |
| M1-A2 Runnable foundations | apps/mobile, apps/merchant-web, apps/admin-web, services/api; shared tokens/contracts/localization; one JS lockfile and Composer lock | A1 | Each application starts; API health responds; apps use the same contract version; design tokens render in both languages |
| M1-A3 Native delivery lanes | Android emulator/physical device and iOS simulator/device build lane | A1, D-015 | Execute TP-01; save binaries, commands, OS/device and signing mode. Web preview cannot satisfy this |
| M1-A4 CI/observability/local services | Supported lint/type/test/build scripts; MySQL/Redis/mail capture setup; health, request IDs, redacted errors, environment examples | A2 | Clean checkout setup; CI checks pass; no production service connection; fail/recover local service and inspect safe error |
| M1-B1 Identity contract/data | Shared user identity, verified identifiers, customer profile, scoped roles/memberships, verification/challenge/session/audit records | A2; approve D-016 | Account lifecycle integration tests on MySQL; identifiers bound to challenge purpose; merchant role absent before approval |
| M1-B2 Register/sign-in/verify/recover | CM and MW/AW auth screens backed by API; local mail capture and explicitly simulated SMS for development | B1; approved auth screens | Register by email and phone; invalid/expired/rate-limited/replayed challenge rejected; generic recovery response; no account enumeration |
| M1-B3 Sessions/security | Secure mobile storage and revocable device tokens; CSRF-protected web session; admin elevated MFA; session list/revoke; deletion request boundary | B1–B2 | Revoke device and deny reuse; logout clears private caches; reject missing CSRF; enforce admin MFA and recovery controls |
| M1-B4 Policies and access tests | Store-scoped permissions, customer privacy, admin/support/finance separation; authorization in HTTP, jobs, media, broadcasts | B1–B3 | Two customers/two stores/staff fixtures prove ID substitution, guessed links and unauthorized transitions are denied |
| M1-C1 Application submission | MM application checklist, draft/upload handling, submit/status/resubmit; MW entry; private documents | B1/B4; D-017 checklist; approved screens | Save/retry draft; reject unsafe file; submit once; pending applicant retains customer access without merchant authority |
| M1-C2 Admin review | AW queue/detail, least-privilege document inspection, request information, rejection and approval with reason/confirmation/audit | C1; admin MFA | Reviewer requests information, applicant resubmits, authorized reviewer approves; concurrent reviewer conflict cannot grant twice |
| M1-C3 Mode/store switching | CM/MM mode chooser driven by server grants; separate navigation; active store context; role-revoked recovery | C2/B3/B4 | Same identity switches without account recreation; pending/rejected cannot enter merchant mode; revoked membership denies access despite cached UI |
| M1-C4 Milestone demonstration | Evidence, updated coverage/status, known issues, startup instructions | All above | Complete bilingual identity → merchant application → admin MFA/review → permitted switching; show denial and session-revocation branches |

## Approved minimum interface scope

Versioned REST endpoints, documented in OpenAPI during M1. The implemented schemas are in packages/contracts/openapi.json; this list records the approved scope:

- Register, login, logout and current-user capabilities: /api/v1/auth/register, /login, /logout and /me.
- Purpose-bound verification/recovery challenges: request, verify and consume; separate recovery reset after verified challenge.
- Profile/preferences and device sessions: self-only read/update/list/revoke.
- Merchant application: draft, document upload authorization, submit, status and information resubmission.
- Admin review: filtered queue, detail/document authorization, propose decision and confirmed decision using application revision.
- Mode switch resolves capabilities and store membership; clients cannot post a role name to grant themselves access.

Use structured field errors, safe public messages, challenge IDs/expiry/retry hints, request IDs, and version-conflict responses. Opaque IDs are not authorization. Document exact schemas before implementing consuming clients.

## Policy defaults accepted for M1 implementation

- Customer identity: verified email or phone before protected operations; one person may link both after re-verification. Never silently merge accounts by matching unverified identifiers.
- Password: proposed minimum 12 characters, allow paste/password managers, strength feedback, breached-password control where available; no arbitrary forced composition copied from the generated reference.
- Verification challenge: proposed 6 digits, 5-minute expiry, 5 attempts, 60-second resend cooldown plus account/IP limits. Server stores a protected verifier, not plaintext; bind purpose and identity; revoke previous challenge on resend. Codes in the prototype are published demo fixtures only.
- Recovery: generic request response; verify channel ownership before password reset; invalidate prior sessions; no customer-support bypass granting access based on caller ID.
- Web sessions: secure HttpOnly cookies, CSRF, explicit trusted origins; proposed 2-hour inactivity and 12-hour absolute customer/merchant lifetime.
- Admin sessions: no public registration; controlled first-admin provisioning; MFA enrollment and challenge with single-use recovery codes. Proposed 15-minute idle and 8-hour absolute lifetime; reauthenticate before privileged decisions.
- Mobile tokens: per-device, protected OS storage, proposed 7-day expiry with explicit reauthentication/revocation; no invented refresh-token protocol. Clear private data on logout.
- Role transitions: application states draft → submitted → under review → information needed → resubmitted → approved/rejected; only server review grants owner membership. Suspended/revoked states deny merchant actions.
- Deactivation/deletion: design request/confirmation and restricted state now; actual retention/erasure subject to approved policy, never falsely promise instant deletion of legally retained records.
- M1 phone delivery uses a development adapter; production SMS/email qualification is separate and must remain labelled unintegrated.

## Validation command contract

Proposed root scripts: pnpm lint, pnpm typecheck, pnpm test, pnpm build, pnpm api:check and pnpm test:e2e:web; Laravel php artisan test, formatter check and static analysis. Native build commands must match the selected SDK/lane and be recorded with actual results. These were not application checks during M0. Current executed outcomes are recorded in CHECKS.md.

## Staffing and estimates

No committed timeline. Planning range only: with one full-time senior cross-platform engineer, a half-time backend/security engineer, a half-time product designer, a half-time QA engineer, timely native-language/product review and already available signing/build accounts, M1 is roughly 4–7 working weeks. This excludes M0 review, procurement delays, unavailable iOS resources, production legal approval and major SDK incompatibility. A solo engineer needs re-estimation, not this date range reused as a promise.

M1 ends with evidence and review, not automatic authorization for M2. See provider register for operating-cost drivers.
