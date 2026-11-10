"""M0 documentation/asset builder only. Does not scaffold apps or execute integration proofs."""
from pathlib import Path
import re, json, csv, hashlib, urllib.request
ROOT=Path(__file__).resolve().parents[2]
def write(rel,text):
    p=ROOT/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text,encoding="utf-8")
history=ROOT/"docs/planning/history/APPROVED_PLAN_2026-11-04.md"
if not history.exists():
    history.parent.mkdir(parents=True,exist_ok=True)
    history.write_bytes((ROOT/"plan.md").read_bytes())
sources=[ROOT/"docs/requirements/MASTER_REQUIREMENTS.md",ROOT/"docs/design/MASTER_DESIGN_BRIEF.md",ROOT/"docs/design/SCREEN_INDEX.md",history,*sorted((ROOT/"docs/design/images").glob("*.png"))]
manifest={"recorded_on":"2026-11-04","purpose":"Preserved original sources before M0 documentation edits","files":[{"path":p.relative_to(ROOT).as_posix(),"sha256":hashlib.sha256(p.read_bytes()).hexdigest()} for p in sources]}
existing_manifest=ROOT/"docs/planning/SOURCE_MANIFEST.json"
if existing_manifest.exists() and (ROOT/"docs/planning/REQUIREMENT_IDS.json").exists():
    old=json.loads(existing_manifest.read_text(encoding="utf-8"))
    assert next(x["sha256"] for x in old["files"] if x["path"]=="docs/requirements/MASTER_REQUIREMENTS.md")==next(x["sha256"] for x in manifest["files"] if x["path"]=="docs/requirements/MASTER_REQUIREMENTS.md"), "Source changed: append/migrate stable IDs explicitly; do not regenerate them"
