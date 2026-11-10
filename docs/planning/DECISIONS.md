# Decisions and open questions

Updated 2026-11-04. Current plan: [PLAN.md](PLAN.md). Only explicit user choices are approved. Creating a design draft is not its approval.

The current M0 authorization is preserved in [M0_AUTHORIZATION.md](M0_AUTHORIZATION.md). It overrides historical implementation prompts and authorizes only documentation and design artifacts.

## Established decisions

| ID | Decision | Status and evidence |
|---|---|---|
| D-001 | Public name Segno Gebeya; slug segno-gebeya | Approved: AGENTS.md and user |
| D-002 | Ethiopia launch; Amharic and English interfaces | Approved: planning answers and M0 authorization |
| D-003 | One mobile app, separate customer/merchant navigation, one identity | Approved: master §3 and M0 authorization |
| D-004 | Separate merchant/admin React dashboards; shared modular Laravel/MySQL backend | Approved: master §3 and M0 authorization |
| D-005 | Full agreed blueprint before first public release; M0–M18 internal delivery | Approved: planning answers; no reduced-feature public pilot |
| D-006 | Review/approve designs before implementing each milestone | Approved: planning answer and M0 authorization |
| D-007 | M0 documentation and design artifacts may be created now | Authorized by attached M0 request; M1 remains unauthorized |
| D-008 | ETB settlement | Assumption only. Not confirmed by selecting Ethiopia |
| D-009 | Original requirements, brief, atlas and images preserved | Required. Hash evidence in SOURCE_MANIFEST.json |
| D-010 | Current canonical plan is docs/planning/PLAN.md | M0 source reconciliation; root plan.md is an entrypoint and the approved historical baseline is preserved in history/APPROVED_PLAN_2026-11-04.md |

## Decisions that affect starting M1

Owner means an accountable role, not a person already assigned. No providers or credentials were provisioned.

| ID | Question / current evidence and confidence | Recommendation / alternatives | Owner | Required verification / blocking gate |
|---|---|---|---|---|
| D-011 | React Native/Expo direction accepted 2026-11-05; exact runtime observed in M1_RUNTIME.json | React Native + Expo development builds, Expo Router, TypeScript. Alternative bare React Native if compatibility proof fails; Flutter requires a reviewed architectural change | Product owner + future technical lead | Approve baseline; M1-A native compatibility proof. Blocks M1-A stack freeze |
| D-012 | Runtime versions now locked; Node 24.22.2, pnpm 12.15.0, Expo 58, Laravel 13/PHP 8.4. See M1_RUNTIME.json | Supported Node LTS compatible with selected Expo SDK; pnpm workspace/one lockfile; Laravel 13 and patched PHP >=8.3. Alternative supported versions with documented compatibility | Technical lead needed | Recheck official compatibility at M1-A; lock exact versions. No installs during M0 |
| D-013 | M1 foundations and designs accepted for implementation 2026-11-05; copy/legal qualification pending | Review M1 screen/state index, visual atlas and foundations as one bounded package; revise identified screens before implementation | Product owner | Explicit approval, including any exceptions. Blocks affected M1 UI tasks |
| D-014 | Amharic draft copy has not had native-speaker review | Assign Amharic reviewer; use bundled Noto Sans Ethiopic; maintain reviewed glossary. Alternative owner-provided translations | Product owner; native-language reviewer needed | Review all M1 copy, error tone and large-text layouts before language sign-off. Blocks bilingual M1 acceptance, not toolchain setup |
| D-015 | User confirms no Mac/Apple/Expo signing account; Android local debug build executed, iOS acceptance unavailable | Provide a Mac build lane or approved cloud build account plus Apple account/signing ownership. Android local emulator/device lane | Owner for accounts + technical lead | Name lane and demonstrate both platform builds in M1-A. Blocks claiming M1 native verification; not M0 |
| D-016 | M1 identity/session/MFA defaults accepted for implementation 2026-11-05; actual access evidence in M1 status | Proposed contracts in M1_EXECUTION.md: secure device tokens, protected web sessions, admin TOTP/recovery, no self-registered admin. Alternatives enterprise IdP or passkeys after separate review | Product owner + security owner needed | Accept defaults or state changes before M1-B. User/session security tests after M1 authorization |
| D-017 | Merchant evidence and review ownership undefined | Configurable evidence checklist; manual review with reasons, request-information and appeal/help. Never treat sample documents as legal requirements | Merchant-operations owner needed | Name reviewer and approve minimum M1 pilot evidence/checklist. Blocks final application form contract in M1-C; production requirements later |

M1 can use local mail capture and an explicitly simulated SMS adapter for development. A production OTP contract is not required to authorize M1, but real phone/email delivery remains unqualified and cannot be claimed integrated.

## Later decisions — do not block M1 foundations

