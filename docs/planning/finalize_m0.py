"""Finalize M0 documentation and inspect local artifact integrity; no integration proofs."""
from pathlib import Path
import json,hashlib,re,urllib.parse
ROOT=Path(__file__).resolve().parents[2]
def write(p,s):
    p=ROOT/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s,encoding="utf-8")
# Historical baseline already preserved by build_m0_documents.py.
assert (ROOT/"docs/planning/history/APPROVED_PLAN_2026-11-04.md").exists()
write("plan.md","""# Segno Gebeya — plan entrypoint

The single current M0–M18 plan is [docs/planning/PLAN.md](docs/planning/PLAN.md).

The [approved 2026-11-04 baseline](docs/planning/history/APPROVED_PLAN_2026-11-04.md) is preserved unchanged for history. Earlier summaries and sample prompts are superseded.

M0 documentation/design work is authorized. M1 application implementation, unfinished screen designs and production providers are not approved by that authorization.

Start with the [M0 exit checklist](docs/planning/M0_EXIT_CHECKLIST.md), [M1 visual designs](docs/design/m1/index.html), and [simulated purchase walkthrough](docs/design/m0/index.html).
""")
scenes=json.loads((ROOT/"docs/design/m1/scenes.js").read_text(encoding="utf-8").removeprefix("window.SG_SCENES = ").strip().removesuffix(";"))
ids=json.loads((ROOT/"docs/planning/REQUIREMENT_IDS.json").read_text(encoding="utf-8"))
s="# M1 screen/state review index\n\nStatus: **designed draft, not approved**. [Open review](index.html), [mobile overview](mobile-overview.png), [web overview](web-overview.png), [design system](../DESIGN_SYSTEM.md).\n\n"
s+="22 review views: 13 mobile views, 8 desktop views and 1 foundations specimen. All 21 product-interface views have Amharic draft presentation and light/dark variants. Technical review controls/notes and some operational sample labels remain English; native copy review is pending. No translation is claimed production-ready.\n\n"
s+="Open index.html directly; all scripts/fonts are local. Or from the project root run python -m http.server 8765 --bind 127.0.0.1 and open http://127.0.0.1:8765/docs/design/m1/index.html. Use the left navigation and review-state/language/theme controls. Demo OTP: 123456; recovery code: DEMO-ABCD-1234. All credentials are public fixtures.\n\n"
s+="## Exact review scope\n\n| Screen ID | Platform / purpose | Source and reference | Default export | State variants | Approval |\n|---|---|---|---|---|---|\n"
for scene in scenes:
    states=", ".join("["+st+"](index.html?screen="+scene["id"]+"&state="+st+")" for st in scene["states"])
    s+=f'| [{scene["id"]}](index.html?screen={scene["id"]}) | {scene["platform"]}: {scene["en"]} | §{scene["section"]}; {scene["reference"]} | [PNG](previews/{scene["id"]}.png) | {states} | Pending |\n'
