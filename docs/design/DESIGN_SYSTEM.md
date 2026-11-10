# Segno Gebeya design system — M0 review candidate v1

Status: visual foundations accepted for M1 implementation on 2026-11-05. Native-language/legal wording and OS accessibility acceptance remain pending. Applies to one mobile app and both dashboards. Original concept boards remain unchanged. Visual specimen: [M1 design review](m1/index.html?screen=foundations). Screen/state index: [M1 index](m1/SCREEN_STATE_INDEX.md). Amharic copy is a review draft; no native-language accuracy claim.

## Semantic color tokens

| Role | Light | Dark | Usage |
|---|---|---|---|
| Canvas | #F5F5EF | #0E221F | Page background |
| Surface | #FFFFFF | #17352D | Forms, cards, dialogs |
| Text | #152B26 | #F5F5EF | Main content |
| Muted text | #52675E | #B6CBC0 | Secondary content; never disabled opacity for readable instructions |
| Primary | #126C55 | #9BE4BF | Main action background |
| On primary | #FFFFFF | #0E221F | Text/icons on primary |
| Primary hover/pressed | #0D5542 | #C0F1D7 | Pointer/touch feedback |
| Accent | #D9EF72 | #D9EF72 | Small highlights, selected context; dark text only |
| On accent | #152B26 | #152B26 | Never white on lime |
| Control boundary | #6D8277 | #A0B8AB | Inputs and meaningful outlines |
| Divider | #DDE5DD | #36584A | Decorative separation only |
| Focus | #126C55 | #D9EF72 | Visible 3px outline + offset; use paired light/dark ring over primary |
| Success text/surface | #166534 / #F0FDF4 | #A7F3D0 / #143D2C | Icon + label, not color alone |
| Warning text/surface | #92400E / #FFFBEB | #FDE68A / #44351B | Eligibility, pending or review |
| Error text/surface | #B91C1C / #FEF2F2 | #FECACA / #492725 | Inline correction and service failures |
| Info text/surface | #075985 / #F0F9FF | #BAE6FD / #18394A | Neutral status/help |

Selected contrast measurements and all proposed semantic foreground/background pairs are recorded in m0/CONTRAST.json after generation. Target normal text >=4.5:1, large text/control cues >=3:1. Decorative dividers need not encode meaning. White on lime and white on bright reference success/warning colors are prohibited for normal text.

## Typography and Ethiopic support

Bundled local variable fonts in m0/assets/fonts: Inter (Latin) and Noto Sans Ethiopic (Ethiopic), with OFL licenses and provenance. No network font service is required to open the review.
CSS family: Inter, Noto Sans Ethiopic, system-ui, sans-serif. Amharic content explicitly uses lang=am and Noto Sans Ethiopic; no forced uppercase or letter-spacing on Ethiopic.

| Style | Mobile | Desktop | Weight / leading |
|---|---|---|---|
| Display | 32px | 48px | 650–700 / 1.15 Latin, >=1.45 Ethiopic |
| Page title | 28px | 32px | 650 / 1.25 Latin, >=1.5 Ethiopic |
| Section | 20px | 24px | 650 / 1.35 Latin, >=1.5 Ethiopic |
| Body | 16px | 16px | 400 / 1.6 Latin, >=1.7 Ethiopic |
| Label | 14px | 14px | 600 / >=1.5 |
| Caption | 12px | 12px | 450 / >=1.5; never sole critical instruction |

Use tabular numerals for money and operational tables. Localize number/currency/date presentation separately from canonical stored values. Settlement currency is unconfirmed; walkthrough uses explicitly fictional demo units. No US address, telephone number or sample metric determines Ethiopia policy.

## Geometry, layout and motion

Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64. Mobile horizontal gutter 24 (16 at very narrow widths); fields/actions minimum 48px high. Form measure 400–440px; desktop working areas max 1440px. Radius 12 controls, 16 cards, 24 sheets. Border 1px. Use restrained elevation only on floating surfaces.

Mobile review frames: 390px, with checks at 320 and 430; desktop 1440, tablet 768. Dashboard sidebar collapses to a labelled navigation control; operational detail stacks under the queue at tablet width. Forms remain a readable measure, never stretched across the canvas. Large type uses reflow, not clipped fixed heights.

Transitions 120–180ms for state feedback; no essential delay. Respect prefers-reduced-motion; disable decorative animation. Auto-play media is outside M1 and needs later consent/caption design.

## Component behavior

| Component | Contract and required states |
|---|---|
| Button | One primary action per decision area; default/hover/focus/pressed/disabled/busy; busy label describes work; never report success on click alone |
| Input/password | Persistent label, input purpose/autocomplete, visible hint, associated error; show/hide password accessible name; no placeholder-only labels |
| Verification code | Single labelled numeric field supports paste and password managers; resend cooldown, expired/incorrect/locked/service failure; no six inaccessible focus traps |
| Form errors | Error summary receives focus, links to fields; keep user input; generic auth failure avoids account enumeration |
| Language selector | Amharic and English visible before sign-in; saves preference in real M1; review artifact changes local presentation only |
| Upload | Optional camera/file route; type/size/progress/retry/remove; privacy explanation; denied permission has manual selection path |
| Mode/store card | Clear active context; pending/denied membership has reason and next action; switch does not itself grant authority |
| Status/timeline | Icon + text; distinguish submitted/under review/information needed/approved/rejected; do not show mutually exclusive outcomes as one timeline |
| Queue/table | Semantic header, keyboard controls, filtering, empty/error/loading; no private document thumbnails in public lists |
| Confirmation | Exact action, effect, reason and current record revision; cancel is safe; irreversible server action only after explicit confirmation |
| Toast/status | aria-live status; critical errors remain in context, never toast-only; no false verified identity or financial success |
| Navigation | Label active area; customer/merchant/admin boundaries explicit; logout/revocation clears private context |
| Product tag/card | Product independent of post; hotspot has labelled list alternative; variant/stock resolved before purchase |
| Skeleton/offline | Meaningful structure; status announcement once; offline copy explains stale data and disables consequential actions |
| Dialog/sheet | Accessible name, focus containment/return, Escape/cancel; large copy scrolls; no essential action outside reachable area |

## Accessibility and localization acceptance

Semantic controls, visible focus, keyboard order, field associations, live errors, non-color status cues, 200% text/zoom, contrast and reduced motion are review requirements. Native VoiceOver/TalkBack, actual OS text scaling and switch-control checks remain M1 device verification; browser inspection does not prove native accessibility. WCAG 2.2 AA is the web target: https://www.w3.org/TR/WCAG22/.

Amharic glossary/copy requires a named native reviewer. Legal, privacy, financial and safety text require specialist review; machine translation is not approval. Preserve English product names where appropriate and avoid concatenated translation fragments. Dates/time zones/address fields are market-configurable; calendar presentation is a later product decision.

## States and review boundaries

All M1 screens expose a state selector with default, validation, loading, error, offline, permission/denial, pending, confirmation, success and recovery as relevant. Screen-specific outcomes replace generic artwork. Demo credentials and actions are explicitly labelled; no backend, identity, provider or financial action occurs.

Photography is important for later discovery, but auth/review work uses calm typography, branded geometry and clear forms. The walkthrough uses original lightweight SVG product illustrations labelled as samples, not reference screen screenshots.

Review foundations and exact M1 variants before implementation. Only the M0 walkthrough illustrates future M2/M3 screens; it does not approve them.
