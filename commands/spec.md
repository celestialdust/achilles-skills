---
description: Design the product before any code — survey the codebase, then grill the idea into ADRs, a PRD, signed acceptance criteria, and an environment manifest.
---

Run **codebase-research** first — a goal-blind survey of the repository as it is today, scoped by intent.md (Outcome · User · Success · Out-of-scope). It writes research.md. The design decisions are made against it, not against recollection.

Then invoke the spec-grilling skill as the spine of this stage. It turns the locked idea (intent.md) into the design: architectural decisions (docs/adr/) and CONTEXT.md. It refuses to run without research.md — ADRs are the hardest artifact in the chain to revise, so nothing gets decided before the territory is surveyed.

Then drive the remaining spec artifacts through their owning skills:
- to-prd — the light dual-audience PRD (prd.md), product-altitude, referencing the ADRs.
- acceptance-criteria — the behavioral Given/When/Then contract (acceptance.md), signed.
- environment-manifest — the typed-kind manifest (environment.md): kinds only, no values, no commands.
- frontend-design — only if there's a UI: explore variants, then commit a prototype + design contract.
- spec-review — last: a fresh, code-cold agent hardens the whole spec before the user reads it.

## Mode

Spec is human-led — this is one of the three stages (Ideate, Spec, Plan) the human owns. Run it interactively: grill, propose, and confirm with the user; do NOT run autonomously and do NOT start implementing. This stage produces the spec artifacts only.

## Notes

- Upstream: reads intent.md from /ideate — it is what scopes the survey. If no intent exists, pin the idea down with the user first (an inline one-paragraph outcome is enough to scope codebase-research), then survey, then grill.
- Downstream: the signed acceptance.md + environment.md + ADRs + CONTEXT.md feed /plan, which slices the work into the vertical-slice DAG. Do not cross into planning here. research.md carries over too — /plan reuses this survey rather than running its own.
- The artifact filenames (intent.md, research.md, prd.md, acceptance.md, environment.md, CONTEXT.md) are the spec→plan contract — keep them exact.