s+="""\n## Interaction and state specifications

- Register: email/phone choice, required identifier/password/sample agreement. Empty input and short passwords retain fields and show errors. Successful demo result leads to verification.
- Sign-in: email/phone and password; generic failure, wait/rate limit, denied and recovery routes. Merchant web uses the same identity, not a second merchant registration.
- Verification: one paste-friendly numeric input; demo code only. Incorrect, expired and rate-limited variants are separate. Expired/rate-limited submit disabled; requesting a new code returns to the default fixture. Resend cooldown is a review specimen, not a running security timer.
- Recovery/reset: generic request acknowledgement; verified-channel recovery is required in production. Demo reset requires matching passwords; it does not change an account.
- Profile/language/permissions: private-account boundary, optional portrait/manual alternative, preferences available before auth. No OS permission prompt occurs.
- Merchant application: proposed business/checklist fields, a local sample attachment, validation, upload error/retry, review submission and information resubmission. Required legal evidence is pending D-017.
- Status: pending review is distinct from information needed (recovery variant), rejection (denied), and approval (success). No role is granted by the prototype.
- Mode switch: customer and merchant contexts are visibly separate; denied/pending merchant choices disabled. Real M1 must use server capabilities and refresh store-scoped subscriptions.
- Sessions/account actions: revoke/deactivate/delete confirmations and recovery layouts; no actual deletion, revocation or retention guarantee.
- Admin sign-in: restricted entry; no self-registration. MFA enrollment, challenge, single-use recovery and code-saving flow represented. Enrollment QR/secret remains a deliberately nonfunctional setup placeholder; the real secure provisioning belongs to M1.
- Admin review: searchable two-record queue and detail; reason required before decision, explicit confirmation/cancel, error/pending/success/recovery. Denied/empty/loading variants hide private detail. Production role/revision/audit checks remain M1 work.
- Confirmation dialogs have an accessible name and native browser focus containment; cancel/Escape and focus return are design requirements. Native accessibility is not proven here.
- The generic state selector is a review fixture, not a backend status editor. Some common failure variants are component specimens; relevant final endpoint transitions must follow M1_EXECUTION.md.
- All views are draft designs. Simulation text and technical annotations are review-only, not final product microcopy.

## Source-ID links

Individual IDs and production statuses live in [FEATURE_COVERAGE.md](../../planning/FEATURE_COVERAGE.md). Key M1 sections: §3.1/3.5 (identity/modes), §5.1 (account/application), §9.2/9.12 (merchant access), §10.2/10.3/10.13 (admin/review), §13.1–13.4 (security/privacy), §16 and §18 (language/accessibility). Cross-reference aliases never replace stable SG IDs.

## Approval boundary

Review this exact revision's foundations, mobile and desktop views, relevant states, copy and proposed policy defaults. Approval does not include M2/M3 UI, any production provider, native build success or M1 implementation permission. Native-language review, OS accessibility and final legal evidence wording remain outstanding.
"""
write("docs/design/m1/SCREEN_STATE_INDEX.md",s)
write("docs/design/m0/SCREEN_STATE_INDEX.md","""# M0 purchase-to-fulfilment walkthrough

[Open clickable local prototype](index.html). It has working local navigation, selection, cart quantities, payment-result simulation, packing and tracking. No account, service, transaction, inventory reservation or delivery is real. All sample names, numbers, units and illustrations are fictional. ETB settlement remains unconfirmed.

Use direct file opening, or the optional localhost command in README. JavaScript and bundled fonts are local; no project dependency installation is required. The walkthrough copy is currently English; Amharic customer/merchant access designs are in the separate M1 package. Native translation review remains pending.

| Step/state | Interaction and design reference | Evidence / boundary |
|---|---|---|
| Sign in | Continue as sample customer; B02:06 direction | No credentials or session; actual M1 access designs reviewed separately |
| Discover | Tap tagged woven bag; B04:01 | [PNG](previews/discovery.png); product independent of social post |
| Product | Select Natural; Forest unavailable; quantity limited in sample; B05:04–05 | No backend stock lock or price authority |
| Cart | Adjust quantity, view merchant groups; B05:10–11 | [Standard](previews/standard-cart.png), [two merchants](previews/split-cart.png) |
| Checkout | Sample delivery groups and itemized total; B05:12–15 | No real address/credential; tax/other fees excluded, not assumed zero in production |
| Payment pending | Explicit simulated verification action; B05:16 | Redirect/click alone never shows paid order |
| Failed | Choose failure scenario; fail, reconcile then retry; B05:18 | [PNG](previews/payment-failure.png); no false no-charge assertion |
| Unknown | Choose unknown scenario; timeout then independent sample verification | [PNG](previews/payment-unknown.png); no success/failure inference from timeout |
| Partial payment | Two merchants; first paid, second pending/failed then recovered | [PNG](previews/partial-payment.png); illustrates a provider-dependent branch, not approved funds flow |
| Offline | Offline checkout scenario; reconnect before proceeding | Purchase action unavailable until simulated reconnect |
| Order | Appears after all required sample payments verified; B06:02 | [PNG](previews/order-confirmed.png); no real receipt or email |
| Merchant fulfilment | Explicit sample actor switch; pack checkbox before dispatch; B10:03–04 | Distinct merchant context; does not authorize a customer |
| Tracking | Sample tracking reference/timeline and exception action; B06:03 | [PNG](previews/tracking.png); no invented live map/ETA |
| Delivered | Explicit simulated delivery event; B06:04 | Reviews/rewards remain subject to later eligibility; no automatic earning |

Scenarios: [happy path](index.html?scenario=standard), [failure](index.html?scenario=failure), [unknown](index.html?scenario=unknown), [two merchants](index.html?scenario=split), [offline](index.html?scenario=offline). Restart/reload resets all fixtures.

Master aliases: R5.1–5.2, R5.11, R5.14–5.17, R9.6. Individual source IDs remain in FEATURE_COVERAGE.md; all M2/M3 design approvals and backend/integration statuses are still pending.

This is a reviewable design walkthrough, not an inventory, idempotency, ledger or payment qualification proof. Those technical proofs have not been executed.
""")
# Semantic contrast checks are calculations, not an accessibility audit.
def lum(h):
    a=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    a=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in a]
    return sum(v*w for v,w in zip(a,[.2126,.7152,.0722]))
