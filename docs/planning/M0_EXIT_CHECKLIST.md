# M0 exit checklist and review handoff

**Status: M0 foundations and M1 designs/defaults accepted on 2026-11-05; M1 implementation authorized and underway.** Historical design QA below proves the M0 artifacts only. See [M1 status](M1_STATUS.md) for application evidence. Native-language/legal review and unavailable iOS resources remain acceptance gates.

Current plan: [PLAN.md](PLAN.md). [M1 tasks](M1_EXECUTION.md). Review visuals first: [M1 browser designs](../design/m1/index.html), [mobile overview](../design/m1/mobile-overview.png), [desktop overview](../design/m1/web-overview.png), [M0 walkthrough](../design/m0/index.html).

## Exit evidence

| Criterion | Status | Evidence / remaining condition |
|---|---|---|
| Reconcile sources and current numbering | Passed | PLAN.md names M0–M18 as current; older prompt is historical; baseline archived unchanged; no separate five-milestone summary found |
| Preserve original requirements and image references | Passed | 15 source hashes match SOURCE_MANIFEST.json; original master/brief/index and 11 boards unchanged |
| Individual traceability and separate statuses | Passed, with later design refinement pending | 1458 stable source items in FEATURE_COVERAGE.md/CSV; source IDs include repeated summaries/data/process items, not 1458 distinct screens; production statuses No |
| Required planning artifacts and concise AGENTS links | Passed | PLAN, FEATURE_COVERAGE, DECISIONS, PROVIDER_QUALIFICATION, this checklist, DESIGN_SYSTEM; extra M1 task specification and indexes |
| Proposed design foundations and Ethiopic support | Accepted for M1 implementation | Exact tokens/type/components/states, bundled licensed fonts and 18 calculated contrast pairs; native copy/accessibility review still needed |
| Actual M1 visual layouts and variants | Accepted for M1 implementation | 22 views (13 mobile, 8 desktop, 1 specimen), local state controls and individual PNGs; scope indexed in m1/SCREEN_STATE_INDEX.md |
| Interactive purchase-to-fulfilment walkthrough | Passed as design artifact | Clickable local selections, cart, payment result branches, packing/tracking; all simulation explicitly labelled; future designs unapproved |
| Artifact browser validation | Passed for stated checks | 292 renders; 37 local interaction checks, zero reported failures; m0/VALIDATION.md and QA_RESULTS.json |
| Actionable decisions/provider dependencies | Passed as documentation; qualification pending | Owners/owner-needed, evidence/confidence, recommendation/alternatives, proof and blocking milestones in registers; no provider approved |
| Financial invariants | Draft delivered; finance approval pending | Balanced postings, merchant/creator liability, refunds, commissions, holds, deduplication and reconciliation cases |
| M1 task/dependency/native verification package | Passed as specification | M1-A/B/C tasks, interfaces, proposed defaults, commands/demos, build-lane evidence requirements and explicitly conditional estimate |
| Native-language copy and policy wording | Pending | D-014 reviewer and D-017 checklist/owner; technical review controls/annotations may remain English |
| Exact M1 design and policy approval | Accepted 2026-11-05 | D-013/D-016 foundations and M1 defaults accepted by "approved go ahead"; language/legal qualification remains open |
| Runtime and native build lane decisions | Runtime implemented; iOS unavailable | D-011/D-012 exact versions recorded in M1 status; user has no Mac/Apple build account. Android evidence is recorded separately |
| Native builds and real integrations | M1 local checks authorized and underway | See M1_STATUS.md for actual Android/API evidence. Production providers remain unqualified |
| M1 implementation authorization | Granted 2026-11-05 | User explicitly approved M1 after the review handoff. This grants no M2 authorization |

## Corrections to the approved baseline

1. One canonical plan and one numbering system; historical material retained.
2. M0 review readiness separated from product design approval and M1 authorization.
3. ETB, framework/runtime recommendations and provider candidates remain unapproved assumptions/proposals.
4. Later production contracts do not gate unrelated M1 foundations.
5. Added explicit financial posting/liability/hold invariants and real proof criteria.
6. Replaced mobile-only desktop assumptions with actual M1 web-auth/MFA/review drafts; later desktop operations remain undrafted.
7. Application verification remains distinct from local prototype QA.

## Scope accepted for M1 implementation

- DESIGN_SYSTEM.md v1 foundations: colors, typography/font support, spacing, components, dark mode, accessibility and state conventions.
- All named M1 views/state variants in m1/SCREEN_STATE_INDEX.md: customer registration/sign-in/verification/recovery/reset, profile/language/permissions, merchant application/status, mode switching, sessions/account actions; merchant web sign-in/recovery; admin sign-in/MFA enrollment/challenge/recovery/codes and application review.
- Proposed identity/session/MFA/review policy defaults in M1_EXECUTION.md; business evidence wording requires D-017.
- M0 walkthrough as a **simulated flow direction**, not final M2/M3 screen approval.
- Scope acceptance does not prove native-language/legal correctness or production readiness. The separate explicit M1 authorization permits routine M1 implementation and local checks.

## Outstanding acceptance decisions

Name the Amharic reviewer and merchant-application policy/checklist owner. The user has confirmed that no Mac or Apple/Expo signing account is available; iOS acceptance remains open. These gaps do not revoke the explicit M1 implementation authorization.

ETB, payment/delivery/telephone providers and commercial rates remain later gates, rather than prerequisites for M1 foundations. Current implementation evidence and limits are in [M1_STATUS.md](M1_STATUS.md). M2 still requires separate authorization.

## Preview instructions and evidence

Open the linked HTML files directly, or run python -m http.server 8765 --bind 127.0.0.1 from the repository root and visit /docs/design/m1/index.html or /docs/design/m0/index.html. The local prototypes require no project dependencies and contact no product providers. Sources and PNG exports are saved in the same directories.
