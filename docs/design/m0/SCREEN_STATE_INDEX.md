# M0 purchase-to-fulfilment walkthrough

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