pairs=[("light text/canvas","#152B26","#F5F5EF",4.5),("light muted/surface","#52675E","#FFFFFF",4.5),("primary label","#FFFFFF","#126C55",4.5),("lime label","#152B26","#D9EF72",4.5),("dark text/surface","#F5F5EF","#17352D",4.5),("dark muted/surface","#B6CBC0","#17352D",4.5),("dark primary label","#0E221F","#9BE4BF",4.5),("success light","#166534","#F0FDF4",4.5),("warning light","#92400E","#FFFBEB",4.5),("error light","#B91C1C","#FEF2F2",4.5),("info light","#075985","#F0F9FF",4.5),("success dark","#A7F3D0","#143D2C",4.5),("warning dark","#FDE68A","#44351B",4.5),("error dark","#FECACA","#492725",4.5),("info dark","#BAE6FD","#18394A",4.5),("light boundary","#6D8277","#FFFFFF",3),("dark boundary","#A0B8AB","#17352D",3),("web story helper","#CADDD1","#123D31",4.5)]
contrasts=[]
for label,fg,bg,target in pairs:
    c=(max(lum(fg),lum(bg))+.05)/(min(lum(fg),lum(bg))+.05)
    contrasts.append({"pair":label,"foreground":fg,"background":bg,"ratio":round(c,2),"target":target,"passed":c>=target})
