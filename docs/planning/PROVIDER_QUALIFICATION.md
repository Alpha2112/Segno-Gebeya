# Provider qualification and early technical proofs

Status: candidate assessment only; no accounts, contracts, transactions, test calls, installs or code-based integration proofs executed in M0. Updated 2026-11-04. See [DECISIONS.md](DECISIONS.md) for owners and [PLAN.md](PLAN.md) for dependency gates.

## Qualification register

Confidence refers to documentation evidence, never operating readiness. All accountable people still need assignment.

| ID / capability or question | Current evidence / confidence | Recommended option / alternatives | Responsible owner | Required verification | Blocks |
|---|---|---|---|---|---|
| PQ-01 Payments: pay-in, refund, multi-merchant settlement, liabilities, holds | Chapa documents test mode, verification, subaccount splits and refunds. Medium: entitlement and arbitrary multi-seller split unproved | First evaluate Chapa hosted sandbox; compare other qualified Ethiopian gateways/direct mobile money. Do not assume platform can hold funds | Finance + legal + payment lead needed | Contracted methods, test/live separation, exact amount/currency, signed events + independent verification, partial refund, duplicate/late events, fees, settlement schedule, payout and failed-group-buy funding | M3 sandbox qualification; production M8/M14/M18 |
| PQ-02 Delivery/pickup/returns | No selected provider or reliable service areas. Low | Merchant-managed dispatch/pickup plus one qualified carrier; alternative carrier-only | Fulfilment owner needed | Ethiopia addresses/service zones, quotes, booking, cancellation, tracking semantics, exceptions, delivery evidence, return pickup, support SOP | M3 production delivery, M4 returns |
| PQ-03 OTP/email/SMS | No credentials or transport contract. Low | Local mail capture + simulated SMS in M1; qualify production email/SMS separately | Identity + operations owner needed | Delivery across target networks, sender registration, cost/limits, receipts, consent, abuse throttling and inaccessible-phone recovery | M1 integration acceptance; M18 production |
| PQ-04 Push/social identity | APNs/FCM and social providers need app accounts. Medium documentation; no app proof | APNs/FCM; Google/Apple only where configured; no fake connected state | Mobile release owner needed | Credentials, Android/iOS signing, token renewal, denied permission, killed-app/background behavior, OAuth redirect/logout/revocation | Relevant M1 optional identity; M6 calls; M18 |
| PQ-05 RTC/live and media processing | LiveKit documents RN and SIP; no Ethiopian real-device quality proof. Medium | Qualify LiveKit managed/self-hosted and licensed media pipeline; compare managed RTC | Media/platform owner needed | TURN/firewalls, background calls, packet loss, captions, consent/recording, moderation, live scale, egress/CDN costs and lifecycle | M5 video, M6 calling, M13 live |
| PQ-06 Telephone routing | SIP transport architecture documented; Ethiopian number/trunk availability unverified. Low | Qualified local carrier/SIP partner into gateway; compare managed contact-centre integration | Telecom/support owner needed | Published-number ownership, inbound reachability on target networks, language menu, DTMF/verification, warm transfer, out-of-hours, consent, lawful outbound/opt-out and outage routing | M12; not M1 |
| PQ-07 AI/STT/TTS/visual | Azure language list includes am-ET recognition; speech output and accent quality not proven. Medium documentation, low product quality evidence | Evaluate bilingual providers behind scoped tools; compare STT/TTS/LLM combinations against same corpus | AI lead + native reviewers needed | Amharic/English task accuracy, noisy phone audio, interruptions, grounded prices/stock, visual matching, injection/cross-account denial, action result, human handoff, latency/cost/retention | M11–M12 |
| PQ-08 Search/embeddings | Meilisearch language docs do not list dedicated Ethiopic tokenizer. Medium | Replaceable Meilisearch adapter with evaluated hybrid search; compare tailored analyzer/other search service | Search lead + Amharic reviewer needed | Exact names, spelling variants, mixed scripts, category/attribute queries, transliteration, stock filtering, latency, privacy, regression corpus | M5 search quality and M11 semantic discovery |
| PQ-09 Storage/CDN/malware/transcode | Architecture required; vendor and region unselected. Low | Private originals/documents; signed upload/delivery and background processing; compare managed/self-hosted costs | Platform/security owner needed | Authenticated upload bounds, file signature, quarantine, document privacy, lifecycle deletion, thumbnails/HLS, moderation and failure retry | M2 media production readiness |
| PQ-10 Maps/geocoding | Ethiopia coverage not tested. Low | Provider adapter + manual address/merchant pin fallback; compare map sources | Fulfilment/product owner needed | Local search/address tests, service zones, pickup directions, consent, licensing, no invented live courier location | M3 address UX; M15 nearby |
| PQ-11 Business connectors/partner APIs | No counterpart systems named. Low | Qualify representative accounting/inventory/CRM/catalogue/commerce connectors; CSV import is useful but not proof of all connectors | Merchant partnerships owner needed | Named APIs, schema mapping, ownership/version conflicts, backfill, revocation, signed webhooks, replay and reconciliation | M16 |
| PQ-12 Hosting/secrets/observability/backups | Docker CLI observed; daemon/regions/services not verified. Low | Reproducible local services in M1, managed production services subject to region/security review | Platform/on-call owner needed | Supported runtime matrix, region, TLS, least privilege, secrets rotation, redacted traces, restore, rollback, capacity/cost monitoring | M1 environment proof; M18 production |
| PQ-13 Subscription billing/settlement reporting | Commercial model unapproved. Low | Explicit billing + entitlements; recurring debits only when supported and consented | Product/finance owner needed | Invoice, renewal, failure, cancellation, entitlement expiry, refunds, tax/export and reconciliation | M17 |

