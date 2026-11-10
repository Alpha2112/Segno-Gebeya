# M0 design artifact validation

Scope: local browser design artifacts and documentation only. This is not application/native/integration verification.

## Observed results

- 292 browser renders covering all 22 views and their declared state specimens, English/light desktop and Amharic/dark narrow layouts; desktop views also checked at tablet width.
- Horizontal-overflow failures: 0; missing headings: 0; font-loading failures: 0; JavaScript exceptions: 0.
- 37 local interaction checks; failures: 0. See [raw results](QA_RESULTS.json).
- 18 semantic contrast pairs calculated; failures: 0. See [contrast values](CONTRAST.json). This is not a complete accessibility audit.
- 1458 unique stable source-item IDs; no application capability is marked implemented/integrated/verified.
- 15 preserved source files hash-matched, including original master/brief/index, 11 boards and the archived approved baseline.
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