Confidence ledger for unresolved decisions (confidence in current evidence, not approval): D-011 high on greenfield state / medium on runtime suitability until TP-01; D-012 medium on supported-version direction / low on an unpinned matrix; D-013 accepted for M1 implementation on 2026-11-05; D-014 low on language accuracy until native review; D-015 iOS resources confirmed unavailable; D-016 defaults accepted for implementation; stated local checks recorded separately; D-017 low on the final evidence checklist. D-018 low on explicit currency approval; D-019 medium on documented provider capabilities / low on contracted funds flow; D-020 low on delivery readiness; D-021 low on approved market policies; D-022 low on approved commercial values; D-023 low on routing/staff readiness; D-024 medium on published capabilities / low on product quality; D-025 low on counterpart access; D-026 low on commercial approval; D-027 low on operating capacity/ownership. Required verification in each row is the exit from that uncertainty.

| ID | Question / evidence and confidence | Recommendation / alternatives | Owner | Required verification / blocking milestone |
|---|---|---|---|---|
| D-018 | Confirm settlement currency and display currencies; ETB is assumed | ETB settlement first; configurable currencies. Alternative owner-specified supported arrangement | Product owner + finance | Explicit confirmation before monetary M3 contracts |
| D-019 | Who collects customer funds, holds liabilities, and settles merchants? Provider split example is not proof of arbitrary multi-merchant settlement | Qualified provider-managed marketplace arrangement. Alternative clearly reviewed separate merchant payments; platform-held funds require approved legal/operational arrangement | Finance/legal owners needed | Written funds-flow + sandbox evidence, PQ-01; blocks M3 live-compatible design and M8 production finance |
| D-020 | Shipping coverage, fees, tracking and returns unknown | Merchant-managed fulfilment/pickup plus qualified carrier. Alternative carrier-only service | Operations owner needed | Serviceability/rates/exception SOP and PQ-02; blocks M3 production delivery |
| D-021 | Tax, refund window, cancellation, retention, privacy, deletion and consent terms unapproved | Configurable rules reviewed for Ethiopia. No guessed taxes, deadlines or legal copy | Legal + operations owners needed | Approved policies before affected M3/M4/M12 production behavior; account-retention basis before M1 production release |
| D-022 | Commission rates, funding, reward values, caps, payout delays and referral/affiliate windows undefined | Versioned rules; no positive-review requirement; hold before payout; one attributed creator per line. Alternatives documented campaign policies | Finance/growth owners needed | Balanced scenarios and approval before M4/M8/M9/M10 |
| D-023 | Carrier/SIP/number and human support staffing unknown | Qualified Ethiopian inbound number/trunk, human transfer; caller ID never authenticates | Support/telecom owner needed | PQ-06 and voice proof; blocks M12 production |
| D-024 | Model, speech, search and media services unselected | Provider adapters; bilingual benchmark before selection. Azure Speech/Meilisearch/LiveKit are candidates only | AI/search/media leads needed | PQ-05/PQ-07/PQ-08; blocks relevant M5/M6/M11–M13 integration sign-off |
| D-025 | Which accounting, inventory, CRM and commerce systems need real connectors? | Name at least one qualified counterpart for each agreed capability; one system can satisfy several classes | Merchant partnerships owner needed | Contracts, mapping, ownership and loop-recovery evidence before M16 |
| D-026 | Subscriptions, premium entitlements, sponsored/live/service pricing not approved | Transparent configurable plans and invoicing; no prices invented | Product/finance owner needed | Approved terms, renewal/cancellation and billing proof before M17 |
| D-027 | Public launch distribution, capacity and on-call ownership unknown | Full-scope controlled distribution with measured rollout; parameterized workload and restore drill | Operations/product owners needed | SLO/load model, support rota and release checklist before M18 |

## Status vocabulary

Proposed: recorded intent. Designed: concrete review draft exists. Approved: explicit owner approval of exact revision. Implemented: production application behavior exists. Integrated: real/sandbox counterpart connected with environment recorded. Verified: stated acceptance evidence exists for that environment. These are separate fields, not interchangeable progress labels.

No new screen, provider, translation, runtime recommendation, financial policy or prototype behavior is approved by this document.

## M1 implementation authorization - 2026-11-05

The user's "approved go ahead" accepts the M0 foundations, M1 designs and proposed M1 identity/session/MFA defaults for implementation. M1-A/B/C local scaffolding, dependency installation, isolated services/migrations and routine checks are authorized. This does not approve production providers, ETB settlement, translation/legal correctness or later milestones.

The user has no Mac or approved Expo/Apple signing account. iOS build/device acceptance remains pending; Android/web/API work proceeds. Language and evidence-policy review owners remain unassigned. The working merchant evidence policy is explicitly development-only and production submission fails closed.

Runtime locks, actual test results and remaining gates are recorded in M1_STATUS.md. pnpm 12 settings use pnpm-workspace.yaml; nodeLinker is hoisted for Windows native path compatibility. Shared browser components live in packages/web-ui (the implementation name for the planned ui-web package).