## Early proof cards — planned, not executed

| Proof | Earliest authorized milestone / scope | Input and method after authorization | Success criteria / required evidence |
|---|---|---|---|
| TP-01 Native builds | M1-A; no backend business integration needed | Chosen Expo development build; Android emulator + physical device, iOS simulator + physical device or approved cloud/Mac lane; bundled Ethiopic font; camera/microphone permission and RTC library compatibility smoke | Installable signed development binaries on both OSes; launch/relaunch, secure storage, deep link, font rendering and permissions work; record versions, commands, devices and artifacts. Windows-only preview is insufficient |
| TP-02 Amharic search | M5 proof, specification prepared now | Native reviewers label >=100 Amharic/mixed-script queries over a representative catalogue; include exact SKU, synonyms, transliteration, misspellings, filters and unavailable products; compare candidates | All exact-SKU matches correct; zero unauthorized/unavailable products presented as purchasable; proposed nDCG@10 >=0.80 and p95 search API <=500ms on declared workload. Native relevance review and exceptions recorded |
| TP-03 Amharic/English speech | M11/M12 proof | Consented or synthetic evaluation audio, >=30 speakers/accents and >=100 task utterances per language, phone-bandwidth/noisy variants, names/numbers and interruptions; independent native review | >=90% scripted task completion per language; zero private-data or unauthorized-action failures; proposed p95 post-turn response <=3s under declared network; handoff available. Measure recognition and speech intelligibility separately |
| TP-04 Payment/settlement | M3 sandbox, finance extension M8 | Two merchants, successful/pending/failed pay-ins, duplicate callbacks, timeout retry, late success after stock release, partial refund, fee/commission/creator adjustments and payout hold | One financial effect per source event; balanced postings per currency; no negative sellable stock; verified refunds; no duplicate payout; provider statement reconciliation and evidence for multiple merchant liabilities |
| TP-05 Telephone | M12; carrier procurement can proceed earlier without application coding | Qualified inbound number/SIP lane; call from target networks without app; language selection, public lookup, OTP/recovery, private lookup and warm transfer; outage/opt-out scenarios | Actual inbound reachability, AI disclosure, verified identity before private data, no caller-ID-only trust, successful human transfer with consented context, truthful final outcomes and recorded latency. Local mocked audio is insufficient |

Thresholds above are proposed acceptance targets, not measured claims. Record workload, language dataset, reviewer, provider/model version and confidence; revise only through a decision record. No code-based proof is part of the current M0 authorization.

## Financial invariants — design contract before M3

