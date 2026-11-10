I authorize the M0 documentation and design work for Segno Gebeya.

Use the latest M0–M18 plan as the planning baseline, incorporating the
corrections below. This authorization does not approve unfinished
screen designs, production providers, or M1 application implementation.

Do not produce another general roadmap. Produce the concrete M0
artifacts needed to review the project and begin M1 safely.

1. Reconcile the planning sources

Read AGENTS.md, the requirements, design brief, screen index, images,
and latest architecture plan.

The older five-milestone planning summary is superseded by the newer
M0–M18 plan. Preserve historical material, but clearly identify one
current plan and one consistent milestone numbering system.

Preserve the original master requirements and reference images.

2. Save the project planning artifacts

Create or update:

- docs/planning/PLAN.md
- docs/planning/FEATURE_COVERAGE.md
- docs/planning/DECISIONS.md
- docs/planning/PROVIDER_QUALIFICATION.md
- docs/planning/M0_EXIT_CHECKLIST.md
- docs/design/DESIGN_SYSTEM.md

Keep AGENTS.md concise and add links to these documents rather than
copying the full plan into it.

Use stable requirement IDs. Connect individual requirements to their
platforms, screens, relevant states, design references, milestones,
acceptance criteria, and planned verification.

Keep proposed, designed, approved, implemented, integrated, and
verified statuses distinct.

3. Preserve established decisions

- Product name: Segno Gebeya.
- Launch market: Ethiopia.
- Initial interface languages: Amharic and English.
- One customer/merchant mobile app.
- Separate merchant and admin React dashboards.
- Shared modular Laravel/MySQL backend.
- Full agreed feature scope before public release.
- Design approval before implementing each milestone.

ETB settlement remains an assumption until I explicitly confirm it.
Do not record recommendations or provider candidates as approved facts.

4. Produce reviewable design work

Finalize the proposed design foundations: colors, typography,
Ethiopic font support, spacing, components, accessibility, and states.

Create actual reviewable visual designs for M1, including:
- Customer registration, sign-in, verification, and recovery.
- Profile setup and language preferences.
- Merchant application and application status.
- Customer/merchant mode switching.
- Merchant and admin web authentication.
- Admin MFA and merchant-application review.

Include relevant validation, loading, error, permission, pending,
and recovery states. Show mobile and appropriate desktop layouts.

Also produce the M0 purchase-to-fulfilment walkthrough/prototype.
Clearly label simulated behavior and sample data. Its existence
does not imply approval of all future M2/M3 screen designs.

Save design artifacts and their screen/state index under
docs/design/m0/ and docs/design/m1/.

Use available design tools. Do not replace the visual deliverables
with descriptions alone or claim a prototype is interactive unless
it actually is.

5. Make dependencies actionable

For every unresolved decision or integration, record:
- The question or capability to verify.
- Current evidence and confidence.
- Recommended option and alternatives.
- Responsible owner or owner still needed.
- Required verification.
- The milestone it blocks.

Separate decisions required before M1 from decisions required later.
Do not make every future production contract a prerequisite for M1.

Propose early technical proofs for native builds, Amharic search and
speech, payment/settlement behavior, and telephone routing. Define
their success criteria; do not execute code-based proofs without
the necessary implementation authorization.

Document financial invariants covering balanced postings, merchant
liabilities, refunds, commissions, payout holds, and duplicate effects.

6. Prepare M1 for execution

Break M1 into manageable internal tasks:
- Toolchain and runnable application foundations.
- Identity, sessions, roles, and authorization.
- Merchant application/review and mode switching.

Specify dependencies, expected application areas, acceptance checks,
Android/iOS build verification, and demonstration scenarios.

Provide effort ranges only with explicit staffing assumptions.
Identify important operating-cost drivers without inventing prices.

7. Boundaries and final handoff

You may edit documentation and create design/prototype artifacts.
Do not scaffold production applications, install project dependencies,
create migrations, change databases, make financial transactions,
or start M1.

Complete useful work before asking questions. Bundle only unresolved
questions that affect the next decision; do not ask again about
already-established choices.

At the end, present:
- Files and visual artifacts created.
- Corrections made to the plan.
- M0 exit criteria: passed, pending, or blocked, with evidence.
- Decisions genuinely required from me.
- The exact designs and scope awaiting approval.
- Whether M1 is ready to authorize and why.

Stop for my review. Do not mark unverified work complete or begin
M1 automatically.