write("docs/design/m0/CONTRAST.json",json.dumps(contrasts,indent=2)+"\n")
qa=json.loads((ROOT/"docs/design/m0/QA_RESULTS.json").read_text(encoding="utf-8"))
summary=qa["summary"]
manifest=json.loads((ROOT/"docs/planning/SOURCE_MANIFEST.json").read_text(encoding="utf-8"))
preserved=all(hashlib.sha256((ROOT/x["path"]).read_bytes()).hexdigest()==x["sha256"] for x in manifest["files"])
assert preserved
assert len(set(x["id"] for x in ids))==len(ids)
evidence=f"""# M0 design artifact validation

Scope: local browser design artifacts and documentation only. This is not application/native/integration verification.

## Observed results

- {summary["renders"]} browser renders covering all 22 views and their declared state specimens, English/light desktop and Amharic/dark narrow layouts; desktop views also checked at tablet width.
- Horizontal-overflow failures: {summary["overflow_failures"]}; missing headings: {summary["missing_headings"]}; font-loading failures: {summary["font_failures"]}; JavaScript exceptions: {summary["exceptions"]}.
- {summary["interaction_checks"]} local interaction checks; failures: {summary["interaction_failures"]}. See [raw results](QA_RESULTS.json).
- {len(contrasts)} semantic contrast pairs calculated; failures: {sum(not x["passed"] for x in contrasts)}. See [contrast values](CONTRAST.json). This is not a complete accessibility audit.
- {len(ids)} unique stable source-item IDs; no application capability is marked implemented/integrated/verified.
- {len(manifest["files"])} preserved source files hash-matched, including original master/brief/index, 11 boards and the archived approved baseline.
- Browser screenshots exported for every default view, representative critical states and five walkthrough branches.

## Visual inspection and corrections

Inspected mobile overview plus individual registration, merchant sign-in, admin review/confirmation, Amharic dark registration, expired verification and discovery/partial-payment walkthrough images. Corrected low-contrast helper copy on the merchant auth panel, placeholder contrast, expired/rate-limited submit controls, review-reason validation, dialog naming, and denial/pending merchant controls. Layout and technical artifact checks were rerun after those changes.

The visual direction follows the inspected boards through ivory/teal/forest/lime, spacing, form hierarchy and distinct operational desktop layouts. Auth uses simple branded geometry. Walkthrough product illustrations are original SVG placeholders, not entire screen screenshots. Final photography/art direction remains later design work.

## Reproduction

Run node --check on docs/design/m1/review.js and docs/design/m0/walkthrough.js for syntax. Run python docs/design/m0/review_artifacts.py to reproduce browser artifacts using the already available Chrome, websocket-client and Pillow. This tool creates an isolated headless profile and local-only temporary HTTP server; it does not control the user's browser or contact product providers. No dependency installation is part of M0.

Run python docs/planning/finalize_m0.py for document indexes, source integrity and contrast calculations. build_m0_documents.py is a baseline extraction helper, not a routine updater: preserve existing IDs/status edits; do not regenerate blindly after source or approval changes.

## Limits and pending evidence

No real identity, OTP delivery, MFA secret, document upload, store grant, payment, inventory transaction, shipment, AI, call or carrier action was executed. No production apps/dependencies/migrations/database changes were created. Native Android/iOS builds, VoiceOver/TalkBack, OS text scaling, real provider qualification, penetration/load tests and native-language/legal copy review are **not performed**.

Browser state selectors are fixtures. Some common states are component specimens, not a fully specified future backend state machine. M0 exit and design approval remain owner decisions.
"""
write("docs/design/m0/VALIDATION.md",evidence)
checklist=f"""# M0 exit checklist and review handoff

**Status: review package produced; M0 acceptance pending. M1 has not started and is not authorized.**

Current plan: [PLAN.md](PLAN.md). [M1 tasks](M1_EXECUTION.md). Review visuals first: [M1 browser designs](../design/m1/index.html), [mobile overview](../design/m1/mobile-overview.png), [desktop overview](../design/m1/web-overview.png), [M0 walkthrough](../design/m0/index.html).

## Exit evidence

| Criterion | Status | Evidence / remaining condition |
|---|---|---|
| Reconcile sources and current numbering | Passed | PLAN.md names M0–M18 as current; older prompt is historical; baseline archived unchanged; no separate five-milestone summary found |
| Preserve original requirements and image references | Passed | {len(manifest["files"])} source hashes match SOURCE_MANIFEST.json; original master/brief/index and 11 boards unchanged |
| Individual traceability and separate statuses | Passed, with later design refinement pending | {len(ids)} stable source items in FEATURE_COVERAGE.md/CSV; source IDs include repeated summaries/data/process items, not {len(ids)} distinct screens; production statuses No |
| Required planning artifacts and concise AGENTS links | Passed | PLAN, FEATURE_COVERAGE, DECISIONS, PROVIDER_QUALIFICATION, this checklist, DESIGN_SYSTEM; extra M1 task specification and indexes |
| Proposed design foundations and Ethiopic support | Draft delivered; approval pending | Exact tokens/type/components/states, bundled licensed fonts and {len(contrasts)} calculated contrast pairs; native copy/accessibility review still needed |
| Actual M1 visual layouts and variants | Draft delivered; approval pending | 22 views (13 mobile, 8 desktop, 1 specimen), local state controls and individual PNGs; scope indexed in m1/SCREEN_STATE_INDEX.md |
| Interactive purchase-to-fulfilment walkthrough | Passed as design artifact | Clickable local selections, cart, payment result branches, packing/tracking; all simulation explicitly labelled; future designs unapproved |
| Artifact browser validation | Passed for stated checks | {summary["renders"]} renders; {summary["interaction_checks"]} local interaction checks, zero reported failures; m0/VALIDATION.md and QA_RESULTS.json |
| Actionable decisions/provider dependencies | Passed as documentation; qualification pending | Owners/owner-needed, evidence/confidence, recommendation/alternatives, proof and blocking milestones in registers; no provider approved |
| Financial invariants | Draft delivered; finance approval pending | Balanced postings, merchant/creator liability, refunds, commissions, holds, deduplication and reconciliation cases |
| M1 task/dependency/native verification package | Passed as specification | M1-A/B/C tasks, interfaces, proposed defaults, commands/demos, build-lane evidence requirements and explicitly conditional estimate |
| Native-language copy and policy wording | Pending | D-014 reviewer and D-017 checklist/owner; technical review controls/annotations may remain English |
| Exact M1 design and policy approval | Pending | D-013/D-016; user must approve exact revision or identify changes |
| Runtime and native build lane decisions | Pending before corresponding M1 work | D-011/D-012 recommendation; D-015 Mac/cloud/signing ownership needed before native acceptance |
| Native builds and real integrations | Not executed; blocked from claiming verification | Require explicit M1/relevant milestone authorization; future production contracts do not block M1-A |
| Start M1 automatically | Prohibited | User requested stop for review; application scaffolding/installs/migrations/database/provider transactions absent |

## Corrections to the approved baseline

1. One canonical plan and one numbering system; historical material retained.
2. M0 review readiness separated from product design approval and M1 authorization.
3. ETB, framework/runtime recommendations and provider candidates remain unapproved assumptions/proposals.
4. Later production contracts do not gate unrelated M1 foundations.
5. Added explicit financial posting/liability/hold invariants and real proof criteria.
6. Replaced mobile-only desktop assumptions with actual M1 web-auth/MFA/review drafts; later desktop operations remain undrafted.
7. Application verification remains distinct from local prototype QA.

## Exact scope awaiting approval

- DESIGN_SYSTEM.md v1 foundations: colors, typography/font support, spacing, components, dark mode, accessibility and state conventions.
- All named M1 views/state variants in m1/SCREEN_STATE_INDEX.md: customer registration/sign-in/verification/recovery/reset, profile/language/permissions, merchant application/status, mode switching, sessions/account actions; merchant web sign-in/recovery; admin sign-in/MFA enrollment/challenge/recovery/codes and application review.
- Proposed identity/session/MFA/review policy defaults in M1_EXECUTION.md; business evidence wording requires D-017.
- M0 walkthrough as a **simulated flow direction**, not final M2/M3 screen approval.
- Scope approval is not proof of native-language/legal correctness, production readiness or an instruction to start M1.

## Decisions genuinely needed next

1. Review/approve the foundations and exact M1 visual/state package, or identify specific revisions.
2. Accept the proposed React Native/Expo and Laravel runtime direction plus M1 identity/MFA/session defaults, or state changes. Versions remain subject to compatibility checks.
3. Name the Amharic reviewer and merchant-application decision/checklist owner; identify a Mac/cloud/Apple signing resource for M1 native verification. These can be the product owner initially if explicitly accepted.

ETB, payment/delivery/telephone providers, commercial rates and later connectors are **not** requested again as prerequisites for M1. They remain tracked later gates.

## Is M1 ready to authorize?

The **task specification and review artifacts are ready**. Unconditional M1 execution is **not yet ready**: exact designs/runtime/policy choices require review, language/checklist ownership remains unassigned, and the iOS lane is unknown. After accepting the relevant defaults and foundation designs, the user may authorize **M1-A only**, while ownership and remaining copy/review work proceed before M1-B/C acceptance. No implementation begins without that explicit instruction.

## Preview instructions and evidence

Open the linked HTML files directly, or run python -m http.server 8765 --bind 127.0.0.1 from the repository root and visit /docs/design/m1/index.html or /docs/design/m0/index.html. The local prototypes require no project dependencies and contact no product providers. Sources and PNG exports are saved in the same directories.
"""
write("docs/planning/M0_EXIT_CHECKLIST.md",checklist)
print(json.dumps({"source_hashes_match":preserved,"unique_ids":len(ids),"views":len(scenes),"contrast_pairs":len(contrasts),"contrast_failures":sum(not x["passed"] for x in contrasts),"browser":summary},indent=2))

