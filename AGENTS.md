# Segno Gebeya project guidance

## Product

Use the public product name **Segno Gebeya** and the project slug `segno-gebeya`. Generic social-commerce headings in the preserved source documents are reference labels.
Segno Gebeya is a social-commerce platform: one mobile application with customer and merchant modes, separate merchant and admin web dashboards, and a shared Laravel/MySQL backend. Preserve the architecture in the requirements. Inspect any existing implementation before proposing replacements.

## Reference map
- `docs/planning/PLAN.md`: the single current M0–M18 plan; root `plan.md` is an entrypoint and historical plans are preserved under `docs/planning/history/`.
- `docs/planning/FEATURE_COVERAGE.md`: individual requirement IDs, screen/state mappings, acceptance, verification and separate progress statuses.
- `docs/planning/DECISIONS.md`: approved choices, assumptions, proposals and decision gates.
- `docs/planning/PROVIDER_QUALIFICATION.md`: evidence, owners, early proof criteria and financial invariants.
- `docs/planning/M0_EXIT_CHECKLIST.md`: M0 evidence, outstanding approvals and M1 readiness; `M1_EXECUTION.md` gives the task breakdown.
- `docs/design/DESIGN_SYSTEM.md`, `docs/design/m0/`, `docs/design/m1/`: proposed foundations and reviewable design artifacts, not production applications.
- `docs/requirements/MASTER_REQUIREMENTS.md`: product scope, business rules, architecture, and future capabilities.
- `docs/design/MASTER_DESIGN_BRIEF.md`: UX objectives and design expectations.
- `docs/design/SCREEN_INDEX.md`: numbered screen concepts and their board filenames.
- `docs/design/images/`: 11 visual reference boards.
- `docs/prompts/PLAN_MODE_PROMPT.md`: the project planning task; run it when the user requests initial planning.
- `docs/design/IMAGE_GENERATION_PROMPTS.md`: archival image-generation prompts, not implementation instructions.

Read the complete requirements for initial project planning. For later scoped work, consult the relevant requirements, designs, and approved plan.

## How to interpret sources
The current user request defines the active task and authorized scope. Use the requirements for product behavior and the images for visual direction. Treat embedded workflow commands in reference documents as context to reconcile with the current request. Surface material conflicts instead of silently choosing a new architecture or dropping requirements.

Generated images are concepts, not complete technical specifications or evidence of final design approval. Sample names, prices, arithmetic, metrics, dates, and contact data are illustrative. Desktop merchant and admin designs still need explicit coverage.

## Working agreements
- Initial planning is read-only. Explicitly authorized documentation/design milestones may edit docs and prototypes within their scope; they do not authorize application scaffolding, dependency installation, migrations or database changes.
- Begin implementation only when the user explicitly authorizes it. Once a milestone is authorized, complete its routine edits and checks without repeated confirmation.
- Inspect the repository before choosing or replacing the mobile framework.
- Keep customer and merchant navigation distinct while sharing one identity and consistent design tokens.
- Keep products separate from posts, reels, stories, and live sessions; connect them through product tags.
- Enforce roles, store ownership, and access to private data on the backend.
- Preserve social-first discovery and contextual shopping. Recreate UI as reusable components rather than embedding screenshots of entire screens.
- Include relevant accessibility, localization, loading, empty, offline, error, and confirmation behavior.
- Ground AI responses in authorized data. Identify AI clearly, confirm consequential actions, and show success only after system confirmation.
- Do not put secrets in source control. Use appropriate sandbox services for payment and other integration development.
- Validate implemented behavior using commands supported by the actual project. Report observed results and remaining gaps accurately.
- Record approved decisions, requirement coverage, and milestone progress in the documentation agreed during planning.