write("docs/planning/SOURCE_MANIFEST.json",json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
base=history.read_text(encoding="utf-8")
base=re.sub(r'\]\((docs/[^)]+)\)',lambda m:'](../'+m[1][5:]+')',base)
base=base.replace("](AGENTS.md)","](../../AGENTS.md)").replace("](README.md)","](../../README.md)")
base=base.replace("# Segno Gebeya — architecture, coverage, design gaps, and implementation plan","# Segno Gebeya — current M0–M18 plan",1)
base=base.replace("**Status:** Overall plan approved by the user on 2026-11-04.","**Baseline status:** Overall M0–M18 plan approved 2026-11-04. M0 documentation/design work subsequently authorized; revisions and visual designs below await review.",1)
base=base.replace("**Implementation status:** Not started. Screen designs and implementation milestones retain their separate approval gates. Approval of this plan does not authorize application implementation.","**Authorization:** M0 documentation and design only. No M1 implementation, dependencies, migrations, provider transactions or production scaffolding are authorized.",1)
corrections="""## Current corrections and M0 handoff — read first

This is the single current plan. [Root plan.md](../../plan.md) points here; the [approved baseline](history/APPROVED_PLAN_2026-11-04.md) is preserved byte-for-byte. Older five-milestone summaries, if supplied later, are historical; no such separate summary was found in this repository. [prpmt sample.txx.yaml](../../prpmt%20sample.txx.yaml) is a historical broad implementation prompt, not active authorization. The current attached M0 request controls scope. Original master requirements, brief, screen index and eleven boards are preserved byte-for-byte; see [source hashes](SOURCE_MANIFEST.json).

- M0 delivers documentation, M1 visual review drafts and a simulated future purchase-to-fulfilment walkthrough. It does not implement M1.
- M1 startup does **not** depend on every future production contract. Only runtime/design decisions and relevant identity/review policies gate the corresponding M1 tasks. Language review and iOS resources gate acceptance, not unrelated setup.
- ETB is still unconfirmed. Runtime/provider/font recommendations and exact visual designs are proposals, not approved facts.
- Full feature scope remains due before first public release. Controlled distribution may limit audience, not silently omit features.
- Preserve M0–M18 numbering. M1-A/B/C are internal task groups within M1, not new public milestones.
- Operational finance needs balanced postings, explicit merchant/creator liabilities, refund obligations, holds and exactly-once effects; see [financial invariants](PROVIDER_QUALIFICATION.md#financial-invariants--design-contract-before-m3).
- Desktop M1 authentication/MFA/review designs now exist as unapproved drafts. Later desktop operations and future M2/M3 designs remain unapproved.
- Prototype fixtures prove only local design behavior. No authentication, stock reservation, payment, delivery, role grant, telephony, provider qualification or native build is verified by them.
- Initial inspection facts in the preserved baseline are historical. The repository now also contains M0 docs/design artifacts.

### M0 artifacts and dependency gates

| Artifact | Review purpose |
|---|---|
| [FEATURE_COVERAGE.md](FEATURE_COVERAGE.md) | Stable individual source items, screens/states, milestone, acceptance and planned verification; production status kept separate |
| [DECISIONS.md](DECISIONS.md) | Established choices vs assumptions/proposals; before-M1 vs later gates and accountable owners |
| [PROVIDER_QUALIFICATION.md](PROVIDER_QUALIFICATION.md) | Evidence/confidence, alternatives, proof cards, financial invariants and operating-cost drivers |
| [M1_EXECUTION.md](M1_EXECUTION.md) | Executable task breakdown, interfaces, policy defaults, checks, native lanes and demonstrations |
| [M0_EXIT_CHECKLIST.md](M0_EXIT_CHECKLIST.md) | Passed/pending/blocked evidence and exact approval scope |
| [DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md) | Proposed exact foundations, accessibility, Ethiopic support and components |
| [M1 visual review](../design/m1/index.html) / [screen-state index](../design/m1/SCREEN_STATE_INDEX.md) | Customer/merchant access, web auth, admin MFA/review and relevant variants |
| [M0 walkthrough](../design/m0/index.html) / [index](../design/m0/SCREEN_STATE_INDEX.md) | Clickable, wholly simulated purchase-to-fulfilment scenario; future design direction only |

No screen is approved merely because it is in these files. M0 is review-ready only when artifact checks are recorded; its exit and M1 authorization remain owner decisions.

"""
base=base.replace("## 1. Summary and evidence",corrections+"## 1. Summary and evidence",1)
base=base.replace("All milestones below are internal until M18. Dependencies are sequential unless explicitly stated otherwise.","All milestones below are internal until M18. Follow named task dependencies rather than treating every earlier integration contract as a prerequisite. Later provider qualification can proceed without blocking M1 foundations.")
write("docs/planning/PLAN.md",base)
# Download design font assets only, not project dependencies.
provenance=[]
for folder,name in [("inter","Inter"),("notosansethiopic","NotoSansEthiopic")]:
    api="https://api.github.com/repos/google/fonts/contents/ofl/"+folder
    request=urllib.request.Request(api,headers={"User-Agent":"Segno-Gebeya-M0-design-review"})
    entries=json.load(urllib.request.urlopen(request,timeout=30))
    font=next(x for x in entries if x["name"].endswith(".ttf") and "Italic" not in x["name"])
    for entry,target in [(font,name+".ttf"),(next(x for x in entries if x["name"]=="OFL.txt"),name+"-OFL.txt")]:
        data=urllib.request.urlopen(entry["download_url"],timeout=30).read()
        p=ROOT/"docs/design/m0/assets/fonts"/target;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
        provenance.append({"file":target,"source":entry["download_url"],"sha256":hashlib.sha256(data).hexdigest(),"bytes":len(data)})
write("docs/design/m0/assets/fonts/PROVENANCE.json",json.dumps(provenance,indent=2)+"\n")
# The source is immutable; retain IDs permanently and append new IDs if source changes later.
lines=(ROOT/"docs/requirements/MASTER_REQUIREMENTS.md").read_text(encoding="utf-8").splitlines()
rows=[];section="1";sub="";counter={};fenced=False
for lineno,line in enumerate(lines,1):
    if line.startswith("```"):fenced=not fenced;continue
    if fenced:continue
    heading=re.match(r"^#{1,2} (\d+(?:\.\d+)?)\.?\s+(.*)",line)
    if heading:section=heading[1];sub=heading[2];continue
    if line.startswith("### "):sub=line[4:];continue
    if line.startswith("## ") and not heading:sub=line[3:];continue
    text=line.strip()
    is_list=bool(re.match(r"^(?:- |\d+\. )",text))
    is_agent=section=="7.4" and text.startswith("|") and not text.startswith(("|---","| AI agent"))
    is_paragraph=(text and not text.startswith(("#","|","**","---","- ","1. ","2. ")) and len(text)>35 and bool(re.search(r"\b(must|should|never|only|support|provide|require|allow|offer|earn|maintain|define|apply|can|avoid|help|use|plan for|include)\b",text,re.I)))
    if not (is_list or is_agent or is_paragraph):continue
    # Roadmap, goals and architecture items are process/data requirements, not falsely declared UI.
    text=re.sub(r"^(?:- |\d+\. )","",text)
    if is_agent:text=" — ".join(x.strip() for x in text.strip("|").split("|"))
    counter[section]=counter.get(section,0)+1
    rows.append({"id":f"SG-{section}-{counter[section]:03d}","section":section,"line":lineno,"requirement":text,"context":sub,"kind":"source item"})
# Workflow map: one source item may share an appropriate screen family; this is not one screen per bullet.
mapping={}
raw="""5.1|CM/MM/MW/AW/API|Account lifecycle and merchant entry|B02:05–18; B03:16–18|M1|Positive lifecycle plus challenge expiry/replay, enumeration, session revocation and unauthorized access tests
5.2|CM/MM/MW/API|Shoppable feed and tagged posts|B04:01–03; B09:10–11|M2/M5/M9|Multiple tags resolve independently; current price/stock and sponsor disclosure; stale/unavailable tag tests
5.3|CM/API|Explore, search and visual discovery|B04:12–17|M5/M11/M15|Rank/filter relevant authorized results; mixed-language and unavailable-product cases
5.4|CM/MM/MW/API|Reel playback and editor|B04:04–05; B09:12|M5|Tagged video, captions, licensed audio and processing/report/reconnect scenarios
5.5|CM/MM/MW/API|Story viewer, editor and highlights|B04:07–08; B09:13|M5|Configured expiry/archive; tagged shopping and poll/reply permission tests
5.6|CM/MM/MW/API|Storefront and store information|B04:09–11; B09:01–02|M2|Published catalogue/policies accurate; private details excluded; unavailable-store recovery
5.7|CM/API|Owner and visitor profile|B03:01–04,15|M1/M5|Public/private fields and follow/saved-content authorization tested separately
5.8|CM/CR/AW/API|Social engagement and safety|B04:06,18|M5|Authorized and duplicate/restricted interactions; comments separate from purchase reviews
5.9|CM/MM/MW/AW/API|Messaging, calls and support|B08:01–07; B10:07,18|M6|Participant privacy, rich cards, offline delivery, blocked/missed calls and RTC device checks
5.10|CM/API|Shop listings, categories and filters|B05:01–03|M2/M5|Server filter/sort/pagination results match catalogue and availability
5.11|CM/API|Product detail, variants, Q&A and purchase entry|B05:04–06|M2/M3|Required variant and current terms; unavailable stock, missing data and denied actions
5.12|CM/API|Comparison and explanation|B05:07; B08:10|M11/M15|Normalized facts compared; missing facts disclosed; no fabricated AI claims
5.13|CM/API|Wishlist, collections and alerts|B03:05–08|M4/M15|Ownership/sharing, real price history, notification preferences and alert deduplication
5.14|CM/API|Multi-merchant cart|B05:10–11|M3|Server totals, variants, quantities and shipment groups; concurrent stock/price-change cases
5.15|CM/API|Checkout quote and review|B05:12–15|M3/M4|Itemized validated terms; expiry, consent, coupon/reward limits and safe resubmission
5.16|CM/AW/API|Hosted payment, receipt and reconciliation|B05:14,16–18; B03:12|M3/M8|Verified amount/currency/mode and event signature; duplicate/late/unknown/refund reconciliation
5.17|CM/MM/MW/AW/API|Orders, shipments, returns and disputes|B06:01–08,18; B10:02–05|M3/M4/M8|Permitted per-line transitions; partial shipment/refund and exception evidence
5.18|CM/MM/AW/API|Verified reviews and review media|B06:09–10; B03:09; B10:08|M4|Purchase eligibility, unbiased reward, edits/reports and media authorization
5.19|CM/AW/API|Rewards, coupons, referrals and loyalty|B06:11–17|M4/M9|Bounded, budgeted, idempotent earning/redemption; refund/cancel reversals
5.20|All/API|Notifications and preferences|B03:13–14|M3/M5/M6|Authorized deep links, preference/quiet-hour delivery and duplicate/retry tests
6.1|CM/MM/CR/MW/AW/API|Live viewer/host/replay|B07:01–05; B09:17|M13|Stock-aware shopping, host/moderator permission, reconnect and recording consent
6.2|CM/MM/MW/AW/API|Group-buy campaign lifecycle|B07:06–10; B09:18|M14|Atomic paid threshold/deadline/stock, failure and verified refund tests
6.3|CR/MM/MW/AW/API|Creator marketplace and attribution|B07:11–18; B10:11|M10|Disclosed promotion, one credited creator per line, fraud/reversal/payout evidence
6.4|CM/MM/MW/API|In-chat shopping|B08:02–03|M6|Authorized product/order cards, approved checkout and no duplicate order creation
6.5|CM/MM/CR/MW/API|Curated collections|B03:05–06; B04:11; B11:08|M15|Sharing permissions, current products and collection edits verified
6.6|CM/MM/MW/AW/API|Drops, waitlists and timed allocation|B11:01–02|M14|Waitlist distinct from reservation; fair limits, expiry and stock contention
6.7|CM/MM/MW/API|Nearby and local fulfilment|B04:17; B05:12|M3/M15|Optional location, manual alternative, reliable coordinates/serviceability
7.1|CM/API|Grounded AI shopping|B08:08–10,12; B11:09|M11|Authorized catalogue facts, confirmation and actual tool outcomes evaluated bilingually
7.2|CM/API|In-app AI voice|B08:11,16|M12|Speech, interruption, accessibility, latency and handoff measured on real devices
7.3|Telephone/CM/AW/API|AI telephone support|B08:13–18|M12|No-app verification, no caller-ID trust, truthful action status and human transfer
7.4|All/API|Scoped specialized AI agents|B08/B09:14/B10:15; AW new|M11/M12|Role/purpose tool boundaries, injection and cross-account tests for every agent
7.5|MM/MW/API|Merchant AI assistant|B10:15|M11|Tenant-scoped facts and reviewed suggestions; no fabricated business metrics
7.6|MM/MW/API|AI content studio|B09:14|M11|Merchant review, factual attributes, safe images/subtitles and reviewed translation
7.7|CM/API|Personalization and controls|B04:02; B03:15|M5/M11|Availability/privacy constraints, measurable ranking and opt-out behavior
7.8|All/AW/API|AI governance and auditing|B08:12,16,18; AW new|M11/M12|Confirmed tool execution, prompt-injection/privacy tests and auditable failures
8|MM/API|Merchant mode navigation and overview|B10:01; B09/B10|M1/M2/M7|Distinct navigation; authorized store context and source-derived metrics
9.1|MM/MW/API|Merchant overview|B10:01; desktop new|M7|Metric definitions reconcile to source events and authorized store
9.2|MM/MW/AW/API|Store management|B09:01–02; B10:16–17; desktop new|M1/M2/M7|Store ownership, private documents, policies and staff role changes enforced
9.3|MM/MW/API|Catalogue and bulk operations|B09:03–06,09; desktop new|M2/M7|Field validation, publish/archive safety and row-level bulk error/retry handling
9.4|MM/MW/API|Inventory and warehouses|B09:07–08; desktop new|M2/M7/M16|Atomic reservation, movements, restock and multi-channel stock reconciliation
9.5|MM/MW/API|Content workspace|B09:10–17; desktop new|M5/M13|Draft/schedule/tagging/media/moderation and engagement tests
9.6|MM/MW/API|Merchant order processing|B10:02–05; desktop new|M3/M4/M7|Allowed transitions, documents/exports and scoped customer data
9.7|MM/MW/API|Customer workspace|B10:06–07; desktop new|M6/M7|Permitted purchase/support records only; segmentation/consent isolation
9.8|MM/MW/AW/API|Campaign builder and reporting|B09:18; B10:09–10; desktop new|M9|Eligibility, stacking, limits/budget contention, expiry and reporting
9.9|MM/MW/CR/API|Creator partnerships|B10:11; desktop new|M10|Accepted terms, product assignments, attribution and commission reversals
9.10|MM/MW/AW/API|Finance, settlements and payouts|B10:12–13; desktop new|M8|Balanced postings, holds, statement reconciliation and no duplicate payout
9.11|MM/MW/API|Merchant analytics|B10:14; desktop new|M7/M10/M11|Documented denominators, attribution, time-zone and tenant filters
9.12|MM/MW/API|Merchant settings and integrations|B10:16–18; desktop new|M1/M7/M16|Scoped changes, secret protection and effect across active sessions/jobs
10.1|AW/API|Marketplace overview|No desktop board|M8|Role-specific metrics reconcile to authoritative events
10.2|AW/API|User management and recovery|No desktop board|M1/M8|Privileged changes, privacy and recovery authorization/audit
10.3|AW/MM/API|Merchant application review|B02:16–17 counterpart; desktop new|M1/M8|Reasoned review, revision conflicts, private evidence and role grant/revocation
10.4|AW/API|Catalogue operations|No desktop board|M2/M8|Approval/taxonomy/restricted/duplicate decisions and appeals audited
10.5|AW/API|Content moderation and appeals|No desktop board|M5/M8/M13|Authorized reports/queues, reasoned decisions, appeal and live termination
10.6|AW/API|Order operations and disputes|No desktop board|M3/M4/M8|Controlled interventions preserve financial/stock invariants
10.7|AW/API|Payments/commissions/reconciliation|No desktop board|M3/M8|Verified provider states, balanced journals, payout holds and reconciliation
10.8|AW/API|Delivery operations|No desktop board|M3/M8|Provider/serviceability settings, authenticated events and exception recovery
10.9|AW/API|Rewards and discounts administration|No desktop board|M4/M9|Budget liability, ledger/reversal and fraud rules reconciled
10.10|AW/API|Review and dispute operations|No desktop board|M4/M8|Verified-purchase eligibility, fair moderation and evidence access
10.11|AW/API|Support inbox and assignments|No desktop board|M6/M12|Participant access, ownership, handoff, retention and response analytics
10.12|AW/API|AI administration|No desktop board|M11/M12|Versioned configuration, knowledge/tool permissions and evaluation evidence
10.13|AW/API|Security/system administration|No desktop board|M1/M8/M18|MFA, roles, least privilege, audit, integration/backup monitoring
17.1|CM/API|Visual shopping|B04:15–16|M11|Grounded similarity ranking; image privacy and unavailable-product filtering
17.2|CM/API|Size/fit guidance|B11:03|M15|Actual merchant sizing inputs; explicit no-guarantee guidance
17.3|CM/API|Personal shopping plan|B11:09|M11/M15|Budget/preferences respected, editable grounded shortlist
17.4|CM/API|Price intelligence|B03:08; B11:04|M15|Real observed price history; target/consent alerts deduplicated
17.5|CM/API|Variant restock alerts|B11:05|M15|Correct variant, availability and preference-aware deduplicated delivery
17.6|CM/MM/MW/API|Smart bundles|B05:08|M9/M15|Transparent component totals, stock and partial-refund allocations
17.7|CM/API|Gift discovery|B05:09; B11:08|M15|Actual budget/category/fulfilment constraints; no invented delivery promise
17.8|CM/API|Shared shopping lists|B11:06–07|M15|Collaborator permissions, concurrent edits, removal and private notes
17.9|CM/MM/CR/MW/API|Shopping events|B11:10|M13/M15|Schedules, reminders, linked products and cancellation/replay states
17.10|CM/AW/API|Customer product demonstrations|B03:04|M5|UGC distinguished from ads and verified reviews; reporting/moderation
17.11|MM/MW/API|Omnichannel stock|No board|M16|Versioned stock ownership, loop prevention and reconciliation
17.12|MW/API|Business connectors|No board|M16|Named counterpart mappings, authorization, backfill and retry evidence
17.13|MW/AW/API|Approved partner API/webhooks|No board|M16|Scoped/revocable access, rate limits, signatures and duplicate/replay safety"""
for line in raw.splitlines():
    k,*v=line.split("|");mapping[k]=v
generic={
"3":["All/API","Architecture and identity boundaries","B01; B02:18","M0/M1","Contract review and permission tests preserve approved boundaries"],
"4":["All","Role/persona inventory","B01; desktop new","M0/M1","Every persona has explicit permissions; no inferred merchant-to-admin grant"],
"11":["API","Domain/entity model (no UI by itself)","Architecture; no artboard","M1 onward","Model/relationship/constraint review; products remain separate from content"],
"12":["API/All","Engineering/infrastructure contracts","Technical specification","M1 onward","API/schema/security/media/search checks on declared runtime and workload"],
"13":["All/API","Privacy, security and marketplace trust","B03:15–18; B04:18; desktop new","M1 onward","Authorization/abuse/privacy tests and approved policy evidence"],
"14":["Infrastructure","Performance/recovery/observability","Operational evidence","M1/M18","Measured load, monitored queues and actual restoration/rollback evidence"],
"15":["CM/MM/MW/AW/API","Commercial rules and monetization","Billing/desktop designs needed","M8/M10/M17","Approved transparent rates/terms; ledger, entitlement and refund reconciliation"],
"16":["All","Market/language/currency configuration","B02:11; B11:18","M1/M17","Bilingual layout/copy review; configurable country rules; ETB unconfirmed"],
"18":["All","Design system and navigation","B01; B11:11–18","M0 onward","Component states, contrast, responsive/text scaling and keyboard/native accessibility"],
"19":["All","Quality assurance and test evidence","No UI by itself","All/M18","Run relevant functional/security/load/AI test with reproducible results"],
"20":["All","Historical phase coverage; mapped to current M0–M18","Reference roadmap only","M0–M18","Preserve features under current numbering; no old phase is an active authorization"],
"21":["All","Progressive design and implementation review","Approval record","All","Explicit approval of exact revision before each implementation milestone"],
"22":["All/Operations","Full-feature launch gate","Release evidence","M18","All critical scope, production qualifications and operational owners signed off"],
"23":["All/API","Metrics and evidence lineage","B10:14; AW new","M1 onward","Metric definitions, source event lineage, denominator and scoped reporting"],
"25":["All","Full blueprint capability summary","Mapped detailed sections","M0–M18","Trace to detailed capability and full-release gate"]
}
def workflow(r):
    return mapping.get(r["section"],generic.get(r["section"].split(".")[0],["All","Product strategy and scope","Source narrative","M0/M18","Review requirement against approved scope and end-to-end acceptance"]))
def binding(r):
    s=r["section"];t=r["requirement"].lower()
    if s=="5.1":
        for key,scene in [("merchant","application"),("password reset","recover"),("otp","verify"),("phone-number","register"),("email registration","register"),("login","signin"),("logout","sessions"),("session","sessions"),("device","sessions"),("deactivation","account-actions"),("deletion","account-actions"),("language","language"),("country","language"),("photo","profile"),("profile","profile"),("security","sessions")]:
            if key in t:return scene
    if s=="10.3" and any(x in t for x in ["application","verification","document","approval","rejection"]):return "admin-review"
    if s=="13.1" and any(x in t for x in ["multi-factor","recovery","session","device","otp","authentication"]):return "admin-mfa" if "factor" in t else "sessions" if any(x in t for x in ["session","device"]) else "recover" if "recovery" in t else "verify"
    return None
def escape(s):return str(s).replace("|"," / ").replace("\n"," ")
out=[]
for r in rows:
    platforms,screen,ref,milestones,verification=workflow(r)
    scene=binding(r)
    relevant=not r["section"].split(".")[0] in ["1","2","3","4","11","12","14","19","20","21","22","23","24","25"]
    states="default; validation; loading; empty/error; offline; denied; pending; confirmation/recovery (as relevant)" if relevant else "contract failure; unauthorized; retry/degraded/recovery (where applicable)"
    if r["section"].startswith("7."):states+="; AI disclosure; uncertain; confirmation; tool failure; human handoff"
    if r["section"] in ["5.14","5.15","5.16","5.17","9.10","10.7","6.2"]:states+="; duplicate; late/unknown; partial; reconciliation"
    if scene:screen=f"[{screen}: {scene}](../design/m1/index.html?screen={scene})"
    # Source item is the acceptance obligation; domain-specific verification supplies observable negatives.
    ac=r["requirement"].rstrip(".")+" — demonstrate in the named workflow with authorized data; no false success."
    if r["section"].startswith("11"):ac="Model "+r["requirement"]+" with reviewed ownership, relationships and constraints; no implicit public access."
    item={"ID":r["id"],"Requirement/source":f'{escape(r["requirement"])} ([§{r["section"]}:L{r["line"]}](../requirements/MASTER_REQUIREMENTS.md#L{r["line"]}))',"Platforms":platforms,"Screen/workflow":screen,"Relevant states":states,"Design reference":ref,"Milestone":milestones,"Acceptance criteria":ac,"Planned verification":f'V-{r["id"]}: {verification}',"Proposed":"Yes","Designed":"Draft (M1 review)" if scene else "No / future","Approved":"No","Implemented":"No","Integrated":"No","Verified":"No"}
    out.append(item)
columns=list(out[0])
header=f"""# Individual requirement coverage register

Current plan: [PLAN.md](PLAN.md). Source: [preserved master](../requirements/MASTER_REQUIREMENTS.md). This register contains **{len(out)} individually identified source items**, including capability bullets, numbered rules, relevant normative paragraphs and the specialized-agent table. It includes data/architecture/process obligations as well as features; not every item implies a separate screen.

IDs are immutable SG-section-sequence identifiers allocated against the preserved source hash. Existing R5.1-style plan IDs remain section aliases. Never renumber existing IDs; append new IDs and record supersession if requirements change. Source line numbers identify this preserved revision (SHA-256 in SOURCE_MANIFEST.json); #L links may be displayed by the IDE rather than every Markdown viewer.

The source wording is retained. Similar bullets in architecture, roadmap and final-definition sections are traceable repeats, not additional features. The raw CSV companion supports filtering: [FEATURE_COVERAGE.csv](FEATURE_COVERAGE.csv).

## Status semantics and review boundary

Proposed = recorded obligation. Designed = concrete draft exists for the linked interface, not backend behavior or approval. Approved = explicit approval of that exact design/contract. Implemented/integrated/verified refer to production application work and environment-specific evidence, never prototype clicks. **All production implementation, integration and verification remain No.** Overall plan approval is recorded in DECISIONS.md; it does not approve individual screens.

M1 draft bindings are intentionally limited. Other references point to concepts or planned workflows; they are not claimed designed. Shared workflows apply per-item states as relevant; [M1 screen/state index](../design/m1/SCREEN_STATE_INDEX.md) is authoritative for rendered M1 variants. Later milestones must refine each relevant variant before design approval. A broad future workflow assignment is not a completed future interaction specification.

## Requirements

"""
table="| "+" | ".join(columns)+" |\n|"+"|".join(["---"]*len(columns))+"|\n"
for item in out:table+="| "+" | ".join(escape(item[c]) for c in columns)+" |\n"
write("docs/planning/FEATURE_COVERAGE.md",header+table)
p=ROOT/"docs/planning/FEATURE_COVERAGE.csv"
with p.open("w",encoding="utf-8-sig",newline="") as f:
    w=csv.DictWriter(f,fieldnames=columns);w.writeheader();w.writerows(out)
write("docs/planning/REQUIREMENT_IDS.json",json.dumps([{"id":r["id"],"section":r["section"],"source_line":r["line"],"text":r["requirement"]} for r in rows],ensure_ascii=False,indent=2)+"\n")
print(json.dumps({"requirement_items":len(rows),"fonts":provenance,"canonical_plan":"docs/planning/PLAN.md"},ensure_ascii=False))