1. Every posted journal balances debits and credits **per currency**. Use integer minor units, immutable journal/source IDs and transactional posting. Never balance one currency against another.
2. Customer capture initially creates a payable obligation; platform revenue is only its approved earned fee. Merchant money is not platform revenue.
3. Merchant liability partitions pending/available/held balances without creating or destroying the total liability. A hold prevents payout; releasing a hold is not a second earning event.
4. Capture, refund, commission, reversal and payout effects each have unique business/provider keys. Repeat deliveries/retries return the prior outcome; they do not post again.
5. Refund approval creates a refund obligation; only verified provider completion reduces the payable and cash/clearing account. Pending, failed or timed-out refunds remain visible for reconciliation.
6. Allocate partial-refund discounts, fees, tax, reward and affiliate adjustments consistently to affected lines. Sum of allocations equals the order total in minor units.
7. Fees and affiliate funding are explicit: merchant-funded and platform-funded commissions use different accounts. Never debit both for one obligation.
8. Payout holds cover unresolved refunds/disputes/chargebacks and policy eligibility. Never request more than available liability net of holds; actual settlement may be automatic under the approved provider arrangement.
9. A payout request is not a paid payout. Deduct liability only at the documented verified accounting event; reserved payout capacity prevents concurrent double requests.
10. Corrections are compensating journals linked to the original, never updates/deletes of posted entries. Negative merchant balances become recoverable liabilities/operational exceptions under approved policy, not fabricated funds.
11. Reconcile order allocation, payments, provider fees, merchant/creator liabilities, refunds, settlements and bank/PSP statements. Differences enter an owned suspense/exception queue; never silently write off differences.
12. Reward points use a separate append-only unit ledger. Redemption holds and reversals must reconcile; points are not a licensed cash wallet. Show a provider wallet only after qualification.
13. External calls occur outside locked posting transactions; an outbox/inbox and reconciliation bridge failure windows. Exactly-once *effects* are enforced even with at-least-once messages.
14. Taxes, settlement timing, custodial arrangements, reserves, exchange rates and entitlement policy require owner/finance/legal approval. No prototype demonstrates their legality.

Illustrative balanced postings below use fictional units, no approved currency/rates, and omit tax/provider fees for clarity:

| Event | Debits | Credits |
|---|---|---|
| Verified capture 1,200 | PSP receivable 1,200 | Merchant payable 1,200 |
| Earned platform fee 120 | Merchant payable 120 | Platform fee revenue 120 |
| Merchant-funded creator commission 30 | Merchant payable 30 | Creator payable 30 |
| Provider pays platform cash 1,200 | Bank 1,200 | PSP receivable 1,200 |
| Partial refund 600, including proportional fee and creator reversal | Merchant payable 525; creator payable 15; fee-reversal/contra revenue 60 | Refund payable 600 |
| Verified refund completion | Refund payable 600 | Bank/PSP clearing 600 |
| Verified eligible merchant payout | Merchant payable (available amount) | Bank/PSP clearing (same amount) |

This internally balanced teaching case leaves merchant payable 525, creator payable 15 and net fee revenue 60 after the 600-unit refund. It is not an instruction to hold funds or combine incompatible settlement modes. Before M3, finance must approve complete cases including taxes, provider fees, disputes, liability holds, recovery of already-paid commissions and provider-managed settlement.

## Evidence and operating-cost drivers

Documentation reviewed 2026-11-04: [Chapa split](https://developer.chapa.co/integrations/split-payment), [webhooks](https://developer.chapa.co/integrations/webhooks), [refunds](https://developer.chapa.co/refund), [NBE operator directory](https://nbe.gov.et/payment-instrument-issuers-system-operators/), [Expo builds](https://docs.expo.dev/develop/development-builds/introduction/), [LiveKit SIP](https://docs.livekit.io/telephony/accepting-calls/), [Azure languages](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support), [Meilisearch languages](https://www.meilisearch.com/docs/resources/help/language). Documentation is evidence of described capability, not contracted entitlement or successful proof.

Obtain quotes against declared usage; do not invent prices. Drivers: OTP volume/fraud, gateway fees/refunds/settlement reserves, object storage and CDN egress, transcodes/moderation, live viewer-minutes/recordings/TURN, phone numbers/trunk/channel minutes, speech/model/embedding tokens, search index size, database/Redis/backup retention, build/signing services, monitoring event retention, translation/review and staffed support/on-call.
