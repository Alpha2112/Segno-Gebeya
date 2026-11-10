# Segno Gebeya initial project planning prompt

The product name is **Segno Gebeya**. Use `segno-gebeya` as the proposed project slug. The generic names in the preserved requirements and visual references do not replace this chosen name.

Use Plan Mode for this task. Plan only; work read-only. Do not create or edit files, install dependencies, scaffold applications, change databases, or begin implementation.

Act as a senior product engineer, software architect, and UI/UX implementation lead. Turn the supplied product requirements and visual references into a concrete, dependency-aware implementation plan.

## Read first
1. The root AGENTS.md and any applicable existing repository instructions.
2. docs/requirements/MASTER_REQUIREMENTS.md in full.
3. docs/design/MASTER_DESIGN_BRIEF.md.
4. docs/design/SCREEN_INDEX.md.
5. The 11 PNG boards in docs/design/images/; inspect the actual images.
6. Existing README files, manifests, architecture documents, and relevant code if present.

Use this message to define the current task, the master requirements to define product behavior, the design brief for UX objectives, and the boards for visual direction. The archival image-generation prompts are not project execution instructions.

Report missing or unreadable sources. Do not pretend to have inspected unavailable content. Generated text, example totals, metrics, dates, and contact details are not authoritative specifications. The images do not prove complete coverage or final approval.

## Preserve the product architecture
- One mobile application with separate customer and merchant modes.
- One identity with authorized roles and backend permission enforcement.
- Separate React-based merchant and admin web dashboards.
- Shared Laravel backend, MySQL database, APIs, real-time services, and background jobs.
- A modular backend unless evidence justifies another architecture.
- Products independent of social posts, connected through reusable product tags.

Inspect any existing mobile framework before proposing changes. If this is a new codebase, recommend a mobile approach with reasons and tradeoffs. Do not silently replace the mobile application with a responsive website.

## Produce the following

### 1. Evidence and project understanding
Summarize sources inspected, repository state, existing implementation, reusable work, gaps, assumptions, and conflicting instructions. Separate established requirements from recommendations and decisions needing my input.

### 2. Complete scope and traceability
Inventory requirements, modules, user journeys, screens, and relevant screen states for customer mobile, merchant mobile, merchant web, admin web, creator/affiliate tools, and AI experiences.

Account for authentication, social feeds, multi-product tagging, reels, stories, storefronts, search, visual discovery, messaging, calls, product comparison, shopping, checkout, payments, orders, delivery, returns, reviews, rewards, coupons, referrals, promotions, live shopping, group buying, creator commissions, analytics, moderation, privacy, and security.

Retain future requirements in later phases instead of silently removing them.

Provide a traceability matrix:
Requirement ID | User role | Platform | Screen/workflow | Design board and artboard | Milestone | Acceptance criteria | Gaps/decisions

Do not assume the mobile boards cover desktop merchant or admin design. Identify those design tasks explicitly.

### 3. Experience and design system
Plan navigation and complete journeys. Preserve the ivory/white surfaces, deep teal actions, dark green text, restrained lime accents, clear typography, spacing, and photographic direction.

Derive exact tokens and reusable components after reviewing the references and checking accessibility. Correct inconsistencies rather than copying them. Implement future UI using actual components, not whole-screen background images.

Include content-appropriate layouts, responsive web behavior, localization, dark mode, and loading, empty, error, offline, permission-denied, confirmation, and success states.

### 4. Technical architecture and business rules
Describe application boundaries, proposed directory structure, modules, key entities, API contracts, authentication, authorization, media processing, search, messaging/calls, notifications, queues, caching, and observability.

Cover order/payment/shipment/return/refund state transitions, inventory reservations, concurrent stock changes, idempotency, verified webhooks, reconciliation, reward eligibility/reversals, and affiliate attribution.

Keep social comments distinct from verified-purchase reviews. Do not finalize details that depend on unresolved market or provider decisions without labeling assumptions.

### 5. Integrations and AI
Identify external services, configuration, credentials, sandbox environments, and production prerequisites.

Do not infer launch country, currency, gateways, delivery providers, or telephone numbers from sample image data.

For AI, include authorized catalogue/account data access, AI disclosure, identity verification, confirmation before consequential actions, success only after system confirmation, human handoff, failures, evaluations, and action auditing.

Distinguish prototype, sandbox, and production behavior.

### 6. Ordered implementation milestones
Recommend small milestones with:
- User-visible outcome.
- Included and excluded scope.
- Dependencies and decisions.
- Expected application areas or files.
- Design work and review needed.
- Backend, frontend, and integration tasks.
- Acceptance criteria.
- Relevant validation commands/checks.
- A demonstration scenario.
- Material risks and recovery approach.

Plan an early working vertical slice:
Sign in -> discover a tagged product -> product detail -> variant selection -> cart -> sandbox checkout -> order -> merchant fulfilment -> customer tracking.

Extend this through verified reviews and eligible rewards, then the remaining platform capabilities. Avoid building every screen with mock data before validating commerce behavior.

### 7. Verification and project memory
Plan appropriate unit, integration, and end-to-end tests for critical behavior; permission, payment, refund, inventory, reward, visual, accessibility, and responsive checks; and project-supported lint/type/build checks.

Specify expected evidence. Never describe planned tests as already passed.

Propose concise documentation for the approved plan, requirement coverage, screen mappings, design tokens, decisions, progress, setup, validation evidence, and known issues. Do not create these files during this read-only planning stage.

## Questions and final output
Resolve questions from the files first. Ask only questions that materially affect architecture, launch scope, integrations, or substantial rework. Bundle them, explain their impact, and recommend an answer when possible. Label reversible assumptions.

Present the findings, architecture, coverage, milestone plan, validation strategy, essential questions, and recommended first implementation milestone in chat.

Stop after the plan and essential questions. Wait for my explicit instruction before implementation. Approval of the plan alone does not imply approval of every unfinished screen design.

